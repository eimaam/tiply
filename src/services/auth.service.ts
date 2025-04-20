import { publicApi } from "@/lib/api";

export const authService = {
    login: (email: string, password: string) => 
        publicApi.post('/auth/login', { email, password }),
      register: (userData: any) => 
        publicApi.post('/auth/register', userData),
      forgotPassword: (email: string) => 
        publicApi.post('/auth/forgot-password', { email }),
      resetPassword: (token: string, password: string) => 
        publicApi.post('/auth/reset-password', { token, password }),
}