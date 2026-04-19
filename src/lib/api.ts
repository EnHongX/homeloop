const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001'

export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/api/products`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  HEALTH: `${API_BASE_URL}/api/health`,
}

export default API_BASE_URL
