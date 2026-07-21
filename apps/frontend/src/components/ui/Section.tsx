import type { ReactNode } from 'react';
import styles from './Section.module.css';

type Props = {
  title: string;
  children: ReactNode;
};

export const Section = ({ title, children }: Props) => (
  <section className={styles.section}>
    <h2 className={styles.title}>{title}</h2>
    {children}
  </section>
);
