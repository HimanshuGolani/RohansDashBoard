import React, { useEffect } from "react";
import Header from "../Component/Header";
import RealTimeVisualizer from "../Component/RealTimeVisualizer";
import { useAppState } from "../GlobalContext/AppContext";

function Dashboard() {
  const {
    ecgLevels,
    spo2,
    bodyTemperature,
    fallDetected,
    setEcgLevels,
    setBodyTemp,
    setFallDetected,
    setSpo2,
  } = useAppState();

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

        // Set sensor data or default to 0
        setEcgLevels(Number.isFinite(data.ecgValue) ? data.ecgValue : 0);
        setBodyTemp(
          Number.isFinite(data.bodyTemperature) ? data.bodyTemperature : 0
        );
        setFallDetected(data.fallDetected ? 1 : 0); // Fall detected is binary
        setSpo2(Number.isFinite(data.spo2) ? data.spo2 : 0);
      } else {
        console.warn("Unrecognized message format:", message);

        // Reset all values to default
        setEcgLevels(0);
        setBodyTemp(0);
        setFallDetected(0);
        setSpo2(0);
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
      <div className="gaps">
        <RealTimeVisualizer
          title="ECG Levels"
          chartData={ecgLevels}
          minRange={0}
          maxRange={100}
        />
        <RealTimeVisualizer
          title="Body Temperature"
          chartData={bodyTemperature}
          minRange={0}
          maxRange={38}
        />

        <RealTimeVisualizer
          title="Fall Detected"
          chartData={fallDetected}
          minRange={0}
          maxRange={1}
        />

        <RealTimeVisualizer
          title="Spo2"
          chartData={spo2}
          minRange={0}
          maxRange={120}
        />
      </div>
    </div>
  );
}

export default Dashboard;
