const EditNoteModal = ({
  note,
  updatedTitle,
  setUpdatedTitle,
  updatedContent,
  setUpdatedContent,
  onClose,
  onUpdate,
}) => {
  if (!note) return null; // don't render if no note is selected

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="text-4xl absolute top-2 p-2 right-4 text-black hover:text-gray-800"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4">Edit Note</h2>

        {/* Input fields */}
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

        {/* Update button */}
        <div className="mt-4 flex justify-end">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => onUpdate(note.id)}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNoteModal;
