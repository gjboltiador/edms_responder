-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.7.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for edms_responder
CREATE DATABASE IF NOT EXISTS `edms_responder` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `edms_responder`;

-- Dumping structure for table edms_responder.alerts
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `location` varchar(255) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `severity` varchar(20) NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table edms_responder.alerts: ~16 rows (approximately)
INSERT INTO `alerts` (`id`, `type`, `location`, `latitude`, `longitude`, `description`, `severity`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Trauma', '123 Main St', 14.59950000, 120.98420000, 'Multiple vehicle accident', 'High', 'pending', '2025-06-15 14:56:12', '2025-06-15 15:02:53'),
	(2, 'Medical', '123 Main Street, Downtown', 14.58950000, 120.97420000, 'Patient experiencing severe chest pain and shortness of breath', 'High', 'accepted', '2025-06-15 15:00:01', '2025-06-15 15:09:20'),
	(3, 'Medical', '456 Oak Avenue, Westside', 14.60950000, 120.99420000, 'Elderly patient with high fever and confusion', 'Medium', 'accepted', '2025-06-15 15:00:01', '2025-06-16 17:29:36'),
	(4, 'Medical', '789 Pine Road, Eastside', 14.57950000, 120.96420000, 'Diabetic patient with low blood sugar', 'Medium', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:53'),
	(5, 'Trauma', '321 Elm Street, North District', 14.61950000, 121.00420000, 'Multiple vehicle accident with 3 casualties', 'High', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:53'),
	(6, 'Trauma', '654 Maple Drive, Southside', 14.56950000, 120.95420000, 'Construction site accident - fall from height', 'High', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:53'),
	(7, 'Trauma', '987 Cedar Lane, Central', 14.62950000, 121.01420000, 'Pedestrian hit by vehicle', 'High', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:53'),
	(8, 'Fire', '147 Birch Court, Industrial Zone', 14.55950000, 120.94420000, 'Factory fire with smoke inhalation cases', 'High', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:53'),
	(9, 'Fire', '258 Spruce Way, Residential Area', 14.63950000, 121.02420000, 'Apartment building fire - multiple units affected', 'High', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:53'),
	(10, 'Fire', '369 Willow Street, Commercial District', 14.54950000, 120.93420000, 'Restaurant kitchen fire', 'Medium', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:53'),
	(11, 'Natural Disaster', '741 Redwood Road, Coastal Area', 14.64950000, 121.03420000, 'Flash flood affecting multiple homes', 'High', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:53'),
	(12, 'Natural Disaster', '852 Sequoia Avenue, Mountain Region', 14.53950000, 120.92420000, 'Landslide blocking main road', 'High', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:53'),
	(13, 'Other', '963 Magnolia Drive, Shopping District', 14.65950000, 121.04420000, 'Mass gathering incident - multiple injuries', 'Medium', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:53'),
	(14, 'Other', '159 Cypress Lane, Park Area', 14.52950000, 120.91420000, 'Water rescue - person trapped in river', 'High', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:54'),
	(15, 'Other', '357 Palm Street, Beach Front', 14.66950000, 121.05420000, 'Heat exhaustion cases at public event', 'Medium', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:02:54'),
	(16, 'Other', '486 Ash Road, School Zone', NULL, NULL, 'Chemical spill in laboratory', 'High', 'pending', '2025-06-15 15:00:01', '2025-06-15 15:00:01');

-- Dumping structure for table edms_responder.gps_data
CREATE TABLE IF NOT EXISTS `gps_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dispatch_id` int(11) NOT NULL,
  `latlng` varchar(255) DEFAULT NULL,
  `lat` varchar(255) DEFAULT NULL,
  `lng` varchar(255) DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `ix_dispatch_id` (`dispatch_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

-- Dumping data for table edms_responder.gps_data: ~27 rows (approximately)
INSERT INTO `gps_data` (`id`, `dispatch_id`, `latlng`, `lat`, `lng`, `created_date`) VALUES
	(1, 2, '9.346175146014733,122.84193888251801', '9.346175146014733', '122.84193888251801', '2025-06-13 19:19:24'),
	(2, 2, '9.3461001691,122.84198242069432', '9.3461001691', '122.84198242069432', '2025-06-13 19:19:51'),
	(3, 2, '9.346175146014733,122.84193888251801', '9.346175146014733', '122.84193888251801', '2025-06-13 19:21:58'),
	(4, 2, '9.346175146014733,122.84193888251801', '9.346175146014733', '122.84193888251801', '2025-06-13 19:21:58'),
	(5, 2, '9.34617909334652,122.84194335382578', '9.34617909334652', '122.84194335382578', '2025-06-13 19:23:14'),
	(6, 2, '9.34617909334652,122.84194335382578', '9.34617909334652', '122.84194335382578', '2025-06-13 19:23:14'),
	(7, 1, '9.34636806160521,122.84204620971082', '9.34636806160521', '122.84204620971082', '2025-06-13 22:01:33'),
	(8, 3, '9.34636806160521,122.84204620971082', '9.34636806160521', '122.84204620971082', '2025-06-13 22:40:55'),
	(9, 3, '9.34636806160521,122.84204620971082', '9.34636806160521', '122.84204620971082', '2025-06-13 22:41:23'),
	(10, 3, '9.34636806160521,122.84204620971082', '9.34636806160521', '122.84204620971082', '2025-06-13 22:41:54'),
	(11, 3, '9.346204865823413,122.84192908034409', '9.346204865823413', '122.84192908034409', '2025-06-13 22:45:39'),
	(12, 3, '9.346204865823413,122.84192908034409', '9.346204865823413', '122.84192908034409', '2025-06-13 22:45:39'),
	(13, 3, '9.346204865823413,122.84192908034409', '9.346204865823413', '122.84192908034409', '2025-06-13 22:45:39'),
	(14, 3, '9.346204865823413,122.84192908034409', '9.346204865823413', '122.84192908034409', '2025-06-13 22:45:39'),
	(15, 3, '9.346204865823413,122.84192908034409', '9.346204865823413', '122.84192908034409', '2025-06-13 22:45:39'),
	(16, 3, '9.346204865823413,122.84192908034409', '9.346204865823413', '122.84192908034409', '2025-06-13 22:45:39'),
	(17, 3, '9.346204865823413,122.84192908034409', '9.346204865823413', '122.84192908034409', '2025-06-13 22:45:39'),
	(18, 2, '9.34617909334652,122.84194335382578', '9.34617909334652', '122.84194335382578', '2025-06-14 00:58:48'),
	(19, 2, '9.34617909334652,122.84194335382578', '9.34617909334652', '122.84194335382578', '2025-06-14 00:59:16'),
	(20, 4, '9.34617909334652,122.84194335382578', '9.34617909334652', '122.84194335382578', '2025-06-14 01:05:46'),
	(21, 5, '9.346317717911043,122.84204131668638', '9.346317717911043', '122.84204131668638', '2025-06-14 01:14:39'),
	(22, 6, '9.346316646141712,122.8420389575779', '9.346316646141712', '122.8420389575779', '2025-06-14 01:16:29'),
	(23, 6, '9.346175146014733,122.84193888251801', '9.346175146014733', '122.84193888251801', '2025-06-14 01:16:59'),
	(24, 7, '9.346175146014733,122.84193888251801', '9.346175146014733', '122.84193888251801', '2025-06-14 01:20:51'),
	(25, 8, '9.346093890563937,122.84197826510312', '9.346093890563937', '122.84197826510312', '2025-06-14 01:23:15'),
	(26, 9, '9.34617909334652,122.84194335382578', '9.34617909334652', '122.84194335382578', '2025-06-14 01:32:21'),
	(27, 11, '9.34617909334652,122.84194335382578', '9.34617909334652', '122.84194335382578', '2025-06-14 01:51:44'),
	(28, 2, '9.346140900697112,122.84195665182185', '9.346140900697112', '122.84195665182185', '2025-06-15 23:09:26'),
	(29, 3, '9.346115255126657,122.84195819646092', '9.346115255126657', '122.84195819646092', '2025-06-17 01:29:41');

-- Dumping structure for table edms_responder.patients
CREATE TABLE IF NOT EXISTS `patients` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `age` varchar(10) NOT NULL,
  `gender` varchar(10) NOT NULL,
  `address` text NOT NULL,
  `contact_number` varchar(20) NOT NULL,
  `contact_person` varchar(100) NOT NULL,
  `incident_id` int(11) DEFAULT NULL,
  `incident_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `incident_id` (`incident_id`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`incident_id`) REFERENCES `alerts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table edms_responder.patients: ~6 rows (approximately)
INSERT INTO `patients` (`id`, `name`, `age`, `gender`, `address`, `contact_number`, `contact_person`, `incident_id`, `incident_type`, `created_at`, `updated_at`) VALUES
	('4f425e59-8974-49d4-940c-415742d772e4', 'Super Lobaton', '68', 'male', 'Caranoche, Sta. Catalina', '09990477880', 'Juan Dela Cruz', 2, NULL, '2025-06-16 14:44:07', '2025-06-16 17:20:31'),
	('5ccad941-8177-4e1f-aa0b-74d6f6cec8a7', 'Name edil', '34', 'male', 'Caranoche, Sta. Catalina', '09990477880', 'Godfrey Boltiador', 3, NULL, '2025-06-16 17:30:16', '2025-06-16 17:30:16'),
	('5f8b865c-1997-4bd4-a783-e7b2cbb0ca11', 'Dennis Saleson', '69', 'male', 'Caranoche, Sta. Catalina', '09990477880', 'Dennis Sales', 2, NULL, '2025-06-16 14:42:10', '2025-06-16 16:05:00'),
	('72bcac47-b186-439d-a2a5-4128b7db0bd9', 'Super spiderman ', '78', 'male', 'Caranoche, Sta. Catalina', '09990477880', 'Spider man', 3, NULL, '2025-06-16 17:35:26', '2025-06-16 17:57:13'),
	('97e714d0-9bd7-435e-ac16-92d83de3de8e', 'Superm9', '34', 'male', 'Tinago,Bayawan', '09990477880', 'Godfrey Boltiok', NULL, NULL, '2025-06-16 01:27:02', '2025-06-16 01:27:02'),
	('ed821578-49f8-11f0-83dd-d8c4978d1dc2', 'John Doe', '35', 'Male', '456 Oak St', '1234567890', 'Jane Doe', 1, 'Trauma', '2025-06-15 14:56:12', '2025-06-15 14:56:12'),
	('f55f308d-0520-48bf-bf3b-0f4d8ccef60d', 'Dennis Sales', '78', 'male', 'Caranoche, Sta. Catalina', '09990477880', 'Anthony Calumpang', 2, NULL, '2025-06-16 12:37:13', '2025-06-16 12:37:13');

-- Dumping structure for table edms_responder.patient_diagnostics
CREATE TABLE IF NOT EXISTS `patient_diagnostics` (
  `id` varchar(36) NOT NULL,
  `patient_id` varchar(36) DEFAULT NULL,
  `chief_complaint` text DEFAULT NULL,
  `pertinent_symptoms` text DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `current_medications` text DEFAULT NULL,
  `past_medical_history` text DEFAULT NULL,
  `last_oral_intake` text DEFAULT NULL,
  `history_of_present_illness` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `patient_diagnostics_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table edms_responder.patient_diagnostics: ~4 rows (approximately)
INSERT INTO `patient_diagnostics` (`id`, `patient_id`, `chief_complaint`, `pertinent_symptoms`, `allergies`, `current_medications`, `past_medical_history`, `last_oral_intake`, `history_of_present_illness`) VALUES
	('2dc29f7c-dd64-49af-9f79-ea4662dc24a4', '5f8b865c-1997-4bd4-a783-e7b2cbb0ca11', 'complain', 'No Symptoms', 'No Allergies', 'No Medications', 'No Past medical history', 'No oral intake', 'No present Illness'),
	('5241a6dd-4ad8-11f0-95f3-d8c4978d1dc2', '72bcac47-b186-439d-a2a5-4128b7db0bd9', 'sakit ang dughan', 'wala naka inom tuba', 'No Allergies', 'medicol bukol', 'Allergy monggos', 'No oral intake', 'unable to breath'),
	('5a8f79ce-0240-4f20-8459-071277977fab', '4f425e59-8974-49d4-940c-415742d772e4', 'sakit ang dughan', 'wala naka inom tuba', 'No Allergies', 'No Medications', 'No Past medical history', 'No oral intake', 'No present Illness'),
	('a7a5be2c-4ad7-11f0-95f3-d8c4978d1dc2', '5ccad941-8177-4e1f-aa0b-74d6f6cec8a7', 'sakit ang dughan', 'wala naka inom tuba', 'No Allergies', 'medicol', 'Allergy monggos', 'No oral intake', 'unable to breath'),
	('ffb2a650-4c84-4d15-8044-b1d044a5bf39', 'f55f308d-0520-48bf-bf3b-0f4d8ccef60d', 'complain', 'No Symptoms', 'No Allergies', 'No Medications', 'No Past medical history', 'No oral intake', 'No present Illness');

-- Dumping structure for table edms_responder.patient_trauma
CREATE TABLE IF NOT EXISTS `patient_trauma` (
  `id` varchar(36) NOT NULL,
  `patient_id` varchar(36) DEFAULT NULL,
  `cause_of_injuries` text DEFAULT NULL,
  `types_of_injuries` text DEFAULT NULL,
  `location_of_incident` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `conscious` tinyint(1) DEFAULT 0,
  `unconscious` tinyint(1) DEFAULT 0,
  `deceased` tinyint(1) DEFAULT 0,
  `verbal` tinyint(1) DEFAULT 0,
  `pain` tinyint(1) DEFAULT 0,
  `alert` tinyint(1) DEFAULT 0,
  `lethargic` tinyint(1) DEFAULT 0,
  `obtunded` tinyint(1) DEFAULT 0,
  `stupor` tinyint(1) DEFAULT 0,
  `first_aid_dressing` tinyint(1) DEFAULT 0,
  `splinting` tinyint(1) DEFAULT 0,
  `ambu_bagging` tinyint(1) DEFAULT 0,
  `oxygen_therapy` tinyint(1) DEFAULT 0,
  `oxygen_liters_per_min` varchar(10) DEFAULT NULL,
  `cpr` tinyint(1) DEFAULT 0,
  `cpr_started` time DEFAULT NULL,
  `cpr_ended` time DEFAULT NULL,
  `aed` tinyint(1) DEFAULT 0,
  `medications_given` tinyint(1) DEFAULT 0,
  `medications_specify` text DEFAULT NULL,
  `others` tinyint(1) DEFAULT 0,
  `others_specify` text DEFAULT NULL,
  `head_immobilization` tinyint(1) DEFAULT 0,
  `control_bleeding` tinyint(1) DEFAULT 0,
  `ked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `patient_trauma_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table edms_responder.patient_trauma: ~5 rows (approximately)
INSERT INTO `patient_trauma` (`id`, `patient_id`, `cause_of_injuries`, `types_of_injuries`, `location_of_incident`, `remarks`, `conscious`, `unconscious`, `deceased`, `verbal`, `pain`, `alert`, `lethargic`, `obtunded`, `stupor`, `first_aid_dressing`, `splinting`, `ambu_bagging`, `oxygen_therapy`, `oxygen_liters_per_min`, `cpr`, `cpr_started`, `cpr_ended`, `aed`, `medications_given`, `medications_specify`, `others`, `others_specify`, `head_immobilization`, `control_bleeding`, `ked`, `created_at`, `updated_at`) VALUES
	('2b4efc28-1d4a-4dd6-818b-052b17626489', '5ccad941-8177-4e1f-aa0b-74d6f6cec8a7', 'No Cause of injuries', 'Fire burnt', 'same as incident location', NULL, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, 0, 0, NULL, 0, NULL, 0, 0, 1, '2025-06-16 17:30:16', '2025-06-16 17:31:18'),
	('2bcb260c-19b2-481e-9731-d99b1267adf9', '4f425e59-8974-49d4-940c-415742d772e4', 'No Cause of injuries', 'Fire burnt', 'same as incident location', NULL, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 'N/A', 0, NULL, NULL, 1, 0, NULL, 0, NULL, 0, 0, 0, '2025-06-16 14:44:07', '2025-06-16 17:20:29'),
	('398d036f-4dbd-43f7-afef-f4222afab46e', '72bcac47-b186-439d-a2a5-4128b7db0bd9', 'No Cause of injuries', 'Fire burnt', 'same as incident location', NULL, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 'N/A', 0, NULL, NULL, 0, 0, NULL, 1, 'nothing', 0, 0, 0, '2025-06-16 17:35:26', '2025-06-16 17:57:13'),
	('c6314272-7d74-49b4-b283-90707a36a05a', '5f8b865c-1997-4bd4-a783-e7b2cbb0ca11', 'No Cause of injuries', 'Fire burnt', 'same as incident location', NULL, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 'N/A', 0, NULL, NULL, 1, 0, NULL, 0, NULL, 0, 1, 1, '2025-06-16 14:42:10', '2025-06-16 15:15:29'),
	('f90d44f9-4563-4400-a3f9-1dfaaf14c2f2', 'f55f308d-0520-48bf-bf3b-0f4d8ccef60d', 'No Cause of injuries', 'Fire burnt', 'same as incident location', 'No additional Remarks', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '67', 1, '20:39:00', '20:39:00', 1, 1, 'No medication Given', 1, 'No additional problems', 1, 1, 1, '2025-06-16 12:37:13', '2025-06-16 12:40:17');

-- Dumping structure for table edms_responder.patient_vital_signs
CREATE TABLE IF NOT EXISTS `patient_vital_signs` (
  `id` varchar(36) NOT NULL,
  `patient_id` varchar(36) DEFAULT NULL,
  `blood_pressure` varchar(20) DEFAULT NULL,
  `pulse_rate` varchar(10) DEFAULT NULL,
  `respiratory_rate` varchar(10) DEFAULT NULL,
  `temperature` varchar(10) DEFAULT NULL,
  `oxygen_saturation` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `patient_vital_signs_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table edms_responder.patient_vital_signs: ~5 rows (approximately)
INSERT INTO `patient_vital_signs` (`id`, `patient_id`, `blood_pressure`, `pulse_rate`, `respiratory_rate`, `temperature`, `oxygen_saturation`) VALUES
	('221ed662-4ac0-11f0-95f3-d8c4978d1dc2', '5f8b865c-1997-4bd4-a783-e7b2cbb0ca11', '90', '67', '67', '36', '78'),
	('52405e6e-4ad8-11f0-95f3-d8c4978d1dc2', '72bcac47-b186-439d-a2a5-4128b7db0bd9', '91', '70', '50', '38', '56'),
	('614d1077-4ac0-11f0-95f3-d8c4978d1dc2', '4f425e59-8974-49d4-940c-415742d772e4', '91', '70', '67', '36', '78'),
	('a7a53c53-4ad7-11f0-95f3-d8c4978d1dc2', '5ccad941-8177-4e1f-aa0b-74d6f6cec8a7', '91', '70', '50', '37', '56'),
	('b11c3c3a-bd1b-4a98-af6a-5aaed04e6a70', '97e714d0-9bd7-435e-ac16-92d83de3de8e', '', '', '', '', ''),
	('c8f0e3ce-4aae-11f0-95f3-d8c4978d1dc2', 'f55f308d-0520-48bf-bf3b-0f4d8ccef60d', '90', '67', '67', '36', '78');

-- Dumping structure for table edms_responder.responders
CREATE TABLE IF NOT EXISTS `responders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'available',
  `last_active` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table edms_responder.responders: ~0 rows (approximately)

-- Dumping structure for table edms_responder.response_logs
CREATE TABLE IF NOT EXISTS `response_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alert_id` int(11) DEFAULT NULL,
  `responder_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `alert_id` (`alert_id`),
  KEY `responder_id` (`responder_id`),
  CONSTRAINT `response_logs_ibfk_1` FOREIGN KEY (`alert_id`) REFERENCES `alerts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `response_logs_ibfk_2` FOREIGN KEY (`responder_id`) REFERENCES `responders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table edms_responder.response_logs: ~0 rows (approximately)

-- Dumping structure for table edms_responder.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table edms_responder.users: ~0 rows (approximately)
INSERT INTO `users` (`id`, `username`, `password`, `firstname`, `lastname`, `created_at`) VALUES
	(1, 'gjboltiador', '1234', 'Godfrey Jeno\r\n', 'Boltiador', '2025-06-02 15:11:32');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
