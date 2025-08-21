import { useContext } from "react";
import { AuthContext } from "./auth-create-context";

export function useAuth() {
  return useContext(AuthContext);
}

