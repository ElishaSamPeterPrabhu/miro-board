import React, { useState } from 'react';
import Note from '../note/note';
import './column.module.scss';
import styles from './column.module.scss';

type NoteType = {
  id: string;
  text: string;
};

type ColumnProps = {
  title: string;
  notes: NoteType[];
  onAddNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote: (noteId: string, text: string) => void;
};

const Column: React.FC<ColumnProps> = ({ title, notes, onAddNote, onDeleteNote, onUpdateNote }) => {
  return (
    <div className={styles['column']}>
      <h2>{title}</h2>
      <button onClick={onAddNote} className={styles['add-note-button']}>
        + Add Note
      </button>
      <div className={styles['notes']}>
        {notes.map((note) => (
          <Note
            key={note.id}
            id={note.id}
            text={note.text}
            onTextChange={(text) => onUpdateNote(note.id, text)}
            onDelete={() => onDeleteNote(note.id)} // Passes noteId to delete function
          />
        ))}
      </div>
    </div>
  );
};

export default Column;
