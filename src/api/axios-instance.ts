import axios, {AxiosRequestConfig} from 'axios';
import {getSession} from 'next-auth/react';
import * as https from "https";

export function customInstance<T = any>(config: AxiosRequestConfig): Promise<T> {
  const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
    timeout: 10000,
  httpsAgent: new https.Agent({
      rejectUnauthorized: false // DEVELOPMENT ONLY
  }),

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
// Add response interceptor
    instance.interceptors.response.use(
        (response) => response.data,
        (error) => {
            // Don't redirect to home for login/registration API paths
            const isAuthPath = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');

            if (error.response?.status === 401 && !isAuthPath) {
                // Handle unauthorized access - only redirect for non-auth paths
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