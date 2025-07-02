DROP TABLE IF EXISTS alerts;

CREATE TABLE alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO alerts (type, location, description, severity, status) VALUES
('Fire Emergency', '123 Main St, Bayawan City', 'Large fire reported at residential building. Multiple units affected.', 'High', 'Pending'),
('Medical Emergency', '456 Santos Ave, Bayawan City', 'Elderly patient with severe chest pain. Requires immediate assistance.', 'High', 'Pending'),
('Traffic Accident', 'National Highway, Bayawan City', 'Multi-vehicle collision. Minor injuries reported.', 'Medium', 'Pending'),
('Natural Disaster', 'Coastal Area, Bayawan City', 'Flooding reported due to heavy rainfall. Several homes affected.', 'High', 'Pending'),
('Public Disturbance', 'Central Market, Bayawan City', 'Crowd control needed. Large gathering causing safety concerns.', 'Low', 'Pending'); 