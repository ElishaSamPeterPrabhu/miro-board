import React, { useState } from 'react';
import Note from '../note/note';
import './column.module.scss';
import styles from './column.module.scss';

interface ColumnProps {
  title?: string;
  onAddNote: () => void;
  notes: { id: string; text: string }[];
  onUpdateNote: (id: string, text: string) => void;
}

const Column: React.FC<ColumnProps> = ({ title = 'Column', onAddNote, notes, onUpdateNote }) => {
  const [columnTitle, setColumnTitle] = useState(title);

  return (
<div className={styles.column}>
  <input
    className={styles['column-title']}
    value={columnTitle}
    onChange={(e) => setColumnTitle(e.target.value)}
    placeholder="Column Title"
  />
  <button className={styles['add-note-btn']} onClick={onAddNote}>
    +
  </button>
  <div className={styles.notes}>
    {notes.map((note) => (
      <Note
        key={note.id}
        id={note.id}
        text={note.text}
        onTextChange={(newText) => onUpdateNote(note.id, newText)}
      />
    ))}
  </div>
</div>

  );
};

export default Column;
