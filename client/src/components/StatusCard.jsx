export default function StatusCard({ title, value, tone = 'neutral' }) {
  return (
    <article className={`status-card status-card--${tone}`}>
      <p className="status-card__title">{title}</p>
      <strong className="status-card__value">{value}</strong>
    </article>
  );
}
