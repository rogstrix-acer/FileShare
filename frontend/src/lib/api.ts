// API configuration and utilities
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<{ accessToken: string; user: Record<string, unknown> }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, name: string) {
    return this.request<{ user: Record<string, unknown> }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout() {
    const result = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return result;
  }

  async getCurrentUser() {
    return this.request<{ user: Record<string, unknown> }>('/auth/me');
  }

  // File methods
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/files/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async getUserFiles() {
    return this.request<unknown[]>('/files/my-files');
  }

  async createShareLink(fileId: string, expiresAt?: string, maxDownloads?: number) {
    return this.request<{ shareLink: string }>(`/files/${fileId}/share`, {
      method: 'POST',
      body: JSON.stringify({ expiresAt, maxDownloads }),
    });
  }

  async deleteFile(fileId: string) {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Share methods
  async getSharedFile(shareToken: string) {
    return this.request<{ file: Record<string, unknown>; share: Record<string, unknown> }>(`/shares/${shareToken}`);
  }

  async downloadSharedFile(shareToken: string) {
    return this.request<{ downloadUrl: string }>(`/shares/${shareToken}/download`, {
      method: 'POST',
    });
  }

  async getUserShares() {
    return this.request<{ shares: Record<string, unknown>[] }>('/shares/my-shares');
  }
}

export const apiClient = new ApiClient();