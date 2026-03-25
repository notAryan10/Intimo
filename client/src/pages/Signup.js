import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    await API.post("/auth/signup", { username, email, password, isAdult });
    navigate("/login");
  };

  return (
    <div>
      <h2>Signup</h2>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)}/>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)}/>
      <label>
        <input type="checkbox" checked={isAdult} onChange={(e) => setIsAdult(e.target.checked)} />
        18+
      </label>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}

export default Signup;
