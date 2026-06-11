"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"



export default function LoginPage() {

  const [email,setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    setMessage("");

    try{

      

      const response = await axios.post("http://localhost:8000/api/user-profile",{
        email: email,
        password: password,
      });

      if(response.data.status === "success"){
        localStorage.setItem("loggedInEmail",email);

        router.push("/profile");
      }

    }catch (error: any) {
      if (error.response) {
        // 👇 ADD THIS LINE to see the exact message in your browser inspect tools
        console.error("FASTAPI VALIDATION ERROR:", error.response.data);
    
        // This handles the fallback message safely
        const errorDetail = error.response.data.detail;
        const errorMsg = Array.isArray(errorDetail) ? errorDetail[0]?.msg : errorDetail;
        setMessage(`${errorMsg || "Invalid credentials"}`);
      } else {
        setMessage("Cannot connect to backend");
      }
    }finally{
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          required  />
        </div>

        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          required  />
        </div>

        <button type="submit" disabled={loading}>
          {loading? "logging In": "Log In"}
        </button>
      
      </form>
      {message && <p>{message}</p> }
    </div>
  );

  }

