import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/v1/admin/me`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
     .then((data) => {
  //console.log("API user:", data);
  setUser(data);
})
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const saveAuthData = (data) => {
    setUser(data);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/v1/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, saveAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);