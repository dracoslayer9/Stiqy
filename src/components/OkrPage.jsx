import { useState } from 'react';
import { IconPlus, IconDeviceFloppy, IconTrash } from '@tabler/icons-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from './Toast';

const catClass = {
  CEO: 'tag-ceo',
  Akademik: 'tag-akademik',
  Personal: 'tag-personal',
};

const progressClass = {
  CEO: 'progress-purple',
  Akademik: 'progress-amber',
  Personal: 'progress-teal',
};

const metricColors = {
  ipk: { label: 'IPK / nilai', color: 'var(--amber-accent)', bg: 'var(--amber-bg)' },
  mrr: { label: 'MRR bisnis', color: 'var(--purple-accent)', bg: 'var(--purple-bg)' },
  koneksi: { label: 'Koneksi baru', color: 'var(--coral-accent)', bg: 'var(--coral-bg)' },
  buku: { label: 'Buku selesai', color: 'var(--teal-accent)', bg: 'var(--teal-bg)' },
};

export default function OkrPage() {
  const showToast = useToast();
  const [okrMetrics, setOkrMetrics] = useLocalStorage('okr-metrics', {
    ipk: '',
    mrr: '',
    koneksi: '',
    buku: '',
  });
  const [okrList, setOkrList] = useLocalStorage('okr-list', []);

  const [metricsInput, setMetricsInput] = useState(okrMetrics);
  const [objInput, setObjInput] = useState('');
  const [krInput, setKrInput] = useState('');
  const [krProgress, setKrProgress] = useState(0);
  const [krCat, setKrCat] = useState('CEO');

  const saveMetrics = () => {
    setOkrMetrics(metricsInput);
    showToast();
  };

  const addKr = () => {
    if (!objInput.trim() || !krInput.trim()) return;
    setOkrList((prev) => [
      ...prev,
      {
        id: Date.now(),
        objective: objInput.trim(),
        name: krInput.trim(),
        progress: Number(krProgress),
        category: krCat,
      },
    ]);
    setKrInput('');
    setKrProgress(0);
    showToast();
  };

  const updateKrProgress = (id, progress) => {
    setOkrList((prev) => prev.map((item) => (item.id === id ? { ...item, progress } : item)));
  };

  const deleteKr = (id) => {
    setOkrList((prev) => prev.filter((item) => item.id !== id));
  };

  // Group KRs by objective
  const grouped = okrList.reduce((acc, kr) => {
    if (!acc[kr.objective]) acc[kr.objective] = [];
    acc[kr.objective].push(kr);
    return acc;
  }, {});

  return (
    <div>
      {/* Dashboard metrics */}
      <div className="section">
        <div className="section-label">Metrics bulanan</div>
        <div className="metric-grid">
          {Object.entries(metricColors).map(([key, meta]) => (
            <div className="metric-card" key={key} style={{ background: meta.bg }}>
              <div className="metric-card-label">{meta.label}</div>
              <input
                className="input-metric"
                style={{ color: meta.color }}
                value={metricsInput[key]}
                onChange={(e) => setMetricsInput((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder="—"
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={saveMetrics}>
          <IconDeviceFloppy size={15} stroke={1.5} />
          Simpan metrics
        </button>
      </div>

      {/* Key Results */}
      <div className="section">
        <div className="section-label">Key results</div>
        <div className="card">
          {okrList.length === 0 ? (
            <div className="empty-state">Belum ada key result. Tambahkan di bawah.</div>
          ) : (
            Object.entries(grouped).map(([objective, krs]) => (
              <div className="kr-group" key={objective}>
                <div className="kr-group-label">{objective}</div>
                {krs.map((kr) => (
                  <div className="list-item" key={kr.id} style={{ flexWrap: 'wrap' }}>
                    <div className="list-item-content">
                      <div className="list-item-title" style={{ fontWeight: 500 }}>
                        {kr.name}
                      </div>
                      <div className="list-item-meta">
                        <span className={`tag ${catClass[kr.category]}`}>
                          {kr.category.toLowerCase()}
                        </span>
                      </div>
                      <div className="progress-row">
                        <div className="progress-bar-container">
                          <div
                            className={`progress-bar-fill ${progressClass[kr.category]}`}
                            style={{ width: `${kr.progress}%` }}
                          />
                        </div>
                        <input
                          type="number"
                          className="progress-input"
                          value={kr.progress}
                          min="0"
                          max="100"
                          onChange={(e) => updateKrProgress(kr.id, Math.min(100, Math.max(0, Number(e.target.value))))}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>%</span>
                      </div>
                    </div>
                    <button className="delete-btn" onClick={() => deleteKr(kr.id)} aria-label="Hapus KR">
                      <IconTrash size={15} stroke={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add KR form */}
      <div className="card section">
        <div className="section-label">Tambah key result</div>
        <div className="form-group">
          <label className="form-label">Objective</label>
          <input
            className="input"
            placeholder="Nama objective..."
            value={objInput}
            onChange={(e) => setObjInput(e.target.value)}
          />
        </div>
        <div className="form-row">
          <input
            className="input"
            placeholder="Key result..."
            value={krInput}
            onChange={(e) => setKrInput(e.target.value)}
          />
          <select className="select" style={{ flex: '0 0 110px' }} value={krCat} onChange={(e) => setKrCat(e.target.value)}>
            <option value="CEO">CEO</option>
            <option value="Akademik">Akademik</option>
            <option value="Personal">Personal</option>
          </select>
          <input
            type="number"
            className="input"
            style={{ flex: '0 0 64px' }}
            placeholder="%"
            min="0"
            max="100"
            value={krProgress}
            onChange={(e) => setKrProgress(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addKr} style={{ flexShrink: 0 }}>
            <IconPlus size={15} stroke={1.5} />
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
