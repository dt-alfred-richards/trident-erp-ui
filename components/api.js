import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;
const axiosInstance = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to Attach Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token"); // Get token from localStorage
    if (token) {
      config.headers["token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("Super catch: Token missing or invalid");

      // Clear any local/session storage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");

      // Redirect to login page if token is invalid
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login" && 
        window.location.pathname !== "/contact"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export class DataByTableName {
  constructor(tableName) {
    this.tableName = tableName;
    this.backendUrl = `${backendUrl}/${tableName}`;
  }

  get() {
    return axiosInstance.get(this.backendUrl).then((res) => res.data);
  }

  async post(payload) {
    return axiosInstance.post(this.backendUrl, payload).then((res) => res.data);
  }

  getby({ column, value }) {
    return axiosInstance
      .get(this.backendUrl + `/${column}/${value}`)
      .then((res) => res.data);
  }

  async patch({ key, value }, payload) {
    return axiosInstance
      .patch(`${this.backendUrl}/${key}/${value}`, payload)
      .then((res) => res.data);
  }

  deleteById({ key, value }) {
    return axiosInstance
      .delete(`${this.backendUrl}/${key}/${value}`)
      .then((res) => res.data);
  }

  login(payload) {
    return axiosInstance
      .post(`${this.backendUrl}login`, payload)
      .then((res) => res.data);
  }
}

export default axiosInstance;
