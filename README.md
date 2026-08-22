# Machine Control Panel

> [!WARNING]
> **Important Note on the `.env` file:** When creating your environment variables file, make sure to verify and use the correct Host (e.g., `localhost` instead of `127.0.0.1`). By default, incorrect host configurations can cause connection blocks between the frontend and the backend when launching the project.

A small full-stack web application that simulates a machine control panel.

The project uses a Python/FastAPI backend and a React frontend. The backend maintains the simulated machine state, while the frontend works as a web-based HMI for monitoring and control.

The machine includes:

* Motor speed control from 0 to 3000 RPM.
* Valve open/close control.
* Ambient temperature obtained from the Open-Meteo public API.
* Visual feedback for the motor and valve.

## Requirements

Before running the project, make sure you have:

* Python 3.8+
* Node.js and npm
* Git
* A modern web browser

You can verify the installations with:

```bash
python --version
node --version
npm --version
git --version
```

## Installation

### 1. Clone the repository

Clone the repository and move into the project folder:

```bash
git clone <your-repository-url>
cd <project-folder>
```

If you are using VS Code, you can open the project with:

```bash
code .
```

The backend and frontend run separately, so you will need two terminals.

In VS Code, you can open the integrated terminal from:

**Terminal → New Terminal**

Then use the `+` button in the terminal panel to open a second terminal.

---

## 2. Backend

Open **Terminal 1** and move into the backend folder:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it.

**Command Prompt:**

```cmd
venv\Scripts\activate.bat
```

**PowerShell:**

```powershell
venv\Scripts\Activate.ps1
```

After activation, you should see `(venv)` at the beginning of the terminal prompt.

Install the dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python main.py
```

The backend should be available at:

```text
http://localhost:8001
```

Keep this terminal running.

---

## 3. Frontend

Open **Terminal 2** and move into the frontend folder:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Inside the `frontend` folder, create a file named `.env` next to `package.json`.

Add:

```env
VITE_API_URL=http://localhost:8001/api
```

Then start the frontend:

```bash
npm run dev
```

Vite should display the local URL in the terminal. By default, this is:

```text
http://localhost:5173
```

Open that address in your browser.

> If you create or modify `.env` while Vite is running, restart the frontend with `Ctrl + C` and then run `npm run dev` again.

---

## How to Run

You should have two terminals running:

```text
Terminal 1 → Python backend
Terminal 2 → React frontend
```

Then open the frontend URL shown by Vite in your browser.

If everything is running correctly, the Machine Control Panel should load and the system status should show:

```text
SYSTEM ONLINE
```

This indicates that the React frontend can communicate with the Python backend.

## Quick Test

### Motor

Move the motor slider through a few values:

```text
0 → 1000 → 2000 → 3000 → 0 RPM
```

The motor visualization should start rotating when the speed is greater than 0 and stop completely at 0 RPM.

The slider uses increments of 100 RPM.

### Valve

Click:

```text
OPEN VALVE
```

and verify that the valve changes to the open state.

Then click:

```text
CLOSE VALVE
```

and verify that it returns to the closed state.

### Ambient Temperature

The temperature shown in the HMI comes from the Open-Meteo public API.

It represents **ambient temperature**, not motor temperature.

The frontend checks for updated temperature data every 30 seconds.

## API

The frontend communicates with the FastAPI backend through these endpoints:

| Method | Endpoint             | Description                                |
| ------ | -------------------- | ------------------------------------------ |
| GET    | `/api/state`         | Returns the current motor and valve state. |
| GET    | `/api/temperature`   | Returns the current ambient temperature.   |
| POST   | `/api/motor/{speed}` | Updates the simulated motor speed.         |
| POST   | `/api/valve/{state}` | Updates the simulated valve state.         |

## Troubleshooting

### `SYSTEM OFFLINE`

This means the frontend could not communicate with the Python backend.

Check that:

1. The backend is running in Terminal 1.
2. The backend is using port `8001`.
3. The frontend `.env` contains:

```env
VITE_API_URL=http://localhost:8001/api
```

4. If `.env` was recently changed, restart Vite:

```bash
npm run dev
```

You can also check the browser console for connection errors.

### Port 8001 is already in use

On Windows, check which process is using the port:

```powershell
netstat -ano | findstr :8001
```

Then, if necessary, stop the corresponding process:

```powershell
taskkill /PID <PID_NUMBER> /F
```

Only terminate a process when you are sure it is the one using the port.

### PowerShell does not allow the virtual environment to activate

You can use Command Prompt instead:

```cmd
venv\Scripts\activate.bat
```

Or, for your current Windows user, use:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then activate the environment again:

```powershell
venv\Scripts\Activate.ps1
```

## Notes

The backend simulates the machine state in memory. No physical motor or valve is connected to this application.

The ambient temperature is retrieved from an external API rather than being simulated.

For a production industrial system, the simulated control layer could later be connected to a PLC using an appropriate industrial communication protocol such as OPC UA or Modbus TCP.

## How to View the Project

Once you have both servers (Frontend and Backend) running in your separate terminals, you can access the application using the following links:

1. View the Application (Frontend HMI)
Open your web browser and navigate to this address to see the running control panel:
http://localhost:5173 

2. Verify the API (Backend)
To verify that the Python backend is running independently and sending data, open this link:
http://localhost:8001/api/state

--------------------------------------------------

## Important Note on the .env file

If the frontend cannot connect to the backend (shows "SYSTEM OFFLINE"), make sure your environment variables are set up correctly:

1. Location: The .env file MUST be located inside the "frontend" folder (at the exact same level as package.json). Do not place it in the root directory of the project.
2. Host URL: Pay close attention to the Host URL. By default, it might change to a different host (like 127.0.0.1 instead of localhost), which can cause connection blocks. Your .env file should contain exactly this line:
   VITE_API_URL=http://localhost:8001/api
3. Restart: If you just created or modified the .env file, you must restart your frontend server for the changes to take effect (press Ctrl + C in the terminal, then run npm run dev again).