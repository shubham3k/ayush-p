export default function Stats({ stats }: { stats: [string, string][] }) {
  return (
    <div className="stats">
      {stats.map(([value, label]) => (
        <div key={label}>
          <b>{value}</b>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}
