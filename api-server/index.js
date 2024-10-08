const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

let notes = {}; // Store notes in memory, or use a database for persistence

// Get notes for a specific column
app.get('/notes/:columnId', (req, res) => {
  const { columnId } = req.params;
  res.json(notes[columnId] || []);
});

// Add a note to a specific column
app.post('/notes/:columnId', (req, res) => {
  const { columnId } = req.params;
  const note = req.body;

  if (!notes[columnId]) notes[columnId] = [];
  notes[columnId].push(note);

  res.json(note);
});

// Update a specific note
app.put('/notes/:columnId/:noteId', (req, res) => {
  const { columnId, noteId } = req.params;
  const updatedNote = req.body;

  notes[columnId] = notes[columnId].map((note) =>
    note.id === noteId ? { ...note, text: updatedNote.text } : note
  );

  res.json(updatedNote);
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
