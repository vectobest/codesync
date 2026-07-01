import { useState } from "react";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

function Home() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();

  const createRoom = () => {
    console.log("Create Room Clicked");
    console.log("Username:", username);

    if (!username.trim()) {
      alert("Please enter username");
      return;
    }

    localStorage.setItem("username", username);

    console.log(
      "Saved Username:",
      localStorage.getItem("username")
    );

    const id = nanoid(6);

    console.log("Room ID:", id);

    navigate(`/room/${id}`);
  };

  const joinRoom = () => {
    console.log("Join Room Clicked");

    if (!username.trim()) {
      alert("Please enter username");
      return;
    }

    if (!roomId.trim()) {
      alert("Please enter Room ID");
      return;
    }

    localStorage.setItem("username", username);

    console.log(
      "Saved Username:",
      localStorage.getItem("username")
    );

    navigate(`/room/${roomId}`);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>CodeSync</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br />
      <br />

      <button onClick={createRoom}>
        Create Room
      </button>

      <br />
      <br />

      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button onClick={joinRoom}>
        Join Room
      </button>
    </div>
  );
}

export default Home;