export default function MarkerPanel({ marker, onUpdate, onDelete, onClose }) {
  if (!marker) return null;

  return (
    <div style={{
      position: "absolute",
      top: "20px",
      right: "20px",
      width: "280px",
      background: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      padding: "16px",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", fontSize: "16px", color: "#1a1a1a" }}>Edit Marker</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>✕</button>
      </div>
      <input
        type="text"
        placeholder="Name this point"
        defaultValue={marker.name}
        id="panel-name"
        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%", color: "#1a1a1a" }}
      />
      <select
        defaultValue={marker.color}
        id="panel-color"
        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #1a1a1a" }}
      >
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="yellow">Yellow</option>
      </select>
      <button
        onClick={() => {
          const name = document.getElementById("panel-name").value;
          const color = document.getElementById("panel-color").value;
          onUpdate(marker.id, color, name);
          onClose();
        }}
        style={{ padding: "8px", background: "#6da48d", color: "white", borderRadius: "4px", border: "none", cursor: "pointer" }}
      >
        Done
      </button>
      <button
        onClick={() => {
          onDelete(marker.id);
          onClose();
        }}
        style={{ padding: "8px", background: "#e74c3c", color: "white", borderRadius: "4px", border: "none", cursor: "pointer" }}
      >
        Delete
      </button>
    </div>
  );
}