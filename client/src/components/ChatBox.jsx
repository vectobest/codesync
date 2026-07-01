import { useState, useEffect } from "react";
import { socket } from "../socket/socket";

function ChatBox({ roomId }) {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleUserJoined = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          text: data.message,
        },
      ]);
    };

    const handleUserLeft = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          text: data.message,
        },
      ]);
    };

    const handleTyping = (data) => {
      setTypingUser(`${data.username} is typing...`);

      setTimeout(() => {
        setTypingUser("");
      }, 1500);
    };

    socket.off("receive-message");
    socket.off("user-joined");
    socket.off("user-left");
    socket.off("user-typing");

    socket.on("receive-message", handleMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("user-typing", handleTyping);

    return () => {
      socket.off("receive-message", handleMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("user-typing", handleTyping);
    };
  }, []);

  const sendMessage = () => {
    if (!msg.trim()) return;

    socket.emit("send-message", {
      roomId,
      username: localStorage.getItem("username"),
      text: msg,
    });

    setMsg("");
  };

  return (
    <div>
      <h2>Chat</h2>

      {messages.map((m, i) =>
        m.system ? (
          <div
            key={i}
            style={{
              color: "#00ff99",
              textAlign: "center",
              margin: "8px 0",
              fontStyle: "italic",
            }}
          >
            {m.text}
          </div>
        ) : (
          <p key={i}>
            <strong>{m.username}:</strong> {m.text}
          </p>
        )
      )}

      <input
        type="text"
        value={msg}
        onChange={(e) => {
          setMsg(e.target.value);

          socket.emit("typing", {
            roomId,
            username: localStorage.getItem("username"),
          });
        }}
        placeholder="Type message..."
      />

      <button onClick={sendMessage}>
        Send
      </button>

      {typingUser && (
        <div
          style={{
            color: "#00ff99",
            fontStyle: "italic",
            marginTop: "5px",
          }}
        >
          {typingUser}
        </div>
      )}
    </div>
  );
}

export default ChatBox;