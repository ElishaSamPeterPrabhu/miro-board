import styles from './app.module.scss';
import React, { useState, useEffect } from 'react';
import  Column  from "../lib/column/column";

// Define Note and Column types
type Note = {
  id: string;
  text: string;
};

type Column = {
  id: string;
  title: string;
  notes: Note[];
};

const App = () => {
  const [columns, setColumns] = useState<Column[]>([
    { id: '1', title: 'Column 1', notes: [] },
    { id: '2', title: 'Column 2', notes: [] },
    { id: '3', title: 'Column 3', notes: [] },
  ]);

  // Fetch notes from server on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const response = await Promise.all(columns.map(column =>
      fetch(`http://localhost:5000/notes/${column.id}`)
    ));

    const data = await Promise.all(response.map(res => res.json()));

    setColumns((prevColumns) =>
      prevColumns.map((column, index) => ({
        ...column,
        notes: data[index] || [],
      }))
    );
  };


  const addNote = async (columnId: string) => {
    const newNote = { text: '' };
    const response = await fetch(`http://localhost:5000/notes/${columnId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote),
    });
    const createdNote = await response.json();
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === columnId
          ? { ...column, notes: [...column.notes, createdNote] }
          : column
      )
    );
  };

  const updateNote = async (columnId: string, noteId: string, text: string) => {
    await fetch(`http://localhost:5000/notes/${columnId}/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              notes: column.notes.map((note) =>
                note.id === noteId ? { ...note, text } : note
              ),
            }
          : column
      )
    );
  };

  return (
    <div className={styles.app}>
      {columns.map((column) => (
        <Column
          key={column.id }
          title={column.title}
          notes={column.notes}
          onAddNote={() => addNote(column.id)}
          onUpdateNote={(noteId, text) => updateNote(column.id, noteId, text)}
        />
      ))}
    </div>
  );
};

export default App;
