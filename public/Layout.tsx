import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { LogOutIcon, PanelsLeftBottom } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { logout, selectUser } from "./app/AuthSlice";
import { useAppSelector } from "@/app/hooks";
import { Sidebar, SidebarBody, SidebarLink } from "./components/ui/sidebar";

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
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 w-full max-w-full border border-neutral-200 overflow-hidden",
        "h-full overflow-hidden"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div
            className={`flex flex-col flex-1 overflow-y-auto ${!open && "no-scrollbar"
              }  overflow-x-hidden`}
          >
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {user?.authority == "MASTER_ADMIN" &&
                master_admin.map((module, idx) => (
                  <SidebarLink key={idx} link={{
                    moduleName: module.moduleName,
                    url: module.url,
                    icon: module.icon,
                    subModules: module.subModules as any, // Cast to satisfy Links[] type
                  }} />
                )
                )}
              {user?.modules?.map((module, idx) => (
                <SidebarLink key={idx} link={{
                  moduleName: module.moduleName,
                  url: module.url,
                  icon: module.icon,
                  subModules: module.subModules as any, // Cast to satisfy Links[] type
                }} />
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
      <div className="p-2 bg-white flex-1 min-w-0 w-full h-full overflow-y-auto overflow-x-hidden">
        <Outlet />
      </div>
    </div >
  );
};
export const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    ><img src="/actify-icon.png" className="size-12" />

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black  whitespace-pre"
      >
        Actify Store Admin
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <img src="/actify-icon.png" className="size-7" />
    </Link>
  );
};
export default Layout;

type SubModule = {
  moduleName: string;
  subModuleName?: string;
  url?: string;
  icon?: React.ReactNode;
  subModules?: SubModule[];
};

type Modules = {
  icon: string;
  moduleName: string;
  subModules: SubModule[] | null;
  url: string;
};

const master_admin: Modules[] = [
  {
    moduleName: "Sidebar Manager",
    subModules: null,
    url: "/sidebar-manager",
    icon: "folder-tree",
  },
  {
    moduleName: "Form Builder",
    subModules: null,
    url: "/master-form-tabs",
    icon: "file-text",
  },
  {
    moduleName: "Create Employee",
    subModules: null,
    url: "/create-employee",
    icon: "user-plus",
  },
];
