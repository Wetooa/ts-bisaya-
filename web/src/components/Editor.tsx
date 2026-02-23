import { useRef, useCallback } from "react";
import styles from "./Editor.module.css";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const next = value.substring(0, start) + "  " + value.substring(end);
        onChange(next);
        requestAnimationFrame(() => {
          el.selectionStart = start + 2;
          el.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.label}>Code</span>
        <span className={styles.hint}>Tab inserts 2 spaces</span>
      </div>
      <div className={styles.editorArea}>
        <LineNumbers value={value} />
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Write your Bisaya++ code here…"
        />
      </div>
    </div>
  );
}

function LineNumbers({ value }: { value: string }) {
  const lines = value.split("\n");
  return (
    <div className={styles.lineNumbers} aria-hidden>
      {lines.map((_, i) => (
        <div key={i} className={styles.lineNumber}>
          {i + 1}
        </div>
      ))}
    </div>
  );
}
