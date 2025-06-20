-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Add user_id column to responders if not present
ALTER TABLE responders ADD COLUMN user_id INT;

-- Add foreign key constraint from responders.user_id to users.id
ALTER TABLE responders ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id); 