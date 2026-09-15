import axios from "axios"

const api = axios.create({
  baseURL: "/api",
})

api.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem("tokens") || "null")
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const tokens = JSON.parse(localStorage.getItem("tokens") || "null")
      if (tokens?.refresh) {
        try {
          const { data } = await axios.post("/api/auth/refresh/", {
            refresh: tokens.refresh,
          })
          const newTokens = { ...tokens, access: data.access }
          localStorage.setItem("tokens", JSON.stringify(newTokens))
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem("tokens")
          window.location.href = "/login"
        }
      } else {
        localStorage.removeItem("tokens")
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export default api
