import { useState } from 'react';
import { parseUrls } from '../lib/parseUrls';
import { useJobsStore } from '../store/jobs.store';
import styles from './JobForm.module.css';

const EXAMPLE_URLS = [
  'https://google.com',
  'https://example.com',
  'https://github.com',
  'https://cloudflare.com',
  'https://not-a-real-domain-xyz-12345.com',
];

export const JobForm = () => {
  const [text, setText] = useState('');
  const submitting = useJobsStore((s) => s.submitting);
  const error = useJobsStore((s) => s.error);
  const createJob = useJobsStore((s) => s.createJob);

  const fillExample = () => setText(EXAMPLE_URLS.join('\n'));

  const submit = async () => {
    const urls = parseUrls(text);
    if (urls.length === 0) return;
    await createJob(urls);
    if (!useJobsStore.getState().error) {
      setText('');
    }
  };

  return (
    <form className={styles.form} action={submit}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`https://example.com\nhttps://google.com`}
        rows={6}
        disabled={submitting}
      />
      <div className={styles.actions}>
        <button
          type="button"
          onClick={fillExample}
          className={styles.exampleButton}
          disabled={submitting}
        >
          Пример
        </button>
        <button
          type="submit"
          className={styles.button}
          disabled={submitting || text.trim().length === 0}
        >
          {submitting ? 'Отправка…' : 'Запустить проверку'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
};
