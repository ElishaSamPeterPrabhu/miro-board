import styles from './my-library.module.scss';

export function MyLibrary() {
  return (
    <div className={styles['container']}>
      <h1>Welcome to MyLibrary!</h1>
    </div>
  );
}

export default MyLibrary;
