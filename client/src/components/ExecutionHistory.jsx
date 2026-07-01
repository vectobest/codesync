function ExecutionHistory({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="history-section">
      <h3>Execution History</h3>
      {history.slice().reverse().map((item, index) => (
        <div key={index} className="history-item">
          <div>👤 {item.username}</div>
          <div>💻 {item.language}</div>
          <div>⏰ {item.time}</div>
          <div className="history-output">{item.output}</div>
        </div>
      ))}
    </div>
  );
}

export default ExecutionHistory;