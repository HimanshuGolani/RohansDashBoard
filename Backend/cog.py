import websocket
import json
import time

def on_message(ws, message):
    print(f"Received from server: {message}")

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws):
    print("Connection closed")

def on_open(ws):
    print("Connection opened")
    # Send test data
    test_data = {
        "SensorData": {
            "bodyTemperature": 37.5,
            "vibrationAngleX": 15,
            "vibrationAngleY": -10,
            "vibrationAngleZ": 5,
            "fallDetected": False,
            "ecgValue": 1000
        }
    }
    ws.send(json.dumps(test_data))
    print("Sent test data.")

# Create a WebSocket app
ws = websocket.WebSocketApp(
    "ws://127.0.0.1:5000",
    on_message=on_message,
    on_error=on_error,
    on_close=on_close,
    on_open=on_open,
)

# Run the WebSocket app
ws.run_forever()
