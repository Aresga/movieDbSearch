export interface User {
  id: string
  username: string
  email: string
  avatarUrl?: string
  bio?: string 
  createdAt: string
  isTwoFactorEnabled: boolean
  isOnline?: boolean
  hasPassword: boolean
}

export interface Movie {
  id: number | string
  title?: string
  name?: string
  overview?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  vote_count?: number
  genre_ids?: number[]
  media_type?: 'movie' | 'tv' | 'person'
}

export interface SearchResponse {
  results: Movie[]
  total_results?: number
  page?: number
  total_pages?: number
}

export interface AuthResponse {
  token_type?: string
  user: User
  requiresTwoFactor?: boolean
  temp_token?: string
}

export interface Friend {
  id: string
  username: string
  email?: string
  isOnline?: boolean
  avatar_url?: string
  created_at?: string
}

export interface TwoFaSetupResponse {
  qr_code_url: string
  secret: string
  backup_codes?: string[] // Maybe nice to have too 
}

export interface ApiError {
  message: string
  statusCode?: number
  error?: string
}

export interface Review {
  id: number
  rating: number
  comment: string
  movieId: number
  userId: string
  createdAt: string
  user: { username: string; avatarUrl?: string }
  title: string
  tmdb_id: number
  sentiment?: string
  sentimentScore?: number
}

