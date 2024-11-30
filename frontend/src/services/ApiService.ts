import { io, Socket } from "socket.io-client";
import { TextData } from "../types/types";

console.log(process.env.REACT_APP_API_URL);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export class ApiService {
  private static socket: Socket | null = null;

  static initializeSocket(): Socket {
    if (!this.socket) {
      this.socket = io(API_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });
    }

    return this.socket;
  }

  static async fetchTexts(): Promise<TextData[]> {
    try {
      const response = await fetch(`${API_URL}/api/texts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching texts:", error);
      throw error;
    }
  }

  static async postText(content: string): Promise<TextData> {
    try {
      const response = await fetch(`${API_URL}/api/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error posting text:", error);
      throw error;
    }
  }

  static disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
