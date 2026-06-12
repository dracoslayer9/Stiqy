import { IconTrash, IconClock } from '@tabler/icons-react';

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

export default function TaskItem({ task, onToggle, onDelete, onStartTimer }) {
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
