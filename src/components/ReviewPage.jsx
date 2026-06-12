import { useState } from 'react';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from './Toast';

export default function ReviewPage() {
  const showToast = useToast();
  const [weeklyReview, setWeeklyReview] = useLocalStorage('weekly-review', {
    achievements: '',
    unfinished: '',
    lesson: '',
  });
  const [monthlyScores, setMonthlyScores] = useLocalStorage('monthly-scores', {
    bisnis: '',
    akademik: '',
    kesehatan: '',
    koneksi: '',
  });
  const [monthlyReview, setMonthlyReview] = useLocalStorage('monthly-review', {
    visionCheck: '',
    changes: '',
    selfNote: '',
  });

  const [wrInput, setWrInput] = useState(weeklyReview);
  const [scInput, setScInput] = useState(monthlyScores);
  const [mrInput, setMrInput] = useState(monthlyReview);

  const saveWeeklyReview = () => {
    setWeeklyReview(wrInput);
    showToast();
  };

  const saveScores = () => {
    setMonthlyScores(scInput);
    showToast();
  };

  const saveMonthlyReview = () => {
    setMonthlyReview(mrInput);
    showToast();
  };

  const scoreItems = [
    { key: 'bisnis', label: 'Bisnis', color: 'var(--teal-accent)', inputColor: 'var(--teal-text)' },
    { key: 'akademik', label: 'Akademik', color: 'var(--purple-accent)', inputColor: 'var(--purple-text)' },
    { key: 'kesehatan', label: 'Kesehatan', color: 'var(--amber-accent)', inputColor: 'var(--amber-text)' },
    { key: 'koneksi', label: 'Koneksi', color: 'var(--coral-accent)', inputColor: 'var(--coral-text)' },
  ];

  return (
    <div>
      {/* Weekly Review */}
      <div className="card section">
        <div className="section-label">Weekly review</div>
        <div className="form-group">
          <label className="form-label">3 pencapaian terbaik</label>
          <textarea
            className="textarea"
            value={wrInput.achievements}
            onChange={(e) => setWrInput((prev) => ({ ...prev, achievements: e.target.value }))}
            placeholder={"1. \n2. \n3."}
            rows={4}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Yang tidak selesai + kenapa</label>
          <textarea
            className="textarea"
            value={wrInput.unfinished}
            onChange={(e) => setWrInput((prev) => ({ ...prev, unfinished: e.target.value }))}
            placeholder="Apa saja yang belum tercapai dan apa penyebabnya?"
            rows={3}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Satu pelajaran terpenting</label>
          <input
            className="input"
            value={wrInput.lesson}
            onChange={(e) => setWrInput((prev) => ({ ...prev, lesson: e.target.value }))}
            placeholder="Insight paling berharga minggu ini..."
          />
        </div>
        <button className="btn btn-primary" onClick={saveWeeklyReview}>
          <IconDeviceFloppy size={15} stroke={1.5} />
          Simpan review
        </button>
      </div>

      {/* Skor Bulanan */}
      <div className="section">
        <div className="section-label">Skor bulanan</div>
        <div className="score-grid">
          {scoreItems.map((item) => (
            <div className="score-card" key={item.key}>
              <input
                className="score-card-input"
                style={{ color: item.inputColor }}
                type="number"
                min="0"
                max="100"
                value={scInput[item.key]}
                onChange={(e) => setScInput((prev) => ({ ...prev, [item.key]: e.target.value }))}
                placeholder="—"
              />
              <div className="score-card-label" style={{ color: item.color }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px' }}>
          <button className="btn btn-primary" onClick={saveScores}>
            <IconDeviceFloppy size={15} stroke={1.5} />
            Simpan skor
          </button>
        </div>
      </div>

      {/* Refleksi Bulanan */}
      <div className="card section">
        <div className="section-label">Refleksi bulanan</div>
        <div className="form-group">
          <label className="form-label">Apakah mendekati visi 3 tahun?</label>
          <textarea
            className="textarea"
            value={mrInput.visionCheck}
            onChange={(e) => setMrInput((prev) => ({ ...prev, visionCheck: e.target.value }))}
            placeholder="Evaluasi seberapa dekat dengan visi jangka panjang..."
            rows={3}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Yang perlu diubah bulan depan</label>
          <textarea
            className="textarea"
            value={mrInput.changes}
            onChange={(e) => setMrInput((prev) => ({ ...prev, changes: e.target.value }))}
            placeholder="Kebiasaan, prioritas, atau pendekatan yang perlu diubah..."
            rows={3}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Satu kalimat untuk diri sendiri</label>
          <input
            className="input"
            value={mrInput.selfNote}
            onChange={(e) => setMrInput((prev) => ({ ...prev, selfNote: e.target.value }))}
            placeholder="Pesan motivasi atau pengingat untuk bulan depan..."
          />
        </div>
        <button className="btn btn-primary" onClick={saveMonthlyReview}>
          <IconDeviceFloppy size={15} stroke={1.5} />
          Simpan refleksi
        </button>
      </div>
    </div>
  );
}
