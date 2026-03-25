import './RelationshipBar.css';

function RelationshipBar({ label, value }) {
  const clamp = (val) => Math.max(0, Math.min(100, val));
  const clampedValue = clamp(value);
  const colorClass = label.toLowerCase();

  return (
    <div className="bar-item">
      <div className="bar-label">
        {label}
      </div>
      <div className="meter">
        <div 
          className={`meter-fill ${colorClass}`} 
          style={{ width: `${clampedValue}%` }}
        ></div>
      </div>
    </div>
  );
}

export default RelationshipBar;
