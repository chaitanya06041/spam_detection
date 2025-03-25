import React, { useState } from "react";
import "./SpamGemini.css";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import axios from "axios";
import { ThreeDot } from "react-loading-indicators";

function SpamGemini() {
  let [emails, setEmails] = useState([]);
  let [clicked, setclicked] = useState(false);
  let [text, setText] = useState("");
  let [predictClicked, setPredictClicked] = useState(false);
  let [predictionLoaded, setPredictionLoaded] = useState(false);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(null);
  const [outPut, setOutput] = useState(null);
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = async () => {
    setclicked(true);
    setEmails([]);
    setSelectedEmailIndex(null);
    setPredictionLoaded(false);
    setIsSelected(false);
    try {
      const response = await axios.post("http://127.0.0.1:5000/fetch-email");
      console.log(response.data);

      setclicked(false);
      setEmails(response.data);
      setText(emails[0].body);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePredict = async () => {
    setOutput(null);
    setPredictClicked(true);
    setPredictionLoaded(false);
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        text,
      });
      console.log(response);
      setPredictionLoaded(true);
      setPredictClicked(false);
      setOutput(response.data);
    } catch (err) {
      console.error("error :", err);
    }
  };
  return (
    <div className="spam_container">
      <div className="fetch_btn">
        <Stack spacing={2} direction="row">
          <Button variant="contained" onClick={handleClick}>
            Fetch Latest Emails from Gmail
          </Button>
        </Stack>
      </div>
      {clicked && (
        <div className="loading">
          <ThreeDot
            color="#232923"
            size="medium"
            text="Fetching emails"
            textColor=""
          />
        </div>
      )}
      {emails.length > 0 && (
        <div className="response">
          <div className="emails_data">
            {emails.map((email, ind) => (
              <div className="msgbox_container" key={ind}>
                <input
                  type="radio"
                  name="email"
                  value={ind}
                  checked={selectedEmailIndex === ind}
                  onChange={() => {
                    setSelectedEmailIndex(ind);
                    setText(email.body);
                    setIsSelected(true);
                  }}
                ></input>
                <div className="message_container">
                  {email.body.length > 500
                    ? email.body.slice(0, 500) + "..."
                    : email.body}
                </div>
              </div>
            ))}
          </div>

          {isSelected && (
            <div className="predict_btn">
              <Stack spacing={2} direction="row">
                <Button variant="contained" onClick={handlePredict}>
                  Predict for Spam
                </Button>
              </Stack>
            </div>
          )}

          <div className="outputs">
            {predictClicked && (
              <div className="loading">
                <ThreeDot
                  color="#232923"
                  size="medium"
                  text="Analyzing Messagge"
                  textColor=""
                />
              </div>
            )}
            {predictionLoaded && (
              <>
                <div className="naive_output op">
                  <h3>Naive Bayes Output</h3>
                  <p>
                    Email is
                    <span
                      style={{
                        color: outPut.naive.spam ? "#fa0202" : "#0aad51", fontWeight: 600
                      }}
                    >
                      {outPut.naive.spam ? " Spam" : " Not Spam"}
                    </span>
                  </p>
                </div>
                <div className="gemini_output op">
                  <h3>Gemini Output</h3>
                  <p>
                    Email is
                    <span
                      style={{
                        color:
                          outPut.gemini.classification === "Spam" ? "#fa0202" : "#0aad51", fontWeight: 600,
                      }}
                    >
                      {" " + outPut.gemini.classification}
                    </span>
                  </p>
                  {outPut.gemini.classification === "Not Spam" && (
                    <p>Email Category: {outPut.gemini.category}</p>
                  )}

                  {outPut.gemini.classification === "Spam" && (
                    <p>
                      Spam Words
                      <ul>
                        {outPut.gemini.spam_words.map((word, index) => (
                          <li key={index}>{word}</li>
                        ))}
                      </ul>
                    </p>
                  )}
                  {outPut.gemini.classification === "Spam" && (
                    <p>Recommendation: {outPut.gemini.suggestion}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpamGemini;
