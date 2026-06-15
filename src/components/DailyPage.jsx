import { useState, useEffect, useRef } from 'react';
import { IconPlus, IconCalendar, IconChartLine, IconBell, IconBellOff } from '@tabler/icons-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from './Toast';
import RoutineItem from './RoutineItem';
import TaskTimer from './TaskTimer';

const DEFAULT_ROUTINES = [
  { id: 1, time: '05:00', title: 'Morning ritual', description: 'Journaling, olahraga ringan, meditasi', category: 'Personal', done: false },
  { id: 2, time: '06:30', title: 'Deep work CEO', description: '90 menit fokus bisnis tanpa gangguan', category: 'CEO', done: false },
  { id: 3, time: '08:00', title: 'Kuliah / belajar', description: 'Kelas atau belajar mandiri', category: 'Akademik', done: false },
  { id: 4, time: '12:00', title: 'Istirahat buffer', description: 'Makan siang, jalan kaki, recharge', category: 'Personal', done: false },
  { id: 5, time: '13:00', title: 'Deep work akademik', description: '90 menit fokus tugas & riset', category: 'Akademik', done: false },
  { id: 6, time: '15:00', title: 'Meeting / operasional', description: 'Rapat tim, review, koordinasi', category: 'CEO', done: false },
  { id: 7, time: '17:30', title: 'Daily close refleksi', description: 'Review hari ini, plan besok', category: 'Personal', done: false },
  { id: 8, time: '20:00', title: 'Belajar mandiri', description: 'Buku, kursus, atau side project', category: 'Akademik', done: false },
  { id: 9, time: '22:30', title: 'Wind down', description: 'Persiapan tidur, no screen', category: 'Personal', done: false },
];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const formatTimeInput = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + ':' + digits.slice(2, 4);
};

