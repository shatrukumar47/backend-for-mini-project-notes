const express = require("express");
const { NotesModel } = require("../model/notesModel");
const { auth } = require("../middlewares/auth.middleware");

const noteRouter = express.Router();

// POST notes
noteRouter.post("/create", auth, async (req, res) => {
  try {
    const note = new NotesModel(req.body);
    await note.save();
    res.status(200).send({ message: "Note added successfully" });
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

//GET notes
noteRouter.get("/", auth, async (req, res) => {
  const { userID } = req.body;
  const { title, sort } = req.query;
  let query = { userID: userID };

  try {
    if (title) {
      query["title"] = { $regex: new RegExp(title, "i") };
    }

    let notes = [];

    if (sort === "newest") {
      notes = await NotesModel.find(query).sort({ createdAt: -1 });
    } else if (sort === "oldest") {
      notes = await NotesModel.find(query).sort({ createdAt: 1 });
    } else {
      notes = await NotesModel.find(query);
    }

    res.status(200).json(notes);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//PATCH notes
noteRouter.patch("/update/:id", auth, async (req, res) => {
  const { id } = req.params;
  const note = await NotesModel.findOne({ _id: id });
  try {
    if (req.body?.userID != note?.userID) {
      res.status(200).send({ message: "Note not found !!" });
    } else {
      await NotesModel.findByIdAndUpdate({ _id: id }, req.body);
      const updateNote = await NotesModel.findOne({ _id: id });
      res
        .status(200)
        .send({ message: "Note updated successfully", note: updateNote });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

//DELETE notes
noteRouter.delete("/delete/:id", auth, async (req, res) => {
  const { id } = req.params;
  const note = await NotesModel.findOne({ _id: id });
  try {
    if (req.body?.userID != note?.userID) {
      res.status(200).send({ message: "Note not found !!" });
    } else {
      const note = await NotesModel.findByIdAndDelete({ _id: id });
      res
        .status(200)
        .send({ message: `Note with _id: ${id} deleted successfully` });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

module.exports = {
  noteRouter,
};
