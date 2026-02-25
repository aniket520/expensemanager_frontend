import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Register
    await axios.post(
      "http://localhost:8091/api/auth/register",
      {
        name,
        email,
        username: email,
        password
      }
    );

    // Login
    const loginResponse = await axios.post(
      "http://localhost:8091/api/auth/login",
      {
        email,
        password
      }
    );

    localStorage.setItem("token", loginResponse.data.token);

    toast.success("Registration Successful ✅");

    navigate("/dashboard");

  } catch (error) {
    if (error.response) {
      toast.error(error.response.data || "Something went wrong");
    } else {
      toast.error("Network error");
    }
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Register</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  card: {
    padding: "40px",
    width: "350px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    background: "linear-gradient(90deg, #6366f1, #4f46e5)",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Register;