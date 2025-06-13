import { Link, LinkProps, useLocation } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRightIcon, CornerDownRight, MenuIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Links {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: Links[];
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

// export const SidebarLink = ({
//   link,
//   className,
//   ...props
// }: {
//   link: Links & { children?: Links[] };
//   className?: string;
//   props?: LinkProps;
// }) => {
//   const { open, animate } = useSidebar();
//   const path = useLocation().pathname;
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <div>
//       <div
//         className={cn(
//           `flex items-center justify-start ${path === link.href && 'bg-slate-400/10'} rounded-lg p-1 gap-x-12 py-2 cursor-pointer`,
//           className
//         )}
//         onClick={() => link.children && setExpanded(!expanded)}
//       >
//         <Link
//           to={link.href || "#"}
//           className="flex items-center gap-2 group/sidebar"
//           {...props}
//         >
//           <span
//             className={
//               path === link.href ? "text-blue-600" : "text-neutral-700"
//             }
//           >
//             {link.icon}
//           </span>

//           <motion.span
//             animate={{
//               display: animate
//                 ? open
//                   ? "inline-block"
//                   : "none"
//                 : "inline-block",
//               opacity: animate ? (open ? 1 : 0) : 1,
//             }}
//             className={`${
//               path === link.href ? "text-blue-600" : "text-neutral-700"
//             } text-sm transition duration-150 whitespace-pre`}
//           >
//             {link.label}
//           </motion.span>
//         </Link>

//         {link.children && (
//           <motion.div
//             animate={{ rotate: expanded ? 90 : 0 }}
//             className="text-neutral-700"
//           >
//             <ChevronRightIcon className="w-4 h-4" />
//           </motion.div>
//         )}
//       </div>

//       {link.children && (
//         <AnimatePresence>
//           {expanded && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="ml-2 flex flex-col gap-2"
//             >
//               {link.children.map((child, idx) => (
//                 <div className="group flex flex-row items-center justify-start">
//                   <CornerDownRight className="h-4 w-4 opacity-0 group-hover:opacity-40" />
//                   <SidebarLink key={idx} link={child} className="text-sm" />
//                 </div>
//               ))}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       )}
//     </div>
//   );
// };

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links & { children?: Links[] };
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  const path = useLocation().pathname;
  const [expanded, setExpanded] = useState(false);

  // Function to close the expanded state
  const handleNestedClick = () => {
    setExpanded(false); // Collapse when clicking on a nested link
  };

  return (
    <div>
      <div
        className={cn(
          `flex items-center justify-start ${
            path === link.href && "bg-slate-400/10"
          } rounded-lg p-1 gap-x-12 py-2 cursor-pointer`,
          className
        )}
        onClick={() => link.children && setExpanded(!expanded)}
      >
        <Link
          to={link.href || "#"}
          className="flex items-center gap-2 group/sidebar"
          {...props}
          onClick={(e) => {
            if (link.children) {
              e.preventDefault(); // Prevent navigation for expandable links
              setExpanded(!expanded);
            }
          }}
        >
          <span
            className={
              path === link.href ? "text-blue-600" : "text-neutral-700"
            }
          >
            {link.icon}
          </span>

          <motion.span
            animate={{
              display: animate
                ? open
                  ? "inline-block"
                  : "none"
                : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className={`
              ${path === link.href ? "text-blue-600" : "text-neutral-700"}
              text-sm transition duration-150
              whitespace-pre  
              md:whitespace-pre-wrap  
              md:break-words
            `}
          >
            {link.label}
          </motion.span>
        </Link>

        {link.children && (
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            className="text-neutral-700"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </motion.div>
        )}
      </div>

      {link.children && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ml-2 flex flex-col gap-2"
            >
              {link.children.map((child, idx) => (
                <div
                  key={idx}
                  className="group flex flex-row items-center justify-start"
                  onClick={handleNestedClick} // Collapse the parent when clicking a child
                >
                  <CornerDownRight className="h-4 w-4 opacity-0 group-hover:opacity-40" />
                  <SidebarLink link={child} className="text-sm" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
