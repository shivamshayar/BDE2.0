// Use relative URL since Express proxies /api/* to FastAPI on port 8000
const API_BASE_URL = '';

class ApiClient {
  private token: string | null = null;
  private machineId: string | null = null;

  setAuth(token: string, machineId: string) {
    this.token = token;
    this.machineId = machineId;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('machine_id', machineId);
  }

  clearAuth() {
    this.token = null;
    this.machineId = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('machine_id');
  }

  loadAuth() {
    this.token = localStorage.getItem('auth_token');
    this.machineId = localStorage.getItem('machine_id');
  }

  getAuthHeaders() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ========== Authentication ==========
  async loginMachine(machineId: string, password: string) {
    const data = await this.request<{ access_token: string; token_type: string; machine_id: string }>(
      '/api/machines/login',
      {
        method: 'POST',
        body: JSON.stringify({ machine_id: machineId, password }),
      }
    );
    this.setAuth(data.access_token, data.machine_id);
    return data;
  }

  // ========== Users ==========
  async getUsers() {
    return this.request<any[]>('/api/users');
  }

  async createUser(userData: { name: string; role: string; image_url?: string }) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: number, userData: Partial<{ name: string; role: string; image_url: string }>) {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: number) {
    return this.request(`/api/users/${userId}`, { method: 'DELETE' });
  }

  // ========== BDE Machines ==========
  async getMachines() {
    return this.request<any[]>('/api/machines');
  }

  async createMachine(machineData: { machine_id: string; password: string }) {
    return this.request('/api/machines', {
      method: 'POST',
      body: JSON.stringify(machineData),
    });
  }

  async resetMachinePassword(machineId: number, newPassword: string) {
    return this.request(`/api/machines/${machineId}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ new_password: newPassword }),
    });
  }

  async deleteMachine(machineId: number) {
    return this.request(`/api/machines/${machineId}`, { method: 'DELETE' });
  }

  // ========== Part Numbers ==========
  async getPartNumbers() {
    return this.request<any[]>('/api/part-numbers');
  }

  async createPartNumber(partData: { part_number: string; description?: string }) {
    return this.request('/api/part-numbers', {
      method: 'POST',
      body: JSON.stringify(partData),
    });
  }

  async deletePartNumber(partId: number) {
    return this.request(`/api/part-numbers/${partId}`, { method: 'DELETE' });
  }

  // ========== Order Numbers ==========
  async getOrderNumbers() {
    return this.request<any[]>('/api/order-numbers');
  }

  async createOrderNumber(orderData: { order_number: string; description?: string }) {
    return this.request('/api/order-numbers', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrderNumber(orderId: number) {
    return this.request(`/api/order-numbers/${orderId}`, { method: 'DELETE' });
  }

  // ========== Performance IDs ==========
  async getPerformanceIds() {
    return this.request<any[]>('/api/performance-ids');
  }

  async createPerformanceId(perfData: { performance_id: string; description?: string }) {
    return this.request('/api/performance-ids', {
      method: 'POST',
      body: JSON.stringify(perfData),
    });
  }

  async deletePerformanceId(perfId: number) {
    return this.request(`/api/performance-ids/${perfId}`, { method: 'DELETE' });
  }

  // ========== Work Sessions ==========
  async createWorkSession(sessionData: {
    user_id: number;
    part_number: string;
    order_number: string;
    performance_id: string;
    duration_seconds: number;
    start_time: string;
    end_time: string;
  }) {
    return this.request('/api/work-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getWorkSessions() {
    return this.request<any[]>('/api/work-sessions');
  }

  async getUserWorkSessions(userId: number) {
    return this.request<any[]>(`/api/work-sessions/user/${userId}`);
  }
}

export const apiClient = new ApiClient();

// Load auth on init
apiClient.loadAuth();