export default function DailyPage() {
  const showToast = useToast();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(2026);

  // Load routines with fallback migration from time-blocks, structured by dateStr
  const [routines, setRoutines] = useLocalStorage('routines-by-date', () => {
    try {
      const oldRoutines = localStorage.getItem('routines');
      if (oldRoutines) {
        const parsed = JSON.parse(oldRoutines);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { [todayStr]: parsed };
        }
      } else {
        const oldBlocks = localStorage.getItem('time-blocks');
        if (oldBlocks) {
          const parsed = JSON.parse(oldBlocks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return { [todayStr]: parsed.map(b => ({ ...b, done: b.done || false })) };
          }
        }
      }
    } catch (e) {
      console.error('Error migrating blocks to routines', e);
    }
    return { [todayStr]: DEFAULT_ROUTINES };
  });

  // Load tasks structured by dateStr
  const [tasks, setTasks] = useLocalStorage('tasks-by-date', () => {
    try {
      const oldTasks = localStorage.getItem('tasks');
      if (oldTasks) {
        const parsed = JSON.parse(oldTasks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { [todayStr]: parsed };
        }
      }
    } catch (e) {
      console.error('Error migrating tasks', e);
    }
    return { [todayStr]: [] };
  });

  const [expandedRoutine, setExpandedRoutine] = useState(null);
  const [timerTask, setTimerTask] = useState(null);
  const [viewType, setViewType] = useState('calendar'); // 'calendar' | 'chart'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Get current active routines/tasks for the selected date
  const activeRoutines = routines[selectedDate] || DEFAULT_ROUTINES;
  const activeTasks = tasks[selectedDate] || [];

  // Sort active routines chronologically by time
  const sortedRoutines = [...activeRoutines].sort((a, b) => a.time.localeCompare(b.time));

  // 90 Days History of Completion (fallback for dates with no stored data)
  const [history, setHistory] = useLocalStorage('daily-history', () => {
    const mock = {};
    const today = new Date();
    for (let i = 90; i > 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const rates = [0, 15, 30, 50, 75, 90, 100];
      mock[dateStr] = rates[Math.floor(Math.random() * rates.length)];
    }
    return mock;
  });

  // Initialize selected date in routines/tasks if not yet populated
  useEffect(() => {
    setRoutines((prev) => {
      if (prev[selectedDate]) return prev;
      // Copy from the most recent date as starting point, resetting completion state
      const dates = Object.keys(prev).sort();
      const fallbackRoutines = dates.length > 0
        ? prev[dates[dates.length - 1]].map(r => ({ ...r, done: false }))
        : DEFAULT_ROUTINES;
      return {
        ...prev,
        [selectedDate]: fallbackRoutines
      };
    });

    setTasks((prev) => {
      if (prev[selectedDate]) return prev;
      return {
        ...prev,
        [selectedDate]: []
      };
    });
  }, [selectedDate]);

  // Daily Reset check on load to sync last opened date
  useEffect(() => {
    const lastOpened = localStorage.getItem('last-opened-date');
    if (!lastOpened || lastOpened !== todayStr) {
      localStorage.setItem('last-opened-date', todayStr);
    }
  }, [todayStr]);

  // --- Web Notifications Reminder ---
  const [notificationPermission, setNotificationPermission] = useState('default');
  const notifiedKeys = useRef(new Set());

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung notifikasi.');
      return;
    }
    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification("Pengingat Aktif!", {
          body: "Anda akan menerima notifikasi untuk rutinitas terjadwal.",
        });
      }
    });
  };

  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const checkRoutines = () => {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHour}:${currentMinute}`;
      const localTodayStr = now.toISOString().split('T')[0];

      // Read routines for today
      const todayRoutines = routines[localTodayStr] || [];

      todayRoutines.forEach((r) => {
        const key = `${localTodayStr}_${r.id}_${r.time}`;
        if (r.time === currentTimeStr && !notifiedKeys.current.has(key)) {
          notifiedKeys.current.add(key);
          new Notification("Waktunya Rutinitas!", {
            body: `${r.time} - ${r.title}\n${r.description || ''}`,
            tag: `routine_${r.id}`,
            requireInteraction: true,
          });
        }
      });
    };

    checkRoutines();
    const interval = setInterval(checkRoutines, 30000);

    return () => clearInterval(interval);
  }, [notificationPermission, routines]);

  // Add-routine form
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [newRoutine, setNewRoutine] = useState({ time: '', title: '', description: '', category: 'Personal' });

  // --- Tasks ---
  const toggleTask = (id) => {
    setTasks((prev) => {
      const dayTasks = prev[selectedDate] || [];
      const updatedDayTasks = dayTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      const updated = { ...prev, [selectedDate]: updatedDayTasks };
      updateHistoryForDate(selectedDate, activeRoutines, updatedDayTasks);
      return updated;
    });
  };

  const deleteTask = (id) => {
    setTasks((prev) => {
      const dayTasks = prev[selectedDate] || [];
      const updatedDayTasks = dayTasks.filter((t) => t.id !== id);
      const updated = { ...prev, [selectedDate]: updatedDayTasks };
      updateHistoryForDate(selectedDate, activeRoutines, updatedDayTasks);
      return updated;
    });
  };

  const addTask = (newTask) => {
    setTasks((prev) => {
      const dayTasks = prev[selectedDate] || [];
      const updatedDayTasks = [...dayTasks, newTask];
      const updated = { ...prev, [selectedDate]: updatedDayTasks };
      updateHistoryForDate(selectedDate, activeRoutines, updatedDayTasks);
      return updated;
    });
    showToast();
  };

  const updateTask = (id, data) => {
    setTasks((prev) => {
      const dayTasks = prev[selectedDate] || [];
      const updatedDayTasks = dayTasks.map((t) => (t.id === id ? { ...t, ...data } : t));
      const updated = { ...prev, [selectedDate]: updatedDayTasks };
      updateHistoryForDate(selectedDate, activeRoutines, updatedDayTasks);
      return updated;
    });
  };

  // --- Routines ---
  const updateRoutine = (id, data) => {
    setRoutines((prev) => {
      const dayRoutines = prev[selectedDate] || [];
      const updatedDayRoutines = dayRoutines.map((r) => (r.id === id ? { ...r, ...data } : r));
      const updated = { ...prev, [selectedDate]: updatedDayRoutines };
      updateHistoryForDate(selectedDate, updatedDayRoutines, activeTasks);
      return updated;
    });
    showToast();
  };

  const deleteRoutine = (id) => {
    setRoutines((prev) => {
      const dayRoutines = prev[selectedDate] || [];
      const updatedDayRoutines = dayRoutines.filter((r) => r.id !== id);
      const updated = { ...prev, [selectedDate]: updatedDayRoutines };
      
      setTasks((prevTasks) => {
        const dayTasks = prevTasks[selectedDate] || [];
        const updatedDayTasks = dayTasks.filter((t) => t.blockId !== id);
        const updatedT = { ...prevTasks, [selectedDate]: updatedDayTasks };
        updateHistoryForDate(selectedDate, updatedDayRoutines, updatedDayTasks);
        return updatedT;
      });
      return updated;
    });
  };

  const handleAddRoutine = () => {
    if (!newRoutine.time.trim() || !newRoutine.title.trim()) return;
    setRoutines((prev) => {
      const dayRoutines = prev[selectedDate] || [];
      const updatedDayRoutines = [
        ...dayRoutines,
        { ...newRoutine, id: Date.now(), time: newRoutine.time.trim(), title: newRoutine.title.trim(), description: newRoutine.description.trim(), done: false },
      ];
      const updated = { ...prev, [selectedDate]: updatedDayRoutines };
      updateHistoryForDate(selectedDate, updatedDayRoutines, activeTasks);
      return updated;
    });
    setNewRoutine({ time: '', title: '', description: '', category: 'Personal' });
    setShowAddRoutine(false);
    showToast();
  };

  const handleToggleExpandRoutine = (id) => {
    setExpandedRoutine((prev) => (prev === id ? null : id));
  };

  // Master handler for checking routine checklist headers
  const handleToggleRoutineHeader = (id) => {
    const routine = activeRoutines.find(r => r.id === id);
    if (!routine) return;
    const routineTasks = activeTasks.filter(t => t.blockId === id);
    const hasTasks = routineTasks.length > 0;

    if (hasTasks) {
      const allDone = routineTasks.every(t => t.done);
      setTasks((prevTasks) => {
        const dayTasks = prevTasks[selectedDate] || [];
        const updatedDayTasks = dayTasks.map(t => t.blockId === id ? { ...t, done: !allDone } : t);
        const updatedT = { ...prevTasks, [selectedDate]: updatedDayTasks };
        
        setRoutines((prevRoutines) => {
          const dayRoutines = prevRoutines[selectedDate] || [];
          const updatedDayRoutines = dayRoutines.map(r => r.id === id ? { ...r, done: !allDone } : r);
          const updatedR = { ...prevRoutines, [selectedDate]: updatedDayRoutines };
          updateHistoryForDate(selectedDate, updatedDayRoutines, updatedDayTasks);
          return updatedR;
        });
        return updatedT;
      });
    } else {
      setRoutines((prevRoutines) => {
        const dayRoutines = prevRoutines[selectedDate] || [];
        const updatedDayRoutines = dayRoutines.map(r => r.id === id ? { ...r, done: !r.done } : r);
        const updatedR = { ...prevRoutines, [selectedDate]: updatedDayRoutines };
        updateHistoryForDate(selectedDate, updatedDayRoutines, activeTasks);
        return updatedR;
      });
    }
  };

  // Helper to save target date's percentage to history
  const updateHistoryForDate = (dateStr, dateRoutines, dateTasks) => {
    const routinesWithoutTasks = dateRoutines.filter(r => !dateTasks.some(t => t.blockId === r.id));
    const doneRoutinesWithoutTasks = routinesWithoutTasks.filter(r => r.done);

    const totalTasks = dateTasks.length;
    const doneTasks = dateTasks.filter(t => t.done).length;

    const totalItems = routinesWithoutTasks.length + totalTasks;
    const completedItems = doneRoutinesWithoutTasks.length + doneTasks;

    const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    setHistory((prev) => ({
      ...prev,
      [dateStr]: pct,
    }));
  };

  const getDayCompletion = (dateStr) => {
    const dayRoutines = routines[dateStr];
    const dayTasks = tasks[dateStr];

    if (dayRoutines) {
      const routinesWithoutTasks = dayRoutines.filter(r => !(dayTasks || []).some(t => t.blockId === r.id));
      const doneRoutinesWithoutTasks = routinesWithoutTasks.filter(r => r.done);

      const totalTasks = dayTasks ? dayTasks.length : 0;
      const doneTasks = dayTasks ? dayTasks.filter(t => t.done).length : 0;

      const totalItems = routinesWithoutTasks.length + totalTasks;
      const completedItems = doneRoutinesWithoutTasks.length + doneTasks;

      return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    }
    return history[dateStr] !== undefined ? history[dateStr] : 0;
  };

  const getCompletionStyle = (pct) => {
    if (pct === 0) {
      return {
        background: 'var(--color-bg-surface)',
        border: '0.5px solid var(--color-border)',
      };
    }
    if (pct <= 25) return { background: '#E1F5EE', border: '0.5px solid rgba(0,0,0,0.02)' };
    if (pct <= 50) return { background: '#9FE1CB', border: '0.5px solid rgba(0,0,0,0.02)' };
    if (pct <= 75) return { background: '#1D9E75', border: '0.5px solid rgba(0,0,0,0.02)' };
    if (pct <= 99) return { background: '#0F6E56', border: '0.5px solid rgba(0,0,0,0.02)' };
    return {
      background: '#085041',
      border: '1.5px solid #EF9F27',
    };
  };

  const indonesianMonths = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Helper to build line/area chart data (last 10 days)
  const getChartData = () => {
    const data = [];
    const today = new Date();
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const pct = getDayCompletion(dateStr);
      data.push({
        dateStr,
        dayLabel: String(d.getDate()).padStart(2, '0'),
        monthLabel: indonesianMonths[d.getMonth()].slice(0, 3),
        fullLabel: `${d.getDate()} ${indonesianMonths[d.getMonth()].slice(0, 3)}`,
        pct,
      });
    }
    return data;
  };

  const renderProductivityView = () => {
    if (viewType === 'calendar') {
      const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="section-label" style={{ margin: 0 }}>Kalendar Produktivitas</div>
            <select
              className="select"
              style={{ width: '120px', padding: '2px 6px', fontSize: '12px', height: '28px' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {indonesianMonths.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Calendar Grid containing all days of the month */}
          <div className="calendar-grid-4x7" style={{ gridTemplateRows: 'unset' }}>
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const pct = getDayCompletion(dateStr);
              const style = getCompletionStyle(pct);
              const isSelected = dateStr === selectedDate;

              let textColor = 'var(--color-text-muted)';
              if (pct > 0 && pct <= 50) textColor = '#0F6E56';
              else if (pct > 50) textColor = '#ffffff';

              return (
                <div
                  key={dayNum}
                  className={`calendar-day-cell-mini ${isSelected ? 'selected' : ''}`}
                  style={{ ...style, color: textColor }}
                  onClick={() => setSelectedDate(dateStr)}
                  title={`${dayNum} ${indonesianMonths[selectedMonth]}: ${pct}% selesai`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      // SVG Line Chart View
      const chartData = getChartData();
      const width = 500;
      const height = 150;
      const paddingLeft = 30;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 30;

      const chartWidth = width - paddingLeft - paddingRight;
      const chartHeight = height - paddingTop - paddingBottom;

      const points = chartData.map((d, index) => {
        const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
        const y = paddingTop + chartHeight - (d.pct / 100) * chartHeight;
        return { ...d, x, y };
      });

      const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      const areaPath = points.length > 0 
        ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
        : '';

      return (
        <div className="chart-view-container">
          <div className="section-label" style={{ marginBottom: '12px' }}>Tren Pencapaian (10 Hari Terakhir)</div>
          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ minWidth: '400px', display: 'block' }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1D9E75" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((level) => {
                const y = paddingTop + chartHeight - (level / 100) * chartHeight;
                return (
                  <g key={level}>
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={width - paddingRight} 
                      y2={y} 
                      stroke="var(--color-border)" 
                      strokeWidth="0.5" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={y + 3} 
                      fontSize="9" 
                      fill="var(--color-text-muted)" 
                      textAnchor="end"
                    >
                      {level}%
                    </text>
                  </g>
                );
              })}

              {/* Area Under Curve */}
              {areaPath && (
                <path d={areaPath} fill="url(#chartGradient)" />
              )}

              {/* Line Curve */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#1D9E75" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Circles on Points */}
              {points.map((p, idx) => {
                const isSelected = p.dateStr === selectedDate;
                return (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredPoint === idx || isSelected ? '7' : '4'}
                      fill={hoveredPoint === idx ? '#0F6E56' : isSelected ? '#EF9F27' : '#1D9E75'}
                      stroke="var(--color-bg-surface)"
                      strokeWidth="1.5"
                      style={{ cursor: 'pointer', transition: 'r 0.15s ease, fill 0.15s ease' }}
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => setSelectedDate(p.dateStr)}
                    />
                    {/* Labels on bottom axis */}
                    <text
                      x={p.x}
                      y={paddingTop + chartHeight + 14}
                      fontSize="9"
                      fill={isSelected ? 'var(--color-text)' : 'var(--color-text-muted)'}
                      fontWeight={isSelected ? '600' : '400'}
                      textAnchor="middle"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedDate(p.dateStr)}
                    >
                      {p.dayLabel}
                    </text>
                    <text
                      x={p.x}
                      y={paddingTop + chartHeight + 23}
                      fontSize="8"
                      fill="var(--color-text-muted)"
                      textAnchor="middle"
                      opacity="0.7"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedDate(p.dateStr)}
                    >
                      {p.monthLabel}
                    </text>

                    {/* Value Tooltip Label */}
                    {(hoveredPoint === idx || isSelected) && (
                      <g>
                        <rect
                          x={p.x - 22}
                          y={p.y - 24}
                          width="44"
                          height="16"
                          rx="3"
                          fill="var(--color-text)"
                        />
                        <text
                          x={p.x}
                          y={p.y - 13}
                          fontSize="9"
                          fontWeight="600"
                          fill="var(--color-bg)"
                          textAnchor="middle"
                        >
                          {p.pct}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      {/* Calendar/Chart Productivity Heatmap - Sticky Header Container */}
      <div className="sticky-header-container">
        <div className="calendar-card-solid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div className="section-label" style={{ margin: 0 }}>Rapor Harian</div>
            </div>
            
            {/* View Type Toggle Buttons */}
            <div className="toggle-btn-group">
              <button 
                className={`toggle-btn ${viewType === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewType('calendar')}
                title="Tampilan Kalendar"
              >
                <IconCalendar size={14} stroke={1.5} />
              </button>
              <button 
                className={`toggle-btn ${viewType === 'chart' ? 'active' : ''}`}
                onClick={() => setViewType('chart')}
                title="Tampilan Grafik"
              >
                <IconChartLine size={14} stroke={1.5} />
              </button>
            </div>
          </div>

          {renderProductivityView()}
        </div>
        {/* Blur edge effect for content sliding under */}
        <div className="blur-transition-strip"></div>
      </div>

      {/* Routines */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div className="section-label" style={{ margin: 0 }}>Jadwal Rutinitas ({selectedDate})</div>
          {'Notification' in window && (
            <button
              onClick={handleRequestPermission}
              className={`toggle-btn ${notificationPermission === 'granted' ? 'active' : ''}`}
              title={
                notificationPermission === 'granted'
                  ? 'Notifikasi Aktif'
                  : 'Aktifkan Pengingat Notifikasi'
              }
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px' }}
            >
              {notificationPermission === 'granted' ? (
                <>
                  <IconBell size={13} stroke={1.5} />
                  <span>Aktif</span>
                </>
              ) : (
                <>
                  <IconBellOff size={13} stroke={1.5} />
                  <span>Minta Izin</span>
                </>
              )}
            </button>
          )}
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {sortedRoutines.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              Belum ada rutinitas untuk tanggal ini. Tambahkan di bawah.
            </div>
          ) : (
            sortedRoutines.map((routine) => (
              <RoutineItem
                key={routine.id}
                routine={routine}
                tasks={activeTasks}
                expanded={expandedRoutine === routine.id}
                onToggleExpand={() => handleToggleExpandRoutine(routine.id)}
                onUpdateRoutine={updateRoutine}
                onDeleteRoutine={deleteRoutine}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onStartTimer={(task) => setTimerTask(task)}
                onToggleRoutineHeader={handleToggleRoutineHeader}
                onUpdateTask={updateTask}
              />
            ))
          )}

          {/* Add routine row */}
          {showAddRoutine ? (
            <div className="time-block-add-block">
              <div className="form-row" style={{ marginBottom: '8px' }}>
                <div style={{ flex: '0 0 68px' }}>
                  <label className="form-label">Waktu</label>
                  <input
                    className="input"
                    placeholder="08:00"
                    value={newRoutine.time}
                    onChange={(e) => setNewRoutine((nr) => ({ ...nr, time: formatTimeInput(e.target.value) }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Judul</label>
                  <input
                    className="input"
                    placeholder="Nama rutinitas"
                    value={newRoutine.title}
                    onChange={(e) => setNewRoutine((nr) => ({ ...nr, title: e.target.value }))}
                  />
                </div>
                <div style={{ flex: '0 0 110px' }}>
                  <label className="form-label">Kategori</label>
                  <select
                    className="select"
                    value={newRoutine.category}
                    onChange={(e) => setNewRoutine((nr) => ({ ...nr, category: e.target.value }))}
                  >
                    <option value="CEO">CEO</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label">Deskripsi</label>
                <input
                  className="input"
                  placeholder="Deskripsi rutinitas..."
                  value={newRoutine.description}
                  onChange={(e) => setNewRoutine((nr) => ({ ...nr, description: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-primary btn-small" onClick={handleAddRoutine}>
                  <IconPlus size={14} stroke={1.5} />
                  Tambah
                </button>
                <button className="btn btn-small" onClick={() => setShowAddRoutine(false)}>
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              className="time-block-add-btn"
              onClick={() => setShowAddRoutine(true)}
            >
              <IconPlus size={14} stroke={1.5} />
              Tambah rutinitas
            </button>
          )}
        </div>
      </div>

      {/* Timer overlay */}
      {timerTask && (
        <TaskTimer
          task={timerTask}
          onClose={() => setTimerTask(null)}
          onComplete={() => {
            setTasks((prev) => {
              const dayTasks = prev[selectedDate] || [];
              const updatedDayTasks = dayTasks.map((t) => (t.id === timerTask.id ? { ...t, done: true } : t));
              const updated = { ...prev, [selectedDate]: updatedDayTasks };
              updateHistoryForDate(selectedDate, activeRoutines, updatedDayTasks);
              return updated;
            });
            setTimerTask(null);
            showToast();
          }}
        />
      )}
    </div>
  );
}
