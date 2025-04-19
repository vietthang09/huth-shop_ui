"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/shared/utils/styling";

import AddVisit from "../common/addVisit";

import NavBarCategory from "./navCategory";
import NavBarFavorite from "./navFavorite";
import NavBarProfile from "./navProfile";
import NavBarShopping from "./navShopping";




const NAVBAR_ITEMS = [
  { name: "Computer", link: "/list/pc-laptops/computer" },
  { name: "Laptop", link: "/list/pc-laptops/laptops" },
  { name: "Mobile", link: "/list/smartphones" },
  { name: "TV", link: "/list/tvs" },
  { name: "Gaming", link: "/list/video-games" },
  { name: "Camera", link: "/list/photography/cameras" },
  { name: "Tablet", link: "/list/tablets" },
  { name: "Watch", link: "/list/watches" },
];

const StoreNavBar = () => {
  const [hideNavbar, setHideNavbar] = useState(false);

  useEffect(() => {
    let prevPositionY = 0;
    if (typeof window !== "undefined") prevPositionY = window.scrollY;
    const handleScroll = () => {
      //---handle auto hiding navbar
      if (window !== undefined) {
        const shouldHideNavbar = prevPositionY < window.scrollY && window.scrollY > 100;
        setHideNavbar(shouldHideNavbar);
        prevPositionY = window.scrollY;
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  return (
    <nav
      className={cn(
        "flex flex-col bg-white transition-all pt-5 duration-700 fixed w-full z-10",
        hideNavbar ? "top-[-180px]" : "top-0"
      )}
    >
      <section className="w-full">
        <div className="storeContainer w-full relative flex justify-between items-center">
          <Link href={"/"} className="mr-0 xl:mr-20 lg:mr-10">
            <Image alt="Bitex Logo" src={"/images/logo.png"} width={125} height={40} quality={100} />
          </Link>
          <div className="h-11 relative flex-1 mx-6 sm:mx-10">
            <input
              type="text"
              className="text-gray-800 hidden sm:block pl-4 size-full border-gray-300 focus:border-gray-500 border rounded-lg outline-gray-500 sm:pl-12"
              placeholder="Search"
            />
            <Image
              src="/icons/searchIcon.svg"
              width={16}
              height={16}
              alt="Search"
              className="absolute top-3.5 left-5 hidden sm:block"
            />
          </div>
          <div className="text-gray-500 flex pr-2 md:pr-0">
            <NavBarProfile />
            <NavBarFavorite />
            <NavBarShopping />
          </div>
        </div>
      </section>
      <section className="w-full border-b-gray-400 mt-5 border-t-gray-300 border-b border-t">
        <div className="storeContainer h-[50px] flex justify-between">
          <div className="flex items-center">
            <NavBarCategory isNavbarVisible={!hideNavbar} />
            <hr className="h-4 border-l border-gray-300 mx-4 hidden sm:block" />
            <ul className="hidden lg:flex space-x-2">
              {NAVBAR_ITEMS.map(({ name, link }) => (
                <li key={name}>
                  <Link
                    href={link}
                    className="px-4 py-2 rounded-md text-sm text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <ul className="flex items-center">
            <li className="hidden lg:block">
              <Link href={""} className="text-sm hover:bg-gray-100 py-2 px-4 rounded-lg transition-all duration-150">
                PC Configuration
              </Link>
            </li>
            <li className="gap-2">
              <Link
                href={""}
                className="text-sm bg-[url('/icons/discountIcon.svg')] bg-[0px_10px] bg-no-repeat text-red-900 flex gap-1 md:visible hover:bg-gray-100 py-2 pl-5 pr-4 rounded-lg transition-all duration-150"
              >
                Top Deals
              </Link>
            </li>
          </ul>
        </div>
      </section>
      <AddVisit />
    </nav>
  );
};

export default StoreNavBar;
