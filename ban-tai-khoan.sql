-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 28, 2025 at 03:19 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ban-tai-khoan`
--

-- --------------------------------------------------------

--
-- Table structure for table `attribute`
--

CREATE TABLE `attribute` (
  `id` int(11) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `value` varchar(191) DEFAULT NULL,
  `unit` varchar(191) DEFAULT NULL,
  `propertiesHash` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attribute`
--

INSERT INTO `attribute` (`id`, `name`, `value`, `unit`, `propertiesHash`) VALUES
(5, 'Gói tháng', '6', 'tháng', 'duration:monthly'),
(6, 'Gói năm', '1', 'năm', 'duration:yearly'),
(7, 'Gói tháng', '1', 'tháng', 'monthly'),
(8, 'Gói tháng', '3', 'tháng', '3-months'),
(9, 'Ngày', '14', 'ngày', '14-days');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `slug`, `image`) VALUES
(5, 'Capcut', 'capcut', 'https://example.com/images/games.jpg'),
(6, 'Office 365', 'office-365', 'https://example.com/images/social.jpg'),
(7, 'Youtube', 'youtube', ''),
(8, 'Chat GPT', 'chat-gpt', ''),
(9, 'Windows 11 Pro', 'windows-11-pro', ''),
(10, 'Spotify', 'spotify', ''),
(11, 'Perplexity', 'perplexity', ''),
(12, 'Zoom', 'zoom', ''),
(13, 'Copilot', 'copilot', ''),
(14, 'Truecaller Pemium', 'truecaller-pemium', '');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `propertiesId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `propertiesId`, `quantity`) VALUES
(7, 7, 0),
(8, 8, 0),
(9, 9, 0),
(10, 11, 0),
(11, 12, 0),
(12, 13, 0),
(13, 14, 0),
(14, 15, 0),
(15, 16, 0),
(16, 17, 0),
(17, 18, 0),
(18, 19, 0),
(19, 20, 0),
(20, 21, 0),
(21, 22, 0);

-- --------------------------------------------------------

--
-- Table structure for table `inventoryimport`
--

CREATE TABLE `inventoryimport` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `supplierId` int(11) NOT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `paymentStatus` enum('PENDING','PARTIALLY_PAID','PAID','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `importStatus` enum('DRAFT','PENDING','PROCESSING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventoryimport`
--

INSERT INTO `inventoryimport` (`id`, `userId`, `supplierId`, `reference`, `description`, `totalAmount`, `paymentStatus`, `importStatus`, `createdAt`, `updatedAt`) VALUES
(5, 5, 5, 'IMP-001', 'Initial stock import from Top Supplier', 1499.00, 'PAID', 'COMPLETED', '2025-05-27 09:51:35.110', '2025-05-27 09:51:35.110'),
(6, 5, 6, 'IMP-002', 'Stock import from Quality Products Co.', 998.00, 'PAID', 'COMPLETED', '2025-05-27 09:51:35.113', '2025-05-27 09:51:35.113'),
(7, 6, 6, 'TEST-001', '', 500.00, 'PAID', 'COMPLETED', '2025-05-27 11:20:20.520', '2025-05-27 11:20:41.706'),
(8, 6, 5, '', '', 200.00, 'PAID', 'COMPLETED', '2025-05-27 11:23:49.609', '2025-05-27 11:23:53.183');

-- --------------------------------------------------------

--
-- Table structure for table `inventoryimportitem`
--

