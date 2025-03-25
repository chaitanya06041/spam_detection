import React, { useEffect, useState } from "react";
import axios from "axios";
import "./History.css";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    axios
      .get("http://127.0.0.1:5000/history")
      .then((response) => setHistory(response.data))
      .catch((error) => console.error("Error fetching history:", error));
    
  };

  const clearHistory = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete the history? This action cannot be undone!");
    
    if (confirmDelete) {
      axios
        .delete("http://127.0.0.1:5000/clear-history")
        .then(() => {
          setHistory([]); // Clear the frontend state
        })
        .catch((error) => console.error("Error clearing history:", error));
    }
  };
  

  return (
    <div className="history-container">
      <div className="history-box">
        <h2>Message History</h2>
        {history.length > 0 ? (
          <>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Label</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index} className={item.label === "spam" ? "spam-row" : "not-spam-row"}>
                    <td>{item.message.length > 300 ? item.message.slice(0,300)+"..." : item.message}</td>
                    <td className={item.label === "spam" ? "spam-text" : "not-spam-text"}>
                      {item.label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="clear-btn" onClick={clearHistory}>
              Clear History
            </button>
          </>
        ) : (
          <p className="no-history">No history available.</p>
        )}
      </div>
    </div>
  );
}

export default History;
