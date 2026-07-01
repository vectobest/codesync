import { FaCopy, FaDownload } from "react-icons/fa";

function RoomHeader({ roomId, theme, setTheme, copyRoomId, downloadCode, copyCode }) {
  return (
    <div className="room-header">
      <h1 className="room-title">Room : {roomId}</h1>
      <button className="btn-copy-room" onClick={copyRoomId}>
        <FaCopy />
      </button>
      <button className="btn-download" onClick={downloadCode}>
        <FaDownload /> Download
      </button>
      <button className="btn-copy-code" onClick={copyCode}>
        <FaCopy /> Copy Code
      </button>
      <select
        className="theme-selector"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="dark">🌙 Dark</option>
        <option value="light">☀️ Light</option>
        <option value="dracula">🧛 Dracula</option>
      </select>
    </div>
  );
}

export default RoomHeader;