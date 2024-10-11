import styles from './app.module.scss';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Column from '../lib/column/column';

type Note = {
  id: string;
  text: string;
};

type ColumnType = {
  id: string;
  title: string;
  notes: Note[];
};

const socket = io('http://localhost:5000'); // Adjust the URL if needed

const App: React.FC = () => {
  const [columns, setColumns] = useState<ColumnType[]>([
    { id: '1', title: 'What Went Well', notes: [] },
    { id: '2', title: 'What Could Be Improved', notes: [] },
    { id: '3', title: 'Action Items', notes: [] },
  ]);

  useEffect(() => {
    fetchNotes();

    socket.on('noteAdded', (note) => handleNoteAddition(note));
    socket.on('noteUpdated', (updatedNote) => handleNoteUpdate(updatedNote));
    socket.on('noteDeleted', (deletedNote) => handleNoteDeletion(deletedNote));

    return () => {
      socket.off('noteAdded');
      socket.off('noteUpdated');
      socket.off('noteDeleted');
    };
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:5000/notes');
      const data = await response.json();

      console.log("Fetched notes data:", data);

      if (!Array.isArray(data)) {
        throw new Error("Expected data to be an array");
      }

      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          notes: data.filter((note: { columnId: string }) => note.columnId === column.id),
        }))
      );
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };
  const handleNoteAddition = (note: Note & { columnId: string }) => {
    setColumns((prevColumns) =>
        prevColumns.map((column) =>
            column.id === note.columnId
                ? {
                    ...column,
                    notes: column.notes.some(n => n.id === note.id)
                        ? column.notes
                        : [...column.notes, { id: note.id, text: note.text }]
                }
                : column
        )
    );
};


  const handleNoteUpdate = (updatedNote: { id: string; text: string; columnId: string; }) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === updatedNote.columnId
          ? {
              ...column,
              notes: column.notes.map((note) =>
                note.id === updatedNote.id ? { ...note, text: updatedNote.text } : note
              ),
            }
          : column
      )
    );
  };

  const handleNoteDeletion = (deletedNote: { id: string; columnId: string; }) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === deletedNote.columnId
          ? {
              ...column,
              notes: column.notes.filter((note) => note.id !== deletedNote.id),
            }
          : column
      )
    );
  };

  const addNote = async (columnId: string) => {

    const newNote = { text: '', columnId };
    const response = await fetch(`http://localhost:5000/notes/${columnId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote),
    });
    const createdNote = await response.json();
    handleNoteAddition(createdNote);
    socket.emit('noteAdded', createdNote);
  };

  const updateNote = async (columnId: string, noteId: string, text: string) => {
    await fetch(`http://localhost:5000/notes/${columnId}/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const updatedNote = { id: noteId, text, columnId };
    handleNoteUpdate(updatedNote);

    socket.emit('noteUpdated', updatedNote);
  };

  const deleteNote = async (columnId: string, noteId: string) => {
    await fetch(`http://localhost:5000/notes/${columnId}/${noteId}`, { method: 'DELETE' });
    const deletedNote = { id: noteId, columnId };
    handleNoteDeletion(deletedNote);

    socket.emit('noteDeleted', deletedNote);
  };

  const exportNotes = () => {
    const notesData = Object.entries(columns).flatMap(([columnId, column]) =>
      column.notes.map(note => ({ ...note, columnId }))
    );
    const json = JSON.stringify(notesData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importNotes = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const contents = e.target?.result;
      if (typeof contents === 'string') {
        const importedNotes = JSON.parse(contents);
        const newColumns = [...columns];
        importedNotes.forEach((note: Note & { columnId: string }) => {
          const column = newColumns.find(col => col.id === note.columnId);
          if (column) {
            column.notes.push(note);
          }
        });
        setColumns(newColumns);
        importedNotes.forEach((note: string) => socket.emit('noteAdded', note));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div>
        <button onClick={exportNotes} className={styles.exportButton}>Export Notes</button>
        <input
          type="file"
          accept=".json"
          onChange={importNotes}
          className={styles.importInput}
          style={{ display: 'none' }}
          id="importInput"
        />
        <label htmlFor="importInput" className={styles.importButton}>Import Notes</label>
      </div>
      <div className={styles.app}>
        {columns.map((column) => (
          <Column
            key={column.id}
            title={column.title}
            notes={column.notes}
            onAddNote={() => addNote(column.id)}
            onDeleteNote={(noteId) => deleteNote(column.id, noteId)}
            onUpdateNote={(noteId, text) => updateNote(column.id, noteId, text)}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
