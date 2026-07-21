import type { JobStatus, UrlStatus } from '@3205/shared';
import { usePollingJob } from '../hooks/usePollingJob';
import {
  jobsActions,
  useActiveJobDetail,
  useActiveJobId,
  useJobsCancelling,
} from '../store/jobs.store';
import styles from './JobDetail.module.css';

const urlStatusLabel: Record<UrlStatus, string> = {
  pending: 'в очереди',
  in_progress: 'в работе',
  success: 'успех',
  error: 'ошибка',
  cancelled: 'отменено',
};

const urlBadgeClass: Record<UrlStatus, string> = {
  pending: styles.badgePending,
  in_progress: styles.badgeInProgress,
  success: styles.badgeSuccess,
  error: styles.badgeError,
  cancelled: styles.badgeCancelled,
};

const jobStatusLabel: Record<JobStatus, string> = {
  pending: 'в очереди',
  in_progress: 'в работе',
  completed: 'готово',
  cancelled: 'отменено',
};

const jobBadgeClass: Record<JobStatus, string> = {
  pending: styles.badgePending,
  in_progress: styles.badgeInProgress,
  completed: styles.badgeSuccess,
  cancelled: styles.badgeError,
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
  const percent = total === 0 ? 0 : (done / total) * 100;
  const canCancel = CANCELLABLE_JOB_STATUSES.includes(detail.status);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <div className={styles.title}>
            Задание
            <span className={styles.titleId}>{detail.id.slice(0, 8)}</span>
            <span className={`${styles.badge} ${jobBadgeClass[detail.status]}`}>
              {jobStatusLabel[detail.status]}
            </span>
          </div>
          <div className={styles.progress}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${percent}%` }} />
            </div>
            <span className={styles.counter}>
              {done} / {total}
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
            {cancelling ? 'Отмена…' : 'Отменить задание'}
          </button>
        )}
      </header>

      <ul className={styles.urls}>
        {detail.urls.map((u, i) => (
          <li key={i} className={styles.url}>
            <div className={styles.urlTop}>
              <span className={styles.urlText}>{u.url}</span>
              <span className={`${styles.badge} ${urlBadgeClass[u.status]}`}>
                {urlStatusLabel[u.status]}
              </span>
            </div>
            {(u.httpStatus !== undefined || u.errorMessage || u.durationMs !== undefined) && (
              <div className={styles.urlMeta}>
                {u.httpStatus !== undefined && <span>HTTP {u.httpStatus}</span>}
                {u.errorMessage && <span className={styles.errorMsg}>{u.errorMessage}</span>}
                {u.durationMs !== undefined && <span>{u.durationMs}мс</span>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
