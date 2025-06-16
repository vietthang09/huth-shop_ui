"use client";
import { Provider } from "react-redux";

import StoreNavBar from "@/components/store/navbar";
import { shoppingCartStore } from "@/store/shoppingCart";

import StoreFooter from "./../../components/store/footer/index";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={shoppingCartStore}>
      <StoreNavBar />
      <main>{children}</main>
      <StoreFooter />
    </Provider>
  );
};

export default StoreLayout;
