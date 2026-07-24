/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tokens
const getTokens = () => {
  const tokens = localStorage.getItem("vertex_ems_tokens");
  if (tokens) {
    try {
      return JSON.parse(tokens) as { accessToken: string; refreshToken: string };
    } catch {
      return null;
    }
  }
  return null;
};

const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("vertex_ems_tokens", JSON.stringify({ accessToken, refreshToken }));
};

const clearTokens = () => {
  localStorage.removeItem("vertex_ems_tokens");
};

// Interceptor for attaching token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Interceptor for refreshing token
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && body !== null && "data" in body) {
      return (body as any).data;
    }
    return body;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest =
      originalRequest.url === "/auth/login" ||
      originalRequest.url === "/auth/register" ||
      originalRequest.url === "/auth/forgot-password" ||
      originalRequest.url === "/auth/reset-password";

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (originalRequest.url === "/auth/refresh") {
        // Refresh token failed, clear everything
        clearTokens();
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const tokens = getTokens();
      if (!tokens?.refreshToken) {
        isRefreshing = false;
        clearTokens();
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        });

        // The response body is enveloped in { data: { accessToken, refreshToken, user } }
        const newAccessToken = data.data?.accessToken || data.accessToken;
        const newRefreshToken = data.data?.refreshToken || data.refreshToken;

        if (!newAccessToken || !newRefreshToken) {
          throw new Error("Invalid tokens in refresh response");
        }

        setTokens(newAccessToken, newRefreshToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        window.location.href = "/auth";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  },
);

// Auth Service
export const AuthAPI = {
  login: (data: any) => api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data),
  logout: (refreshToken?: string) => api.post("/auth/logout", { refreshToken }),
  getMe: () => api.get("/auth/me"),
  saveTokens: setTokens,
  clearTokens: clearTokens,
  getTokens: getTokens,
};

// Employees
export const EmployeesAPI = {
  getAll: () => api.get("/employees"),
  getById: (id: string) => api.get(`/employees/${id}`),
  create: (data: any) => api.post("/employees", data),
  update: (id: string, data: any) => api.patch(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
};

// Departments
export const DepartmentsAPI = {
  getAll: () => api.get("/departments"),
  getById: (id: string) => api.get(`/departments/${id}`),
  create: (data: any) => api.post("/departments", data),
  update: (id: string, data: any) => api.patch(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

// Attendance
export const AttendanceAPI = {
  getAll: () => api.get("/attendance"), // Admin might need parameters here or a specific endpoint
  getMy: () => api.get("/attendance/me"),
  checkIn: () => api.post("/attendance/check-in"),
  checkOut: () => api.post("/attendance/check-out"),
};

// Leaves
export const LeavesAPI = {
  getAll: () => api.get("/leaves"),
  getMy: () => api.get("/leaves/me"),
  apply: (data: any) => api.post("/leaves", data),
  updateStatus: (id: string, data: { status: string; reason?: string }) =>
    api.patch(`/leaves/${id}/status`, data),
  getBalances: (employeeId?: string) =>
    api.get("/leaves/balances", { params: employeeId ? { employeeId } : {} }),
};

// Projects
export const ProjectsAPI = {
  getAll: () => api.get("/projects"),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post("/projects", data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Tasks
export const TasksAPI = {
  getAll: () => api.get("/tasks"),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post("/tasks", data),
  update: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/tasks/${id}/status`, { status }),
};

// Assets
export const AssetsAPI = {
  getAll: () => api.get("/assets"),
  getById: (id: string) => api.get(`/assets/${id}`),
  create: (data: any) => api.post("/assets", data),
  update: (id: string, data: any) => api.patch(`/assets/${id}`, data),
  delete: (id: string) => api.delete(`/assets/${id}`),
};

// Documents
export const DocumentsAPI = {
  getAll: () => api.get("/documents"),
  upload: (data: FormData) =>
    api.post("/documents", data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

// Notifications
export const NotificationsAPI = {
  getAll: () => api.get("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

// Audit Logs
export const AuditLogsAPI = {
  getAll: (params?: any) => api.get("/audit-logs", { params }),
};

// Reports / Dashboard
export const ReportsAPI = {
  getDashboardStats: () => api.get("/reports/dashboard"),
};

// Settings
export const SettingsAPI = {
  get: () => api.get("/settings"),
  update: (data: Record<string, unknown>) => api.patch("/settings", data),
};

// Notification Preferences
export const NotificationPrefsAPI = {
  get: () => api.get("/settings/preferences"),
  update: (data: Record<string, unknown>) => api.patch("/settings/preferences", data),
};

// Payroll
export const PayrollAPI = {
  getAll: (params?: any) => api.get("/payroll", { params }),
  getMy: () => api.get("/payroll/me"),
  generate: (data: { month: number; year: number; departmentId?: string; deductionPercent?: number }) =>
    api.post("/payroll/generate", data),
  getById: (id: string) => api.get(`/payroll/${id}`),
  update: (id: string, data: any) => api.patch(`/payroll/${id}`, data),
};
