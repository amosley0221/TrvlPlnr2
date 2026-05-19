// Pipeline / "peek under the hood" view — streams API tool calls

function jsonHighlight(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (value === null) return <span className="b">null</span>;
  if (typeof value === "string") return <span className="s">"{value}"</span>;
  if (typeof value === "number") return <span className="n">{value}</span>;
  if (typeof value === "boolean") return <span className="b">{String(value)}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="p">[]</span>;
    return (
      <>
        <span className="p">[</span>
        {value.map((v, i) => (
          <span key={i}>
            {"\n" + pad + "  "}
            {jsonHighlight(v, indent + 1)}
            {i < value.length - 1 ? <span className="p">,</span> : null}
          </span>
        ))}
        {"\n" + pad}<span className="p">]</span>
      </>
    );
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return <span className="p">{"{}"}</span>;
    return (
      <>
        <span className="p">{"{"}</span>
        {keys.map((k, i) => (
          <span key={k}>
            {"\n" + pad + "  "}
            <span className="k">"{k}"</span><span className="p">: </span>
            {jsonHighlight(value[k], indent + 1)}
            {i < keys.length - 1 ? <span className="p">,</span> : null}
          </span>
        ))}
        {"\n" + pad}<span className="p">{"}"}</span>
      </>
    );
  }
  return <span>{String(value)}</span>;
}

function truncateForDisplay(obj, depth = 0) {
  // Make giant Duffel offer fit — strip ids and trim arrays
  if (Array.isArray(obj)) {
    return obj.slice(0, 2).map(v => truncateForDisplay(v, depth + 1)).concat(obj.length > 2 ? [`…(+${obj.length - 2})`] : []);
  }
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (depth > 3) continue;
      out[k] = truncateForDisplay(v, depth + 1);
    }
    return out;
  }
  return obj;
}

function Pipeline({ activeIdx }) {
  const frames = window.PIPELINE.slice(0, activeIdx + 1);
  return (
    <div className="pipeline">
      <div className="pipeline-head">
        <div className="dot3"><span className="a"></span><span className="b"></span><span className="c"></span></div>
        <span className="label">agent.runtime · trip-tulum-001</span>
        <span className="grow"></span>
        <span className="pill-live">LIVE</span>
      </div>
      <div className="pipeline-body" ref={el => { if (el) el.scrollTop = el.scrollHeight; }}>
        {frames.map((f, i) => <Frame key={i} f={f} isLast={i === frames.length - 1} />)}
      </div>
    </div>
  );
}

function Frame({ f, isLast }) {
  if (f.kind === "thought") {
    return (
      <div className="frame thought">
        <span className="arrow">▸</span>
        <span>{f.text}{isLast ? <span className="cursor"></span> : null}</span>
      </div>
    );
  }
  if (f.kind === "tool") {
    return (
      <div className="frame tool">
        <div className="tool-head">
          <span className="tk">→ call</span>
          <span className="nm">{f.name}</span>
          <span className="meta">POST · 200ms</span>
        </div>
        <div className="tool-body">
          <pre className="json">{jsonHighlight(truncateForDisplay(f.req))}</pre>
        </div>
      </div>
    );
  }
  if (f.kind === "result") {
    return (
      <div className="frame result">
        <div className="res-head">
          <span className="ok">← 200</span>
          <span className="nm">{f.from}</span>
          <span className="ms">{Math.floor(120 + Math.random() * 280)}ms</span>
        </div>
        <div className="res-body">
          <pre className="json">{jsonHighlight(truncateForDisplay(f.data))}</pre>
          {f.summary && <div className="summary">💡 {f.summary}</div>}
        </div>
      </div>
    );
  }
  return null;
}

Object.assign(window, { Pipeline, jsonHighlight, truncateForDisplay });
