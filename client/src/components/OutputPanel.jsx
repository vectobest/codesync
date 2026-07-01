function OutputPanel({ status, outputUser, output, executionTime }) {
  return (
    <>
      {executionTime && (
        <div className="execution-time">⏱ Execution Time: {executionTime}s</div>
      )}
      <div className="output-section">
        <h3>Output</h3>
        <div className="output-status">
          {status === "running" && "⏳ Running..."}
          {status === "success" && "✅ Success"}
          {status === "error" && "❌ Error"}
        </div>
        {outputUser && (
          <div className="output-user">🚀 {outputUser} executed the code</div>
        )}
        <pre className="output-text">{output}</pre>
      </div>
    </>
  );
}

export default OutputPanel;