import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

export function customInstance<T = any>(config: AxiosRequestConfig): Promise<T> {
  const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor
  instance.interceptors.request.use(
    async (config) => {
      const session = await getSession();
      if (session?.user?.token) {
        config.headers.Authorization = `Bearer ${session.user.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        window.location.href = '/';
      }
      if (error.response?.status === 500) {
        console.error('Server error:', error.response.data);
      }
      return Promise.reject(error.response?.data || error);
    }
  );

  return instance.request(config);
}