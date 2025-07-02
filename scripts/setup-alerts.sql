-- Create alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  severity ENUM('High', 'Medium', 'Low') NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);

-- Insert sample alerts with GPS coordinates for Bayawan City locations
INSERT INTO alerts (type, location, description, severity, status, created_at, latitude, longitude) VALUES
('Fire Emergency', '123 Main St, Bayawan City', 'Large fire reported at residential building. Multiple units affected.', 'High', 'Pending', NOW(), 9.3647, 122.8047),
('Medical Emergency', '456 Santos Ave, Bayawan City', 'Elderly patient with severe chest pain. Requires immediate assistance.', 'High', 'Pending', NOW(), 9.3650, 122.8050),
('Traffic Accident', 'National Highway, Bayawan City', 'Multi-vehicle collision. Minor injuries reported.', 'Medium', 'Pending', NOW(), 9.3655, 122.8055),
('Natural Disaster', 'Coastal Area, Bayawan City', 'Flooding reported due to heavy rainfall. Several homes affected.', 'High', 'Pending', NOW(), 9.3660, 122.8060),
('Public Disturbance', 'Central Market, Bayawan City', 'Crowd control needed. Large gathering causing safety concerns.', 'Low', 'Pending', NOW(), 9.3665, 122.8065); 