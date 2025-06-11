"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useGlobalContext } from "../components/GlobalContext";

function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { logout } = useGlobalContext();

  useEffect(() => {
    const checkToken = () => {
      if (!logout) return
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token || isTokenExpired(token)) {
        logout();
        router.push("/login");
      }
    };

    checkToken();

    const interval = setInterval(checkToken, 60 * 1000); // check every 1 min
    return () => clearInterval(interval);
  }, [router]);

  return <>{children}</>;
};
