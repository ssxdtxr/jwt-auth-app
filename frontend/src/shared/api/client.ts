import axios from 'axios';
import { getToken, sessionExpire, setToken } from '../auth/token';

// Extend axios config to carry the _retry flag
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

export const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
let waitQueue: QueueItem[] = [];

const processQueue = (err: unknown, token: string | null = null): void => {
  waitQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  waitQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const orig = error.config!;

    if (error.response?.status !== 401 || orig._retry) {
      return Promise.reject(error);
    }

    if (refreshing) {
      return new Promise<string>((resolve, reject) =>
        waitQueue.push({ resolve, reject })
      ).then((token) => {
        orig.headers.Authorization = `Bearer ${token}`;
        return api(orig);
      });
    }

    orig._retry = true;
    refreshing = true;

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        '/api/auth/refresh',
        {},
        { withCredentials: true }
      );
      setToken(data.accessToken);
      processQueue(null, data.accessToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(orig);
    } catch (err) {
      processQueue(err, null);
      sessionExpire();
      return Promise.reject(err);
    } finally {
      refreshing = false;
    }
  }
);
