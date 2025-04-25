import { TProductCard } from "@/types/common";

import { TDealCard } from "../types";

export const TodayDeals: TDealCard[] = [
  {
    name: "Netflix Premium 1 Year",
    imgUrl: ["/images/products/netflix1.jpg", "/images/products/netflix2.jpg"],
    price: 4500000,
    dealPrice: 3200000,
    specs: ["4K Ultra HD", "4 Screens", "Ad-free streaming"],
    url: "/product/65e6ef559d4ab819d1158194",
    dealDate: new Date("1970-01-01T18:00:00"),
  },
  {
    name: "Spotify Premium Family",
    imgUrl: ["/images/products/spotify1.jpg", "/images/products/spotify2.jpg"],
    price: 1990000,
    dealPrice: 1590000,
    specs: ["Ad-free music", "6 accounts", "Premium quality audio"],
    url: "/product/65e6f3fd9d4ab819d1158197",
    dealDate: new Date("1970-01-01T09:30:00"),
  },
  {
    name: "Google Workspace Business",
    imgUrl: ["/images/products/google1.jpg", "/images/products/google2.jpg"],
    price: 2990000,
    dealPrice: 2390000,
    specs: ["Custom email", "Cloud storage", "Video meetings"],
    url: "/product/65e22d7f580cd983d5aa5a2f",
    dealDate: new Date("1970-01-01T23:10:00"),
  },
  {
    name: "Microsoft Office 365",
    imgUrl: ["/images/products/microsoft1.jpg", "/images/products/microsoft2.jpg"],
    price: 3490000,
    dealPrice: 2790000,
    specs: ["Word, Excel, PowerPoint", "1TB OneDrive", "PC & Mac compatible"],
    url: "/product/65e6244fcb99bb936d4cb7c0",
    dealDate: new Date("1970-01-01T06:30:00"),
  },
  {
    name: "Adobe Creative Cloud",
    imgUrl: ["/images/products/adobe1.jpg", "/images/products/adobe2.jpg"],
    price: 5590000,
    dealPrice: 4690000,
    specs: ["Photoshop, Illustrator, Premiere Pro", "100GB cloud storage", "Premium templates"],
    url: "/product/65e6530ecb99bb936d4cb7db",
    dealDate: new Date("1970-01-01T10:50:00"),
  },
];

export const TopProducts: TProductCard[] = [
  {
    name: "Apple Airpods Pro",
    imgUrl: ["/images/products/airpods1.jpg", "/images/products/airpods2.jpg"],
    price: 129.99,
    specs: ["Built-In Microphone", "3rd generation", "Water Resistant"],
    url: "/product/65e6eed69d4ab819d1158193",
  },
  {
    name: "Apple Watch Ultra 2",
    imgUrl: ["/images/products/appleWatch1.jpg", "/images/products/appleWatch2.jpg"],
    price: 799.0,
    specs: ["GPS + Cellular", "Titanium", "49mm"],
    url: "/product/65e6f5339d4ab819d115819c",
  },
  {
    name: "ASUS ROG Laptop",
    imgUrl: ["/images/products/asusRog1.jpg", "/images/products/asusRog2.jpg"],
    price: 2499.99,
    dealPrice: 2149.99,
    specs: ["32GB RAM", "17inch display", "OLED Display"],
    url: "/product/65e6008bcb99bb936d4cb7ac",
  },
  {
    name: "PS5 Controller",
    imgUrl: ["/images/products/ps5Controller1.jpg", "/images/products/ps5Controller2.jpg"],
    price: 69,
    specs: ["Bluetooth", "Version 2"],
    url: "/product/65e6f5f89d4ab819d115819f",
  },
  {
    name: "Sony Alpha 7RV",
    imgUrl: ["/images/products/sonyAlpha7_1.jpg", "/images/products/sonyAlpha7_2.jpg"],
    price: 4499,
    specs: ["Full Frame", "Body", "40MP"],
    dealPrice: 3699,
    url: "/product/65e656decb99bb936d4cb7e4",
  },
];
