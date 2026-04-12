/**
 * Core User profile information
*/
export interface User {
  id: string
  username: string
  email: string
  avatarUrl?: string
  bio?: string 
  createdAt: string          // ISO date string
  isTwoFactorEnabled: boolean
  isOnline?: boolean
  hasPassword: boolean       // Useful for users who signed up via OAuth (Google/GitHub)
}

/**
 * Movie/TV show data usually sourced from TMDB API.
 * Supports both Movie and TV properties.
*/
export interface Movie {
  id: number | string
  title?: string            // Used by Movies
  name?: string             // Used by TV Shows
  overview?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string     // Format: YYYY-MM-DD
  first_air_date?: string   // Used by TV Shows
  vote_average?: number
  vote_count?: number
  genre_ids?: number[]
  media_type?: 'movie' | 'tv' | 'person'
}

/**
 * Standard paginated response for search queries
*/
export interface SearchResponse {
  results: Movie[]
  total_results?: number
  page?: number
  total_pages?: number
}

/**
 * Response returned after login or registration attempts
*/
export interface AuthResponse {
  token_type?: string       // Usually "Bearer"
  user: User
  requiresTwoFactor?: boolean
  temp_token?: string       // Used to complete 2FA verification if required
}

/**
 * Simplified User object for social/friend lists
 */
export interface Friend {
  id: string
  username: string
  email?: string
  isOnline?: boolean
  avatarUrl?: string
  created_at?: string
}

/**
 * Data required to initiate the TOTP (Google Authenticator) setup
*/
export interface TwoFaSetupResponse {
  qr_code_url: string       // Base64 or URL to be rendered as a QR code
  secret: string            // Plaintext secret for manual entry
  backup_codes?: string[]   // Emergency codes if the user loses their device 
}

/**
 * Standardized error structure for API catch blocks
 */
export interface ApiError {
  message: string           // Human-readable error message
  statusCode?: number       // HTTP Status Code (400, 401, 404, 500)
  error?: string            // Error type slug (e.g., "UNAUTHORIZED")
}

/**
 * User-generated review for a specific movie or show
*/
export interface Review {
  id: number                
  rating: number            // Usually 1-10 or 1-5
  comment: string
  movieId: number           // Internal database ID
  userId: string            // Author ID
  createdAt: string
  user: {                   // Denormalized user data for display
    username: string;
    avatarUrl?: string 
  }
  title: string             // Review title (not movie title)
  tmdb_id: number           // External TMDB reference ID
  sentiment?: string        // ML output: 'positive', 'negative', 'neutral'
  sentimentScore?: number   // Confidence score (0 to 1)
}

