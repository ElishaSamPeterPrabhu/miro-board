import React from 'react';
import styles from './note.module.scss';

interface NoteProps {
  id: string;
  text: string;
  onTextChange: (text: string) => void;
}

const Note: React.FC<NoteProps> = ({ text, onTextChange }) => {
  return (
    <div className={styles.note}>
    <textarea
      className={styles['text-area']}
      value={text}
      onChange={(e) => onTextChange(e.target.value)}
      placeholder="Type your note here..."
    />
    </div>
  );
};

export default Note;
