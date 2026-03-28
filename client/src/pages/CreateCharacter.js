import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function CreateCharacter() {
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState("");
  const [emotion, setEmotion] = useState("Happy");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("female");
  const [style, setStyle] = useState("soft");
  
  const [pitch, setPitch] = useState(1.0);
  const [rate, setRate] = useState(1.0);

  const navigate = useNavigate();

  const createCharacter = async () => {
    try {
      await API.post("/character/create", {
        name,
        personality,
        emotion,
        description,
        visibility: "private",
        gender,
        voice: {
          style,
          pitch: parseFloat(pitch),
          rate: parseFloat(rate)
        }
      });
      navigate("/");
    } catch (err) {
      console.error("Creation Error:", err);
      alert("Failed to create character.");
    }
  };

  return (
    <div className="create-character-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Create New Companion</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="form-group">
          <label>Name</label>
          <input placeholder="e.g. Luna" onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px' }} />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: '10px' }}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        <div className="form-group">
          <label>Personality (Keywords help assign the best voice)</label>
          <input
            placeholder="e.g. Shy, caring, energetic..."
            onChange={(e) => setPersonality(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
          />
        </div>

        <div className="form-group">
          <label>Description (Bio)</label>
          <textarea
            placeholder="Tell us about them..."
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '10px', height: '80px' }}
          />
        </div>

        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #444', borderRadius: '8px', background: 'var(--secondary-bg)' }}>
          <h3>Vocal Profile</h3>
          
          <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Vocal Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
              <option value="soft">Soft & Gentle</option>
              <option value="cute">Cute & Playful</option>
              <option value="serious">Serious & Calm</option>
              <option value="deep">Deep & Resonant</option>
              <option value="energetic">Energetic & Bright</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Tone Pitch: {pitch} </label>
            <input 
              type="range" 
              min="0.5" max="1.5" step="0.1" 
              value={pitch}
              onChange={(e) => setPitch(e.target.value)} 
            />
          </div>
          
          <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Speech Speed: {rate} </label>
            <input 
              type="range" 
              min="0.5" max="1.5" step="0.1" 
              value={rate}
              onChange={(e) => setRate(e.target.value)} 
            />
          </div>
          
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
            * AI will automatically select a unique voice ID matched to your selections.
          </p>
        </div>

        <button onClick={createCharacter} style={{ marginTop: '20px', width: '100%', padding: '12px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
          Create Companion
        </button>
      </div>
    </div>
  );
}

export default CreateCharacter;
