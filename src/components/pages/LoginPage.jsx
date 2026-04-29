import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import companyLogo from "../../assets/Asset_1.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  
const { user, loading, saveAuthData } = useAuth();

useEffect(() => {
  if (!loading && user) {
    navigate("/home", { replace: true });
  }
}, [user, loading]);

const handleLogin = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message);
      return;
    }

    saveAuthData(data.payload);
    //console.log(data); 
  } catch (err) {
    setError("Login failed");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">

        <div className="text-center mb-8">
          <img src={companyLogo} className="w-[200px] mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Enter your credentials
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-3 rounded-xl"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-4 py-3 rounded-xl"
          />

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            {isLoggingIn ? "Loading..." : "Login"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;