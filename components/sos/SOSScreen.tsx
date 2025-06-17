import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlert } from '@/hooks/useAlert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

export function SOSScreen() {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('high');

  const {
    createAlert,
    loading,
    error,
  } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createAlert({
        type,
        description,
        location,
        severity,
        status: 'pending',
        latitude: 0, // This should be replaced with actual GPS coordinates
        longitude: 0, // This should be replaced with actual GPS coordinates
      });

      // Reset form
      setType('');
      setDescription('');
      setLocation('');
      setSeverity('high');

      alert('SOS alert sent successfully!');
    } catch (error) {
      console.error('Failed to send SOS alert:', error);
      alert('Failed to send SOS alert. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Send SOS Alert</h1>
      
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Emergency Type</Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select Type</option>
            <option value="medical">Medical Emergency</option>
            <option value="fire">Fire</option>
            <option value="accident">Accident</option>
            <option value="crime">Crime</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md min-h-[100px] resize-y"
            placeholder="Describe the emergency situation..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity">Severity</Label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <Button type="submit" className="w-full">
          Send SOS Alert
        </Button>
      </form>
    </div>
  );
} 