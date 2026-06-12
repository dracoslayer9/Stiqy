import { IconTrash } from '@tabler/icons-react';

const catClass = {
  CEO: 'tag-ceo',
  Akademik: 'tag-akademik',
  Personal: 'tag-personal',
  Koneksi: 'tag-koneksi',
};

const progressClass = {
  CEO: 'progress-purple',
  Akademik: 'progress-amber',
  Personal: 'progress-teal',
  Koneksi: 'progress-coral',
};

export default function ProgressItem({ item, onChangeProgress, onDelete }) {
  return (
    <div className="list-item" style={{ flexWrap: 'wrap' }}>
      <div className="list-item-content">
        <div className="list-item-title">{item.name}</div>
        <div className="progress-row">
          <div className="progress-bar-container">
            <div
              className={`progress-bar-fill ${progressClass[item.category]}`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <input
            type="number"
            className="progress-input"
            value={item.progress}
            min="0"
            max="100"
            onChange={(e) => onChangeProgress(item.id, Math.min(100, Math.max(0, Number(e.target.value))))}
          />
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>%</span>
        </div>
      </div>
      <button
        className="delete-btn"
        onClick={() => onDelete(item.id)}
        aria-label="Hapus item"
      >
        <IconTrash size={15} stroke={1.5} />
      </button>
    </div>
  );
}
