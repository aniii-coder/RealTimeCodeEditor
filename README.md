<h1>⚡ Real-Time Code Editor & Collaborator</h1>

<p>
  <strong>Live collaborative code editor</strong> built with <strong>React</strong> (frontend)
  and <strong>Node.js + Socket.IO</strong> (backend). Supports multiple users editing
  and running code simultaneously with real-time syncing.
</p>

<h2>🚀 Features</h2>
<ul>
  <li>🧠 Real-time collaboration using WebSockets (Socket.IO)</li>
  <li>🧪 Code execution with Judge0 API</li>
  <li>📚 Multiple language support</li>
  <li>🔐 Private room creation with unique IDs</li>
  <li>📁 Modular project structure (frontend & backend)</li>
</ul>

<h2>📁 Project Structure</h2>

<pre>
RealTimeCodeEditor/
├── backend/           # Node.js server with Socket.IO
│   ├── server.js
│   └── package.json
├── frontend/          # React client
│   ├── src/
│   ├── .env           # Contains backend API URL
│   └── package.json
└── README.md
</pre>

<h2>🛠️ Setup Instructions</h2>

<h3>1. Clone the Repository</h3>
<pre><code>
git clone https://github.com/aniii-coder/RealTimeCodeEditor.git
cd RealTimeCodeEditor
</code></pre>

<h3>2. Backend Setup</h3>
<pre><code>
cd backend
npm install
</code></pre>

<h4>➤ Configure Judge API</h4>
<p>
Create a <code>.env</code> file inside the <code>backend/</code> directory and add the following:
</p>
<pre><code>
JUDGE_API_KEY=your_judge_api_key_here
</code></pre>

<p>
🔓 You must unlock your own <strong>Judge API</strong> instance via
<a href="https://rapidapi.com/judge0-official/api/judge0-ce" target="_blank">RapidAPI</a> or host your own.
</p>

<h3>3. Frontend Setup</h3>
<pre><code>
cd ../frontend
npm install
</code></pre>


<h3>4. Running the App</h3>
<p>Use two separate terminals:</p>

<pre><code>
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
</code></pre>

<h2>🌐 Deployment Notes (Render)</h2>
<ul>
  <li><strong>Backend:</strong> Deploy as a Web Service (Root: <code>backend</code>)</li>
  <li><strong>Frontend:</strong> Deploy as a Static Site (Root: <code>frontend</code>)</li>
  <li>Set required environment variables in both deployments</li>
</ul>

<h2>📌 Author</h2>
<p>
  Developed by <strong>Aniket Singh</strong><br>
  🔗 <a href="https://github.com/aniii-coder" target="_blank">GitHub Profile</a>
</p>
