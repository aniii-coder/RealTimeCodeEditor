import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { executeCode } from "../utils/api";
import { languages } from "../utils/languages";

const CodeEditor = ({ socket }) => {
  const getDefaultLang = () => localStorage.getItem("language") || languages[0].name.toLowerCase();
  const getDefaultCode = (lang) => {
    return languages.find((l) => l.name.toLowerCase() === lang)?.defaultCode || "";
  };

  const [code, setCode] = useState(() => getDefaultCode(getDefaultLang()));
  const [language, setLanguage] = useState(getDefaultLang());
  const [output, setOutput] = useState("");

  // ✅ Sync with WebSocket & Restore Data
  useEffect(() => {
    const handleInit = ({ code, language }) => {
      setCode(code);
      setLanguage(language);
      localStorage.setItem("code", code);
      localStorage.setItem("language", language);
    };

    const handleCodeChange = (newCode) => {
      setCode(newCode);
      localStorage.setItem("code", newCode);
    };

    const handleLanguageChange = ({ language, code }) => {
      setLanguage(language);
      setCode(code);
      localStorage.setItem("language", language);
      localStorage.setItem("code", code);
    };

    const handleExecutionOutput = (receivedOutput) => {
      setOutput(receivedOutput);
    };

    socket.on("init", handleInit);
    socket.on("code-change", handleCodeChange);
    socket.on("language-change", handleLanguageChange);
    socket.on("execution-output", handleExecutionOutput);

    return () => {
      socket.off("init", handleInit);
      socket.off("code-change", handleCodeChange);
      socket.off("language-change", handleLanguageChange);
      socket.off("execution-output", handleExecutionOutput);
    };
  }, [socket]);

  // ✅ Handle Code Changes & Sync with WebSocket
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    localStorage.setItem("code", newCode);
    socket.emit("code-change", newCode);
  };

  // ✅ Handle Language Selection & Sync with WebSocket
  const handleLanguageChange = (event) => {
    const newLang = event.target.value.toLowerCase();
    setLanguage(newLang);

    const newCode = getDefaultCode(newLang);
    setCode(newCode);
    
    localStorage.setItem("language", newLang);
    localStorage.setItem("code", newCode);
    
    socket.emit("language-change", { language: newLang, code: newCode });
  };

  // ✅ Run Code Execution & Sync Output Across Tabs
  const handleRunClick = async () => {
    setOutput("Running...");
    const selectedLang = languages.find((lang) => lang.name.toLowerCase() === language);

    if (!selectedLang) {
      setOutput("Error: Language not supported");
      return;
    }

    try {
      const result = await executeCode(code, selectedLang.id);
      const outputText = result.stdout || result.stderr || "No output";
      setOutput(outputText);
      socket.emit("execution-output", outputText);
    } catch (error) {
      setOutput("Execution Error: " + error.message);
    }
  };

  // ✅ Map languages to CodeMirror extensions
  const getEditorLanguage = () => {
    switch (language) {
      case "javascript":
        return javascript();
      case "python":
        return python();
      case "java":
        return java();
      default:
        return javascript();
    }
  };

  return (
    <div style={styles.container}>
      {/* Language Selector */}
      <div style={styles.languageContainer}>
        <label style={styles.label}>Select Language:</label>
        <select value={language} onChange={handleLanguageChange} style={styles.select}>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.name.toLowerCase()}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Code Editor */}
      <CodeMirror
        value={code}
        theme={vscodeDark}
        extensions={[getEditorLanguage()]}
        onChange={handleCodeChange}
        style={styles.codeEditor}
      />

      {/* Run Button & Output */}
      <div style={styles.bottomSection}>
        <button style={styles.runButton} onClick={handleRunClick}>▶ Run</button>
        <div style={styles.outputBox}>
          <h3 style={styles.outputTitle}>Output:</h3>
          <pre style={styles.outputText}>{output}</pre>
        </div>
      </div>
    </div>
  );
};

// 🎨 Styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#1E1E1E",
    borderRadius: "8px",
    width: "100%",
    height: "100%",
  },
  languageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "10px",
    backgroundColor: "#252526",
    padding: "8px 12px",
    borderRadius: "5px",
    width: "100%",
  },
  label: {
    color: "#FFFFFF",
    marginRight: "10px",
    fontSize: "14px",
  },
  select: {
    padding: "5px",
    backgroundColor: "#3A3D41",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "5px",
    fontSize: "14px",
    cursor: "pointer",
  },
  codeEditor: {
    height: "65vh",
    borderRadius: "5px",
    width: "100%",
    border: "1px solid #3A3D41",
    overflow: "auto",
  },
  bottomSection: {
    width: "100%",
    height: "30vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  runButton: {
    marginTop: "10px",
    padding: "10px 15px",
    fontSize: "16px",
    backgroundColor: "#28A745",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  outputBox: {
    width: "100%",
    height: "26vh",
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#252526",
    color: "#FFFFFF",
    borderRadius: "5px",
    border: "1px solid #3A3D41",
    overflow: "auto",
  },
  outputTitle: {
    fontSize: "16px",
    marginBottom: "5px",
    color: "#FFFFFF",
  },
  outputText: {
    whiteSpace: "pre-wrap",
    fontSize: "14px",
  },
};

export default CodeEditor;