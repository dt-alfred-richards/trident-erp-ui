import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

export class DataByTableName {
  constructor(tableName) {
    this.tableName = tableName;
    this.backendUrl = `${backendUrl}/${tableName}`;
  }

  async get() {
    return await axios.get(this.backendUrl).then((res) => res.data);
  }

  async post(payload) {
    return axios.post(this.backendUrl, payload).then((res) => res.data);
  }

  async patch({ key, value }, payload) {
    return axios
      .patch(`${this.backendUrl}/${key}/${value}`, payload)
      .then((res) => res.data);
  }
}
