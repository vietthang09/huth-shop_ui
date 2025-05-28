import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional)
  await prisma.log.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.inventoryImportItem.deleteMany({});
  await prisma.inventoryImport.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.attribute.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      fullname: "Admin User",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      isActive: true,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      fullname: "Sample Customer",
      password: await bcrypt.hash("customer123", 10),
      role: "customer",
      isActive: true,
    },
  });

  // Create categories
  const gamesCategory = await prisma.category.create({
    data: {
      name: "Games",
      slug: "games",
      image: "https://example.com/images/games.jpg",
    },
  });

  const socialCategory = await prisma.category.create({
    data: {
      name: "Social Media",
      slug: "social-media",
      image: "https://example.com/images/social.jpg",
    },
  });

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Top Supplier Inc.",
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "Quality Products Co.",
    },
  });

  // Create products (without pricing fields - pricing is at Property level)
  const product1 = await prisma.product.create({
    data: {
      sku: "PROD-001",
      title: "Premium Account",
      description: "Full-featured premium account with all benefits",
      image: "https://example.com/images/premium.jpg",
      categoryId: gamesCategory.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sku: "PROD-002",
      title: "Standard Account",
      description: "Basic account with standard features",
      image: "https://example.com/images/standard.jpg",
      categoryId: socialCategory.id,
    },
  });

  // Create attribute sets
  const attribute1 = await prisma.attribute.create({
    data: {
      name: "Monthly Plan",
      value: "Monthly",
      unit: "month",
      propertiesHash: "duration:monthly", // Changed from properties_hash to propertiesHash
    },
  });

  const attribute2 = await prisma.attribute.create({
    data: {
      name: "Yearly Plan",
      value: "Yearly",
      unit: "year",
      propertiesHash: "duration:yearly", // Changed from properties_hash to propertiesHash
    },
  });

  // Create properties (product variants) with pricing
  const property1 = await prisma.property.create({
    data: {
      productId: product1.id,
      attributeSetHash: attribute1.propertiesHash,
      retailPrice: 14.99,
      salePrice: 12.99,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      productId: product1.id,
      attributeSetHash: attribute2.propertiesHash,
      retailPrice: 149.99,
      salePrice: 129.99,
    },
  });

  const property3 = await prisma.property.create({
    data: {
      productId: product2.id,
      attributeSetHash: attribute1.propertiesHash,
      retailPrice: 9.99,
      salePrice: 7.99,
    },
  });

  // Create inventory for each variant
  const inventory1 = await prisma.inventory.create({
    data: {
      propertiesId: property1.id,
      quantity: 0, // Start with 0, will be updated through imports
    },
  });

  const inventory2 = await prisma.inventory.create({
    data: {
      propertiesId: property2.id,
      quantity: 0,
    },
  });

  const inventory3 = await prisma.inventory.create({
    data: {
      propertiesId: property3.id,
      quantity: 0,
    },
  });

  // Create inventory imports to demonstrate supplier-product relationship
  const import1 = await prisma.inventoryImport.create({
    data: {
      userId: adminUser.id,
      supplierId: supplier1.id,
      reference: "IMP-001",
      description: "Initial stock import from Top Supplier",
      totalAmount: 1499.0,
      paymentStatus: "PAID",
      importStatus: "COMPLETED",
    },
  });

  const import2 = await prisma.inventoryImport.create({
    data: {
      userId: adminUser.id,
      supplierId: supplier2.id,
      reference: "IMP-002",
      description: "Stock import from Quality Products Co.",
      totalAmount: 998.0,
      paymentStatus: "PAID",
      importStatus: "COMPLETED",
    },
  });

  // Create import items
  await prisma.inventoryImportItem.create({
    data: {
      importId: import1.id,
      propertiesId: property1.id,
      inventoryId: inventory1.id,
      quantity: 100,
      netPrice: 9.99,
      warrantyPeriod: 365,
      notes: "Premium accounts batch 1",
    },
  });

  await prisma.inventoryImportItem.create({
    data: {
      importId: import1.id,
      propertiesId: property2.id,
      inventoryId: inventory2.id,
      quantity: 50,
      netPrice: 99.99,
      warrantyPeriod: 365,
      notes: "Yearly premium accounts",
    },
  });

  await prisma.inventoryImportItem.create({
    data: {
      importId: import2.id,
      propertiesId: property3.id,
      inventoryId: inventory3.id,
      quantity: 200,
      netPrice: 4.99,
      warrantyPeriod: 30,
      notes: "Standard monthly accounts",
    },
  });

  // Update inventory quantities to reflect imports
  await prisma.inventory.update({
    where: { id: inventory1.id },
    data: { quantity: 100 },
  });

  await prisma.inventory.update({
    where: { id: inventory2.id },
    data: { quantity: 50 },
  });

  await prisma.inventory.update({
    where: { id: inventory3.id },
    data: { quantity: 200 },
  });

  // Create topics
  const newsTopic = await prisma.topic.create({
    data: {
      name: "News",
      slug: "news",
      image: "https://example.com/images/news.jpg",
    },
  });

  const tutorialsTopic = await prisma.topic.create({
    data: {
      name: "Tutorials",
      slug: "tutorials",
      image: "https://example.com/images/tutorials.jpg",
    },
  });

  // Create blog posts
  await prisma.post.create({
    data: {
      userId: adminUser.id,
      topicId: newsTopic.id, // Associate with a topic
      slug: "welcome-to-our-store",
      title: "Welcome to Our Online Account Store",
      shortDescription: "Learn about our services and offerings",
      content: "This is a detailed post about our online account store and what we offer to customers.",
      cover: "https://example.com/images/welcome.jpg",
    },
  });

  // Create another post for the tutorials topic
  await prisma.post.create({
    data: {
      userId: adminUser.id,
      topicId: tutorialsTopic.id,
      slug: "how-to-use-our-platform",
      title: "How to Use Our Platform",
      shortDescription: "A beginner's guide to our account services",
      content:
        "This tutorial will walk you through the process of purchasing and managing your accounts on our platform.",
      cover: "https://example.com/images/tutorial.jpg",
    },
  });

  // Create an order
  const order = await prisma.order.create({
    data: {
      userId: customerUser.id,
      total: 12.99,
      status: "PROCESSING", // Using the enum value
      notes: "First order from our customer",
    },
  });

  // Add order items
  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      propertiesId: property1.id,
      netPrice: 9.99,
      retailPrice: 12.99,
      quantity: 1,
    },
  });

  // Create logs
  await prisma.log.create({
    data: {
      userId: adminUser.id,
      productId: product1.id,
      title: "SEED_DATABASE",
      description: "Database seeded with initial data",
    },
  });

  console.log("Database has been seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
