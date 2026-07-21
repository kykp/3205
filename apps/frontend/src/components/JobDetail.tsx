import type { JobStatus, UrlStatus } from '@3205/shared';
import { usePollingJob } from '../hooks/usePollingJob';
import {
  jobsActions,
  useActiveJobDetail,
  useActiveJobId,
  useJobsCancelling,
} from '../store/jobs.store';
import styles from './JobDetail.module.css';

const jobStatusLabel: Record<JobStatus, string> = {
  pending: 'в очереди',
  in_progress: 'в работе',
  completed: 'готово',
  cancelled: 'отменено',
};

const jobBadgeClass: Record<JobStatus, string> = {
  pending: styles.badgePending,
  in_progress: styles.badgeInProgress,
  completed: styles.badgeCompleted,
  cancelled: styles.badgeCancelled,
};

const urlDotClass: Record<UrlStatus, string> = {
  pending: styles.dotPending,
  in_progress: styles.dotInProgress,
  success: styles.dotSuccess,
  error: styles.dotError,
  cancelled: styles.dotCancelled,
};

const TERMINAL_URL_STATUSES: UrlStatus[] = ['success', 'error', 'cancelled'];
const CANCELLABLE_JOB_STATUSES: JobStatus[] = ['pending', 'in_progress'];

export const JobDetail = () => {
  const activeId = useActiveJobId();
  const detail = useActiveJobDetail();
  const cancelling = useJobsCancelling();

  usePollingJob(activeId);

  if (!activeId) {
    return <p className={styles.empty}>Выбери задание слева</p>;
  }

  if (!detail) {
    return <p className={styles.empty}>Загрузка…</p>;
  }

  const done = detail.urls.filter((u) => TERMINAL_URL_STATUSES.includes(u.status)).length;
  const total = detail.urls.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const canCancel = CANCELLABLE_JOB_STATUSES.includes(detail.status);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerMeta}>
            <div className={styles.eyebrow}>Задание</div>
            <div className={styles.title}>
              <span className={styles.titleId}>{detail.id.slice(0, 8)}</span>
              <span className={`${styles.badge} ${jobBadgeClass[detail.status]}`}>
                {jobStatusLabel[detail.status]}
              </span>
            </div>
          </div>
          {canCancel && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => void jobsActions.cancelActive()}
              disabled={cancelling}
            >
              {cancelling ? 'Отмена…' : 'Отменить'}
            </button>
          )}
        </div>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>
          <div className={styles.progressMeta}>
            <span>
              {done} / {total}
            </span>
            <span className={styles.percent}>{percent}%</span>
          </div>
        </div>
      </header>

      <ul className={styles.urls}>
        {detail.urls.map((u, i) => (
          <li key={i} className={styles.url}>
            <span className={`${styles.dot} ${urlDotClass[u.status]}`} aria-hidden />
            <span className={styles.urlText}>{u.url}</span>
            <div className={styles.urlMeta}>
              {u.httpStatus !== undefined && (
                <span className={styles.httpStatus}>HTTP {u.httpStatus}</span>
              )}
              {u.durationMs !== undefined && <span>{u.durationMs}мс</span>}
              {u.errorMessage && <span className={styles.errorMsg}>{u.errorMessage}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
