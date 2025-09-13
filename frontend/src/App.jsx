import { useEffect, useState } from "react";
import { apiFetch } from "./api/apiFetch.js"
import { saveSession, clearSession, loadSession } from "./utils/session";
import LoginForm from "./components/LoginForm.jsx";


export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const [health, setHealth] = useState(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [msg, setMsg] = useState(null);
  const [toEdit, setToEdit] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedContent, setUpdatedContent] = useState("");

  useEffect(() => {
    const s = loadSession();
    if (s.token && s.user) {
      setToken(s.token);
      setUser(s.user);
      fetchNotes(s.token);
    }
  }, []);

  async function login(email, password) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch(`/auth/login`, null, {
        method: "POST",
        json: { email, password },
      });
      // Expected res: { token, user: { email, role, tenant: { slug } } }
      console.log(res);

      const t = res.token;
      const u = res.user;
      if (!t || !u)
        throw new Error("Unexpected login response shape (missing token/user)");
      saveSession(t, u);
      setToken(t);
      setUser(u);
      setMessage({ type: "success", text: "Login successful" });
      await fetchNotes(t);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    clearSession();
    setToken(null);
    setUser(null);
    setNotes([]);
    setMessage({ type: "info", text: "Logged out" });
  }

  async function fetchNotes(currentToken = token) {
    if (!currentToken) return;
    setLoading(true);
    setLimitReached(false);
    try {
      const res = await apiFetch(`/notes`, currentToken, { method: "GET" });
      // assume res is array of notes
      // console.log(res);

      setNotes(Array.isArray(res) ? res : res.notes || []);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: `Failed to fetch notes: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  }
  // console.log(user);

  async function createNote(e) {
    e.preventDefault();
    if (!token) return setMessage({ type: "error", text: "Not authenticated" });
    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch(`/notes`, token, {
        method: "POST",
        json: { title, content },
      });
      // success -> refresh notes
      setTitle("");
      setContent("");
      setMessage({ type: "success", text: "Note created" });
      await fetchNotes(token);
    } catch (err) {
      console.error(err);
      // If backend enforces limit, we expect a 403 or 402 and a helpful message
      if (
        err.status === 403 ||
        (err.body && err.body.message && /limit/i.test(err.body.message))
      ) {
        setLimitReached(true);
        setMessage({
          type: "error",
          text: "Note limit reached for Free plan. Upgrade to Pro.",
        });
      } else {
        setMessage({
          type: "error",
          text: err.message || "Failed to create note",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function editNote(id) {
    if (!token) return setMessage({ type: "error", text: "Not authenticated" });
    // if (!confirm("Edit this note?")) return;
    // setLoading(true);
    try {
      const res = await apiFetch(`/notes/${id}`, token);
      // console.log(res);
      setToEdit(res);
    } catch (error) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Failed to edit note",
      });
    }
  }
  async function updateNote(id) {
    if (!token) return setMessage({ type: "error", text: "Not authenticated" });

    setLoading(true);
    setMessage(null);

    try {
      const res = await apiFetch(`/notes/${id}`, token, {
        method: "PUT", // use PUT for update
        json: { title: updatedTitle, content: updatedContent },
      });

      // Close popup and refresh notes
      setToEdit(null);
      setMessage({ type: "success", text: "Note updated" });
      await fetchNotes(token);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Failed to update note",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteNote(id) {
    if (!token) return setMessage({ type: "error", text: "Not authenticated" });
    if (!confirm("Delete this note?")) return;
    setLoading(true);
    try {
      await apiFetch(`/notes/${id}`, token, { method: "DELETE" });
      setMessage({ type: "success", text: "Note deleted" });
      await fetchNotes(token);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Failed to delete note",
      });
    } finally {
      setLoading(false);
    }
  }

  async function invite(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/tenants/${tenantSlug}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to invite");
      setMsg({ type: "success", text: `Invited ${data.user.email}` });
      setEmail("");
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  async function fetchMe(currentToken = token) {
    const res = await apiFetch(`/auth/me`, currentToken, { method: "GET" });
    saveSession(currentToken, res.user);
    setUser(res.user);
    return res.user;
  }

  async function upgradeTenant() {
    // console.log("here");
    console.log(token, user);

    if (!token || !user) return;
    if (!confirm("Upgrade tenant to Pro? This action is immediate.")) return;
    setLoading(true);
    try {
      // console.log(`/tenants/${user.tenant.slug}/upgrade`);
      await apiFetch(`/tenants/${user.tenantSlug}/upgrade`, token, {
        method: "POST",
      });
      const updatedUser = await fetchMe(token);
      setUser(updatedUser);
      setMessage({
        type: "success",
        text: "Tenant upgraded to Pro successfully",
      });
      setLimitReached(false);
      await fetchNotes(token);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Failed to upgrade tenant",
      });
    } finally {
      setLoading(false);
    }
  }

  async function checkHealth() {
    try {
      const res = await apiFetch(`/health`, null, { method: "GET" });
      setHealth(res);
      setMessage({ type: "success", text: "Health OK" });
    } catch (err) {
      setHealth({ status: "down" });
      setMessage({ type: "error", text: "Health check failed" });
    }
  }

  useEffect(() => {
    if (toEdit) {
      setUpdatedTitle(toEdit.title);
      setUpdatedContent(toEdit.content);
    }
  }, [toEdit]);

  if (!token || !user) {
    return (
      <LoginForm
        login={login}
        checkHealth={checkHealth}
        message={message}
        health={health}
      />
      
    );
  }

  // console.log(toEdit);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">SaaS Notes</h2>
            <div className="text-sm text-gray-600">
              {user.email}-{user.role}-Tenant: {user.tenantSlug || "unknown"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <button
                onClick={upgradeTenant}
                className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-sm"
              >
                Upgrade Tenant
              </button>
            )}
            <button
              onClick={logout}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {user.role === "admin" && (
          <form
            onSubmit={invite}
            className="space-y-2 bg-white p-4 rounded shadow mb-4"
          >
            <h3 className="font-semibold">Invite User</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full border rounded px-2 py-1"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Invite
            </button>
            {msg && (
              <div
                className={`p-2 rounded text-sm ${
                  msg.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {msg.text}
              </div>
            )}
          </form>
        )}

        {limitReached && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <strong>Note limit reached.</strong> Upgrade your tenant to Pro
                for unlimited notes.
              </div>
              {user.role === "admin" ? (
                <button
                  onClick={upgradeTenant}
                  className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500"
                >
                  Upgrade to Pro
                </button>
              ) : (
                <div className="text-sm text-gray-600">
                  Ask an Admin to upgrade.
                </div>
              )}
            </div>
          </div>
        )}

        <main className="grid md:grid-cols-3 gap-6">
          <section className="md:col-span-1 bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Create Note</h3>
            <form onSubmit={createNote} className="space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full border rounded px-2 py-1"
                required
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
                className="w-full border rounded px-2 py-1 h-28"
                required
              />
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setContent("");
                  }}
                  className="text-sm text-gray-600"
                >
                  Clear
                </button>
              </div>
            </form>
            <div className="mt-4 text-xs text-gray-500">
              Plan: <strong>{user.tenantPlan}</strong>
            </div>
          </section>

          <section className="md:col-span-2 bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Notes</h3>
              <div>
                <button
                  onClick={() => fetchNotes(token)}
                  className="px-2 py-1 text-sm rounded bg-gray-100 hover:cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-sm text-gray-500 mb-2">Loading...</div>
            )}
            {message && (
              <div
                className={`mb-3 p-2 rounded ${
                  message.type === "error"
                    ? "bg-red-100 text-red-700"
                    : message.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {notes.length === 0 ? (
              <div className="text-sm text-gray-500">No notes yet.</div>
            ) : (
              <div className="space-y-3">
                {notes.map((n) => (
                  <div key={n.id || n._id} className="border rounded p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{n.title}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {n.content}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          By: {n.author.email || "Unknown"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs text-gray-400">
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleString()
                            : ""}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editNote(n.id || n._id)}
                            className="px-2 py-1 text-xs rounded bg-slate-500 text-white hover:cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteNote(n.id || n._id)}
                            className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
      {toEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setToEdit(null)}
              className="text-4xl absolute top-2 p-2 right-4 text-black hover:text-gray-800"
            >
              x
            </button>

            <h2 className="text-xl font-semibold mb-4">Edit Note</h2>

            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />

            <textarea
              value={updatedContent}
              onChange={(e) => setUpdatedContent(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1 h-24"
            />

            <div>
              <button
                className="border p-1"
                onClick={() => updateNote(toEdit.id)}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
