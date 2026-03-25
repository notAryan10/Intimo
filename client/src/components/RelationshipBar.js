function RelationshipBar({ label, value }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ccc", marginBottom: "4px" }}>
        {label}
      </div>
      <div
        style={{
          background: "#333",
          height: "8px",
          borderRadius: "5px",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            background: "#2b8cff",
            height: "8px",
            borderRadius: "5px",
            transition: "width 0.5s ease"
          }}
        ></div>
      </div>
    </div>
  );
}

export default RelationshipBar;
