import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { isLoggedIn, logout } from "@/api/profile";
import { useRouter } from "next/navigation";
import NotificationBell from "./notificationBell";

export default function Navbar({
  setShowSignIn,
  setShowSignUp,
}: {
  setShowSignIn: Dispatch<SetStateAction<boolean>>;
  setShowSignUp: Dispatch<SetStateAction<boolean>>;
}) {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const result = await isLoggedIn();
      setLoggedIn(result);
      if (result) {
        const userRole = localStorage.getItem("role");
        setRole(userRole);
      }
    };
    checkLoggedIn();
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };
  return (
    <section>
      <div className="container flex justify-between">
        {/* Logo */}
        <div className="logo m-4">
          <Image
            src="/med.png"
            alt="AppointMed Logo"
            width={150}
            height={50}
            priority={true}
          />
        </div>

        {/* Menu */}
        <div className="menu flex m-2">
          {!loggedIn && (
            <div className="m-2">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/" className="font-normal">
                        Home
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/about" className="font-normal">
                        About
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/contact" className="font-normal">
                        Contact
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}

          {/* Auth Buttons or User Menu */}
          <div className="m-2">
            {loggedIn ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <Button variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
                {loggedIn && role === "patient" && (
                  <Button
                    className="ml-2"
                    style={{ backgroundColor: "#0e77d6", color: "white" }}
                    asChild
                  >
                    <Link href="/profile">Profile</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div>
                <Button
                  variant="secondary"
                  className="mr-2"
                  onClick={() => setShowSignUp(true)}
                >
                  Sign up
                </Button>
                <Button
                  style={{ backgroundColor: "#0e77d6", color: "white" }}
                  onClick={() => setShowSignIn(true)}
                >
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
