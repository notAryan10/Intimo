import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function CreateCharacter() {
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState("");
  const [emotion, setEmotion] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const createCharacter = async () => {
    await API.post("/character/create", {
      name,
      personality,
      emotion,
      description,
      visibility: "private",
    });

    navigate("/");
  };

  return (
    <div>
      <h2>Create Character</h2>
      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input
        placeholder="Personality"
        onChange={(e) => setPersonality(e.target.value)}
      />
      <input
        placeholder="Emotion"
        onChange={(e) => setEmotion(e.target.value)}
      />
      <input
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={createCharacter}>Create</button>
    </div>
  );
}

export default CreateCharacter;
