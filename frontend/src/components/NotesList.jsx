const NotesList = ({ notes, onEdit, onDelete }) => {
  if (!notes || notes.length === 0) {
    return <div className="text-sm text-gray-500">No notes yet.</div>;
  }

  return (
    <div className="space-y-3">
      {notes.map((n) => (
        <div key={n.id || n._id} className="border rounded p-3">
          <div className="flex items-start justify-between">
            <div>
              {/* Title */}
              <div className="font-semibold">{n.title}</div>

              {/* Content */}
              <div className="text-sm text-gray-600 mt-1">{n.content}</div>

              {/* Author */}
              <div className="text-xs text-gray-400 mt-1">
                By: {n.author?.email || "Unknown"}
              </div>
            </div>

            {/* Right side: date + actions */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-xs text-gray-400">
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(n.id || n._id)}
                  className="px-2 py-1 text-xs rounded bg-slate-500 text-white hover:cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(n.id || n._id)}
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
  );
};

export default NotesList;
