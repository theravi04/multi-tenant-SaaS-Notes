const LoginForm = ({ login, checkHealth, message, health }) => {
  const QuickLogin = ({ email }) => (
    <button
      className="px-3 py-1 bg-gray-100 rounded text-sm mr-2 hover:bg-gray-200"
      onClick={() => (document.getElementById("login-email").value = email)}
      title={`Fill ${email}`}
    >
      {email}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-4">SaaS Notes — Sign in</h1>
        <p className="text-sm text-gray-500 mb-4">
          Use one of the test accounts below (password: <code>password</code>)
        </p>
        <div className="mb-3">
          <QuickLogin email="admin@acme.test" />
          <QuickLogin email="user@acme.test" />
          <QuickLogin email="admin@globex.test" />
          <QuickLogin email="user@globex.test" />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const pw = document.getElementById("login-password").value;
            login(email, pw);
          }}
        >
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="login-email"
            defaultValue="user@acme.test"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
          <label className="block text-sm font-medium text-gray-700 mt-3">Password</label>
          <input
            id="login-password"
            type="password"
            defaultValue="password"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
          <div className="flex items-center justify-between mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={checkHealth}
              className="text-sm text-gray-600 underline"
            >
              Health check
            </button>
          </div>
        </form>
        {message && (
          <div
            className={`mt-4 p-2 rounded ${
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
        {health && (
          <div className="mt-2 text-xs text-gray-500">Health: {JSON.stringify(health)}</div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
