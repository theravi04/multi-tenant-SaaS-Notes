import prisma from "../config/db.js";

// create note overall in one slug 3 (untill upgrade)
export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user.tenantId },
      include: { notes: true },
    });

    const noteCount = await prisma.note.count({
      where: {
        tenantId: req.user.tenantId,
        // createdBy: req.user.id,
      }
    })

    if (tenant.plan === "free" && noteCount >= 3 ) {
      return res
        .status(403)
        .json({ message: "Free plan limit reached. Upgrade to Pro." });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        tenantId: req.user.tenantId,
        createdBy: req.user.id,
      },
    });

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get notes with the author
export const getNotes = async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { tenantId: req.user.tenantId, },
    include: { author: { select: { id: true, email: true } } },
  });
  res.json(notes);
};

// get note by id of note
export const getNoteById = async (req, res) => {
  const note = await prisma.note.findUnique({ where: { id: req.params.id } });
  if (!note || note.tenantId !== req.user.tenantId) {
    return res.status(404).json({ message: "Note not found" });
  }
  res.json(note);
};

// update note
export const updateNote = async (req, res) => {
  const note = await prisma.note.findUnique({ where: { id: req.params.id } });
  if (!note || note.tenantId !== req.user.tenantId) {
    return res.status(404).json({ message: "Note not found" });
  }

  const updated = await prisma.note.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json(updated);
};

// delete note
export const deleteNote = async (req, res) => {
  const note = await prisma.note.findUnique({ where: { id: req.params.id } });
  if (!note || note.tenantId !== req.user.tenantId) {
    return res.status(404).json({ message: "Note not found" });
  }

  await prisma.note.delete({ where: { id: req.params.id } });
  res.json({ message: "Note deleted" });
};
