-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3305
-- Generation Time: Aug 06, 2026 at 06:33 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `stagge`
--

-- --------------------------------------------------------

--
-- Table structure for table `assignment`
--

CREATE TABLE `assignment` (
  `id` int(11) NOT NULL,
  `status` varchar(255) NOT NULL,
  `commentaire` longtext DEFAULT NULL,
  `assigned_at` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `report_id` int(11) DEFAULT NULL,
  `assigned_agent_id` int(11) DEFAULT NULL,
  `assigned_by_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assignment`
--

INSERT INTO `assignment` (`id`, `status`, `commentaire`, `assigned_at`, `completed_at`, `report_id`, `assigned_agent_id`, `assigned_by_id`) VALUES
(6, 'COMPLETED', 'done', '2026-08-05 02:54:41', '2026-08-05 03:10:33', 20, 6, 5),
(7, 'COMPLETED', 'azerazer d qs s qd', '2026-08-05 03:07:02', NULL, 21, 6, 5),
(8, 'ASSIGNED', NULL, '2026-08-05 03:18:30', NULL, 23, 6, 5);

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `entity_name` varchar(255) NOT NULL,
  `entity_id` varchar(255) NOT NULL,
  `details` longtext DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id`, `action`, `entity_name`, `entity_id`, `details`, `created_at`, `user_id`) VALUES
(1, 'CREATE', 'Category', '8', 'nom=AuditTestCat', '2026-08-05 03:14:26', 8),
(2, 'DELETE', 'Category', 'unknown', NULL, '2026-08-05 03:15:18', 8),
(3, 'DELETE', 'Category', 'unknown', NULL, '2026-08-05 03:15:27', 8),
(4, 'DELETE', 'User', 'unknown', NULL, '2026-08-05 03:16:34', 8),
(5, 'CREATE', 'Report', '23', 'titre=mmmm', '2026-08-05 03:17:24', 7),
(6, 'CREATE', 'Assignment', '8', NULL, '2026-08-05 03:18:30', 5),
(7, 'UPDATE', 'Report', '23', '[\"status\",\"updatedAt\"]', '2026-08-05 03:18:30', 5);

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `priorite_par_defaut` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `nom`, `description`, `icon`, `priorite_par_defaut`) VALUES
(4, 'Pothol', 'Road surface damage', NULL, 'MEDIUM'),
(5, 'Streetlight', 'Broken streetlight', NULL, 'LOW'),
(6, 'Garbage', 'Overflowing trash', NULL, 'HIGH');

-- --------------------------------------------------------

--
-- Table structure for table `comment`
--

CREATE TABLE `comment` (
  `id` int(11) NOT NULL,
  `contenu` longtext NOT NULL,
  `created_at` datetime NOT NULL,
  `report_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctrine_migration_versions`
--

CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20260722193420', '2026-07-22 19:34:27', 1025);

-- --------------------------------------------------------

--
-- Table structure for table `messenger_messages`
--

CREATE TABLE `messenger_messages` (
  `id` bigint(20) NOT NULL,
  `body` longtext NOT NULL,
  `headers` longtext NOT NULL,
  `queue_name` varchar(190) NOT NULL,
  `created_at` datetime NOT NULL,
  `available_at` datetime NOT NULL,
  `delivered_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `municipality`
--

CREATE TABLE `municipality` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `gouvernorat` varchar(255) NOT NULL,
  `code` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `municipality`
--

INSERT INTO `municipality` (`id`, `nom`, `gouvernorat`, `code`) VALUES
(2, 'Tunis', 'Tunis', 'TN-01');

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` longtext NOT NULL,
  `is_read` tinyint(4) NOT NULL,
  `created_at` datetime NOT NULL,
  `report_id` int(11) DEFAULT NULL,
  `recipient_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report`
--

CREATE TABLE `report` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `adresse` varchar(512) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `status` varchar(255) NOT NULL,
  `priority` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `creator_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report`
--

INSERT INTO `report` (`id`, `titre`, `description`, `adresse`, `latitude`, `longitude`, `status`, `priority`, `created_at`, `updated_at`, `resolved_at`, `category_id`, `creator_id`) VALUES
(20, 'fffffff', 'fffffff', 'zarzis', 33.492290496826, 11.087408065796, 'RESOLVED', 'HIGH', '2026-08-05 02:53:13', '2026-08-05 03:10:33', '2026-08-05 03:10:31', 6, 7),
(21, 'jhjhj', 'chchch', 'zarzis', 33.492290496826, 11.087408065796, 'RESOLVED', 'LOW', '2026-08-05 02:58:52', '2026-08-05 03:10:31', '2026-08-05 03:10:31', 5, 7),
(22, 'My Reports fix test', 'desc', 'Tunis', 36.81, 10.18, 'REJECTED', 'MEDIUM', '2026-08-05 03:05:57', '2026-08-05 03:06:49', NULL, 4, 7),
(23, 'mmmm', 'mmmm', 'mmmm', 33.49229, 11.087408, 'ASSIGNED', 'LOW', '2026-08-05 03:17:24', '2026-08-05 03:18:30', NULL, 5, 7);

-- --------------------------------------------------------

--
-- Table structure for table `report_photo`
--

CREATE TABLE `report_photo` (
  `id` int(11) NOT NULL,
  `url` varchar(1024) NOT NULL,
  `type` varchar(255) NOT NULL,
  `uploaded_at` datetime NOT NULL,
  `report_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report_photo`
--

INSERT INTO `report_photo` (`id`, `url`, `type`, `uploaded_at`, `report_id`) VALUES
(3, '/uploads/reports/23/cat_6a72ab4489a87.jpeg', 'BEFORE', '2026-08-05 03:17:24', 23);

-- --------------------------------------------------------

--
-- Table structure for table `status_history`
--

CREATE TABLE `status_history` (
  `id` int(11) NOT NULL,
  `old_status` varchar(255) NOT NULL,
  `new_status` varchar(255) NOT NULL,
  `changed_at` datetime NOT NULL,
  `report_id` int(11) DEFAULT NULL,
  `changed_by_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `nom` varchar(180) NOT NULL,
  `email` varchar(180) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `municipality_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `nom`, `email`, `password`, `role`, `municipality_id`) VALUES
(5, 'Admin', 'admin@example.com', '$2y$13$CwkmzifGm.tbuamU50o8VOfQI70Wty2mo9WuYkw.DJZCpisWDXiYq', 'ROLE_SUPER_ADMIN', 2),
(6, 'Agent', 'agent@example.com', '$2y$13$2VGJryo3SOVpKceXVBT8ievnPyLQPJlerSdpYyvJOzV1cQZF7Smxi', 'ROLE_AGENT', 2),
(7, 'Citizen', 'citizen@example.com', '$2y$13$JEYqffzyzewCi1rnFhTEdu2MofsU7Xt5nOiFwmGDTRRIDHi37bAHq', 'ROLE_CITIZEN', 2),
(8, 'Admin2', 'admin2@example.com', '$2y$13$zMGmWFrXZT/nRejw8ZTMSOO01zmw4naIK0CoAzvJRGMgxn60LHxVm', 'ROLE_ADMIN', 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignment`
--
ALTER TABLE `assignment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_30C544BA4BD2A4C0` (`report_id`),
  ADD KEY `IDX_30C544BA49197702` (`assigned_agent_id`),
  ADD KEY `IDX_30C544BA6E6F1246` (`assigned_by_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_F6E1C0F5A76ED395` (`user_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_9474526C4BD2A4C0` (`report_id`),
  ADD KEY `IDX_9474526CA76ED395` (`user_id`);

--
-- Indexes for table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Indexes for table `messenger_messages`
--
ALTER TABLE `messenger_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750` (`queue_name`,`available_at`,`delivered_at`,`id`);

--
-- Indexes for table `municipality`
--
ALTER TABLE `municipality`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_BF5476CA4BD2A4C0` (`report_id`),
  ADD KEY `IDX_BF5476CAE92F8F78` (`recipient_id`);

--
-- Indexes for table `report`
--
ALTER TABLE `report`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_C42F778412469DE2` (`category_id`),
  ADD KEY `IDX_C42F778461220EA6` (`creator_id`);

--
-- Indexes for table `report_photo`
--
ALTER TABLE `report_photo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_3EAB83614BD2A4C0` (`report_id`);

--
-- Indexes for table `status_history`
--
ALTER TABLE `status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_2F6A07CE4BD2A4C0` (`report_id`),
  ADD KEY `IDX_2F6A07CE828AD0A0` (`changed_by_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_8D93D649E7927C74` (`email`),
  ADD KEY `IDX_8D93D649AE6F181C` (`municipality_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assignment`
--
ALTER TABLE `assignment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `comment`
--
ALTER TABLE `comment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messenger_messages`
--
ALTER TABLE `messenger_messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `municipality`
--
ALTER TABLE `municipality`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report`
--
ALTER TABLE `report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `report_photo`
--
ALTER TABLE `report_photo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `status_history`
--
ALTER TABLE `status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignment`
--
ALTER TABLE `assignment`
  ADD CONSTRAINT `FK_30C544BA49197702` FOREIGN KEY (`assigned_agent_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_30C544BA4BD2A4C0` FOREIGN KEY (`report_id`) REFERENCES `report` (`id`),
  ADD CONSTRAINT `FK_30C544BA6E6F1246` FOREIGN KEY (`assigned_by_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `FK_F6E1C0F5A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `comment`
--
ALTER TABLE `comment`
  ADD CONSTRAINT `FK_9474526C4BD2A4C0` FOREIGN KEY (`report_id`) REFERENCES `report` (`id`),
  ADD CONSTRAINT `FK_9474526CA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `FK_BF5476CA4BD2A4C0` FOREIGN KEY (`report_id`) REFERENCES `report` (`id`),
  ADD CONSTRAINT `FK_BF5476CAE92F8F78` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `report`
--
ALTER TABLE `report`
  ADD CONSTRAINT `FK_C42F778412469DE2` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  ADD CONSTRAINT `FK_C42F778461220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `report_photo`
--
ALTER TABLE `report_photo`
  ADD CONSTRAINT `FK_3EAB83614BD2A4C0` FOREIGN KEY (`report_id`) REFERENCES `report` (`id`);

--
-- Constraints for table `status_history`
--
ALTER TABLE `status_history`
  ADD CONSTRAINT `FK_2F6A07CE4BD2A4C0` FOREIGN KEY (`report_id`) REFERENCES `report` (`id`),
  ADD CONSTRAINT `FK_2F6A07CE828AD0A0` FOREIGN KEY (`changed_by_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FK_8D93D649AE6F181C` FOREIGN KEY (`municipality_id`) REFERENCES `municipality` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
