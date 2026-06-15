import { useState } from 'react';
import { IconTrash, IconClock, IconPencil, IconCheck, IconX } from '@tabler/icons-react';

const catClass = {
  CEO: 'tag-ceo',
  Akademik: 'tag-akademik',
  Personal: 'tag-personal',
};

const prioClass = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

const prioLabel = {
  high: 'high',
  medium: 'med',
  low: 'low',
};

export default function TaskItem({ task, onToggle, onDelete, onStartTimer, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editPriority, setEditPriority] = useState(task.priority);

  const handleSave = () => {
    if (!editName.trim()) return;
    onUpdate(task.id, { name: editName.trim(), priority: editPriority });
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <div className="list-item" style={{ padding: '6px 4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          className="input"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, padding: '4px 8px', fontSize: '13px', height: '28px', minWidth: 0 }}
          placeholder="Nama task..."
          autoFocus
        />
        <select
          className="select"
          value={editPriority}
          onChange={(e) => setEditPriority(e.target.value)}
          style={{ flex: '0 0 84px', padding: '4px 8px', fontSize: '12px', height: '28px' }}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button className="tb-action-btn" onClick={handleSave} style={{ padding: '4px' }}>
            <IconCheck size={14} stroke={1.5} style={{ color: 'var(--teal-accent)' }} />
          </button>
          <button className="tb-action-btn" onClick={() => setEditing(false)} style={{ padding: '4px' }}>
            <IconX size={14} stroke={1.5} style={{ color: 'var(--red-text)' }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="list-item">
      <input
        type="checkbox"
        className="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
      />
      <div className="list-item-content">
        <div className={`list-item-title ${task.done ? 'done' : ''}`}>
          {task.name}
        </div>
        <div className="list-item-meta">
          <span className={`priority-badge ${prioClass[task.priority]}`}>
            {prioLabel[task.priority]}
          </span>
          <span className={`tag ${catClass[task.category]}`}>
            {task.category.toLowerCase()}
          </span>
        </div>
      </div>
      <div className="list-item-actions">
        <button
          className="action-btn"
          onClick={() => {
            setEditName(task.name);
            setEditPriority(task.priority);
            setEditing(true);
          }}
          aria-label="Edit task"
        >
          <IconPencil size={15} stroke={1.5} />
        </button>
        {onStartTimer && (
          <button
            className="action-btn timer-action-btn"
            onClick={(e) => { e.stopPropagation(); onStartTimer(task); }}
            aria-label="Timer"
          >
            <IconClock size={15} stroke={1.5} />
          </button>
        )}
        <button
          className="action-btn delete-action-btn"
          onClick={() => onDelete(task.id)}
          aria-label="Hapus task"
        >
          <IconTrash size={15} stroke={1.5} />
        </button>
      </div>
    </div>
  );
}
