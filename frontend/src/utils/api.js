const API_KEY = "API_KEY"; // 🔥 Replace with your actual API key

export const executeCode = async (sourceCode, languageId) => {
  const url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true";
  const options = {
    method: "POST",
    headers: {
      "x-rapidapi-key": API_KEY, // ✅ Replace with actual key
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      language_id: languageId,
      source_code: btoa(sourceCode), // ✅ Encode source code to base64
      stdin: btoa(""), // ✅ Provide empty input (if needed)
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.error) {
      return `Error: ${data.error}`;
    }

    // ✅ Decode base64 output
    const stdout = data.stdout ? atob(data.stdout) : "";
    const stderr = data.stderr ? atob(data.stderr) : "";
    const compileOutput = data.compile_output ? atob(data.compile_output) : "";

    return {
      stdout,
      stderr,
      compileOutput,
    };
  } catch (error) {
    console.error("Error executing code:", error);
    return { stdout: "", stderr: "Execution error", compileOutput: "" };
  }
};



export const verifyHash = async (hash) => {
  try {
    const response = await fetch('http://localhost:5000/api/verify-hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash }),
    });
    return await response.json();
  } catch (error) {
    console.error('Hash verification error:', error);
    return { success: false };
  }
};
