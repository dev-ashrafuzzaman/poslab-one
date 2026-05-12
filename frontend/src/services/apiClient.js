// src/services/apiClient.js
import axios from "axios";
import { Config } from "../utils/constants";

const apiClient = axios.create({
  baseURL: Config.api.url,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true, // 🍪 REQUIRED for HTTP-only refresh cookie
});

export default apiClient;
