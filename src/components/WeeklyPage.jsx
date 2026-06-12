import { useState } from 'react';
import {
  IconPlus,
  IconTrash,
  IconSquareNumber1,
  IconSquareNumber2,
  IconSquareNumber3,
  IconSquareNumber4,
  IconSchool,
  IconBriefcase,
  IconTrendingUp,
  IconHeart,
} from '@tabler/icons-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from './Toast';
import ProgressItem from './ProgressItem';

const WEEKS = [
  { id: '1', label: 'Pekan 1', icon: IconSquareNumber1, bg: 'var(--purple-bg)', color: 'var(--purple-text)' },
  { id: '2', label: 'Pekan 2', icon: IconSquareNumber2, bg: 'var(--amber-bg)', color: 'var(--amber-text)' },
  { id: '3', label: 'Pekan 3', icon: IconSquareNumber3, bg: 'var(--teal-bg)', color: 'var(--teal-text)' },
  { id: '4', label: 'Pekan 4', icon: IconSquareNumber4, bg: 'var(--coral-bg)', color: 'var(--coral-text)' },
];

const FOCUS_ICONS = {
  Academic: IconSchool,
  Business: IconBriefcase,
  Career: IconTrendingUp,
  Health: IconHeart,
};

export default function WeeklyPage() {
  const showToast = useToast();

  // Unified weekly data structure indexed by week ID '1', '2', '3', '4'
  // Storing 'focuses' array instead of theme string
  const [weeklyData, setWeeklyData] = useLocalStorage('weekly-data-v3', {
    1: { focuses: [], priorities: [], ntd: [] },
    2: { focuses: [], priorities: [], ntd: [] },
    3: { focuses: [], priorities: [], ntd: [] },
    4: { focuses: [], priorities: [], ntd: [] },
  });

  const [expandedWeek, setExpandedWeek] = useState(null);

  // Form states
  const [priorityName, setPriorityName] = useState('');
  const [priorityProgress, setPriorityProgress] = useState(0);
  const [ntdText, setNtdText] = useState('');

  const handleToggleWeek = (weekId) => {
    if (expandedWeek === weekId) {
      setExpandedWeek(null);
    } else {
      setExpandedWeek(weekId);
      // Clear forms
      setPriorityName('');
      setPriorityProgress(0);
      setNtdText('');
    }
  };

  // --- Focus Multi-Select Actions ---
  const handleToggleFocus = (weekId, focus) => {
    setWeeklyData((prev) => {
      const updated = { ...prev };
      const currentFocuses = updated[weekId]?.focuses || [];
      const isSelected = currentFocuses.includes(focus);
      const newFocuses = isSelected
        ? currentFocuses.filter((f) => f !== focus)
        : [...currentFocuses, focus];

      updated[weekId] = {
        ...updated[weekId],
        focuses: newFocuses,
      };
      return updated;
    });
  };

  // --- Priority Actions ---
  const addPriority = (weekId) => {
    if (!priorityName.trim()) return;
    setWeeklyData((prev) => {
      const updated = { ...prev };
      const currentPriorities = updated[weekId]?.priorities || [];
      updated[weekId] = {
        ...updated[weekId],
        priorities: [
          ...currentPriorities,
          {
            id: Date.now(),
            name: priorityName.trim(),
            category: weekId === '1' ? 'CEO' : weekId === '2' ? 'Akademik' : weekId === '3' ? 'Personal' : 'Koneksi',
            progress: Number(priorityProgress),
          },
        ],
      };
      return updated;
    });
    setPriorityName('');
    setPriorityProgress(0);
    showToast();
  };

  const updatePriorityProgress = (weekId, id, progress) => {
    setWeeklyData((prev) => {
      const updated = { ...prev };
      const currentPriorities = updated[weekId]?.priorities || [];
      updated[weekId] = {
        ...updated[weekId],
        priorities: currentPriorities.map((item) =>
          item.id === id ? { ...item, progress } : item
        ),
      };
      return updated;
    });
  };

  const deletePriority = (weekId, id) => {
    setWeeklyData((prev) => {
      const updated = { ...prev };
      const currentPriorities = updated[weekId]?.priorities || [];
      updated[weekId] = {
        ...updated[weekId],
        priorities: currentPriorities.filter((item) => item.id !== id),
      };
      return updated;
    });
  };

  // --- Not To Do Actions ---
  const addNtd = (weekId) => {
    if (!ntdText.trim()) return;
    setWeeklyData((prev) => {
      const updated = { ...prev };
      const currentNtd = updated[weekId]?.ntd || [];
      updated[weekId] = {
        ...updated[weekId],
        ntd: [...currentNtd, { id: Date.now(), text: ntdText.trim() }],
      };
      return updated;
    });
    setNtdText('');
    showToast();
  };

  const deleteNtd = (weekId, id) => {
    setWeeklyData((prev) => {
      const updated = { ...prev };
      const currentNtd = updated[weekId]?.ntd || [];
      updated[weekId] = {
        ...updated[weekId],
        ntd: currentNtd.filter((item) => item.id !== id),
      };
      return updated;
    });
  };

  return (
    <div>
      <div className="section-label" style={{ marginBottom: '8px' }}>Rencana Mingguan</div>
      
      {/* 4 Week Boxes Grid */}
      <div className="metric-grid" style={{ marginBottom: '1.25rem' }}>
        {WEEKS.map((week) => {
          const FallbackIcon = week.icon;
          const isExpanded = expandedWeek === week.id;
          const weekPrio = weeklyData[week.id]?.priorities || [];
          const completedCount = weekPrio.filter((p) => p.progress === 100).length;
          const progressText = weekPrio.length > 0 ? `${completedCount}/${weekPrio.length}` : '—';
          const selectedFocuses = weeklyData[week.id]?.focuses || [];

          return (
            <div
              key={week.id}
              onClick={() => handleToggleWeek(week.id)}
              className="metric-card"
              style={{
                background: week.bg,
                border: isExpanded ? `2px solid ${week.color}` : '1.5px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem 0.5rem',
                borderRadius: 'var(--radius-lg)',
                transition: 'transform 150ms ease, border-color 150ms ease',
                transform: isExpanded ? 'scale(1.03)' : 'none',
              }}
            >
              {/* Display Focus Icons side-by-side or Fallback Week Number Icon */}
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', color: week.color, marginBottom: '8px' }}>
                {selectedFocuses.length === 0 ? (
                  <FallbackIcon size={26} stroke={1.5} />
                ) : (
                  selectedFocuses.map((f) => {
                    const FocusIcon = FOCUS_ICONS[f];
                    return FocusIcon ? <FocusIcon key={f} size={22} stroke={1.5} /> : null;
                  })
                )}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
                {week.label}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: week.color }}>
                {progressText}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Dropdown Section for Selected Week */}
      {expandedWeek && (
        <div className="week-dropdown-content" style={{ animation: 'fadeIn 200ms ease-out' }}>
          
          {/* Week Theme / Focus - Multi-Select Checkbox Pills */}
          <div className="card section">
            <div className="section-label">Fokus Pekan {expandedWeek}</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['Academic', 'Business', 'Career', 'Health'].map((focus) => {
                const currentFocuses = weeklyData[expandedWeek]?.focuses || [];
                const isSelected = currentFocuses.includes(focus);
                return (
                  <button
                    key={focus}
                    onClick={() => handleToggleFocus(expandedWeek, focus)}
                    className="btn"
                    style={{
                      background: isSelected ? 'var(--teal-bg)' : 'transparent',
                      borderColor: isSelected ? 'var(--teal-accent)' : 'var(--color-border)',
                      color: isSelected ? 'var(--teal-text)' : 'var(--color-text)',
                      fontWeight: isSelected ? '600' : '400',
                      padding: '6px 12px',
                    }}
                  >
                    {focus}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prioritas List */}
          <div className="section">
            <div className="section-label">Prioritas Pekan {expandedWeek}</div>
            <div className="card">
              {(weeklyData[expandedWeek]?.priorities || []).length === 0 ? (
                <div className="empty-state">Belum ada prioritas untuk pekan ini. Tambahkan di bawah.</div>
              ) : (
                (weeklyData[expandedWeek]?.priorities || []).map((item) => (
                  <ProgressItem
                    key={item.id}
                    item={item}
                    onChangeProgress={(id, prog) => updatePriorityProgress(expandedWeek, id, prog)}
                    onDelete={(id) => deletePriority(expandedWeek, id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Add Target / Priority Form */}
          <div className="card section">
            <div className="section-label">Tambah Prioritas Pekan {expandedWeek}</div>
            <div className="form-row">
              <input
                className="input"
                placeholder="Prioritas baru..."
                value={priorityName}
                onChange={(e) => setPriorityName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPriority(expandedWeek)}
              />
              <input
                type="number"
                className="input"
                style={{ flex: '0 0 64px' }}
                placeholder="%"
                min="0"
                max="100"
                value={priorityProgress}
                onChange={(e) => setPriorityProgress(e.target.value)}
              />
              <button className="btn btn-primary" onClick={() => addPriority(expandedWeek)} style={{ flexShrink: 0 }}>
                <IconPlus size={15} stroke={1.5} />
                Tambah
              </button>
            </div>
          </div>

          {/* Not To Do List */}
          <div className="section">
            <div className="section-label">Not-to-do list Pekan {expandedWeek}</div>
            <div className="card">
              {(weeklyData[expandedWeek]?.ntd || []).length === 0 ? (
                <div className="empty-state">Belum ada Not-To-Do untuk pekan ini. Tambahkan di bawah.</div>
              ) : (
                (weeklyData[expandedWeek]?.ntd || []).map((item) => (
                  <div className="list-item" key={item.id}>
                    <div className="ntd-bullet" />
                    <div className="list-item-content">
                      <div className="list-item-title" style={{ color: 'var(--color-text-muted)' }}>
                        {item.text}
                      </div>
                    </div>
                    <button className="delete-btn" onClick={() => deleteNtd(expandedWeek, item.id)} aria-label="Hapus item">
                      <IconTrash size={15} stroke={1.5} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Not To Do Form */}
          <div className="card section">
            <div className="section-label">Tambah Not-to-do Pekan {expandedWeek}</div>
            <div className="form-row">
              <input
                className="input"
                placeholder="Yang harus dihindari pekan ini..."
                value={ntdText}
                onChange={(e) => setNtdText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNtd(expandedWeek)}
              />
              <button className="btn btn-primary" onClick={() => addNtd(expandedWeek)} style={{ flexShrink: 0 }}>
                <IconPlus size={15} stroke={1.5} />
                Tambah
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
