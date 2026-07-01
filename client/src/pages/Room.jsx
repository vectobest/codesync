import "../styles/Room.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import api from "../api/axios";
import { FaPlay, FaUsers } from "react-icons/fa";

// Import Components
import ChatBox from "../components/ChatBox";
import CodeEditor from "../components/CodeEditor";
import VideoCall from "../components/VideoCall";
import RoomHeader from "../components/RoomHeader";
import ProjectManager from "../components/ProjectManager";
import FileExplorer from "../components/FileExplorer";
import OutputPanel from "../components/OutputPanel";
import ExecutionHistory from "../components/ExecutionHistory";
import AIAssistant from "../components/AIAssistant";

function Room() {
  const [newFileName, setNewFileName] = useState("");
  const { roomId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [output, setOutput] = useState("");
  const [outputUser, setOutputUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [input, setInput] = useState(localStorage.getItem("input") || "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [editingUser, setEditingUser] = useState("");
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("idle");
  const [executionTime, setExecutionTime] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "cpp");
  const [files, setFiles] = useState([
    { name: "main.cpp", language: "cpp", code: "// Start Coding" },
  ]);
  const [currentFile, setCurrentFile] = useState(0);

  const addFile = () => {
    if (!newFileName.trim()) return alert("Enter File Name");
    const exists = files.find((file) => file.name === newFileName);
    if (exists) return alert("File already exists");

    const newFile = { name: newFileName, language, code: "" };
    setFiles([...files, newFile]);
    setNewFileName("");
  };

  const deleteFile = (index) => {
    if (files.length === 1) return alert("At least one file is required");
    const deletedFile = files[index];
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);

    if (currentFile >= updated.length) setCurrentFile(updated.length - 1);
    socket.emit("delete-file", { roomId, fileName: deletedFile.name });
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await api.delete(`/api/project/${id}`);
    loadProjects();
  };

  const askAI = async () => {
    if (!aiPrompt) return;
    try {
      setAiLoading(true);
     const res = await api.post("/api/ai",{
        prompt: aiPrompt,
        code: files[currentFile].code,
        language,
      });
      setAiResponse(res.data.response);
    } catch (err) {
      console.log(err);
      setAiResponse("Error getting AI response");
    } finally {
      setAiLoading(false);
    }
  };

  const saveProject = async () => {
    if (!projectName) return alert("Enter Project Name");
    await api.post("/api/save-project", {
      name: projectName,
      roomId,
      language,
      files,
      input,
    });
    alert("Project Saved");
  };

  const loadProjects = async () => {
    const res = await api.get( "/api/projects");
    setProjects(res.data);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(files[currentFile].code);
    alert("Code Copied!");
  };

  const clearOutput = () => {
    setOutput("");
    setExecutionTime(null);
    setStatus("idle");
  };

  const downloadCode = () => {
    const extensions = { cpp: "cpp", python: "py", javascript: "js", java: "java" };
    const blob = new Blob([files[currentFile].code], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${extensions[language]}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID Copied!");
  };

  const handleProjectClick = (project) => {
    if (!project.files || project.files.length === 0) {
      alert("Project has no files");
      return;
    }
    setFiles(project.files.map((file) => ({ ...file })));
    setCurrentFile(0);
    setLanguage(project.language);
    setInput(project.input || "");
    
    localStorage.setItem(`code-${roomId}`, project.files[0].code);
    localStorage.setItem("language", project.language);
    localStorage.setItem("input", project.input || "");
    
    socket.emit("code-change", { roomId, code: project.files[0].code });
    socket.emit("input-change", { roomId, input: project.input || "" });
  };

  useEffect(() => {
    const savedCode = localStorage.getItem(`code-${roomId}`);
    if (savedCode) {
      setFiles((prev) => {
        const updated = [...prev];
        updated[0] = { ...updated[0], code: savedCode };
        return updated;
      });
    }

    socket.emit("join-room", {
      roomId,
      username: localStorage.getItem("username"),
    });

    const handleLoadCode = (savedCode) => {
      setFiles((prev) => {
        const updated = [...prev];
        updated[currentFile] = { ...updated[currentFile], code: savedCode };
        return updated;
      });
    };

    const handleReceiveCode = (newCode) => {
      setFiles((prev) => {
        const updated = [...prev];
        updated[currentFile] = { ...updated[currentFile], code: newCode };
        return updated;
      });
    };

    const handleHistory = (data) => setHistory(data);
    const handleUsersList = (users) => setOnlineUsers(users);
    const handleOutput = (data) => {
      setOutput(data.output);
      setOutputUser(data.username);
    };
    const handleInput = (newInput) => setInput(newInput);
    const handleCursorUpdate = (data) => {
      setEditingUser(`${data.username} is editing line ${data.line}`);
      setTimeout(() => setEditingUser(""), 2000);
    };
    const handleReceiveFile = (file) => setFiles((prev) => [...prev, file]);
    const handleDeleteFile = (fileName) => {
      setFiles((prev) => prev.filter((file) => file.name !== fileName));
    };

    socket.on("receive-delete-file", handleDeleteFile);
    socket.on("receive-file", handleReceiveFile);
    socket.on("cursor-update", handleCursorUpdate);
    socket.on("receive-input", handleInput);
    socket.on("receive-code", handleReceiveCode);
    socket.on("users-list", handleUsersList);
    socket.on("receive-output", handleOutput);
    socket.on("load-code", handleLoadCode);
    socket.on("history-update", handleHistory);

    return () => {
      socket.off("receive-code", handleReceiveCode);
      socket.off("users-list", handleUsersList);
      socket.off("receive-output", handleOutput);
      socket.off("load-code", handleLoadCode);
      socket.off("history-update", handleHistory);
      socket.off("receive-input", handleInput);
      socket.off("cursor-update", handleCursorUpdate);
      socket.off("receive-file", handleReceiveFile);
      socket.off("receive-delete-file", handleDeleteFile);
    };
  }, [roomId, currentFile]);

  const handleCodeChange = (value) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[currentFile] = { ...updated[currentFile], code: value };
      return updated;
    });
    localStorage.setItem(`code-${roomId}`, value);
    socket.emit("code-change", { roomId, code: value });
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    loadProjects();
  }, []);

  const runCode = async () => {
    setStatus("running");
    try {
      const startTime = performance.now();
      const res = await api.post("/api/run",{
        code: files[currentFile].code,
        language,
        input,
      });
      const endTime = performance.now();
      setExecutionTime(((endTime - startTime) / 1000).toFixed(3));

      const finalOutput = res.data.output || "No Output";
      setOutput(finalOutput);
      setOutputUser(localStorage.getItem("username"));
      setStatus("success");

      socket.emit("code-output", {
        roomId,
        username: localStorage.getItem("username"),
        output: finalOutput,
        language,
      });
    } catch (err) {
      console.log(err);
      setStatus("error");
      setOutput("Error Running Code");
    }
  };

  return (
    <div className={`room-container theme-${theme}`}>
      
      {/* 1. HEADER */}
      <RoomHeader 
        roomId={roomId} theme={theme} setTheme={setTheme} 
        copyRoomId={copyRoomId} downloadCode={downloadCode} copyCode={copyCode} 
      />

      {/* 2. TOOLBAR */}
      <div className="toolbar">
        <select className="language-selector" value={language} onChange={(e) => { setLanguage(e.target.value); localStorage.setItem("language", e.target.value); }}>
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
        </select>
        <button className="btn-run" onClick={runCode} disabled={status === "running"}>
          {status === "running" ? "⏳ Running..." : <><FaPlay /> Run Code</>}
        </button>
        <button className="btn-clear" onClick={clearOutput}>Clear Output</button>

        {editingUser && <div className="editing-indicator">🟢 {editingUser}</div>}
      </div>

      {/* 3. EDITOR */}
      <div className="editor-layout">
        <FileExplorer 
          newFileName={newFileName} setNewFileName={setNewFileName} addFile={addFile}
          files={files} currentFile={currentFile} setCurrentFile={setCurrentFile} deleteFile={deleteFile}
        />

        <div className="editor-container">
          <CodeEditor code={files[currentFile].code} setCode={handleCodeChange} roomId={roomId} />
          
          <div className="input-section">
            <h3>Input</h3>
            <textarea
              className="input-textarea" value={input}
              onChange={(e) => {
                setInput(e.target.value);
                localStorage.setItem("input", e.target.value);
                socket.emit("input-change", { roomId, input: e.target.value });
              }}
              placeholder="Enter Input Here..." rows={5}
            />
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* 4. OUTPUT */}
      <OutputPanel 
        status={status} outputUser={outputUser} output={output} executionTime={executionTime} 
      />

      <hr className="divider" />

      {/* 5. VIDEO */}
      <div className="video-section">
        <VideoCall roomId={roomId} />
      </div>

      <hr className="divider" />

      {/* 6. CHAT + AI */}
      <div className="chat-ai-container">
        <div className="online-users-section">
          <h3><FaUsers /> Online Users</h3>
          {onlineUsers.map((user, index) => <div key={index} className="online-user">🟢 {user}</div>)}
        </div>
        
        <AIAssistant 
          aiPrompt={aiPrompt} setAiPrompt={setAiPrompt} askAI={askAI} 
          aiLoading={aiLoading} aiResponse={aiResponse} 
        />

        <ChatBox roomId={roomId} />
      </div>

      <hr className="divider" />

      {/* 7. HISTORY */}
      <ExecutionHistory history={history} />

      <hr className="divider" />

      {/* 8. PROJECTS */}
      <ProjectManager 
        projectName={projectName} setProjectName={setProjectName} projects={projects}
        saveProject={saveProject} loadProjects={loadProjects} deleteProject={deleteProject}
        handleProjectClick={handleProjectClick}
      />

    </div>
  );
}

export default Room;