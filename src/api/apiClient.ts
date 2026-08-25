import axios from "axios";
import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { store } from "../store/store";
import { logout, saveToken } from "../store/authSlice";
import { persistLogin, removeRefreshToken } from "../util/localStorage";
import Config from "react-native-config";
const storage = createAsyncStorage("appDB");

// API_BASE_URL comes from .env (see react-native-config). Local dev points
// at the Android emulator's loopback address (10.0.2.2); the deployed URL
// is swapped in by changing .env, not by editing this file.
export const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor — attach the access token
apiClient.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor — refresh on 401, then retry once
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { refreshToken } = store.getState().auth;
      if (!refreshToken) {
        store.dispatch(logout())
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}auth/refresh`,
          { refreshToken }
        );
        store.dispatch(saveToken({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }));
        persistLogin(data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch (refreshErr) {
        store.dispatch(logout());
        removeRefreshToken();
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);


