export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  bio?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  username: string
  full_name?: string
  password: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  user: User
}

export interface UpdateProfileRequest {
  full_name?: string
  username?: string
  bio?: string
  avatar_url?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}
