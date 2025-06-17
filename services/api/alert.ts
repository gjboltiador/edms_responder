import { Alert } from '@/types/alert';
import { API_ENDPOINTS } from '@/constants/config';

export const alertService = {
  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(API_ENDPOINTS.ALERTS);
    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }
    return response.json();
  },

  async getAlertById(id: number): Promise<Alert> {
    const response = await fetch(`${API_ENDPOINTS.ALERTS}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch alert');
    }
    return response.json();
  },

  async createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const response = await fetch(API_ENDPOINTS.ALERTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert),
    });
    if (!response.ok) {
      throw new Error('Failed to create alert');
    }
    return response.json();
  },

  async updateAlert(id: number, alert: Partial<Alert>): Promise<Alert> {
    const response = await fetch(`${API_ENDPOINTS.ALERTS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert),
    });
    if (!response.ok) {
      throw new Error('Failed to update alert');
    }
    return response.json();
  },

  async deleteAlert(id: number): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.ALERTS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete alert');
    }
  },
}; 