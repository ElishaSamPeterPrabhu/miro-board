// Note.tsx

import React from 'react';
import styles from './note.module.scss';

type NoteProps = {
  id: string;
  text: string;
  onTextChange: (text: string) => void;
  onDelete: () => void;
};

const Note: React.FC<NoteProps> = ({ text, onTextChange, onDelete }) => {
  return (
    <div className={styles['note']}>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Type your note here..."
      />
      <button onClick={onDelete} className={styles['delete-button']}>
        Delete
      </button>
    </div>
  );
};

export default Note;
