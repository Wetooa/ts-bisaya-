import styles from "./OutputPanel.module.css";

interface RunResult {
  output: string;
  error: string | null;
}

interface OutputPanelProps {
  result: RunResult | null;
  loading: boolean;
}

export default function OutputPanel({ result, loading }: OutputPanelProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.label}>Output</span>
        {result && !loading && (
          <span className={result.error ? styles.badgeFail : styles.badgeOk}>
            {result.error ? "Error" : "OK"}
          </span>
        )}
      </div>
      <div className={styles.content}>
        {loading && (
          <div className={styles.loading}>
            <span className={styles.spinner} />
            Running…
          </div>
        )}
        {!loading && result === null && (
          <p className={styles.empty}>
            Press <strong>Run</strong> or <kbd>Ctrl+Enter</kbd> to execute your code.
          </p>
        )}
        {!loading && result !== null && result.error && (
          <pre className={styles.error}>{result.error}</pre>
        )}
        {!loading && result !== null && !result.error && (
          <pre className={styles.output}>
            {result.output.length > 0 ? result.output : <span className={styles.noOutput}>(no output)</span>}
          </pre>
        )}
      </div>
    </div>
  );
}
