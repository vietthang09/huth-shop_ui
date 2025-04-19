"use client";
import { Provider } from "react-redux";

import StoreNavBar from "@/components/store/navbar";
import { shoppingCartStore } from "@/store/shoppingCart";

import StoreFooter from "./../../components/store/footer/index";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-gray-50">
      <Provider store={shoppingCartStore}>
        <StoreNavBar />
        {children}
        <StoreFooter />
      </Provider>
    </main>
  );
};

export default StoreLayout;
