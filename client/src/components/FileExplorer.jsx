function FileExplorer({ newFileName, setNewFileName, addFile, files, currentFile, setCurrentFile, deleteFile }) {
  return (
    <div className="file-explorer">
      <h3>📁 Files</h3>
      <input
        className="new-file-input"
        value={newFileName}
        onChange={(e) => setNewFileName(e.target.value)}
        placeholder="New File"
      />
      <button className="btn-new-file" onClick={addFile}>+ New File</button>

      {files.map((file, index) => (
        <div key={index} className={`file-item ${currentFile === index ? "active-file" : ""}`}>
          <span className="file-name" onClick={() => setCurrentFile(index)}>
            📄 {file.name}
          </span>
          <button className="btn-delete-file" onClick={() => deleteFile(index)}>
            🗑
          </button>
        </div>
      ))}
    </div>
  );
}

export default FileExplorer;