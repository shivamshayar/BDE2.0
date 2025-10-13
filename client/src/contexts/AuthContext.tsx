import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  sessionToken: string | null;
  machineId: string | null;
  login: (sessionToken: string, machineId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem("sessionToken");
  });
  const [machineId, setMachineId] = useState<string | null>(() => {
    return localStorage.getItem("machineId");
  });

  const login = (token: string, machine: string) => {
    setSessionToken(token);
    setMachineId(machine);
    localStorage.setItem("sessionToken", token);
    localStorage.setItem("machineId", machine);
  };

  const logout = () => {
    setSessionToken(null);
    setMachineId(null);
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("machineId");
  };

  return (
    <AuthContext.Provider
      value={{
        sessionToken,
        machineId,
        login,
        logout,
        isAuthenticated: !!sessionToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
