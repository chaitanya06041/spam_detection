import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./Graph.css";

const COLORS = ["red", "green"]; // Colors for spam and not spam
const COLORS2 = ["blue", "green"]; // Colors for work and personal

function Graph() {
  const [data, setData] = useState([]);
  const [emailData, setEmailData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    axios
      .get("http://127.0.0.1:5000/graphs") // Fetch message history
      .then((response) => {
        const messages = response.data; // Assuming the response is an array of objects [{ text: "...", label: "Spam" }, { text: "...", label: "Not Spam" }]
        console.log("messages: ", messages);
        // Count spam and not spam messages
        let spamCount = 0;
        let notSpamCount = 0;
        let workCount = 0;
        let personalCount = 0;

        messages.forEach((message) => {
          if (message.label.toLowerCase() === "spam") {
            spamCount++;
          } else {
            notSpamCount++;
          }

          if (message.category.toLowerCase() === "personal") {
            personalCount++;
          }
          if (message.category.toLowerCase() === "work") {
            workCount++;
          }
        });

        // Set data for the pie chart
        setData([
          { name: "Spam", value: spamCount },
          { name: "Not Spam", value: notSpamCount },
        ]);
        setEmailData([
          { name: "Personal", value: personalCount },
          { name: "work", value: workCount },
        ]);
        setIsLoaded(true);
      })
      .catch((error) => console.error("Error fetching history:", error));
  }, []);

  const renderCustomizedLabel = ({ percent }) => {
    return `${(percent * 100).toFixed(2)}%`; // Format to two decimal places
  };

  return (
    <div className="graph">
      <h2>Spam vs Not Spam Messages</h2>
      {isLoaded && data.length > 0 ? (
        <div className="all_graphs">
          <div className="row">
            <PieChart width={400} height={400}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
            {/* Bar Chart */}
            <BarChart width={400} height={400} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>

          </div>
          <div className="row">
            <PieChart width={400} height={400}>
              <Pie
                data={emailData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {emailData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS2[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
            {/* Bar Chart */}
            <BarChart width={400} height={400} data={emailData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </div>
        </div>
      ) : isLoaded ? (
        <p>No Data Found</p>
      ) : <p>Loading</p>}
      <p></p>
    </div>
  );
}

export default Graph;
