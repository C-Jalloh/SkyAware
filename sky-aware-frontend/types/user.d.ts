export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  savedLocations: string[]; // or a more specific type if not just string[]
  createdAt: string; // ISO date string
}
