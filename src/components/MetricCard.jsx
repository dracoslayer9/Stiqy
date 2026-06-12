export default function MetricCard({ label, value, color }) {
  return (
    <div className="metric-card">
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-value" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}
