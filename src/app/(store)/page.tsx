import { Metadata } from "next";

import HomePage from "@/components/store/home";

export const metadata: Metadata = {
  title: "BITEX - Trang chủ",
};

export default function Home() {
  return <HomePage />;
}
