USE shiftpulse;

CREATE TABLE companies (
  id INT NOT NULL AUTO_INCREMENT,
  company_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE company_locations (
  id INT NOT NULL AUTO_INCREMENT,
  company_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  radius_meters INT NOT NULL DEFAULT 100,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  shift_start TIME NOT NULL DEFAULT '09:00:00',
  shift_end TIME NOT NULL DEFAULT '18:00:00',
  PRIMARY KEY (id),
  KEY company_id (company_id),
  CONSTRAINT company_locations_ibfk_1
    FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  company_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('manager','employee') NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  location_id INT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  KEY company_id (company_id),
  KEY fk_user_location (location_id),
  CONSTRAINT fk_user_location
    FOREIGN KEY (location_id) REFERENCES company_locations(id),
  CONSTRAINT users_ibfk_1
    FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE shifts (
  id INT NOT NULL AUTO_INCREMENT,
  employee_id INT NOT NULL,
  company_id INT NOT NULL,
  location_id INT NOT NULL,
  clock_in DATETIME DEFAULT NULL,
  clock_out DATETIME DEFAULT NULL,
  status ENUM('active','completed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY employee_id (employee_id),
  KEY company_id (company_id),
  KEY location_id (location_id),
  CONSTRAINT shifts_ibfk_1
    FOREIGN KEY (employee_id) REFERENCES users(id),
  CONSTRAINT shifts_ibfk_2
    FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT shifts_ibfk_3
    FOREIGN KEY (location_id) REFERENCES company_locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE shift_locations (
  id INT NOT NULL AUTO_INCREMENT,
  shift_id INT NOT NULL,
  employee_id INT NOT NULL,
  company_id INT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  geofence_status ENUM('inside','outside') NOT NULL,
  recorded_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY employee_id (employee_id),
  KEY company_id (company_id),
  KEY shift_id (shift_id),
  CONSTRAINT shift_locations_ibfk_1
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
  CONSTRAINT shift_locations_ibfk_2
    FOREIGN KEY (employee_id) REFERENCES users(id),
  CONSTRAINT shift_locations_ibfk_3
    FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;