import { useState, useCallback } from "react";
import Editor from "./components/Editor";
import StdinPanel from "./components/StdinPanel";
import OutputPanel from "./components/OutputPanel";
import AstPanel from "./components/AstPanel";
import styles from "./App.module.css";

const DEFAULT_CODE = `SUGOD
  MUGNA NUMERO x = 10, y = 3
  MUGNA TIPIK result
  result = x / y
  IPAKITA: x & " / " & y & " = " & result & $
  IPAKITA: "Maayong adlaw!"
KATAPUSAN`;

interface RunResult {
  output: string;
  ast: object | null;
  error: string | null;
}

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [astOpen, setAstOpen] = useState(true);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdin }),
      });
      const data = (await res.json()) as RunResult;
      setResult(data);
    } catch (err) {
      setResult({
        output: "",
        ast: null,
        error: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  }, [code, stdin]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        void handleRun();
      }
    },
    [handleRun],
  );

  return (
    <div className={styles.app} onKeyDown={handleKeyDown}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoAccent}>Bisaya</span>
          <span className={styles.logoPlus}>++</span>
        </div>
        <p className={styles.tagline}>An online interpreter for the Bisaya++ programming language</p>
        <button
          className={styles.astToggleBtn}
          onClick={() => setAstOpen((v) => !v)}
          title={astOpen ? "Hide parse tree" : "Show parse tree"}
        >
          {astOpen ? "Hide" : "Show"} Parse Tree
        </button>
        <button
          className={styles.runBtn}
          onClick={() => void handleRun()}
          disabled={loading}
          title="Run (Ctrl+Enter)"
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <polygon points="2,1 13,7 2,13" />
            </svg>
          )}
          {loading ? "Running…" : "Run"}
          {!loading && <kbd className={styles.kbd}>Ctrl+↵</kbd>}
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.left}>
          <Editor value={code} onChange={setCode} />
        </div>
        <div className={styles.middle}>
          <StdinPanel value={stdin} onChange={setStdin} />
          <OutputPanel result={result} loading={loading} />
        </div>
        <div className={`${styles.astSidebar} ${astOpen ? styles.astSidebarOpen : styles.astSidebarClosed}`}>
          <AstPanel ast={result?.ast ?? null} loading={loading} />
        </div>
      </main>
    </div>
  );
}
