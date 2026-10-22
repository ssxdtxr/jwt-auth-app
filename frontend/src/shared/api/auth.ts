import axios from 'axios';

// These API response shapes are contracts between client and server
interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string };
}

interface RegisterResponse {
  message: string;
}

// Separate axios instance — no Authorization header, no refresh interceptor
const authAxios = axios.create({ baseURL: '/api', withCredentials: true });

export const login = (email: string, password: string) =>
  authAxios.post<LoginResponse>('/auth/login', { email, password });

export const register = (email: string, password: string) =>
  authAxios.post<RegisterResponse>('/auth/register', { email, password });

export const refresh = () =>
  authAxios.post<LoginResponse>('/auth/refresh');

export const logout = () =>
  authAxios.post<void>('/auth/logout');
