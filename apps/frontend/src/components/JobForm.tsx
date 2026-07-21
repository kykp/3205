import { useState, type FormEvent } from 'react';
import { useJobsStore } from '../store/jobs.store';
import styles from './JobForm.module.css';

export const JobForm = () => {
  const [text, setText] = useState('');
  const submitting = useJobsStore((s) => s.submitting);
  const error = useJobsStore((s) => s.error);
  const createJob = useJobsStore((s) => s.createJob);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const urls = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (urls.length === 0) return;
    await createJob(urls);
    if (!useJobsStore.getState().error) {
      setText('');
    }
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`https://example.com\nhttps://google.com`}
        rows={6}
        disabled={submitting}
      />
      <button
        type="submit"
        className={styles.button}
        disabled={submitting || text.trim().length === 0}
      >
        {submitting ? 'Отправка...' : 'Запустить проверку'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
};
