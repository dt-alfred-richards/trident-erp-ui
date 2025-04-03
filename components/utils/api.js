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
    const token = localStorage.getItem("token"); // Get token from localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export class DataByTableName {
  constructor(tableName) {
    this.tableName = tableName;
    this.backendUrl = `${backendUrl}/${tableName}`;
  }

  async get() {
    return await axiosInstance.get(this.backendUrl).then((res) => res.data);
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
}

export default axiosInstance;
