"use client";

import { useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ProfileIcon } from "@/components/icons/svgIcons";
import Button from "@/components/UI/button";
import { useToggleMenu } from "@/hooks/useToggleMenu";
import { cn } from "@/shared/utils/styling";

const NavBarProfile = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const menuRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useToggleMenu(false, menuRef);

  const toggleMenu = () => {
    setIsActive((prev) => !prev);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setIsActive(false);
    router.push("/");
  };

  return (
    <div className="relative flex items-center select-none">
      <Button
        onClick={toggleMenu}
        className={cn(
          "border-white h-9 hover:border-gray-300 transition-all text-gray-500 text-sm duration-300",
          isActive && "border-gray-300 bg-gray-50"
        )}
      >
        <ProfileIcon width={16} className="fill-white transition-all duration-300 stroke-gray-500 stroke-2" />
        <span className="select-none hidden lg:block ml-2">
          {loading ? "Loading..." : isAuthenticated ? session.user?.name?.split(" ")[0] || "Account" : "Account"}
        </span>
      </Button>

      <div
        ref={menuRef}
        className={cn(
          "w-[200px] absolute rounded-lg overflow-hidden flex flex-col items-start top-[42px] right-0 border border-gray-300 bg-white shadow-md scale-[0.97] invisible opacity-0 transition-all duration-300 p-2 z-10",
          isActive && "scale-100 visible opacity-100"
        )}
      >
        {isAuthenticated ? (
          <>
            <div className="w-full p-2 mb-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
              <p className="text-xs text-gray-500">{session.user?.email}</p>
            </div>

            <Link
              href="/profile"
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setIsActive(false)}
            >
              Profile
            </Link>

            <Link
              href="/orders"
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setIsActive(false)}
            >
              Orders
            </Link>

            {/* Show Admin Dashboard link for admins */}
            {session.user?.role === "admin" && (
              <Link
                href="/admin"
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={() => setIsActive(false)}
              >
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-2"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="w-full text-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setIsActive(false)}
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="w-full text-center px-3 py-2 mt-1 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
              onClick={() => setIsActive(false)}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBarProfile;
