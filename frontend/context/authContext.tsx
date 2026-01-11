"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { auth, getUserId, logout } from "@/actions/actions";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  checkAuth: () => Promise<void>;
  handleLogout: () => Promise<void>;
  userId: any;
  user: User | null;
  updateUserBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  checkAuth: async () => {},
  handleLogout: async () => {},
  userId: null,
  user: null,
  updateUserBalance: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = async () => {
    try {
      const isAuth = await auth();
      setIsAuthenticated(isAuth);
      const userId = await getUserId();
      if (userId) {
        setUserId(userId);
        fetchUserData(userId as string);
      }
    } catch (error) {
      console.error("Auth check failed", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const user = await fetch(`http://localhost:3000/api/users/${userId}`);
      const userData = await user.json();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const updateUserBalance = (newBalance: number) => {
    console.log("AuthContext: Updating user balance to", newBalance);
    if (user) {
      setUser({ ...user, balance: newBalance });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        checkAuth,
        handleLogout,
        userId,
        user,
        updateUserBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
