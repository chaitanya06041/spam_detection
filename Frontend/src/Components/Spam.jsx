import React, { useState } from "react";
import axios from "axios";
// import "./Spam.css"; // Import the CSS file

function Spam() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [words, setWords] = useState([]);

  const checkSpam = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", { text });
      setResult(response.data.spam ? "🚨 Spam Detected!" : "✅ Not Spam");
      setWords(response.data.words);
    } catch (error) {
      console.error("Error:", error);
      setResult("Error checking spam.");
    }
  };

  return (
    <div className="spam_container">
      <div className="spam-box">
        <h2>Spam Detector</h2>
        <textarea
          rows="4"
          placeholder="Enter your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={checkSpam}>Check Spam</button>
        {result && <h3 className={result.includes("Spam") ? "spam-text" : "not-spam-text"}>{result}</h3>}
        {words.length > 0 && (
          <div className="common-words">
            <h4>Common Spam Words:</h4>
            <p>
              {words.join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Spam;
