function AIAssistant({ aiPrompt, setAiPrompt, askAI, aiLoading, aiResponse }) {
  return (
    <div className="ai-section">
      <h3>🤖 AI Assistant</h3>
      <textarea
        className="ai-textarea"
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        placeholder="Ask AI..."
        rows={3}
      />
      <button className="btn-ai" onClick={askAI}>
        {aiLoading ? "Thinking..." : "Ask AI"}
      </button>

      {aiResponse && <pre className="ai-response">{aiResponse}</pre>}
    </div>
  );
}

export default AIAssistant;