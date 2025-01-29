export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface RegisterResponse {
  data: {
    user: User;
  };
}

export interface ErrorResponse {
  status: 'error';
  message: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ApiResponse<T = void> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
} 