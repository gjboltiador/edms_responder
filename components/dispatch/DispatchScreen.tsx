import { useState, useEffect } from 'react';
import { Alert } from '@/types/alert';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { useAlert } from '@/hooks/useAlert';

export function DispatchScreen() {
  const {
    alerts,
    loading,
    error,
    fetchAlerts,
    updateAlert,
  } = useAlert();

  const handleStatusChange = async (alertId: number, newStatus: string) => {
    try {
      await updateAlert(alertId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update alert status:', error);
      alert('Failed to update alert status. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchAlerts} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dispatch Alerts</h1>
      <div className="grid gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{alert.type}</h3>
                <p className="text-sm text-gray-600">{alert.location}</p>
                <p className="mt-2">{alert.description}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    alert.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    alert.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {alert.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(alert.id, 'in-progress')}
                  >
                    Accept
                  </Button>
                )}
                {alert.status === 'in-progress' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(alert.id, 'completed')}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 