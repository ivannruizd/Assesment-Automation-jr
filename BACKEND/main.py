from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# allow the react frontend comunicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# current state of the simulated machine 
machine_state = {
    "motor_speed": 0,
    "valve_open": False
}
#to get the state of the machines when the frontend is loaded to see if it is online or offline and to see the last known state of the machines 
@app.get("/api/state")
def get_state():
    return machine_state
#update motor speed
@app.post("/api/motor/{speed}")
def set_motor_speed(speed: int):
    machine_state["motor_speed"] = speed
    return {"status": "success", "motor_speed": speed}
#update valve state
@app.post("/api/valve/{state}")
def set_valve_state(state: bool):
    machine_state["valve_open"] = state
    return {"status": "success", "valve_open": state}
#update temperature from the url
@app.get("/api/temperature")
async def get_temperature():
    url = "https://api.open-meteo.com/v1/forecast?latitude=24.0203&longitude=-104.6576&current_weather=true"
    
    try:
        # I Set a 5-second timeout for the the API request
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            response.raise_for_status() # Verifica si hubo un error HTTP (ej. 404, 500)
            data = response.json()
            return {
                "status": "online",
                "temperature": data["current_weather"]["temperature"], 
                "unit": "C"
            }
    except Exception as e:
        # If there's no internet connection or the API fails, we return an offline status
        return {
            "status": "offline", 
            "temperature": None, 
            "unit": "C", 
            "error": str(e)
        }