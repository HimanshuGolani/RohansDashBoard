

import asyncio
import websockets
import json
import boto3
import decimal

# Initialize DynamoDB resource
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table("cogdb")

# Store the last processed payload
last_processed_payload = None

# Custom JSON encoder to handle Decimal objects from DynamoDB
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super().default(o)

# Fetch data from DynamoDB and modify the data structure
async def fetch_data_from_dynamodb():
    global last_processed_payload
    try:
        print("Fetching data from DynamoDB...")  # Debug statement
        response = table.scan()
        items = response.get("Items", [])

        # Debug statement for raw DynamoDB response
        print(f"Response from DynamoDB: {json.dumps(response, cls=DecimalEncoder, indent=4)}")

        # Initialize data structure with default values
        data = {
            "SensorData": {
                "bodyTemperature": 0,
                "vibrationAngleX": 0,
                "vibrationAngleY": 0,
                "vibrationAngleZ": 0,
                "fallDetected": False,
                "ecgValue": 0
            }
        }

        if items:
            # Get the latest item based on timestamp
            print(f"Items fetched from DynamoDB: {items}")  # Debug statement
            latest_item = max(items, key=lambda x: int(x.get("timestamp", 0)))
            payload = latest_item.get("payload", {})

            # Check if the payload has been updated
            if payload != last_processed_payload:
                print("New payload detected. Updating data...")  # Debug statement
                last_processed_payload = payload

                # Update data fields from the payload
                data["SensorData"]["bodyTemperature"] = payload.get("bodyTemperature", 0)
                data["SensorData"]["vibrationAngleX"] = float(payload.get("vibrationAngleX", 0))
                data["SensorData"]["vibrationAngleY"] = float(payload.get("vibrationAngleY", 0))
                data["SensorData"]["vibrationAngleZ"] = float(payload.get("vibrationAngleZ", 0))
                data["SensorData"]["fallDetected"] = payload.get("fallDetected", False)
                data["SensorData"]["ecgValue"] = int(payload.get("ecgValue", 0))
            else:
                print("No new payload detected. Using previous data.")  # Debug statement
        else:
            print("No items found in DynamoDB.")  # Debug statement

        return data
    except Exception as e:
        print(f"Error fetching data from DynamoDB: {e}")
        return {}

# Handle incoming client connections
async def handle_client(websocket):
    print("New client connected")  # Debug statement
    while True:
        try:
            message = await websocket.recv()
            received_data = json.loads(message)
            print("Received from client:", json.dumps(received_data, indent=4))

        except websockets.exceptions.ConnectionClosed:
            print("Connection with client closed.")  # Debug statement
            break

        except Exception as e:
            print(f"Error receiving data from client: {e}")
            break

# Send data from DynamoDB to WebSocket clients
async def send_data_from_dynamodb(websocket, path):
    receive_task = asyncio.create_task(handle_client(websocket))

    try:
        while True:
            data = await fetch_data_from_dynamodb()
            print("Fetched data from DynamoDB:", json.dumps(data, indent=4))

            if data:
                print("Sending data to client...")  # Debug statement
                await websocket.send(json.dumps(data))
            else:
                print("No data to send.")

            await asyncio.sleep(1)  # Adjust the sleep time as needed

    except Exception as e:
        print(f"Error sending data to client: {e}")

    finally:
        receive_task.cancel()
        try:
            await receive_task
        except asyncio.CancelledError:
            pass
        print("Receive task cancelled.")  # Debug statement

# Start the WebSocket server
start_server = websockets.serve(send_data_from_dynamodb, "127.0.0.1", 5000)

print("WebSocket server starting on ws://127.0.0.1:5000")  # Debug statement
asyncio.get_event_loop().run_until_complete(start_server)
print("WebSocket server is running.")  # Debug statement
asyncio.get_event_loop().run_forever()
