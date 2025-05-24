/*
  Warnings:

  - You are about to drop the column `salePrice` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `attribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attributetype` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productattribute` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `attribute` DROP FOREIGN KEY `Attribute_attributeTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `productattribute` DROP FOREIGN KEY `ProductAttribute_attributeId_fkey`;

-- DropForeignKey
ALTER TABLE `productattribute` DROP FOREIGN KEY `ProductAttribute_productId_fkey`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `salePrice`;

-- DropTable
DROP TABLE `attribute`;

-- DropTable
DROP TABLE `attributetype`;

-- DropTable
DROP TABLE `productattribute`;
