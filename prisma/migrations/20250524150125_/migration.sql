-- CreateTable
CREATE TABLE `InventoryImport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `reference` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `paymentStatus` ENUM('PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `importStatus` ENUM('DRAFT', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InventoryImport_userId_idx`(`userId`),
    INDEX `InventoryImport_supplierId_idx`(`supplierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryImportItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `importId` INTEGER NOT NULL,
    `propertiesId` INTEGER NOT NULL,
    `inventoryId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `netPrice` DECIMAL(10, 2) NOT NULL,
    `warrantyPeriod` INTEGER NULL,
    `warrantyExpiry` DATETIME(3) NULL,
    `notes` TEXT NULL,

    INDEX `InventoryImportItem_importId_idx`(`importId`),
    INDEX `InventoryImportItem_propertiesId_idx`(`propertiesId`),
    INDEX `InventoryImportItem_inventoryId_idx`(`inventoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InventoryImport` ADD CONSTRAINT `InventoryImport_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryImport` ADD CONSTRAINT `InventoryImport_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryImportItem` ADD CONSTRAINT `InventoryImportItem_importId_fkey` FOREIGN KEY (`importId`) REFERENCES `InventoryImport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryImportItem` ADD CONSTRAINT `InventoryImportItem_propertiesId_fkey` FOREIGN KEY (`propertiesId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryImportItem` ADD CONSTRAINT `InventoryImportItem_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
