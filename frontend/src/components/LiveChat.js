import React, { useState, useEffect, useRef } from "react";

const LiveChat = ({ socket, currentUser, setCurrentUser }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // ✅ Clear username and chat messages on refresh
  useEffect(() => {
    window.addEventListener("beforeunload", () => {
      localStorage.removeItem("chatMessages");
      localStorage.removeItem("username");
    });

    return () => {
      window.removeEventListener("beforeunload", () => {
        localStorage.removeItem("chatMessages");
        localStorage.removeItem("username");
      });
    };
  }, []);

  // ✅ Handle Incoming Messages
  useEffect(() => {
    const handleNewMessage = (messageData) => {
      console.log("📥 Received message:", messageData);
      setMessages((prev) => [...prev, messageData]);
    };

    socket.on("chat-message", handleNewMessage);

    return () => {
      socket.off("chat-message", handleNewMessage);
    };
  }, [socket]);

  // ✅ Handle Sending Messages
  const sendMessage = () => {
    if (message.trim() === "") return;
    const messageData = { text: message, sender: currentUser };

    socket.emit("chat-message", messageData); // ✅ Send to server
    setMessage(""); // ✅ Clear input field
  };

  // ✅ Handle "Enter" Key Press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  // ✅ Auto-scroll to Latest Message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.chatContainer}>
      <h3 style={styles.title}>💬 Live Chat</h3>

      {/* Chat Messages */}
      <div style={styles.chatMessages}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.chatMessage}>
            <strong style={msg.sender === currentUser ? styles.currentUser : {}}>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Send Button */}
      <div style={styles.chatInputContainer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress} // ✅ Send on Enter
          style={styles.chatInput}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} style={styles.sendButton}>Send</button>
      </div>
    </div>
  );
};

// 🎨 Styles
const styles = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "95%",
    backgroundColor: "#1e1e1e",
    borderRadius: "8px",
    padding: "10px",
    gap: "10px",
  },
  title: {
    textAlign: "center",
    color: "white",
  },
  chatMessages: {
    flex: 1,
    height: "100vh",
    overflowY: "auto",
    padding: "10px",
    backgroundColor: "#282828",
    borderRadius: "8px",
    maxHeight: "700px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  chatMessage: {
    padding: "8px",
    marginBottom: "5px",
    backgroundColor: "#383838",
    borderRadius: "5px",
    color: "white",
  },
  currentUser: {
    color: "#4CAF50", // ✅ Green for current user
  },
  chatInputContainer: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#333",
    borderRadius: "8px",
  },
  chatInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#555",
    color: "white",
  },
  sendButton: {
    marginLeft: "10px",
    padding: "8px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default LiveChat;
