const users = {};
const roomCode = {};
const roomHistory = {};

module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    // ================= JOIN ROOM =================

    socket.on("join-room", ({ roomId, username }) => {

      if (roomHistory[roomId]) {
        socket.emit("history-update", roomHistory[roomId]);
      }

      users[socket.id] = {
        roomId,
        username,
      };

      socket.join(roomId);

      if (roomCode[roomId]) {
        socket.emit("load-code", roomCode[roomId]);
      }

      io.to(roomId).emit("user-joined", {
        message: `${username} joined the room`,
      });

      const roomUsers = Object.values(users)
        .filter((user) => user.roomId === roomId)
        .map((user) => user.username);

      io.to(roomId).emit("users-list", roomUsers);
    });

    // ================= INPUT =================

    socket.on("input-change", (data) => {

      socket.to(data.roomId).emit(
        "receive-input",
        data.input
      );

    });

    // ================= CURSOR =================

    socket.on("cursor-move", (data) => {

      socket.to(data.roomId).emit(
        "cursor-update",
        {
          username: data.username,
          line: data.line,
        }
      );

    });

    // ================= VIDEO CALL =================

    // ================= VIDEO CALL =================

// Tell new user how many users are already inside
socket.on("video-ready", (roomId) => {

    const room = io.sockets.adapter.rooms.get(roomId);

    const usersInRoom = room
        ? room.size
        : 0;

    socket.emit(
        "room-users",
        usersInRoom
    );

    socket.to(roomId).emit(
        "video-ready",
        socket.id
    );

});

// Forward Offer
socket.on("video-offer", (data) => {

    io.to(data.to).emit(
        "video-offer",
        {
            offer: data.offer,
            from: socket.id,
        }
    );

});

// Forward Answer
socket.on("video-answer", (data) => {

    io.to(data.to).emit(
        "video-answer",
        {
            answer: data.answer,
            from: socket.id,
        }
    );

});

// Forward ICE Candidate
socket.on("ice-candidate", (data) => {

    io.to(data.to).emit(
        "ice-candidate",
        {
            candidate: data.candidate,
            from: socket.id,
        }
    );

});

    // ================= CHAT =================

    socket.on("typing", ({ roomId, username }) => {

      socket.to(roomId).emit(
        "user-typing",
        { username }
      );

    });

    socket.on("send-message", (data) => {

      io.to(data.roomId).emit(
        "receive-message",
        data
      );

    });

    // ================= CODE =================

    socket.on("code-change", (data) => {

      roomCode[data.roomId] = data.code;

      socket.to(data.roomId).emit(
        "receive-code",
        data.code
      );

    });

    // ================= FILES =================

    socket.on("add-file", (data) => {

      socket.to(data.roomId).emit(
        "receive-file",
        data.file
      );

    });

    socket.on("delete-file", (data) => {

      socket.to(data.roomId).emit(
        "receive-delete-file",
        data.fileName
      );

    });

    // ================= OUTPUT =================

    socket.on("code-output", (data) => {

      if (!roomHistory[data.roomId]) {
        roomHistory[data.roomId] = [];
      }

      roomHistory[data.roomId].push({
        username: data.username,
        output: data.output,
        language: data.language,
        time: new Date().toLocaleTimeString(),
      });

      io.to(data.roomId).emit(
        "receive-output",
        {
          username: data.username,
          output: data.output,
        }
      );

      io.to(data.roomId).emit(
        "history-update",
        roomHistory[data.roomId]
      );

    });

    // ================= DISCONNECT =================

    socket.on("disconnect", () => {

      const user = users[socket.id];

      if (user) {

        io.to(user.roomId).emit("user-left", {
          message: `${user.username} left the room`,
        });

        delete users[socket.id];

        const roomUsers = Object.values(users)
          .filter((u) => u.roomId === user.roomId)
          .map((u) => u.username);

        io.to(user.roomId).emit(
          "users-list",
          roomUsers
        );

      }

      console.log(
        "User Disconnected:",
        socket.id
      );

    });

  });

};