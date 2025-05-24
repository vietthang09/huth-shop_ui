/*
  Warnings:

  - You are about to drop the column `sale_price` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `sale_price`,
    ADD COLUMN `salePrice` DECIMAL(10, 2) NULL;
