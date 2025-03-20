-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 20, 2025 at 07:28 PM
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
-- Database: `hopeconnect`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `orphanage_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_schedule`
--

CREATE TABLE `activity_schedule` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) DEFAULT NULL,
  `scheduled_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `id` int(11) NOT NULL,
  `donor_id` int(11) DEFAULT NULL,
  `orphan_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `orphanage_id` int(11) DEFAULT NULL,
  `type` enum('money','clothes','food','books','medical aid') NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','approved','delivered') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `donors`
--

CREATE TABLE `donors` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `orphanage_id` int(11) DEFAULT NULL,
  `total_donations` int(11) DEFAULT 0,
  `total_amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orphanages`
--

CREATE TABLE `orphanages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orphans`
--

CREATE TABLE `orphans` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `age` int(11) NOT NULL,
  `education_status` text DEFAULT NULL,
  `health_condition` text DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `orphanage_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orphan_activities`
--

CREATE TABLE `orphan_activities` (
  `id` int(11) NOT NULL,
  `orphan_id` int(11) DEFAULT NULL,
  `schedule_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `orphanage_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sponsors`
--

CREATE TABLE `sponsors` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `orphanage_id` int(11) DEFAULT NULL,
  `total_sponsored` int(11) DEFAULT 0,
  `total_amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sponsorships`
--

CREATE TABLE `sponsorships` (
  `id` int(11) NOT NULL,
  `sponsor_id` int(11) DEFAULT NULL,
  `orphan_id` int(11) DEFAULT NULL,
  `orphanage_id` int(11) DEFAULT NULL,
  `monthly_amount` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `status` enum('active','paused','cancelled') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('orphan','donor','volunteer','admin','sponsor') NOT NULL,
  `orphanage_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer_activities`
--

CREATE TABLE `volunteer_activities` (
  `id` int(11) NOT NULL,
  `volunteer_id` int(11) DEFAULT NULL,
  `orphanage_id` int(11) DEFAULT NULL,
  `schedule_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orphanage_id` (`orphanage_id`);

--
-- Indexes for table `activity_schedule`
--
ALTER TABLE `activity_schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_id` (`activity_id`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `donor_id` (`donor_id`),
  ADD KEY `orphan_id` (`orphan_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `orphanage_id` (`orphanage_id`);

--
-- Indexes for table `donors`
--
ALTER TABLE `donors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `orphanage_id` (`orphanage_id`);

--
-- Indexes for table `orphanages`
--
ALTER TABLE `orphanages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orphans`
--
ALTER TABLE `orphans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `orphanage_id` (`orphanage_id`);

--
-- Indexes for table `orphan_activities`
--
ALTER TABLE `orphan_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orphan_id` (`orphan_id`),
  ADD KEY `schedule_id` (`schedule_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orphanage_id` (`orphanage_id`);

--
-- Indexes for table `sponsors`
--
ALTER TABLE `sponsors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `orphanage_id` (`orphanage_id`);

--
-- Indexes for table `sponsorships`
--
ALTER TABLE `sponsorships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sponsor_id` (`sponsor_id`),
  ADD KEY `orphan_id` (`orphan_id`),
  ADD KEY `orphanage_id` (`orphanage_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `orphanage_id` (`orphanage_id`);

--
-- Indexes for table `volunteer_activities`
--
ALTER TABLE `volunteer_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `volunteer_id` (`volunteer_id`),
  ADD KEY `orphanage_id` (`orphanage_id`),
  ADD KEY `schedule_id` (`schedule_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_schedule`
--
ALTER TABLE `activity_schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `donors`
--
ALTER TABLE `donors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orphanages`
--
ALTER TABLE `orphanages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orphans`
--
ALTER TABLE `orphans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orphan_activities`
--
ALTER TABLE `orphan_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sponsors`
--
ALTER TABLE `sponsors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sponsorships`
--
ALTER TABLE `sponsorships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `volunteer_activities`
--
ALTER TABLE `volunteer_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`orphanage_id`) REFERENCES `orphanages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `activity_schedule`
--
ALTER TABLE `activity_schedule`
  ADD CONSTRAINT `activity_schedule_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `donations_ibfk_2` FOREIGN KEY (`orphan_id`) REFERENCES `orphans` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `donations_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `donations_ibfk_4` FOREIGN KEY (`orphanage_id`) REFERENCES `orphanages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `donors`
--
ALTER TABLE `donors`
  ADD CONSTRAINT `donors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `donors_ibfk_2` FOREIGN KEY (`orphanage_id`) REFERENCES `orphanages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orphans`
--
ALTER TABLE `orphans`
  ADD CONSTRAINT `orphans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orphans_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orphans_ibfk_3` FOREIGN KEY (`orphanage_id`) REFERENCES `orphanages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orphan_activities`
--
ALTER TABLE `orphan_activities`
  ADD CONSTRAINT `orphan_activities_ibfk_1` FOREIGN KEY (`orphan_id`) REFERENCES `orphans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orphan_activities_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `activity_schedule` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`orphanage_id`) REFERENCES `orphanages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sponsors`
--
ALTER TABLE `sponsors`
  ADD CONSTRAINT `sponsors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sponsors_ibfk_2` FOREIGN KEY (`orphanage_id`) REFERENCES `orphanages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sponsorships`
--
ALTER TABLE `sponsorships`
  ADD CONSTRAINT `sponsorships_ibfk_1` FOREIGN KEY (`sponsor_id`) REFERENCES `sponsors` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sponsorships_ibfk_2` FOREIGN KEY (`orphan_id`) REFERENCES `orphans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sponsorships_ibfk_3` FOREIGN KEY (`orphanage_id`) REFERENCES `orphanages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`orphanage_id`) REFERENCES `orphanages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `volunteer_activities`
--
ALTER TABLE `volunteer_activities`
  ADD CONSTRAINT `volunteer_activities_ibfk_1` FOREIGN KEY (`volunteer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `volunteer_activities_ibfk_2` FOREIGN KEY (`orphanage_id`) REFERENCES `orphanages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `volunteer_activities_ibfk_3` FOREIGN KEY (`schedule_id`) REFERENCES `activity_schedule` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
