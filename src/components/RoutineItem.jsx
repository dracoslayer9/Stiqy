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

const formatTimeInput = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + ':' + digits.slice(2, 4);
};

export default function RoutineItem({
  routine,
  tasks,
  expanded,
  onToggleExpand,
  onUpdateRoutine,
  onDeleteRoutine,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onStartTimer,
  onToggleRoutineHeader,
  onUpdateTask,
}) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ ...routine });
  const [taskName, setTaskName] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');

  const routineTasks = tasks.filter((t) => t.blockId === routine.id);

  // --- Task actions ---
  const handleAddTask = () => {
    if (!taskName.trim()) return;
    onAddTask({
      id: Date.now(),
      name: taskName.trim(),
      priority: taskPriority,
      category: routine.category,
      blockId: routine.id,
      done: false,
    });
    setTaskName('');
  };

  const handleTaskKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask();
  };

  // --- Routine edit actions ---
  const startEdit = (e) => {
    e.stopPropagation();
    setEditData({ ...routine });
    setEditing(true);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditing(false);
  };

  const saveEdit = (e) => {
    e.stopPropagation();
    if (!editData.time.trim() || !editData.title.trim()) return;
    onUpdateRoutine(routine.id, editData);
    setEditing(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteRoutine(routine.id);
  };

  const totalTasks = routineTasks.length;
  const completedTasks = routineTasks.filter((t) => t.done).length;
  
  // A routine is completed if it has tasks and all tasks are completed, OR if it has no tasks and the routine itself is checked.
  const isCompleted = totalTasks > 0 
    ? completedTasks === totalTasks 
    : !!routine.done;

  const routineStatusClass = isCompleted ? 'completed-green' : 'incomplete-grey';

  if (editing) {
    return (
      <div className="routine-item-wrapper">
        <div className="routine-item-edit" onClick={(e) => e.stopPropagation()}>
          <div className="form-row" style={{ marginBottom: '8px' }}>
            <div style={{ flex: '0 0 68px' }}>
              <label className="form-label">Waktu</label>
              <input
                className="input"
                value={editData.time}
                onChange={(e) => setEditData((d) => ({ ...d, time: formatTimeInput(e.target.value) }))}
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

  return (
    <div className={`routine-item-wrapper ${expanded ? 'expanded' : ''} ${routineStatusClass}`}>
      <div className="routine-item" onClick={onToggleExpand} role="button" tabIndex={0}>
        {/* Checkbox for Routine Accomplishment */}
        <div 
          className="routine-checkbox-container" 
          onClick={(e) => {
            e.stopPropagation();
            onToggleRoutineHeader(routine.id);
          }}
        >
          <input 
            type="checkbox" 
            className="routine-checkbox"
            checked={isCompleted}
            onChange={() => {}} // handled by onClick container
          />
        </div>

        <div className="routine-item-time">{routine.time}</div>
        <div className="routine-item-info">
          <div className="routine-item-title">
            {routine.title}
            <span className={`tag ${catClass[routine.category] || 'tag-personal'}`}>
              {routine.category.toLowerCase()}
            </span>
            {totalTasks > 0 && (
              <span className="routine-item-count">
                {completedTasks}/{totalTasks}
              </span>
            )}
          </div>
          {routine.description && (
            <div className="routine-item-desc">{routine.description}</div>
          )}
        </div>

        {/* Edit / Delete actions */}
        <div className="routine-item-actions">
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
          className={`routine-item-chevron ${expanded ? 'rotated' : ''}`}
        />
      </div>

      {/* Expandable subtasks */}
      {expanded && (
        <div className="routine-item-body">
          {totalTasks > 0 && (
            <div className="routine-item-tasks">
              {routineTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onStartTimer={onStartTimer}
                  onUpdate={onUpdateTask}
                />
              ))}
            </div>
          )}

          {/* Add task form */}
          <div className="routine-item-add">
            <div className="form-row">
              <input
                className="input"
                placeholder="Tambah sub-kegiatan..."
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
