import styles from "./DayPath.module.css";

type Props = {
  total: number;
  completed: number;
  label: string;
};

export function DayPath({ total, completed, label }: Props) {
  return (
    <div
      className={styles.path}
      role="img"
      aria-label={label}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={i < completed ? styles.done : styles.tick}
        />
      ))}
    </div>
  );
}
