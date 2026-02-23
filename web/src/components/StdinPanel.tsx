import styles from "./StdinPanel.module.css";

interface StdinPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StdinPanel({ value, onChange }: StdinPanelProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.label}>Input (stdin)</span>
        <span className={styles.hint}>one line per DAWAT:</span>
      </div>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        placeholder={"e.g.\n5\n3, 7"}
      />
    </div>
  );
}
