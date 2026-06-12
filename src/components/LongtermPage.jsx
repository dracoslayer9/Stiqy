import { useState } from 'react';
import { IconPlus, IconDeviceFloppy, IconTrash, IconBrain, IconRocket, IconUsers, IconHeart } from '@tabler/icons-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from './Toast';

const progressColors = ['progress-teal', 'progress-purple', 'progress-amber', 'progress-coral'];

export default function LongtermPage() {
  const showToast = useToast();
  const [visi, setVisi] = useLocalStorage('visi', { visi3: '', misi: '' });
  const [milestones, setMilestones] = useLocalStorage('milestones', []);
  const [pilar, setPilar] = useLocalStorage('pilar', {
    akademik: '',
    bisnis: '',
    network: '',
    kesehatan: '',
  });

  const [visiInput, setVisiInput] = useState(visi.visi3);
  const [misiInput, setMisiInput] = useState(visi.misi);

  const [msPeriode, setMsPeriode] = useState('');
  const [msTema, setMsTema] = useState('');
  const [msDesc, setMsDesc] = useState('');
  const [msProgress, setMsProgress] = useState(0);

  const [pilarInput, setPilarInput] = useState(pilar);

  const saveVisi = () => {
    setVisi({ visi3: visiInput, misi: misiInput });
    showToast();
  };

  const addMilestone = () => {
    if (!msPeriode.trim() || !msTema.trim()) return;
    setMilestones((prev) => [
      ...prev,
      {
        id: Date.now(),
        periode: msPeriode.trim(),
        tema: msTema.trim(),
        desc: msDesc.trim(),
        progress: Number(msProgress),
      },
    ]);
    setMsPeriode('');
    setMsTema('');
    setMsDesc('');
    setMsProgress(0);
    showToast();
  };

  const updateMsProgress = (id, progress) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, progress } : m)));
  };

  const deleteMilestone = (id) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const savePilar = () => {
    setPilar(pilarInput);
    showToast();
  };

  const pilars = [
    { key: 'akademik', label: 'Akademik', icon: IconBrain, bg: 'var(--purple-bg)', color: 'var(--purple-text)' },
    { key: 'bisnis', label: 'Bisnis', icon: IconRocket, bg: 'var(--coral-bg)', color: 'var(--coral-text)' },
    { key: 'network', label: 'Network', icon: IconUsers, bg: 'var(--teal-bg)', color: 'var(--teal-text)' },
    { key: 'kesehatan', label: 'Kesehatan', icon: IconHeart, bg: 'var(--pink-bg)', color: 'var(--pink-text)' },
  ];

  return (
    <div>
      {/* Visi & Misi */}
      <div className="card visi-card section">
        <div className="section-label">Visi & misi</div>
        <div className="form-group">
          <label className="form-label">Visi 3 tahun</label>
          <textarea
            className="textarea visi-textarea"
            value={visiInput}
            onChange={(e) => setVisiInput(e.target.value)}
            placeholder="Gambaran besar hidup dan karir 3 tahun ke depan..."
            rows={3}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Misi pribadi</label>
          <input
            className="input"
            value={misiInput}
            onChange={(e) => setMisiInput(e.target.value)}
            placeholder="Misi satu kalimat yang memandu keputusan sehari-hari"
          />
        </div>
        <button className="btn btn-primary" onClick={saveVisi}>
          <IconDeviceFloppy size={15} stroke={1.5} />
          Simpan
        </button>
      </div>

      {/* Roadmap Milestones */}
      <div className="section">
        <div className="section-label">Roadmap milestones</div>
        <div className="card">
          {milestones.length === 0 ? (
            <div className="empty-state">Belum ada milestone. Tambahkan di bawah.</div>
          ) : (
            milestones.map((ms, idx) => (
              <div className="list-item" key={ms.id} style={{ flexWrap: 'wrap' }}>
                <div className="list-item-content">
                  <div className="list-item-meta" style={{ marginTop: 0, marginBottom: 4 }}>
                    <span className="tag" style={{
                      background: 'var(--color-bg-surface)',
                      color: 'var(--color-text-muted)',
                    }}>
                      {ms.periode}
                    </span>
                  </div>
                  <div className="list-item-title" style={{ fontWeight: 500 }}>
                    {ms.tema}
                  </div>
                  {ms.desc && (
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {ms.desc}
                    </div>
                  )}
                  <div className="progress-row">
                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar-fill ${progressColors[idx % progressColors.length]}`}
                        style={{ width: `${ms.progress}%` }}
                      />
                    </div>
                    <input
                      type="number"
                      className="progress-input"
                      value={ms.progress}
                      min="0"
                      max="100"
                      onChange={(e) => updateMsProgress(ms.id, Math.min(100, Math.max(0, Number(e.target.value))))}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>%</span>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => deleteMilestone(ms.id)} aria-label="Hapus milestone">
                  <IconTrash size={15} stroke={1.5} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add milestone form */}
      <div className="card section">
        <div className="section-label">Tambah milestone</div>
        <div className="form-row" style={{ marginBottom: '8px' }}>
          <div style={{ flex: '0 0 120px' }}>
            <label className="form-label">Periode</label>
            <input
              className="input"
              placeholder="Q3 2026"
              value={msPeriode}
              onChange={(e) => setMsPeriode(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Tema</label>
            <input
              className="input"
              placeholder="Judul milestone..."
              value={msTema}
              onChange={(e) => setMsTema(e.target.value)}
            />
          </div>
          <div style={{ flex: '0 0 64px' }}>
            <label className="form-label">Progress</label>
            <input
              type="number"
              className="input"
              placeholder="%"
              min="0"
              max="100"
              value={msProgress}
              onChange={(e) => setMsProgress(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi</label>
          <textarea
            className="textarea"
            value={msDesc}
            onChange={(e) => setMsDesc(e.target.value)}
            placeholder="Detail milestone..."
            rows={2}
          />
        </div>
        <button className="btn btn-primary" onClick={addMilestone}>
          <IconPlus size={15} stroke={1.5} />
          Tambah
        </button>
      </div>

      {/* Empat Pilar */}
      <div className="section">
        <div className="section-label">Empat pilar</div>
        <div className="pilar-grid">
          {pilars.map((p) => {
            const Icon = p.icon;
            return (
              <div className="pilar-card" key={p.key}>
                <div className="pilar-card-header">
                  <div className="pilar-card-icon" style={{ background: p.bg }}>
                    <Icon size={16} stroke={1.5} style={{ color: p.color }} />
                  </div>
                  <div className="pilar-card-title" style={{ color: p.color }}>
                    {p.label}
                  </div>
                </div>
                <textarea
                  className="textarea"
                  value={pilarInput[p.key]}
                  onChange={(e) => setPilarInput((prev) => ({ ...prev, [p.key]: e.target.value }))}
                  placeholder={`Target & kebiasaan ${p.label.toLowerCase()}...`}
                  rows={3}
                  style={{ fontSize: '13px' }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '10px' }}>
          <button className="btn btn-primary" onClick={savePilar}>
            <IconDeviceFloppy size={15} stroke={1.5} />
            Simpan semua pilar
          </button>
        </div>
      </div>
    </div>
  );
}
