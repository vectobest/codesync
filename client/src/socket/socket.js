import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/config";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});
