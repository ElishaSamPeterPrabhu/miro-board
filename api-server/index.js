const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

let notes = {};

app.get('/notes', (req, res) => {
  const allNotes = Object.entries(notes).flatMap(([columnId, notesArray]) =>
    notesArray.map((note) => ({ ...note, columnId }))
  );
  res.json(allNotes);
});

app.get('/notes/:columnId', (req, res) => {
  const { columnId } = req.params;
  res.json(notes[columnId] || []);
});

app.post('/notes/:columnId', (req, res) => {
  const { columnId } = req.params;
  const note = req.body;

  const newNote = {
    ...note,
    id: `${Date.now()}`,
  };
console.log("server",newNote);
  if (!notes[columnId]) notes[columnId] = [];
  notes[columnId].push(newNote);

  res.json(newNote);
});

app.put('/notes/:columnId/:noteId', (req, res) => {
  const { columnId, noteId } = req.params;
  const updatedNote = req.body;
  notes[columnId] = notes[columnId].map((note) =>
    note.id === noteId ? { ...note, text: updatedNote.text } : note
  );
  res.json(updatedNote);
});

app.delete('/notes/:columnId/:noteId', (req, res) => {
  const { columnId, noteId } = req.params;
  if (notes[columnId]) {
    notes[columnId] = notes[columnId].filter(note => note.id !== noteId);
  }
  res.sendStatus(204);
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('noteAdded', (note) => {
    io.emit('noteAdded', note);
  });

  socket.on('noteUpdated', (updatedNote) => {
    io.emit('noteUpdated', updatedNote);
  });

  socket.on('noteDeleted', (deletedNote) => {
    io.emit('noteDeleted', deletedNote);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
