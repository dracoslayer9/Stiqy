import { useState, useEffect, useRef } from 'react';
import { 
  IconPlayerPlay, 
  IconPlayerPause, 
  IconRefresh, 
  IconFlame, 
  IconCoins,
  IconSparkles
} from '@tabler/icons-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import './index.css'; // Ensure styling is applied!

// Durations definitions
const DURATIONS = [
  { label: '25 mnt', seconds: 25 * 60, reward: 2 },
  { label: '60 mnt', seconds: 60 * 60, reward: 5 },
  { label: '90 mnt', seconds: 90 * 60, reward: 8 }
];

export default function App() {
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const activeDurationObj = DURATIONS[selectedDurationIndex];
  
  // Timer States
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false); // Celebratory delay when glass is full
  
  // Reward & Banner states
  const [sessionCoins, setSessionCoins] = useState(0);
  const [showPop, setShowPop] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [popRewardText, setPopRewardText] = useState('');
  const [showAbandonWarning, setShowAbandonWarning] = useState(false);

  // Daily stats persisted to localStorage
  const [todayDateStr] = useState(() => new Date().toDateString());
  const [dailyStats, setDailyStats] = useLocalStorage('ayofokus_daily_stats_light', {
    date: new Date().toDateString(),
    completedCount: 0,
    totalSeconds: 0
  });

  // Reset daily stats if date changes
  useEffect(() => {
    if (dailyStats.date !== todayDateStr) {
      setDailyStats({
        date: todayDateStr,
        completedCount: 0,
        totalSeconds: 0
      });
    }
  }, [dailyStats.date, todayDateStr, setDailyStats]);

  // Format seconds to H jam MM mnt SS dtk
  const formatDuration = (totalSecs) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const parts = [];
    if (h > 0) parts.push(`${h} jam`);
    if (m > 0 || h > 0) parts.push(`${m} mnt`);
    parts.push(`${s} dtk`);
    return parts.join(' ');
  };

  const timerRef = useRef(null);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Track if previous session was abandoned on page reload/close
  useEffect(() => {
    const wasActive = localStorage.getItem('ayofokus_session_active') === 'true';
    if (wasActive) {
      setShowAbandonWarning(true);
      localStorage.setItem('ayofokus_session_active', 'false');
    }
  }, []);

  // Warn user before reload/tab close during focus
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isRunning) {
        e.preventDefault();
        e.returnValue = 'Sesi fokus sedang berjalan! Jika Anda keluar, progres Anda akan direset ke 0.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning]);

  // Web Audio API Synthesis for completion sound
  const playFinishChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.12 + 0.3);
        osc.start(audioCtx.currentTime + i * 0.12);
        osc.stop(audioCtx.currentTime + i * 0.12 + 0.35);
      });
    } catch (e) {
      console.warn("Audio Context not allowed or supported yet:", e);
    }
  };

  const handleStart = () => {
    if (isCompleted) {
      handleReset();
    }
    
    setIsRunning(true);
    setIsCelebrating(false);
    setShowBanner(false);
    setShowAbandonWarning(false);
    localStorage.setItem('ayofokus_session_active', 'true');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= activeDurationObj.seconds) {
          // Timer finished!
          setIsRunning(false);
          setIsCelebrating(true); // Enter celebration state so the glass stays visible briefly
          setIsCompleted(true);
          localStorage.setItem('ayofokus_session_active', 'false');
          if (timerRef.current) clearInterval(timerRef.current);
          
          // Add reward
          const reward = activeDurationObj.reward;
          setSessionCoins(reward);
          setPopRewardText(`+${reward} 🪙`);
          setShowPop(true);
          playFinishChime();

          // Increment daily count and total time
          setDailyStats(prevStats => ({
            ...prevStats,
            completedCount: prevStats.completedCount + 1,
            totalSeconds: (prevStats.totalSeconds || 0) + activeDurationObj.seconds
          }));

          // End celebration after 2.5 seconds, hide glass and show results banner
          setTimeout(() => {
            setIsCelebrating(false);
            setShowBanner(true);
          }, 2500);

          return activeDurationObj.seconds;
        }
        return next;
      });
    }, 1000);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.setItem('ayofokus_session_active', 'false');
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCelebrating(false);
    setIsCompleted(false);
    setElapsed(0);
    setSessionCoins(0);
    setShowPop(false);
    setShowBanner(false);
    localStorage.setItem('ayofokus_session_active', 'false');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Calculate progress
  const progress = Math.min(100, Math.floor((elapsed / activeDurationObj.seconds) * 100));

  // Determine phase label
  let phaseLabel = "Gelas kosong";
  let phaseColor = "rgba(100, 116, 139, 0.15)";
  
  if (progress === 100) {
    phaseLabel = "Penuh!";
    phaseColor = "#16a34a";
  } else if (progress >= 75) {
    phaseLabel = "Hampir penuh";
    phaseColor = "#84cc16";
  } else if (progress >= 50) {
    phaseLabel = "Setengah jalan";
    phaseColor = "#eab308";
  } else if (progress > 0) {
    phaseLabel = "Mulai terisi";
    phaseColor = "#2563eb";
  }

  // Calculate dynamic HSL color (light green to dark green)
  const progressRatio = progress / 100;
  const h = 140 + (145 - 140) * progressRatio;
  const s = 75 + (85 - 75) * progressRatio;
  const l = 65 - (65 - 25) * progressRatio;
  const waterColor = `hsl(${h}, ${s}%, ${l}%)`;

  // Hide coin popup after animation finishes
  useEffect(() => {
    if (showPop) {
      const timer = setTimeout(() => setShowPop(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showPop]);

  // Determine if we should show the glass view
  const showGlassView = isRunning || isCelebrating;

  return (
    <div className={`app-container ${showGlassView ? 'focusing-active' : ''}`}>
      {/* 1. Header (Hidden during active focus) */}
      {!showGlassView && (
        <header className="app-header">
          <h1 className="app-title">AyoFokus</h1>
          <p className="app-subtitle">Ubah waktu belajar menjadi gelas yang terisi</p>
        </header>
      )}

      {/* 2. Stats (Only shown when not active focusing) */}
      {!showGlassView && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Sesi hari ini</span>
            <div className="stat-value">
              <IconFlame size={22} style={{ color: '#f97316' }} />
              {dailyStats.completedCount} sesi
            </div>
            <div className="stat-duration">
              {dailyStats.totalSeconds > 0
                ? formatDuration(dailyStats.totalSeconds)
                : '0 dtk'}
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Koin terkumpul</span>
            <div className="stat-value">
              <IconCoins size={22} style={{ color: '#fbbf24' }} />
              {sessionCoins}
            </div>
          </div>
        </div>
      )}

      {/* 3. Duration Selector (Only shown when not active focusing and not paused/completed) */}
      {!showGlassView && elapsed === 0 && (
        <div className="duration-container">
          <span className="duration-label">Pilih Durasi Fokus</span>
          <div className="duration-options">
            {DURATIONS.map((dur, index) => (
              <button
                key={dur.label}
                className={`duration-btn ${selectedDurationIndex === index ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDurationIndex(index);
                  handleReset();
                }}
              >
                {dur.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Glass Visualization (Always shown) */}
      <div className="glass-section">
        {showPop && <div className="coin-popup">{popRewardText}</div>}

        <div className="glass-wrapper">
          <div className="glass-lip"></div>
          <div className="glass-highlight"></div>
          <div className="glass-body">
            <div 
              className="water" 
              style={{ 
                height: `${progress}%`, 
                color: waterColor,
                backgroundColor: 'currentColor'
              }}
            >
              {progress > 0 && (
                <svg className="water-waves" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path 
                    className="wave-back" 
                    d="M 0 10 C 30 4, 60 16, 100 10 L 100 20 L 0 20 Z" 
                    fill="rgba(255,255,255,0.15)" 
                  />
                  <path 
                    className="wave-front" 
                    d="M 0 10 C 40 16, 70 4, 100 10 L 100 20 L 0 20 Z" 
                    fill="rgba(255,255,255,0.25)" 
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="percentage-text">{progress}%</div>

        {isRunning && <p className="focus-instruction">Fokus sedang berjalan. Jauhkan gangguan...</p>}
      </div>

      {/* 5. Reward / Completion Message Banner (Shown in normal view after completing) */}
      {!showGlassView && showBanner && (
        <div className="reward-banner">
          <IconSparkles size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          Gelasmu penuh — +{activeDurationObj.reward} koin fokus didapat!
        </div>
      )}

      {/* 5b. Abandon Warning Banner (Shown if user force closed previous session) */}
      {!showGlassView && showAbandonWarning && (
        <div className="reward-banner" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#b91c1c' }}>
          ⚠️ Sesi fokus sebelumnya terputus karena aplikasi ditutup. Kemajuan direset ke 0!
        </div>
      )}

      {/* 6. Control Buttons */}
      <div className="controls-container">
        {/* Only Jeda (Pause) button is shown during active focus */}
        {showGlassView ? (
          isRunning && (
            <>
              <button className="btn btn-secondary" onClick={handlePause}>
                <IconPlayerPause size={20} stroke={2.5} />
                Jeda Fokus
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                <IconRefresh size={20} stroke={2.5} />
                Reset Sesi
              </button>
            </>
          )
        ) : (
          // Standard controls in stats/menu view
          elapsed === 0 ? (
            <button className="btn btn-primary" onClick={handleStart}>
              <IconPlayerPlay size={20} stroke={2.5} />
              Mulai Fokus
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleStart} disabled={isCompleted}>
              <IconPlayerPlay size={20} stroke={2.5} />
              Lanjutkan
            </button>
          )
        )}
      </div>
    </div>
  );
}
