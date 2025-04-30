import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EnterHashPage from './components/EnterHashPage';
import CodeEditor from './components/CodeEditor'; // Your main editor

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnterHashPage />} />
        <Route path="/editor" element={<CodeEditor />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
