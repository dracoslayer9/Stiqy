import { useState, useEffect, useRef } from 'react';
import { IconPlayerPause, IconPlayerPlay, IconCheck, IconX } from '@tabler/icons-react';

const categoryColors = {
  CEO: 'var(--purple-accent)',
  Akademik: 'var(--amber-accent)',
  Personal: 'var(--teal-accent)',
};

const SIZE = 200;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TaskTimer({ task, onClose, onComplete }) {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const adjustTime = (deltaSec) => {
    if (running) return;
    const newTotal = Math.max(60, totalSeconds + deltaSec);
    setTotalSeconds(newTotal);
    setRemaining(newTotal);
  };

  const handleReset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setRemaining(totalSeconds);
  };

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const offset = CIRCUMFERENCE * (1 - progress);

  // Dynamic colors:
  // - Starts with #1D9E75 (teal) when progress > 70%
  // - Transits to #7F77DD (purple) in the middle (35% to 70%)
  // - Goes up to #EF9F27 (amber) near end (10% to 35%)
  // - Explodes to #D85A30 (coral) in final 10%
  let accentColor = '#1D9E75';
  let shouldPulse = false;

  if (progress <= 0.10) {
    accentColor = '#D85A30';
    shouldPulse = true;
  } else if (progress <= 0.35) {
    accentColor = '#EF9F27';
  } else if (progress <= 0.70) {
    accentColor = '#7F77DD';
  }

  return (
    <div className="timer-overlay" onClick={onClose}>
      <div className="timer-card" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="timer-close-btn" onClick={onClose}>
          <IconX size={18} stroke={1.5} />
        </button>

        {/* Task name */}
        <div className="timer-task-name">{task.name}</div>

        {/* Circle */}
        <div className={`timer-circle-wrap ${shouldPulse ? 'pulse-timer' : ''}`}>
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="timer-svg"
          >
            {/* Track */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={STROKE}
            />
            {/* Progress */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={accentColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className="timer-ring"
            />
          </svg>

          {/* Center content */}
          <div className="timer-center">
            <div className="timer-time" style={{ color: accentColor }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="timer-adjust">
              <button
                className="timer-adjust-btn"
                onClick={() => adjustTime(-5 * 60)}
                disabled={running}
              >
                − 5m
              </button>
              <button
                className="timer-adjust-btn"
                onClick={() => adjustTime(5 * 60)}
                disabled={running}
              >
                + 5m
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <button
            className="timer-ctrl-btn"
            onClick={handleReset}
            title="Reset"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
            </svg>
          </button>
          <button
            className="timer-ctrl-btn timer-ctrl-main"
            style={{ background: accentColor }}
            onClick={() => setRunning(!running)}
          >
            {running ? (
              <IconPlayerPause size={24} stroke={1.5} />
            ) : (
              <IconPlayerPlay size={24} stroke={1.5} />
            )}
          </button>
          <button
            className="timer-ctrl-btn"
            onClick={() => {
              if (onComplete) {
                onComplete();
              } else {
                onClose();
              }
            }}
            title="Selesai"
          >
            <IconCheck size={18} stroke={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
