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
                <button className="btn-chat" onClick={() => navigate(`/chat/${char._id}`)}>
                  Open Chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
