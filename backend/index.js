const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const crypto = require('crypto');
const app = express();
app.use(cors());
app.use(express.json());
const validHashes = new Set();
function generateAccessHash() {
  const hash = crypto.randomBytes(4).toString('hex'); 
  validHashes.add(hash);
  return hash; 
}
app.post('/api/verify-hash', (req, res) => {
  const { hash } = req.body;
  if (validHashes.has(hash)) {
    return res.status(200).json({ success: true });
  }
  return res.status(401).json({ success: false });
});
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});
const defaultCodes = {
  javascript: `console.log("Hello, World!");`,
  python: `print("Hello, World!")`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}`,
  "c++": `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}`,
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
};

let code = defaultCodes["javascript"];
let language = "javascript";
let chatMessages = [];
let users = new Map();
let executionOutput = "";

io.on("connection", (socket) => {

  socket.on("set-username", (username) => {
    let finalUsername = username?.trim() || `User_${Math.floor(Math.random() * 1000)}`;
    
    const existingUsernames = new Set(users.values());
    let count = 1;
    while (existingUsernames.has(finalUsername)) {
      finalUsername = `${username}_${count++}`;
    }

    users.set(socket.id, finalUsername);
    console.log(`🔵 User connected = 👤${username} = ${socket.id}`);


    socket.emit("init", {
      code,
      language,
      chatMessages,
      users: [...users.entries()].map(([id, name]) => ({ id, name })),
      executionOutput,
    });

    io.emit("update-users", [...users.entries()].map(([id, name]) => ({ id, name })));
  });

  socket.on("code-change", (newCode) => {
    if (typeof newCode === "string") {
      code = newCode;
      socket.broadcast.emit("code-change", newCode);
    }
  });

  socket.on("language-change", (data) => {
    const newLanguage = data.language; 
  
    if (typeof newLanguage === "string") {
      const normalizedLang = newLanguage.toLowerCase();
  
      if (defaultCodes[normalizedLang]) {
        language = normalizedLang;
        code = defaultCodes[normalizedLang];
  
        console.log(`🌍 Language changed to: ${language}`); 
  
        io.emit("language-change", { language, code }); 
      } else {
        socket.emit("error", "Unsupported language selected");
      }
    } else {
      console.error("❌ Invalid newLanguage received:", data);
    }
  });
  

  socket.on("execution-output", (output) => {
    executionOutput = output;
    io.emit("execution-output", output);
  });

  socket.on("chat-message", (messageData) => {
    chatMessages.push(messageData);
    io.emit("chat-message", messageData);
  });

  socket.on("disconnect", (username) => {
    console.log(`🔴 User disconnected = ${username} =  ${socket.id}`);
    if (users.has(socket.id)) {
      users.delete(socket.id);
      io.emit("update-users", [...users.entries()].map(([id, name]) => ({ id, name })));
    }
  });
});
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
  const newHash = generateAccessHash(); 
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔐 Access Hash for frontend use: ${newHash}`);
});

