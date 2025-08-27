import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

export const axiosInstance = async <T = any>(
  config: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  });

  // Get session token from NextAuth if available
  if (typeof window !== 'undefined') {
    try {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      if (session?.accessToken) {
        instance.defaults.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } catch {
      // NextAuth not available - continue without auth
      console.debug('NextAuth session not available');
    }
  }

  return instance.request<T>(config);
};
