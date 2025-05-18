import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional)
  await prisma.log.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.attribute.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.post.deleteMany({});
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
      image: "https://example.com/images/games.jpg"
    }
  });

  const socialCategory = await prisma.category.create({
    data: {
      name: "Social Media",
      slug: "social-media",
      image: "https://example.com/images/social.jpg"
    }
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

  // Create products
  const product1 = await prisma.product.create({
    data: {
      sku: "PROD-001",
      title: "Premium Account",
      description: "Full-featured premium account with all benefits",
      image: "https://example.com/images/premium.jpg",
      supplierId: supplier1.id,
      categoryId: gamesCategory.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sku: "PROD-002",
      title: "Standard Account",
      description: "Basic account with standard features",
      image: "https://example.com/images/standard.jpg",
      supplierId: supplier2.id,
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

  // Create properties (product variants)
  const property1 = await prisma.property.create({
    data: {
      productId: product1.id,
      attributeSetHash: attribute1.propertiesHash, // Changed from properties_hash to propertiesHash
      netPrice: 9.99, // Changed from net_price to netPrice
      retailPrice: 14.99, // Changed from retail_price to retailPrice
      salePrice: null, // Changed from sale_price to salePrice
    },
  });

  const property2 = await prisma.property.create({
    data: {
      productId: product1.id,
      attributeSetHash: attribute2.propertiesHash, // Changed from properties_hash to propertiesHash
      netPrice: 99.99, // Changed from net_price to netPrice
      retailPrice: 149.99, // Changed from retail_price to retailPrice
      salePrice: 129.99, // Changed from sale_price to salePrice
    },
  });

  const property3 = await prisma.property.create({
    data: {
      productId: product2.id,
      attributeSetHash: attribute1.propertiesHash, // Changed from properties_hash to propertiesHash
      netPrice: 4.99, // Changed from net_price to netPrice
      retailPrice: 9.99, // Changed from retail_price to retailPrice
      salePrice: null, // Changed from sale_price to salePrice
    },
  });

  // Create inventory for each variant
  await prisma.inventory.create({
    data: {
      propertiesId: property1.id,
      quantity: 100,
    },
  });

  await prisma.inventory.create({
    data: {
      propertiesId: property2.id,
      quantity: 50,
    },
  });

  await prisma.inventory.create({
    data: {
      propertiesId: property3.id,
      quantity: 200,
    },
  });

  // Create blog posts
  await prisma.post.create({
    data: {
      userId: adminUser.id,
      slug: "welcome-to-our-store",
      title: "Welcome to Our Online Account Store",
      shortDescription: "Learn about our services and offerings", // Changed from short_description to shortDescription
      content: "This is a detailed post about our online account store and what we offer to customers.",
      cover: "https://example.com/images/welcome.jpg",
    },
  });

  // Create an order
  const order = await prisma.order.create({
    data: {
      userId: customerUser.id,
      total: 14.99,
      status: "PROCESSING", // Using the enum value
      notes: "First order from our customer",
    },
  });

  // Add order items
  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      propertiesId: property1.id,
      netPrice: 9.99, // Changed from net_price to netPrice
      retailPrice: 14.99, // Changed from retail_price to retailPrice
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
