import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Features/Home/Home";
import Masters from "./Features/Masters/Masters";
import LoginPage from "./Features/Auth/Login";
import ProtectedRoutes from "./components/Protected";
import Collections from "./Features/Collections/Collections";
import axios from "axios";
import AddProducts from "./Features/Products/AddProducts";
import { toast } from "sonner";
import Mapping from "./Features/Mapping/Mapping";
import ProductList from "./Features/Products/Components/ProductList";
import NewOrder from "./Features/Orders/Order";
import LandingPage from "./Features/LandingPage/LandingPage";
import Enquires from "./Features/Products/Components/Enquires/Enquires";
import LedgerDashboard from "./pages/LedgerDashboard";
import LedgerMaster from "./pages/ledger-masters";
import SidebarManager from "./pages/sidebar-manager";
import CompanyManager from "./pages/CompanyManager";
import CreateEntryPage from "./pages/EntryPage";
import LedgerPaymentsPage from "./pages/ledger-payments";
import LedgerViews from "./pages/ledger-view";

axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    config.headers.Authorization = localStorage.getItem("token");
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    return response;
  },
  function (error) {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.clear();
      window.location.href = "/login";
      toast.error(
        "Your session has expired or is invalid. Please log in again to continue."
      );
    }
    // Do something with response error
    return Promise.reject(error);
  }
);

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <ProtectedRoutes />,
      children: [
        {
          path: "/home",
          element: <Home />,
        },
        {
          path: "/masters",
          element: <Masters />,
        },
        {
          path: "/mapping",
          element: <Mapping />,
        },
        {
          path: "/manage-company",
          element: <CompanyManager />,
        },
        {
          path: "/collections",
          element: <Collections />,
        },
        {
          path: "/enquires",
          element: <Enquires />,
        },
        {
          path: "/orders",
          element: <NewOrder />,
        },
        {
          path: "/product",
          children: [
            {
              path: "/product/add",
              element: <AddProducts />,
            },
            {
              path: "/product/addLandingPage",
              element: <LandingPage />,
            },
            {
              path: "/product/list",
              element: <ProductList />,
            },
          ],
        },

        {
          path: "sidebar-manager",
          element: <SidebarManager />,
        },
        {
          path: "/ledger-dashboard",
          element: <LedgerDashboard />,
        },
        {
          path: "/ledger-sheet",
          element: <LedgerViews />,
        },
        {
          path: "/ledger-masters",
          element: <LedgerMaster />,
        },
        {
          path: "/ledger/add",
          element: <CreateEntryPage />,
        },
        {
          path: "/ledger/payments",
          element: <LedgerPaymentsPage />,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
