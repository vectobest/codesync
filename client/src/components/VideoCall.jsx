import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";

function VideoCall({ roomId }) {

  const myVideo = useRef(null);
  const remoteVideo = useRef(null);

  const localStream = useRef(null);
  const peerConnection = useRef(null);
  const remoteSocket = useRef(null);

  const [connected, setConnected] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const createPeerConnection = () => {

    if (peerConnection.current) return;

peerConnection.current = new RTCPeerConnection({
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
      ],
    },
  ],
});

    peerConnection.current.onconnectionstatechange = () => {

  console.log(
    "Connection State :",
    peerConnection.current.connectionState
  );

  if (
    peerConnection.current.connectionState ===
    "connected"
  ) {

    setConnected(true);

  }

};
peerConnection.current.oniceconnectionstatechange =
  () => {

    console.log(
      "ICE State :",
      peerConnection.current.iceConnectionState
    );

};
peerConnection.current.onsignalingstatechange =
  () => {

    console.log(
      "Signaling State :",
      peerConnection.current.signalingState
    );

};
peerConnection.current.onicegatheringstatechange =
  () => {

    console.log(
      "ICE Gathering :",
      peerConnection.current.iceGatheringState
    );

};

    localStream.current
      ?.getTracks()
      .forEach(track => {

        peerConnection.current.addTrack(
          track,
          localStream.current
        );

      });

    peerConnection.current.ontrack = (event) => {
         console.log("🎥 ontrack Fired");

    console.log("Streams:", event.streams);

    console.log("Track:", event.track.kind);

      if (remoteVideo.current) {

        remoteVideo.current.srcObject =
          event.streams[0];

        setConnected(true);

      }

    };

    peerConnection.current.onicecandidate = (event) => {

      if (
        event.candidate &&
        remoteSocket.current
      ) {

        socket.emit("ice-candidate", {

          to: remoteSocket.current,

          candidate: event.candidate,

        });

      }

    };
    peerConnection.current.onconnectionstatechange = () => {

  console.log(
    "Connection State :",
    peerConnection.current.connectionState
  );

  if (
    peerConnection.current.connectionState ===
    "connected"
  ) {
    setConnected(true);
  }

};

peerConnection.current.oniceconnectionstatechange = () => {

  console.log(
    "ICE State :",
    peerConnection.current.iceConnectionState
  );

};

peerConnection.current.onsignalingstatechange = () => {

  console.log(
    "Signaling State :",
    peerConnection.current.signalingState
  );

};

