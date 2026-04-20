const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001'

export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/api/products`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  HEALTH: `${API_BASE_URL}/api/health`,
  AUTH_SEND_CODE: `${API_BASE_URL}/api/auth/send-code`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_ME: `${API_BASE_URL}/api/auth/me`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
}

export default API_BASE_URL
