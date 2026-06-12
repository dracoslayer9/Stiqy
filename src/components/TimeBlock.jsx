import { useState } from 'react';
import {
  IconPlus,
  IconChevronDown,
  IconTrash,
  IconPencil,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import TaskItem from './TaskItem';

const catClass = {
  CEO: 'tag-ceo',
  Akademik: 'tag-akademik',
  Personal: 'tag-personal',
};

export default function TimeBlock({
  block,
  tasks,
  expanded,
  onToggle,
  onUpdateBlock,
  onDeleteBlock,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onStartTimer,
}) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ ...block });
  const [taskName, setTaskName] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');

  const blockTasks = tasks.filter((t) => t.blockId === block.id);

  // --- Task actions ---
  const handleAddTask = () => {
    if (!taskName.trim()) return;
    onAddTask({
      id: Date.now(),
      name: taskName.trim(),
      priority: taskPriority,
      category: block.category,
      blockId: block.id,
      done: false,
    });
    setTaskName('');
  };

  const handleTaskKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask();
  };

  // --- Block edit actions ---
  const startEdit = (e) => {
    e.stopPropagation();
    setEditData({ ...block });
    setEditing(true);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditing(false);
  };

  const saveEdit = (e) => {
    e.stopPropagation();
    if (!editData.time.trim() || !editData.title.trim()) return;
    onUpdateBlock(block.id, editData);
    setEditing(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteBlock(block.id);
  };

  // --- Edit mode ---
  if (editing) {
    return (
      <div className="time-block-wrapper">
        <div className="time-block-edit" onClick={(e) => e.stopPropagation()}>
          <div className="form-row" style={{ marginBottom: '8px' }}>
            <div style={{ flex: '0 0 68px' }}>
              <label className="form-label">Waktu</label>
              <input
                className="input"
                value={editData.time}
                onChange={(e) => setEditData((d) => ({ ...d, time: e.target.value }))}
                placeholder="08:00"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Judul</label>
              <input
                className="input"
                value={editData.title}
                onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))}
                placeholder="Nama kegiatan"
              />
            </div>
            <div style={{ flex: '0 0 110px' }}>
              <label className="form-label">Kategori</label>
              <select
                className="select"
                value={editData.category}
                onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value }))}
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
              value={editData.description}
              onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
              placeholder="Deskripsi singkat..."
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-primary btn-small" onClick={saveEdit}>
              <IconCheck size={14} stroke={1.5} />
              Simpan
            </button>
            <button className="btn btn-small" onClick={cancelEdit}>
              <IconX size={14} stroke={1.5} />
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Display mode ---
  return (
    <div className={`time-block-wrapper ${expanded ? 'expanded' : ''}`}>
      {/* Clickable header */}
      <div className="time-block" onClick={onToggle} role="button" tabIndex={0}>
        <div className="time-block-time">{block.time}</div>
        <div className="time-block-info">
          <div className="time-block-title">
            {block.title}
            <span className={`tag ${catClass[block.category] || 'tag-personal'}`}>
              {block.category.toLowerCase()}
            </span>
            {blockTasks.length > 0 && (
              <span className="time-block-count">
                {blockTasks.filter((t) => t.done).length}/{blockTasks.length}
              </span>
            )}
          </div>
          {block.description && (
            <div className="time-block-desc">{block.description}</div>
          )}
        </div>

        {/* Edit / Delete — visible on hover */}
        <div className="time-block-actions">
          <button className="tb-action-btn" onClick={startEdit} aria-label="Edit">
            <IconPencil size={13} stroke={1.5} />
          </button>
          <button className="tb-action-btn tb-action-delete" onClick={handleDelete} aria-label="Hapus">
            <IconTrash size={13} stroke={1.5} />
          </button>
        </div>

        <IconChevronDown
          size={14}
          stroke={1.5}
          className={`time-block-chevron ${expanded ? 'rotated' : ''}`}
        />
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="time-block-body">
          {/* Task list */}
          {blockTasks.length > 0 && (
            <div className="time-block-tasks">
              {blockTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onStartTimer={onStartTimer}
                />
              ))}
            </div>
          )}

          {/* Inline add form */}
          <div className="time-block-add">
            <div className="form-row">
              <input
                className="input"
                placeholder="Tambah kegiatan..."
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={handleTaskKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
              <select
                className="select"
                style={{ flex: '0 0 84px' }}
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button
                className="btn btn-primary btn-small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTask();
                }}
                style={{ flexShrink: 0 }}
              >
                <IconPlus size={14} stroke={1.5} />
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
