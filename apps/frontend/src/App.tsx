import { JobDetail } from './components/JobDetail';
import { JobForm } from './components/JobForm';
import { JobList } from './components/JobList';
import { Section } from './components/ui/Section';
import styles from './App.module.css';

const App = () => (
  <div className={styles.app}>
    <aside className={styles.sidebar}>
      <Section title="Новое задание">
        <JobForm />
      </Section>
      <Section title="Задания">
        <JobList />
      </Section>
    </aside>
    <main className={styles.detail}>
      <JobDetail />
    </main>
  </div>
);

export default App;
