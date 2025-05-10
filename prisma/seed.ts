import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional)
  // Uncomment if you want to start with a clean database each time
  await prisma.logs.deleteMany({});
  await prisma.order_Items.deleteMany({});
  await prisma.orders.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.properties.deleteMany({});
  await prisma.attributes.deleteMany({});
  await prisma.products.deleteMany({});
  await prisma.suppliers.deleteMany({});
  await prisma.posts.deleteMany({});
  await prisma.users.deleteMany({});

  // Create users
  const adminUser = await prisma.users.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      fullname: "Admin User",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    },
  });

  const customerUser = await prisma.users.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      fullname: "Sample Customer",
      password: await bcrypt.hash("customer123", 10),
      role: "customer",
    },
  });

  // Create suppliers
  const supplier1 = await prisma.suppliers.create({
    data: {
      name: "Top Supplier Inc.",
    },
  });

  const supplier2 = await prisma.suppliers.create({
    data: {
      name: "Quality Products Co.",
    },
  });

  // Create products
  const product1 = await prisma.products.create({
    data: {
      sku: "PROD-001",
      title: "Premium Account",
      supplierId: supplier1.id,
    },
  });

  const product2 = await prisma.products.create({
    data: {
      sku: "PROD-002",
      title: "Standard Account",
      supplierId: supplier2.id,
    },
  });

  // Create attribute sets
  const attribute1 = await prisma.attributes.create({
    data: {
      name: "Monthly Plan",
      properties_hash: "duration:monthly",
    },
  });

  const attribute2 = await prisma.attributes.create({
    data: {
      name: "Yearly Plan",
      properties_hash: "duration:yearly",
    },
  });

  // Create properties (product variants)
  const property1 = await prisma.properties.create({
    data: {
      productId: product1.id,
      attributeSetHash: attribute1.properties_hash,
      net_price: 9.99,
      retail_price: 14.99,
    },
  });

  const property2 = await prisma.properties.create({
    data: {
      productId: product1.id,
      attributeSetHash: attribute2.properties_hash,
      net_price: 99.99,
      retail_price: 149.99,
    },
  });

  const property3 = await prisma.properties.create({
    data: {
      productId: product2.id,
      attributeSetHash: attribute1.properties_hash,
      net_price: 4.99,
      retail_price: 9.99,
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
  await prisma.posts.create({
    data: {
      userId: adminUser.id,
      slug: "welcome-to-our-store",
      title: "Welcome to Our Online Account Store",
      short_description: "Learn about our services and offerings",
      content: "This is a detailed post about our online account store and what we offer to customers.",
      cover: "https://example.com/images/welcome.jpg",
    },
  });

  // Create an order
  const order = await prisma.orders.create({
    data: {
      userId: customerUser.id,
      total: 14.99,
    },
  });

  // Add order items
  await prisma.order_Items.create({
    data: {
      orderId: order.id,
      propertiesId: property1.id,
      net_price: 9.99,
      retail_price: 14.99,
      quantity: 1,
    },
  });

  // Create logs
  await prisma.logs.create({
    data: {
      userId: adminUser.id,
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
