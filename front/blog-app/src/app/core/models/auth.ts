export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}
