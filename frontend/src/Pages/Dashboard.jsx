import React, { useContext, useEffect } from "react";
import Header from "../Component/Header";
import RealTimeVisualizer from "../Component/RealTimeVisualizer";
import Metrics from "../Component/Metrics";
import Prediction from "../Component/Prediction";
import { useAppState } from "../GlobalContext/AppContext"; // Correctly importing the context

function Dashboard() {
  const {
    ecgLevels,
    bodyPosture,
    salineWaterLevel,
    spo2Level,
    setEcgLevels, // Ensure this is properly imported
    setBodyPosture,
    setSalineWaterLevel,
    setSpo2Level,
  } = useAppState();

  // Ensure all the variables and functions exist in the context

  const fetchSensorData = () => {
    const socket = new WebSocket("ws://127.0.0.1:5000");

    socket.onopen = () => {
      console.log("WebSocket connection established.");
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received WebSocket message:", message);

      if (message.SensorData) {
        const data = message.SensorData;
        console.log("SensorData:", data);

        // Safely update the state only if the set functions are available
        if (setEcgLevels && setBodyPosture &&  setSpo2Level) {
          setEcgLevels(data.ecgValue); // Update ECG levels
          let  fall=data.fallDetected?1:0;
          setBodyPosture(fall); // Update posture
           // Update saline water level
          setSpo2Level(data.bodyTemperature); // Update SPO2 level
        } else {
          console.error("set functions not defined properly in context");
        }
      } else {
        console.warn("Received unrecognized message format:", message);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  useEffect(() => {
    const intervalId = setInterval(fetchSensorData, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="dashboard" style={{ backgroundColor: "#ffffff" }}>
      <Header />
      <h1 style={{ textAlign: "center", color: "#000000" }}></h1> {/*  Title */}
      <div className="gaps">
        <RealTimeVisualizer title="ECG Levels:" chartData={ecgLevels} />
        <RealTimeVisualizer title="Body Posture:" chartData={bodyPosture} />
        <RealTimeVisualizer title="Saline Water Level:" chartData={salineWaterLevel} />
        <RealTimeVisualizer title="SPO2 Level:" chartData={spo2Level} />
      </div>
      <div className="metrics-prediction">
        <Metrics />
        <Prediction />
      </div>
    </div>
  );
}

export default Dashboard;
