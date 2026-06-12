import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from './Toast';
import TimeBlock from './TimeBlock';
import TaskTimer from './TaskTimer';

const DEFAULT_BLOCKS = [
  { id: 1, time: '05:00', title: 'Morning ritual', description: 'Journaling, olahraga ringan, meditasi', category: 'Personal' },
  { id: 2, time: '06:30', title: 'Deep work CEO', description: '90 menit fokus bisnis tanpa gangguan', category: 'CEO' },
  { id: 3, time: '08:00', title: 'Kuliah / belajar', description: 'Kelas atau belajar mandiri', category: 'Akademik' },
  { id: 4, time: '12:00', title: 'Istirahat buffer', description: 'Makan siang, jalan kaki, recharge', category: 'Personal' },
  { id: 5, time: '13:00', title: 'Deep work akademik', description: '90 menit fokus tugas & riset', category: 'Akademik' },
  { id: 6, time: '15:00', title: 'Meeting / operasional', description: 'Rapat tim, review, koordinasi', category: 'CEO' },
  { id: 7, time: '17:30', title: 'Daily close refleksi', description: 'Review hari ini, plan besok', category: 'Personal' },
  { id: 8, time: '20:00', title: 'Belajar mandiri', description: 'Buku, kursus, atau side project', category: 'Akademik' },
  { id: 9, time: '22:30', title: 'Wind down', description: 'Persiapan tidur, no screen', category: 'Personal' },
];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // 0 = Mon, 6 = Sun
};

export default function DailyPage() {
  const showToast = useToast();
  const [blocks, setBlocks] = useLocalStorage('time-blocks', DEFAULT_BLOCKS);
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(2026);

  const [expandedBlock, setExpandedBlock] = useState(null);
  const [timerTask, setTimerTask] = useState(null);

  // 90 Days History of Task Completion
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

  // Add-block form
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({ time: '', title: '', description: '', category: 'Personal' });

  // --- Tasks ---
  const toggleTask = (id) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      updateTodayHistory(updated);
      return updated;
    });
  };

  const deleteTask = (id) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      updateTodayHistory(updated);
      return updated;
    });
  };

  const addTask = (newTask) => {
    setTasks((prev) => {
      const updated = [...prev, newTask];
      updateTodayHistory(updated);
      return updated;
    });
    showToast();
  };

  // Helper to save today's percentage to history
  const updateTodayHistory = (updatedTasks) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const pct = updatedTasks.length > 0
      ? Math.round((updatedTasks.filter((t) => t.done).length / updatedTasks.length) * 100)
      : 0;
    setHistory((prev) => ({
      ...prev,
      [todayStr]: pct,
    }));
  };

  // --- Blocks ---
  const updateBlock = (id, data) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
    showToast();
  };

  const deleteBlock = (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setTasks((prev) => {
      const updated = prev.filter((t) => t.blockId !== id);
      updateTodayHistory(updated);
      return updated;
    });
  };

  const handleAddBlock = () => {
    if (!newBlock.time.trim() || !newBlock.title.trim()) return;
    setBlocks((prev) => [
      ...prev,
      { ...newBlock, id: Date.now(), time: newBlock.time.trim(), title: newBlock.title.trim(), description: newBlock.description.trim() },
    ]);
    setNewBlock({ time: '', title: '', description: '', category: 'Personal' });
    setShowAddBlock(false);
    showToast();
  };

  const handleToggleBlock = (id) => {
    setExpandedBlock((prev) => (prev === id ? null : id));
  };

  const getDayCompletion = (dateStr) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) {
      return tasks.length > 0 ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0;
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

  return (
    <div>
      {/* Calendar Productivity Heatmap - Sticky Header Container */}
      <div className="sticky-header-container">
        <div className="calendar-card-solid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="section-label" style={{ margin: 0 }}>Produktivitas Harian</div>
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

          {/* Calendar days grid - exactly 4 rows & 7 columns (28 days) */}
          <div className="calendar-grid-4x7">
            {Array.from({ length: 28 }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(selectedYear, selectedMonth, dayNum);
              const dateStr = dateObj.toISOString().split('T')[0];
              const pct = getDayCompletion(dateStr);
              const style = getCompletionStyle(pct);

            // Determine text color based on progress for contrast
            let textColor = 'var(--color-text-muted)';
            if (pct > 0 && pct <= 50) textColor = '#0F6E56';
            else if (pct > 50) textColor = '#ffffff';

            return (
              <div
                key={dayNum}
                className="calendar-day-cell-mini"
                style={{ ...style, color: textColor }}
                title={`${dayNum} ${indonesianMonths[selectedMonth]}: ${pct}% selesai`}
              >
                {dayNum}
              </div>
            );
            })}
          </div>
        </div>
        {/* Blur edge effect for content sliding under */}
        <div className="blur-transition-strip"></div>
      </div>

      {/* Time blocks */}
      <div className="section">
        <div className="section-label">Time blocks</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {blocks.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              Belum ada jadwal. Tambahkan di bawah.
            </div>
          ) : (
            blocks.map((block) => (
              <TimeBlock
                key={block.id}
                block={block}
                tasks={tasks}
                expanded={expandedBlock === block.id}
                onToggle={() => handleToggleBlock(block.id)}
                onUpdateBlock={updateBlock}
                onDeleteBlock={deleteBlock}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onStartTimer={(task) => setTimerTask(task)}
              />
            ))
          )}

          {/* Add block row */}
          {showAddBlock ? (
            <div className="time-block-add-block">
              <div className="form-row" style={{ marginBottom: '8px' }}>
                <div style={{ flex: '0 0 68px' }}>
                  <label className="form-label">Waktu</label>
                  <input
                    className="input"
                    placeholder="08:00"
                    value={newBlock.time}
                    onChange={(e) => setNewBlock((nb) => ({ ...nb, time: e.target.value }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Judul</label>
                  <input
                    className="input"
                    placeholder="Nama kegiatan"
                    value={newBlock.title}
                    onChange={(e) => setNewBlock((nb) => ({ ...nb, title: e.target.value }))}
                  />
                </div>
                <div style={{ flex: '0 0 110px' }}>
                  <label className="form-label">Kategori</label>
                  <select
                    className="select"
                    value={newBlock.category}
                    onChange={(e) => setNewBlock((nb) => ({ ...nb, category: e.target.value }))}
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
                  placeholder="Deskripsi singkat..."
                  value={newBlock.description}
                  onChange={(e) => setNewBlock((nb) => ({ ...nb, description: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-primary btn-small" onClick={handleAddBlock}>
                  <IconPlus size={14} stroke={1.5} />
                  Tambah
                </button>
                <button className="btn btn-small" onClick={() => setShowAddBlock(false)}>
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              className="time-block-add-btn"
              onClick={() => setShowAddBlock(true)}
            >
              <IconPlus size={14} stroke={1.5} />
              Tambah jadwal
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
              const updated = prev.map((t) => (t.id === timerTask.id ? { ...t, done: true } : t));
              updateTodayHistory(updated);
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
