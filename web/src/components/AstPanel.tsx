import { useState } from "react";
import styles from "./AstPanel.module.css";

interface AstPanelProps {
  ast: object | null;
  loading: boolean;
}

export default function AstPanel({ ast, loading }: AstPanelProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.label}>Parse Tree</span>
        {!loading && ast !== null && (
          <span className={styles.badge}>AST</span>
        )}
      </div>
      <div className={styles.content}>
        {loading && (
          <div className={styles.loading}>
            <span className={styles.spinner} />
            Parsing…
          </div>
        )}
        {!loading && ast === null && (
          <p className={styles.empty}>No parse tree yet. Run your code to see the AST.</p>
        )}
        {!loading && ast !== null && (
          <div className={styles.tree}>
            <JsonNode value={ast} depth={0} />
          </div>
        )}
      </div>
    </div>
  );
}

interface JsonNodeProps {
  value: unknown;
  depth: number;
  keyName?: string;
}

function JsonNode({ value, depth, keyName }: JsonNodeProps) {
  const [collapsed, setCollapsed] = useState(depth > 2);

  const indent = depth * 14;

  if (value === null || value === undefined) {
    return (
      <div className={styles.row} style={{ paddingLeft: indent }}>
        {keyName !== undefined && <span className={styles.key}>{keyName}: </span>}
        <span className={styles.null}>null</span>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className={styles.row} style={{ paddingLeft: indent }}>
        {keyName !== undefined && <span className={styles.key}>{keyName}: </span>}
        <span className={styles.bool}>{value ? "true" : "false"}</span>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className={styles.row} style={{ paddingLeft: indent }}>
        {keyName !== undefined && <span className={styles.key}>{keyName}: </span>}
        <span className={styles.number}>{value}</span>
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <div className={styles.row} style={{ paddingLeft: indent }}>
        {keyName !== undefined && <span className={styles.key}>{keyName}: </span>}
        <span className={styles.string}>"{value}"</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className={styles.row} style={{ paddingLeft: indent }}>
          {keyName !== undefined && <span className={styles.key}>{keyName}: </span>}
          <span className={styles.punctuation}>[]</span>
        </div>
      );
    }

    return (
      <div>
        <div
          className={`${styles.row} ${styles.collapsible}`}
          style={{ paddingLeft: indent }}
          onClick={() => setCollapsed((c) => !c)}
        >
          <span className={styles.arrow}>{collapsed ? "▶" : "▼"}</span>
          {keyName !== undefined && <span className={styles.key}>{keyName}: </span>}
          <span className={styles.punctuation}>[{collapsed ? ` … ${value.length} items` : ""}</span>
        </div>
        {!collapsed &&
          value.map((item, i) => (
            <JsonNode key={i} value={item} depth={depth + 1} keyName={String(i)} />
          ))}
        {!collapsed && (
          <div className={styles.row} style={{ paddingLeft: indent }}>
            <span className={styles.punctuation}>]</span>
          </div>
        )}
      </div>
    );
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    const nodeType = typeof obj["type"] === "string" ? obj["type"] : null;

    if (keys.length === 0) {
      return (
        <div className={styles.row} style={{ paddingLeft: indent }}>
          {keyName !== undefined && <span className={styles.key}>{keyName}: </span>}
          <span className={styles.punctuation}>{"{}"}</span>
        </div>
      );
    }

    return (
      <div>
        <div
          className={`${styles.row} ${styles.collapsible}`}
          style={{ paddingLeft: indent }}
          onClick={() => setCollapsed((c) => !c)}
        >
          <span className={styles.arrow}>{collapsed ? "▶" : "▼"}</span>
          {keyName !== undefined && <span className={styles.key}>{keyName}: </span>}
          {nodeType && <span className={styles.nodeType}>{nodeType}</span>}
          {collapsed && <span className={styles.punctuation}> {"{ … }"}</span>}
        </div>
        {!collapsed &&
          keys.map((k) => (
            <JsonNode key={k} value={obj[k]} depth={depth + 1} keyName={k} />
          ))}
      </div>
    );
  }

  return null;
}
