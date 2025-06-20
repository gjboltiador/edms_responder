-- Migration to add responder assignment functionality to alerts
-- Run this after the existing schema is set up

USE sql12785202;

-- Add responder_id column to alerts table
ALTER TABLE alerts 
ADD COLUMN responder_id INT NULL,
ADD COLUMN assigned_at TIMESTAMP NULL,
ADD COLUMN latitude DECIMAL(10, 8) NULL,
ADD COLUMN longitude DECIMAL(11, 8) NULL,
ADD FOREIGN KEY (responder_id) REFERENCES responders(id) ON DELETE SET NULL;

-- Create alert_assignments table for tracking assignment history
CREATE TABLE IF NOT EXISTS alert_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT NOT NULL,
    responder_id INT NOT NULL,
    assigned_by INT NULL, -- Could be a dispatcher/admin
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP NULL,
    status ENUM('assigned', 'accepted', 'rejected', 'completed', 'unassigned') DEFAULT 'assigned',
    notes TEXT,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    FOREIGN KEY (responder_id) REFERENCES responders(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES responders(id) ON DELETE SET NULL
);

-- Create index for better performance
CREATE INDEX idx_alerts_responder ON alerts(responder_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alert_assignments_alert ON alert_assignments(alert_id);
CREATE INDEX idx_alert_assignments_responder ON alert_assignments(responder_id);

-- Update existing alerts to have 'Pending' status if not set
UPDATE alerts SET status = 'Pending' WHERE status = 'pending';

-- Update responders table to use proper status values
UPDATE responders SET status = 'Available' WHERE status = 'available';
UPDATE responders SET status = 'Busy' WHERE status = 'busy';
UPDATE responders SET status = 'Offline' WHERE status = 'offline';

-- Add constraint to ensure only available responders can be assigned
-- This will be enforced at the application level for now 