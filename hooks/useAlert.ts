import { useState, useCallback } from 'react';
import { Alert } from '@/types/alert';
import { alertService } from '@/services/api/alert';

export const useAlert = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await alertService.getAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAlertById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const alert = await alertService.getAlertById(id);
      setError(null);
      return alert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alert');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlert = useCallback(async (alert: Omit<Alert, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const newAlert = await alertService.createAlert(alert);
      setAlerts(prev => [...prev, newAlert]);
      setError(null);
      return newAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAlert = useCallback(async (id: number, alert: Partial<Alert>) => {
    try {
      setLoading(true);
      const updatedAlert = await alertService.updateAlert(id, alert);
      setAlerts(prev => prev.map(a => a.id === id ? updatedAlert : a));
      setError(null);
      return updatedAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAlert = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await alertService.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    getAlertById,
    createAlert,
    updateAlert,
    deleteAlert,
  };
}; 