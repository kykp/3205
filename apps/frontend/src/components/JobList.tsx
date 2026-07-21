import { useEffect } from 'react';
import type { JobStatus } from '@3205/shared';
import { jobsActions, useActiveJobId, useJobsList } from '../store/jobs.store';
import styles from './JobList.module.css';

const statusLabels: Record<JobStatus, string> = {
  pending: 'в очереди',
  in_progress: 'в работе',
  completed: 'готово',
  cancelled: 'отменено',
};

const badgeClass: Record<JobStatus, string> = {
  pending: styles.badgePending,
  in_progress: styles.badgeInProgress,
  completed: styles.badgeCompleted,
  cancelled: styles.badgeCancelled,
};

export const JobList = () => {
  const list = useJobsList();
  const activeId = useActiveJobId();

  useEffect(() => {
    void jobsActions.refreshList();
  }, []);

  if (list.length === 0) {
    return <p className={styles.empty}>Пока пусто</p>;
  }

  return (
    <ul className={styles.list}>
      {list.map((job) => {
        const done = job.successCount + job.errorCount;
        const percent = job.total === 0 ? 0 : (done / job.total) * 100;
        return (
          <li key={job.id}>
            <button
              type="button"
              className={`${styles.item} ${activeId === job.id ? styles.active : ''}`}
              onClick={() => jobsActions.setActive(job.id)}
            >
              <div className={styles.itemTop}>
                <span className={styles.id}>{job.id.slice(0, 8)}</span>
                <span className={`${styles.badge} ${badgeClass[job.status]}`}>
                  {statusLabels[job.status]}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${percent}%` }} />
              </div>
              <div className={styles.itemBottom}>
                <span>
                  {done} / {job.total}
                </span>
                {job.errorCount > 0 && (
                  <span className={styles.errCount}>{job.errorCount} ошибок</span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
