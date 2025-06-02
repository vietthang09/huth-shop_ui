"use client";
import { Provider } from "react-redux";

import StoreNavBar from "@/components/store/navbar";
import { shoppingCartStore } from "@/store/shoppingCart";

import StoreFooter from "./../../components/store/footer/index";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={shoppingCartStore}>
      <StoreNavBar />
      <main className="my-36 max-w-7xl mx-auto px-4 2xl:px-0">{children}</main>
      <StoreFooter />
    </Provider>
  );
};

export default StoreLayout;
