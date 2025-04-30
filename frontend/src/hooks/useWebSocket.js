import { useState, useEffect } from "react";
import io from "socket.io-client";

// Dynamically determine WebSocket server URL
const SOCKET_SERVER_URL = `http://${window.location.hostname}:5000`;

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");

  useEffect(() => {
    let storedUsername = localStorage.getItem("username");

    if (!storedUsername) {
      storedUsername = prompt("Enter your name:")?.trim();
      if (!storedUsername) {
        alert("Username is required!");
        window.location.reload();
        return;
      }
      localStorage.setItem("username", storedUsername);
    }

    setUsername(storedUsername);

    // Initialize WebSocket connection
    const socketInstance = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
      socketInstance.emit("set-username", storedUsername);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket server");
    });

    // Receive initial data from server
    socketInstance.on("init", ({ users, code, language, executionOutput }) => {
      setParticipants(users);
      setCode(code);
      setLanguage(language);
      setOutput(executionOutput);
    });

    // Update user list
    socketInstance.on("update-users", (users) => {
      setParticipants(users);
    });

    // Listen for chat messages
    socketInstance.on("chat-message", (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    // Listen for real-time code updates
    socketInstance.on("code-change", (newCode) => {
      setCode(newCode);
    });

    // Listen for language changes and update default code accordingly
    socketInstance.on("language-change", ({ language, code }) => {
      setLanguage(language);
      setCode(code);
    });

    // Listen for execution output updates
    socketInstance.on("execution-output", (newOutput) => {
      setOutput(newOutput);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Function to send messages
  const sendMessage = (message) => {
    if (socket && message.trim() !== "") {
      const messageData = {
        text: message,
        sender: username || "User",
        timestamp: new Date().toISOString(),
      };
      socket.emit("chat-message", messageData);
    }
  };

  // Function to send code updates
  const sendCodeUpdate = (newCode) => {
    if (socket) {
      setCode(newCode);
      socket.emit("code-change", newCode);
    }
  };

  // Function to change language and update code
  const changeLanguage = (newLanguage) => {
    if (socket) {
      socket.emit("language-change", { language: newLanguage }); // ✅ Send only the language
    }
  };
  

  // Function to send execution request
  const sendExecutionRequest = (output) => {
    if (socket) {
      setOutput(output);
      socket.emit("execution-output", output);
    }
  };

  return {
    socket,
    messages,
    sendMessage,
    participants,
    username,
    code,
    setCode: sendCodeUpdate,
    language,
    setLanguage: changeLanguage,
    output,
    sendExecutionRequest,
  };
};
