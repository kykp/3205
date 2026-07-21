import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <section>
          <h2>Новое задание</h2>
          <p className={styles.stub}>(форма будет тут)</p>
        </section>
        <section>
          <h2>Задания</h2>
          <p className={styles.stub}>(список будет тут)</p>
        </section>
      </aside>
      <main className={styles.detail}>
        <p className={styles.empty}>Выбери задание слева</p>
      </main>
    </div>
  );
}

export default App;
