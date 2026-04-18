import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./components/ui/sidebar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  CircleArrowOutUpLeft,
  Cog,
  Component,
  FolderTree,
  LayoutDashboard,
  LogOutIcon,
  Package2,
  Percent,
  Sheet,
  Shuffle,
  UserPlus,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout, selectUser } from "./app/AuthSlice";
import { LucideWarehouse } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "./app/hooks";
const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    dispatch({
      type: "store/reset",
    });
    // sessionStorage.clear();
    toast.success("You have successfully logged out!");
    navigate("/login", { replace: true });
  };

  const [open, setOpen] = useState(false);

  //   useEffect(() => {
  //   // const groupCompanyId = localStorage.getItem("groupCompanyId");

  //   // // if (localStorage.getItem("token")) {
  //   // if (Number(groupCompanyId) === 3) {
  //   //   navigate("/masters", { replace: true });
  //   // } else {
  //   //   navigate("/", { replace: true });
  //     // }
  //     navigate(user.user.path)
  //     console.log(user.user.path);

  //   // }
  // }, []);
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1  mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen overflow-hidden"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div
            className={`flex flex-col flex-1 overflow-y-auto ${
              !open && "no-scrollbar"
            }  overflow-x-hidden`}
          >
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {user.modules?.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div
            onClick={handleLogout}
            className="flex flex-row items-center justify-between"
          >
            <SidebarLink
              link={{
                moduleName: "Logout",
                icon: <LogOutIcon />,
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="p-2 bg-white w-full h-full overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
export const Logo = () => {
  return (
    <Link
      to="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Actify Store Admin
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

const links = [
  {
    label: "Sidebar Manager",
    href: "/sidebar-manager",
    icon: <FolderTree className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Add Company",
    href: "/add-company",
    icon: <UserPlus className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Ledger Dashboard",
    href: "/ledger-dashboard",
    icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Masters",
    href: "/ledger-masters",
    icon: <Cog className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Ledger",
    href: "/ledger-sheet",
    icon: <Sheet className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Products",
    // href: "/product",
    icon: <Package2 className="h-5 w-5 flex-shrink-0" />,
    children: [
      {
        label: "Add Product",
        href: "/product/add",
        // icon: <Package2 className="h-5 w-5 flex-shrink-0" />,
      },
      {
        label: "All Products",
        href: "/ledger/add",
        // icon: <Package2 className="h-5 w-5 flex-shrink-0" />,
      },
    ],
  },
];

export default Layout;
