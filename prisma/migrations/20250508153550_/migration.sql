/*
  Warnings:

  - Made the column `sku` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `products` MODIFY `sku` VARCHAR(191) NOT NULL;