peerConnection.current.onicegatheringstatechange = () => {

  console.log(
    "ICE Gathering :",
    peerConnection.current.iceGatheringState
  );

};

  };

  const startCamera = async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: true,
          audio: true,

        });

      localStream.current = stream;

      if (myVideo.current) {

        myVideo.current.srcObject = stream;

      }

      createPeerConnection();

      socket.emit(
        "video-ready",
        roomId
      );

    }

    catch (err) {

      console.log(err);

      alert("Camera Permission Denied");

    }

  };
  const shareScreen = async () => {

  try {

    const screenStream =
      await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

    const screenTrack =
      screenStream.getVideoTracks()[0];

    const sender =
      peerConnection.current
        .getSenders()
        .find(
          sender =>
            sender.track &&
            sender.track.kind === "video"
        );

    if (sender) {

      await sender.replaceTrack(screenTrack);

    }

    if (myVideo.current) {

      myVideo.current.srcObject =
        screenStream;

    }

    setIsSharing(true);

    screenTrack.onended = async () => {

      const cameraTrack =
        localStream.current.getVideoTracks()[0];

      await sender.replaceTrack(cameraTrack);

      myVideo.current.srcObject =
        localStream.current;

      setIsSharing(false);

    };

  }

  catch (err) {

    console.log(err);

  }

};

  useEffect(() => {

    startCamera();

    socket.on(
      "room-users",
      (count) => {

        console.log(
          "Users in Room:",
          count
        );

      }
    );

   socket.on(
  "video-ready",
  async (socketId) => {

    console.log("📹 video-ready received from:", socketId);

    remoteSocket.current = socketId;

    if (!peerConnection.current) {
      console.log("❌ PeerConnection not created");
      return;
    }

    console.log("🟡 Creating Offer...");

    const offer =
      await peerConnection.current.createOffer();

    console.log("✅ Offer Created:", offer);

    await peerConnection.current.setLocalDescription(
      offer
    );

    console.log("📤 Sending Offer...");

    socket.emit("video-offer", {
      to: socketId,
      roomId,
      offer,
    });

  }
);
        // Receive Offer
    socket.on(
      "video-offer",
      async ({ offer, from }) => {

        remoteSocket.current = from;

        if (!peerConnection.current) {
          createPeerConnection();
        }

        try {

          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

          const answer =
            await peerConnection.current.createAnswer();

          await peerConnection.current.setLocalDescription(
            answer
          );

          socket.emit("video-answer", {

            to: from,

            answer,

          });

        }

        catch (err) {

          console.log(err);

        }

      }
    );

    // Receive Answer
    socket.on(
      "video-answer",
      async ({ answer }) => {

        try {

          await peerConnection.current.setRemoteDescription(

            new RTCSessionDescription(answer)

          );

        }

        catch (err) {

          console.log(err);

        }

      }
    );

    // Receive ICE Candidate
   socket.on("ice-candidate", async ({ candidate }) => {

  if (
    !candidate ||
    !peerConnection.current
  ) {
    return;
  }

  try {

    if (
      peerConnection.current.remoteDescription
    ) {

      await peerConnection.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );

    }

  } catch (err) {

    console.log(
      "ICE Error",
      err
    );

  }

});
    return () => {

      socket.off("room-users");
      socket.off("video-ready");
      socket.off("video-offer");
      socket.off("video-answer");
      socket.off("ice-candidate");

      if (localStream.current) {

        localStream.current
          .getTracks()
          .forEach(track => track.stop());

      }

      if (peerConnection.current) {

        peerConnection.current.close();

        peerConnection.current = null;

      }

    };

  }, [roomId]);

  // Toggle Camera
  const toggleCamera = () => {

    const track =
      localStream.current
        ?.getVideoTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;

    setCameraOn(track.enabled);

  };


  // Toggle Mic
  const toggleMic = () => {

    const track =
      localStream.current
        ?.getAudioTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;

    setMicOn(track.enabled);

  };
    return (

    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        background: "#1e293b",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ color: "white" }}>
        📹 Video Call
      </h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
          <button
  onClick={shareScreen}
  disabled={isSharing}
  style={{
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  {isSharing
    ? "🖥 Sharing..."
    : "🖥 Share Screen"}
</button>
        {/* My Camera */}
        <div>

          <h3
            style={{
              color: "white",
            }}
          >
            My Camera
          </h3>

          <video
            ref={myVideo}
            autoPlay
            muted
            playsInline
            style={{
              width: "350px",
              height: "250px",
              background: "black",
              borderRadius: "12px",
              objectFit: "cover",
            }}
          />

        </div>

        {/* Remote Camera */}
        <div>

          <h3
            style={{
              color: "white",
            }}
          >
            Remote Camera
          </h3>

          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            style={{
              width: "350px",
              height: "250px",
              background: "black",
              borderRadius: "12px",
              objectFit: "cover",
            }}
          />

        </div>

      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >

        <button
          onClick={toggleCamera}
          style={{
            padding: "10px 20px",
            background: cameraOn
              ? "#22c55e"
              : "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {cameraOn
            ? "📷 Camera ON"
            : "🚫 Camera OFF"}
        </button>

        <button
          onClick={toggleMic}
          style={{
            padding: "10px 20px",
            background: micOn
              ? "#22c55e"
              : "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {micOn
            ? "🎤 Mic ON"
            : "🔇 Mic OFF"}
        </button>

      </div>

      <div
        style={{
          marginTop: "15px",
          color: connected
            ? "#22c55e"
            : "#f59e0b",
          fontWeight: "bold",
        }}
      >
        {connected
          ? "🟢 Connected"
          : "🟡 Waiting for another user..."}
      </div>

    </div>
  );

}

export default VideoCall;