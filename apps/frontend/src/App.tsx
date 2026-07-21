import { JobDetail } from './components/JobDetail';
import { JobForm } from './components/JobForm';
import { JobList } from './components/JobList';
import styles from './App.module.css';

const App = () => (
  <div className={styles.app}>
    <aside className={styles.sidebar}>
      <section>
        <h2>Новое задание</h2>
        <JobForm />
      </section>
      <section>
        <h2>Задания</h2>
        <JobList />
      </section>
    </aside>
    <main className={styles.detail}>
      <JobDetail />
    </main>
  </div>
);

export default App;