CREATE TABLE `inventoryimportitem` (
  `id` int(11) NOT NULL,
  `importId` int(11) NOT NULL,
  `propertiesId` int(11) NOT NULL,
  `inventoryId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `netPrice` decimal(10,2) NOT NULL,
  `warrantyPeriod` int(11) DEFAULT NULL,
  `warrantyExpiry` datetime(3) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventoryimportitem`
--

INSERT INTO `inventoryimportitem` (`id`, `importId`, `propertiesId`, `inventoryId`, `quantity`, `netPrice`, `warrantyPeriod`, `warrantyExpiry`, `notes`) VALUES
(7, 5, 7, 7, 100, 9.99, 365, NULL, 'Premium accounts batch 1'),
(8, 5, 8, 8, 50, 99.99, 365, NULL, 'Yearly premium accounts'),
(9, 6, 9, 9, 200, 4.99, 30, NULL, 'Standard monthly accounts'),
(10, 7, 11, 10, 100, 5.00, NULL, NULL, ''),
(11, 8, 11, 10, 50, 4.00, NULL, NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE `log` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `productId` int(11) DEFAULT NULL,
  `postId` int(11) DEFAULT NULL,
  `title` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `log`
--

INSERT INTO `log` (`id`, `userId`, `productId`, `postId`, `title`, `description`, `createdAt`) VALUES
(3, 5, 5, NULL, 'SEED_DATABASE', 'Database seeded with initial data', '2025-05-27 09:51:35.145'),
(4, 6, NULL, NULL, 'INVENTORY_IMPORT_PROCESSED', 'Processed inventory import ID: 7 with 1 items', '2025-05-27 11:20:41.709'),
(5, 6, NULL, NULL, 'INVENTORY_IMPORT_PROCESSED', 'Processed inventory import ID: 8 with 1 items', '2025-05-27 11:23:53.186'),
(6, 6, NULL, NULL, 'ORDER_CREATED', 'Order #4 created with total 12', '2025-05-27 11:38:57.417'),
(7, 7, NULL, NULL, 'ORDER_STATUS_UPDATED', 'Order #4 status updated to DELIVERED', '2025-05-27 15:26:11.295'),
(8, 7, NULL, NULL, 'ORDER_DELETED', 'Order #4 was deleted', '2025-05-28 13:16:06.631'),
(9, 7, NULL, NULL, 'ORDER_DELETED', 'Order #3 was deleted', '2025-05-28 13:16:08.627');

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('PENDING','PROCESSING','DELIVERED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `notes` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orderitem`
--

CREATE TABLE `orderitem` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `propertiesId` int(11) NOT NULL,
  `netPrice` decimal(10,2) NOT NULL,
  `retailPrice` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `post`
--

CREATE TABLE `post` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `topicId` int(11) DEFAULT NULL,
  `slug` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `shortDescription` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `cover` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post`
--

INSERT INTO `post` (`id`, `userId`, `topicId`, `slug`, `title`, `shortDescription`, `content`, `cover`, `createdAt`, `updatedAt`) VALUES
(5, 5, 5, 'welcome-to-our-store', 'Welcome to Our Online Account Store', 'Learn about our services and offerings', 'This is a detailed post about our online account store and what we offer to customers.', 'https://example.com/images/welcome.jpg', '2025-05-27 09:51:35.135', '2025-05-27 09:51:35.135'),
(6, 5, 6, 'how-to-use-our-platform', 'How to Use Our Platform', 'A beginner\'s guide to our account services', 'This tutorial will walk you through the process of purchasing and managing your accounts on our platform.', 'https://example.com/images/tutorial.jpg', '2025-05-27 09:51:35.138', '2025-05-27 09:51:35.138');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` int(11) NOT NULL,
  `sku` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `cardColor` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `categoryId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `sku`, `title`, `description`, `image`, `cardColor`, `createdAt`, `updatedAt`, `categoryId`) VALUES
(5, 'youtube-premium', 'Youtube Premium', 'Full-featured premium account with all benefits', 'https://example.com/images/premium.jpg', 'red-500', '2025-05-27 09:51:35.088', '2025-05-28 13:04:13.806', 7),
(6, 'chat-gpt', 'Chat GPT (Dùng riêng)', 'Basic account with standard features', 'https://example.com/images/standard.jpg', 'green-500', '2025-05-27 09:51:35.090', '2025-05-28 13:08:08.142', 8),
(14, 'capcut', 'Capcut', 'Tài khoản new chưa đăng kí', NULL, 'green-500', '2025-05-27 11:19:42.357', '2025-05-28 13:06:39.455', 5),
(17, 'capcut-dang-ky-san', 'Capcut', 'Tài khoản đã đăng kí sẵn capcut', NULL, 'green-500', '2025-05-28 13:07:19.108', '2025-05-28 13:07:19.108', 5),
(18, 'office-365', 'Office 365', 'Khách gửi mail-> join family', NULL, '', '2025-05-28 13:08:00.831', '2025-05-28 13:08:00.831', 6),
(19, 'windows-11-pro', 'Windows 11 Pro', 'Key', NULL, '', '2025-05-28 13:10:36.004', '2025-05-28 13:10:36.004', 9),
(20, 'spotify', 'Spotify', 'khách gửi tài khoản nâng chính chủ', NULL, '', '2025-05-28 13:11:55.534', '2025-05-28 13:11:55.534', 10),
(21, 'perplexity', 'Perplexity', 'khách gửi tài khoản nâng chính chủ', NULL, '', '2025-05-28 13:12:28.419', '2025-05-28 13:12:28.419', 11),
(22, 'zoom', 'Zoom', 'khách gửi tài khoản nâng chính chủ', NULL, '', '2025-05-28 13:13:50.676', '2025-05-28 13:13:50.676', 12),
(23, 'copilot', 'Copilot', 'khách gửi tài khoản nâng chính chủ', NULL, '', '2025-05-28 13:14:17.736', '2025-05-28 13:14:17.736', 13),
(24, 'true-caller-premium', 'Truecaller Premium', 'Khách gửi số điện thoại', NULL, '', '2025-05-28 13:14:49.828', '2025-05-28 13:14:49.828', 14);

-- --------------------------------------------------------

--
-- Table structure for table `property`
--

CREATE TABLE `property` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `attributeSetHash` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `retailPrice` decimal(10,2) NOT NULL DEFAULT 0.00,
  `salePrice` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `property`
--

INSERT INTO `property` (`id`, `productId`, `attributeSetHash`, `createdAt`, `updatedAt`, `retailPrice`, `salePrice`) VALUES
(7, 5, 'duration:monthly', '2025-05-27 09:51:35.097', '2025-05-28 13:04:13.821', 130000.00, NULL),
(8, 5, 'duration:yearly', '2025-05-27 09:51:35.100', '2025-05-28 13:04:13.827', 250000.00, NULL),
(9, 6, 'duration:monthly', '2025-05-27 09:51:35.103', '2025-05-28 13:08:08.149', 9.99, NULL),
(11, 14, 'duration:yearly', '2025-05-27 11:19:42.363', '2025-05-28 13:06:39.462', 550000.00, NULL),
(12, 17, 'duration:yearly', '2025-05-28 13:07:19.119', '2025-05-28 13:07:19.119', 650000.00, NULL),
(13, 18, 'duration:yearly', '2025-05-28 13:08:00.837', '2025-05-28 13:08:00.837', 120000.00, NULL),
(14, 20, 'duration:monthly', '2025-05-28 13:11:55.537', '2025-05-28 13:11:55.537', 200000.00, NULL),
(15, 20, 'duration:yearly', '2025-05-28 13:11:55.547', '2025-05-28 13:11:55.547', 300000.00, NULL),
(16, 20, '3-months', '2025-05-28 13:11:55.553', '2025-05-28 13:11:55.553', 90000.00, NULL),
(17, 21, 'monthly', '2025-05-28 13:12:28.424', '2025-05-28 13:12:28.424', 310000.00, NULL),
(18, 22, 'duration:yearly', '2025-05-28 13:13:50.681', '2025-05-28 13:13:50.681', 1300000.00, NULL),
(19, 22, 'monthly', '2025-05-28 13:13:50.686', '2025-05-28 13:13:50.686', 130000.00, NULL),
(20, 22, '14-days', '2025-05-28 13:13:50.697', '2025-05-28 13:13:50.697', 15000.00, NULL),
(21, 23, 'monthly', '2025-05-28 13:14:17.740', '2025-05-28 13:14:17.740', 50000.00, NULL),
(22, 24, 'duration:yearly', '2025-05-28 13:14:49.834', '2025-05-28 13:14:49.834', 70000.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`id`, `name`) VALUES
(6, 'Tap hoa MMO'),
(5, 'Tele');

-- --------------------------------------------------------

--
-- Table structure for table `topic`
--

CREATE TABLE `topic` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `topic`
--

INSERT INTO `topic` (`id`, `name`, `slug`, `image`) VALUES
(5, 'News', 'news', 'https://example.com/images/news.jpg'),
(6, 'Tutorials', 'tutorials', 'https://example.com/images/tutorials.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `fullname` varchar(191) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `lastLogin` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `fullname`, `email`, `password`, `role`, `createdAt`, `updatedAt`, `isActive`, `lastLogin`) VALUES
(5, 'Admin User', 'admin@example.com', '$2b$10$OOa/py4pwYRZvjNHyaJzyOztNErtI6pxuU4SEdTmdqCARg/N8c/LO', 'admin', '2025-05-27 09:51:35.006', '2025-05-27 09:51:35.006', 1, NULL),
(6, 'Sample Customer', 'customer@example.com', '$2b$10$yHxI88Git7bDgjUA3UWbPupBFEgCBn9i.e4lpsXYjZTAM84fbxMca', 'customer', '2025-05-27 09:51:35.074', '2025-05-27 09:51:35.074', 1, NULL),
(7, 'Lê Việt Thắng', 'vthcvn@gmail.com', '$2b$10$gemTAQj.IsvxThIydoIZCuF/eMtNHisdoM17fc1BCct/JCEItlhzO', 'admin', '2025-05-27 14:30:43.906', '2025-05-27 14:30:43.906', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('425ad4bf-f286-4ce0-9352-dffbf1a60d48', '6b05e7f76b68eb24b7554b41d204dc9f960d1696892ee22a5efc5dce36fee98b', '2025-05-27 09:51:22.854', '20250527095122_', NULL, NULL, '2025-05-27 09:51:22.843', 1),
('e269d99e-f25b-4812-8fb8-2d5fdf2d7204', '2c14d0734b6a915de2259c70748c2042cdeb23285f641079f126b4f360f78ba2', '2025-05-27 09:44:51.241', '20250527094449_', NULL, NULL, '2025-05-27 09:44:49.592', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attribute`
--
ALTER TABLE `attribute`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Attribute_propertiesHash_key` (`propertiesHash`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Category_slug_key` (`slug`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Inventory_propertiesId_key` (`propertiesId`);

--
-- Indexes for table `inventoryimport`
--
ALTER TABLE `inventoryimport`
  ADD PRIMARY KEY (`id`),
  ADD KEY `InventoryImport_userId_idx` (`userId`),
  ADD KEY `InventoryImport_supplierId_idx` (`supplierId`);

--
-- Indexes for table `inventoryimportitem`
--
ALTER TABLE `inventoryimportitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `InventoryImportItem_importId_idx` (`importId`),
  ADD KEY `InventoryImportItem_propertiesId_idx` (`propertiesId`),
  ADD KEY `InventoryImportItem_inventoryId_idx` (`inventoryId`);

--
-- Indexes for table `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Log_userId_idx` (`userId`),
  ADD KEY `Log_productId_idx` (`productId`),
  ADD KEY `Log_postId_idx` (`postId`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Order_userId_idx` (`userId`);

--
-- Indexes for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderItem_orderId_idx` (`orderId`),
  ADD KEY `OrderItem_propertiesId_idx` (`propertiesId`);

--
-- Indexes for table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Post_slug_key` (`slug`),
  ADD KEY `Post_userId_idx` (`userId`),
  ADD KEY `Post_topicId_idx` (`topicId`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Product_sku_key` (`sku`),
  ADD KEY `Product_categoryId_idx` (`categoryId`);

--
-- Indexes for table `property`
--
ALTER TABLE `property`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Property_productId_attributeSetHash_key` (`productId`,`attributeSetHash`),
  ADD KEY `Property_attributeSetHash_idx` (`attributeSetHash`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Supplier_name_key` (`name`);

--
-- Indexes for table `topic`
--
ALTER TABLE `topic`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Topic_slug_key` (`slug`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attribute`
--
ALTER TABLE `attribute`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `inventoryimport`
--
ALTER TABLE `inventoryimport`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `inventoryimportitem`
--
ALTER TABLE `inventoryimportitem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `log`
--
ALTER TABLE `log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `order`
--
ALTER TABLE `order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orderitem`
--
ALTER TABLE `orderitem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `post`
--
ALTER TABLE `post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `property`
--
ALTER TABLE `property`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `topic`
--
ALTER TABLE `topic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `Inventory_propertiesId_fkey` FOREIGN KEY (`propertiesId`) REFERENCES `property` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventoryimport`
--
ALTER TABLE `inventoryimport`
  ADD CONSTRAINT `InventoryImport_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryImport_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `inventoryimportitem`
--
ALTER TABLE `inventoryimportitem`
  ADD CONSTRAINT `InventoryImportItem_importId_fkey` FOREIGN KEY (`importId`) REFERENCES `inventoryimport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryImportItem_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `inventory` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryImportItem_propertiesId_fkey` FOREIGN KEY (`propertiesId`) REFERENCES `property` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `log`
--
ALTER TABLE `log`
  ADD CONSTRAINT `Log_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Log_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItem_propertiesId_fkey` FOREIGN KEY (`propertiesId`) REFERENCES `property` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `Post_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `topic` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Post_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `property`
--
ALTER TABLE `property`
  ADD CONSTRAINT `Property_attributeSetHash_fkey` FOREIGN KEY (`attributeSetHash`) REFERENCES `attribute` (`propertiesHash`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Property_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
