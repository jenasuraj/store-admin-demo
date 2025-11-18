import { Link, LinkProps, useLocation } from "react-router-dom";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRightIcon, CornerDownRight, MenuIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconRenderer, type IconName } from "./icon-picker";

interface Links {
  moduleName: string;
  url?: string;
  icon?: React.ReactNode;
  subModules?: Links[];
  subModuleName?: string;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as any)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden  md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[200px] flex-shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "200px" : "60px") : "200px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full"
        )}
        {...props}
      >
        <div className="flex justify-start z-20 w-full">
          <MenuIcon
            className="text-neutral-800 dark:text-neutral-200"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate, setOpen } = useSidebar();
  const { pathname } = useLocation();

  const hasChildren = !!link.subModules?.length;

  const [expanded, setExpanded] = useState(() => {
    return (
      hasChildren &&
      link.subModules?.some((sub) => pathname.startsWith(sub.url || ""))
    );
  });

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  const isParentActive = pathname === link.url;
  const isChildActive =
    hasChildren && link.subModules?.some((sub) => pathname === sub.url);
  const isActive = isParentActive || isChildActive;

  return (
    <div className="flex flex-col">
      {/* === Parent Item === */}
      <div
        className={cn(
          "group flex items-center justify-between rounded-lg py-2.5 transition-all duration-200 select-none",
          "hover:bg-accent/70 hover:text-accent-foreground",
          isActive && "bg-accent/90 text-accent-foreground font-medium",
          className
        )}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <Link
          to={link.url || "#"}
          className="flex flex-1 items-center gap-3 overflow-hidden"
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
            } else {
              setOpen(false);
            }
          }}
          {...props}
        >
          {/* === ICON (Parent) === */}
          <span
            className={cn(
              "flex-shrink-0 transition-colors",
              isActive
                ? "text-blue-800"
                : "text-muted-foreground group-hover:text-foreground"
            )}
          >
            {typeof link.icon === "string" ? (
              <IconRenderer name={link.icon as IconName} />
            ) : link.icon ? (
              React.cloneElement(link.icon as React.ReactElement, {
                className: "h-5 w-5",
              })
            ) : (
              <div className="w-5 h-5" />
            )}
          </span>

          {/* === Label === */}
          <motion.span
            animate={{
              opacity: animate ? (open ? 1 : 0) : 1,
              x: animate && !open ? -8 : 0,
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "truncate",
              isActive
                ? "text-blue-700"
                : "text-neutral-800 group-hover:text-foreground",
              !open && "hidden"
            )}
          >
            {link.moduleName}
          </motion.span>
        </Link>

        {/* === Chevron === */}
        {hasChildren && open && (
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0"
          >
            <ChevronRightIcon
              className={cn(
                isActive
                  ? "text-blue-800"
                  : "text-muted-foreground group-hover:text-foreground",
                "h-4 w-4 text-muted-foreground"
              )}
            />
          </motion.div>
        )}
      </div>

      {/* === Children (Submodules) === */}
      <AnimatePresence>
        {hasChildren && expanded && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-0.5 border-l-2 border-muted/30 pl-3">
              {link.subModules!.map((child) => {
                const childActive = pathname === child.url;
                return (
                  <Link
                    key={child.url || child.moduleName}
                    to={child.url || "#"}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                      "hover:bg-accent/60 hover:text-accent-foreground",
                      childActive && "bg-accent/80 text-primary font-medium"
                    )}
                    onClick={() => setOpen(false)}
                    {...props}
                  >
                    {/* === ICON (Child) === */}
                    <span className="flex-shrink-0">
                      {typeof child.icon === "string" ? (
                        <IconRenderer name={child.icon as IconName} />
                      ) : child.icon ? (
                        React.cloneElement(child.icon as React.ReactElement, {
                          className: "h-4 w-4 text-muted-foreground",
                        })
                      ) : (
                        <CornerDownRight
                          className={cn(
                            isActive
                              ? "text-blue-800"
                              : "text-muted-foreground group-hover:text-foreground",
                            "h-3.5 w-3.5 text-muted-foreground"
                          )}
                        />
                      )}
                    </span>

                    {/* === Child Label === */}
                    <span
                      className={cn(
                        "truncate",
                        childActive
                          ? "text-primary font-medium"
                          : "text-gray-700"
                      )}
                    >
                      {child.subModuleName || child.moduleName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
