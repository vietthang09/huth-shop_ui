import { TTopSellingCard } from "../types";

export const TopSellingProducts: TTopSellingCard[] = [
  {
    name: "Netflix Premium 1 Year",
    imgUrl: ["/images/products/netflix1.jpg", "/images/products/netflix2.jpg"],
    price: 4500000,
    dealPrice: 3200000,
    specs: ["4K Ultra HD", "4 Screens", "Ad-free streaming"],
    url: "/product/65e6ef559d4ab819d1158194",
    soldCount: 356,
  },
  {
    name: "Spotify Premium Family",
    imgUrl: ["/images/products/spotify1.jpg", "/images/products/spotify2.jpg"],
    price: 1990000,
    dealPrice: 1590000,
    specs: ["Ad-free music", "6 accounts", "Premium quality audio"],
    url: "/product/65e6f3fd9d4ab819d1158197",
    soldCount: 248,
  },
  {
    name: "Google Workspace Business",
    imgUrl: ["/images/products/google1.jpg", "/images/products/google2.jpg"],
    price: 2990000,
    dealPrice: 2390000,
    specs: ["Custom email", "Cloud storage", "Video meetings"],
    url: "/product/65e22d7f580cd983d5aa5a2f",
    soldCount: 195,
  },
  {
    name: "Microsoft Office 365",
    imgUrl: ["/images/products/microsoft1.jpg", "/images/products/microsoft2.jpg"],
    price: 3490000,
    dealPrice: 2790000,
    specs: ["Office apps", "1TB OneDrive", "Microsoft Teams"],
    url: "/product/65e6f8019d4ab819d1158198",
    soldCount: 175,
  },
];
