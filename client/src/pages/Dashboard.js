import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [characters, setCharacters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
        const res = await API.get("/character/my");
        setCharacters(res.data);
    } catch (err) {
        console.error("Error fetching characters:", err);
    }
  };

  const handleDelete = async (charId, charName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${charName}? This will permanently remove all chats, memories, and relationship data.`);
    
    if (!confirmDelete) return;

    try {
      await API.delete(`/character/${charId}`);
      alert("Character deleted successfully.");
      fetchCharacters();
    } catch (err) {
      console.error("Error deleting character:", err);
      alert("Failed to delete character.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Your AI Companions</h1>
        <button className="btn-primary" onClick={() => navigate("/create")}>
          + Create New
        </button>
      </div>

      <div className="character-grid">
        {characters.length === 0 ? (
          <div className="empty-state">
            <p>No characters yet. Create your first companion!</p>
          </div>
        ) : (
          characters.map((char) => (
            <div key={char._id} className="character-card">
              <div className="card-avatar">
                {char.name.charAt(0)}
              </div>
              <div className="card-content">
                <h3>{char.name}</h3>
                <p className="personality-tag">{char.personality}</p>
                <p className="description-text">{char.description || "No description provided."}</p>
                <div className="card-actions">
                  <button className="btn-chat" onClick={() => navigate(`/chat/${char._id}`)}>
                    Open Chat
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(char._id, char.name)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
