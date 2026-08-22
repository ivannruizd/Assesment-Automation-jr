import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  // I have to define the state variables for the temperature, motor speed, valve state, and system connection
  const [temp, setTemp] = useState(null);
  const [motorSpeed, setMotorSpeed] = useState(0);
  const [valveOpen, setValveOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // i use this variable to conect the api directly to the url that is on the env.
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_URL}/state`);
      if (res.ok) {
        const data = await res.json();
        setMotorSpeed(data.motor_speed);
        setValveOpen(data.valve_open);
        setIsOnline(true);  
      } else {
        setIsOnline(false); 
      }
    } catch (error) {
      console.error("Error fetching state:", error);
      setIsOnline(false); // conexion for the web page and when its offline
    }
  };

  const fetchTemp = async () => {
    try {
      const res = await fetch(`${API_URL}/temperature`);
      if (res.ok) {
        const data = await res.json();
        setTemp(data.temperature);
      }
    } catch (error) {
      // here was a sugestion of the ia to set the temp to null but i think is better to keep the last known value
      console.error("Error fetching temperature, keeping last known value:", error);
    }
  };

  useEffect(() => {
    fetchState();
    fetchTemp();
    // Actualización de temperatura cada 30 segundos
    const interval = setInterval(fetchTemp, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateMotor = async (speed) => {
    try {
      const res = await fetch(`${API_URL}/motor/${speed}`, { method: 'POST' });
      if (res.ok) {
        // here we update the motor speed only if the backend responds with 00 OK as in the orher functions
        setMotorSpeed(speed);
      }
    } catch (error) {
      console.error("Error updating motor:", error);
    }
  };

  const toggleValve = async () => {
    const newState = !valveOpen;
    try {
      const res = await fetch(`${API_URL}/valve/${newState}`, { method: 'POST' });
      if (res.ok) {
        // here to 
        setValveOpen(newState);
      }
    } catch (error) {
      // as in the previous improvements the same to keep the last known state if the backend fails to respond
      console.error("Error toggling valve, state reverted:", error);
    }
  };

  // we have to derivate the current machine data without inventing it
  const isRunning = motorSpeed > 0;
  const tempStatusColor = temp === null ? 'var(--neutral)' : temp < 20 ? 'var(--cold)' : temp > 30 ? 'var(--hot)' : 'var(--normal)';

  return (
    <div className="hmi-dashboard">
      <header className="hmi-header">
        <div className="header-title">
          <h1>Machine Control System</h1>
          <span className="subtitle">INDUSTRIAL AUTOMATION HMI</span>
        </div>
        <div className="system-status">
          <div className="status-indicator">
           <span className={`pulse-dot ${isOnline ? 'online' : 'offline'}`} style={{ backgroundColor: isOnline ? '#10b981' : '#ef4444' }}></span>
          {isOnline ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
          </div>
          <div className="status-indicator">
            <span className={`pulse-dot ${isRunning ? 'running' : 'idle'}`}></span>
            MOTOR: {isRunning ? 'RUNNING' : 'IDLE'}
          </div>
        </div>
      </header>

      <main className="hmi-grid">
        <div className="hmi-card motor-card">
          <div className="card-header">
            <h2>Motor Control</h2>
            <span className="badge">DRIVE-01</span>
          </div>

          <div className="motor-visual-container">
            <MotorVisualization speed={motorSpeed} />
          </div>

          <div className="motor-data">
            <div className="rpm-display">
              <span className="rpm-value">{motorSpeed.toLocaleString()}</span>
              <span className="rpm-unit">RPM</span>
            </div>
            <p className="data-label">Motor Speed</p>
          </div>

          <div className="control-slider">
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={motorSpeed}
              onChange={(e) => updateMotor(Number(e.target.value))}
              className={`styled-slider ${isRunning ? 'active' : ''}`}
            />
            <div className="slider-scale">
              <span>0</span>
              <span>500</span>
              <span>1000</span>
              <span>1500</span>
              <span>2000</span>
              <span>2500</span>
              <span>3000</span>
            </div>
          </div>
        </div>

        <div className="hmi-right-column">
          <div className="hmi-card valve-card">
            <div className="card-header">
              <h2>Valve Status</h2>
              <span className={`status-badge ${valveOpen ? 'open' : 'closed'}`}>
                {valveOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>

            <div className="valve-interactive-area">
              <ValveVisualization isOpen={valveOpen} />
              <button
                className={`valve-btn ${valveOpen ? 'btn-close' : 'btn-open'}`}
                onClick={toggleValve}
              >
                {valveOpen ? 'CLOSE VALVE' : 'OPEN VALVE'}
              </button>
            </div>
          </div>

          <div className="hmi-card temp-card" style={{ '--dynamic-temp-color': tempStatusColor }}>
            <div className="card-header">
              <h2>Ambient Temperature</h2>
              <span className="badge">SENSOR-T1</span>
            </div>

            <div className="temp-widget">
              <svg viewBox="0 0 100 100" className="temp-ring">
                <circle cx="50" cy="50" r="45" className="ring-bg" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="ring-progress"
                  strokeDasharray="283"
                  strokeDashoffset={temp !== null ? 283 - (283 * (Math.min(temp, 50) / 50)) : 283}
                />
              </svg>
              <div className="temp-readout">
                <span className="temp-value">{temp !== null ? temp.toFixed(1) : '--'}</span>
                <span className="temp-unit">°C</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// this is where we make the visual components
function MotorVisualization({ speed }) {
  const isRunning = speed > 0;
  // this is an visual optimitation to to see the motor spinning faster when the speed is higher and slower when the speed is lower
  const animationDuration = isRunning ? Math.max(0.15, 300 / speed) : 0;

  return (
    <svg viewBox="0 0 200 200" className="svg-motor">
      <path d="M 40 180 L 160 180 L 140 140 L 60 140 Z" fill="#1e293b" />
      <rect x="30" y="40" width="140" height="110" rx="15" fill="#293548" stroke="#3b4b66" strokeWidth="4" />
      <line x1="45" y1="60" x2="155" y2="60" stroke="#161f2e" strokeWidth="6" strokeLinecap="round"/>
      <line x1="45" y1="80" x2="155" y2="80" stroke="#161f2e" strokeWidth="6" strokeLinecap="round"/>
      <line x1="45" y1="100" x2="155" y2="100" stroke="#161f2e" strokeWidth="6" strokeLinecap="round"/>
      <line x1="45" y1="120" x2="155" y2="120" stroke="#161f2e" strokeWidth="6" strokeLinecap="round"/>

      <g style={{
        transformOrigin: '100px 95px',
        animation: isRunning ? `spin ${animationDuration}s linear infinite` : 'none'
      }}>
        <circle cx="100" cy="95" r="35" fill="#0f172a" stroke="#38bdf8" strokeWidth={isRunning ? 2 : 0} className={isRunning ? 'glow' : ''}/>
        <circle cx="100" cy="95" r="10" fill="#94a3b8" />
        <path d="M 100 65 L 105 95 L 95 95 Z" fill="#cbd5e1" />
        <path d="M 100 125 L 105 95 L 95 95 Z" fill="#cbd5e1" />
        <path d="M 70 95 L 100 90 L 100 100 Z" fill="#cbd5e1" />
        <path d="M 130 95 L 100 90 L 100 100 Z" fill="#cbd5e1" />
      </g>
    </svg>
  );
}
function ValveVisualization({ isOpen }) {
  return (
    <svg viewBox="0 0 200 150" className="svg-valve">
      <rect x="10" y="65" width="180" height="40" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      <rect x="70" y="55" width="15" height="60" rx="2" fill="#475569" />
      <rect x="115" y="55" width="15" height="60" rx="2" fill="#475569" />
      <rect x="85" y="60" width="30" height="50" fill="#1e293b" />
      <rect x="90" y="30" width="20" height="30" fill="#475569" />

      <g style={{
        transformOrigin: '100px 30px',
        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <rect x="50" y="22" width="100" height="16" rx="8" fill={isOpen ? '#10b981' : '#ef4444'} className="valve-handle" />
        <circle cx="100" cy="30" r="12" fill="#0f172a" />
        <circle cx="100" cy="30" r="4" fill="#94a3b8" />
      </g>
    </svg>
  );
}