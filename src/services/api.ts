import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// JWT injection
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 redirect
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ------ Type definitions matching backend schemas ------

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string;
  status: "active" | "inactive" | "on_leave";
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  category: string;
  required_level: number;
}

export interface Assessment {
  id: string;
  employee_id: string;
  competency_id: string;
  assessed_level: number;
  assessor_id: string;
  assessed_at: string;
  notes?: string;
}

export interface SkillGap {
  employee_id: string;
  competency_id: string;
  required_level: number;
  current_level: number;
  gap: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export default api;
