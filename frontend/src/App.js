import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import CodeEditor from "./components/CodeEditor";
import LiveChat from "./components/LiveChat";
import io from "socket.io-client";

const socket = io(`http://${window.location.hostname}:5000`);

const App = () => {
  const [participants, setParticipants] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 800);
  const [currentUsername, setCurrentUsername] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hashInput, setHashInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(true); // Optional: show loader

  // ✅ Handle resize
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Verify hash on mount
  useEffect(() => {

    localStorage.removeItem("access_hash");
    sessionStorage.removeItem("accessHash");

    const checkHashOnLoad = async () => {
      setIsAuthorized(false);
      setIsVerifying(true);
  
      // Clean up previous data
      localStorage.removeItem("username");
      sessionStorage.removeItem("accessHash");
  
      const storedHash = localStorage.getItem("access_hash");
      if (storedHash) {
        const success = await verifyHash(storedHash);
        if (!success) {
          localStorage.removeItem("access_hash");
          sessionStorage.removeItem("accessHash");
          setIsAuthorized(false); // explicitly mark unauthorized
        }
      }
  
      setIsVerifying(false);
    };
  
    checkHashOnLoad();
  }, []);



  // ✅ Verify Hash Function
  const verifyHash = useCallback(async (customHash = null) => {
    const hash = customHash || sessionStorage.getItem("accessHash");
    if (hash) {
      try {
        const response = await axios.post(`http://${window.location.hostname}:5000/api/verify-hash`, { hash });
        if (response.data.success) {
          sessionStorage.setItem("accessHash", hash);
          localStorage.setItem("access_hash", hash);
          setIsAuthorized(true);
          return true;
        } else {
          sessionStorage.removeItem("accessHash");
          localStorage.removeItem("access_hash");
          return false;
        }
      } catch (error) {
        console.error("Verification failed", error);
        return false;
      }
    }
    return false;
  }, []);

  // ✅ Ask for username after authorization
  useEffect(() => {
    if (isAuthorized) {
      let username = localStorage.getItem("username");
      if (!username) {
        username = prompt("Enter your name:")?.trim() || `Anonymous_${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem("username", username);
      }
      setCurrentUsername(username);
      socket.emit("set-username", username);
    }
  }, [isAuthorized]);

  // ✅ Listen for connected users
  useEffect(() => {
    socket.on("update-users", (users) => setParticipants(users));
    return () => socket.off("update-users");
  }, []);

  // ✅ Loading state
  if (isVerifying) {
    return (
      <div style={styles.hashPage}>
        <h2>⏳ Verifying Access...</h2>
      </div>
    );
  }

  // ✅ Hash input form
  if (!isAuthorized) {
    return (
      <div style={styles.hashPage}>
        <h2>🔐 Enter Access Hash</h2>
        <input
          value={hashInput}
          onChange={(e) => setHashInput(e.target.value)}
          placeholder="Access hash"
          style={styles.input}
        />
        <button
          onClick={async () => {
            setIsVerifying(true);
            const success = await verifyHash(hashInput);
            setIsVerifying(false);
            if (!success) alert("Invalid hash");
          }}
          style={styles.verifyButton}
        >
          Verify
        </button>
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={{ ...styles.sidebar, transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)" }}>
        <button onClick={() => setIsSidebarOpen(false)} style={styles.closeButton}>✖</button>
        <h2 style={styles.title}>👥 Participants ({participants.length})</h2>
        <ul style={styles.list}>
          {participants.length > 0 ? (
            participants.map((user, index) => (
              <li key={user.id || index} style={{ ...styles.participant, ...(user.name === currentUsername ? styles.greenText : {}) }}>
                {user.name}
              </li>
            ))
          ) : (
            <li style={styles.noUser}>No users online</li>
          )}
        </ul>
      </div>

      {/* Toggle button */}
      {!isSidebarOpen && (
        <button onClick={() => setIsSidebarOpen(true)} style={styles.sidebarToggle}>☰</button>
      )}

      {/* Main content */}
      <div style={{ ...styles.content, marginLeft: isSidebarOpen && !isMobileView ? "200px" : "0" }}>
        <div style={styles.codeEditorWrapper}>
          <CodeEditor socket={socket} />
        </div>
        <div style={styles.chatWrapper}>
          <LiveChat socket={socket} currentUser={currentUsername} />
        </div>
      </div>
    </div>
  );
};





const styles = {
  hashPage: { background: "#1E1E1E", color: "white", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  input: { padding: "10px", borderRadius: "5px", border: "none", margin: "10px 0", width: "200px", textAlign: "center" },
  verifyButton: { padding: "10px 20px", backgroundColor: "#007bff", border: "none", color: "white", borderRadius: "5px", cursor: "pointer" },
  container: { display: "flex", height: "100vh", backgroundColor: "#1E1E1E", color: "#FFFFFF", overflow: "hidden" },
  greenText: { color: "limegreen", fontWeight: "bold" },
  sidebar: { width: "200px", backgroundColor: "#252526", padding: "15px", borderRight: "2px solid #3A3D41", display: "flex", flexDirection: "column", alignItems: "center", position: "fixed", top: 0, left: 0, height: "100%", transition: "transform 0.3s ease-in-out", zIndex: 1000 },
  sidebarToggle: { position: "absolute", top: "10px", left: "10px", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", zIndex: 1001 },
  closeButton: { position: "absolute", top: "10px", right: "10px", background: "red", color: "white", border: "none", cursor: "pointer", fontSize: "16px", padding: "5px 10px", borderRadius: "5px" },
  title: { fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#FFFFFF" },
  list: { listStyle: "none", padding: 0, width: "100%" },
  participant: { padding: "10px", backgroundColor: "#3A3D41", borderRadius: "5px", textAlign: "center", marginBottom: "5px", fontSize: "14px" },
  noUser: { padding: "10px", textAlign: "center", fontSize: "14px", color: "#AAAAAA" },
  content: { display: "flex", flex: 1, width: "100%", transition: "margin-left 0.3s ease-in-out" },
  codeEditorWrapper: { flex: 3, display: "flex", justifyContent: "center", alignItems: "center", padding: "10px" },
  chatWrapper: { flex: 2, display: "flex", flexDirection: "column", backgroundColor: "#252526", padding: "10px", borderLeft: "2px solid #3A3D41" },
};

export default App;
