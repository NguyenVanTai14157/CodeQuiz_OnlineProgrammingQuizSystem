export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  status?: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}
