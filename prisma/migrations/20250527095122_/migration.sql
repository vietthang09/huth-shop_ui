/*
  Warnings:

  - You are about to drop the column `retailPrice` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `retailPrice`,
    DROP COLUMN `salePrice`;

-- AlterTable
ALTER TABLE `property` ADD COLUMN `retailPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `salePrice` DECIMAL(10, 2) NULL;
