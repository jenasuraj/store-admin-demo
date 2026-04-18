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
import Chocolate from "./Features/template-manager/Template";
import Form from "./Features/template-manager/Form";
import TemplateManager from "./Features/template-manager/TemplateManager";


import OracleLoginPage from "./Features/bot-poc/auth/OracleLogin";
import PennantLoginPage from "./Features/bot-poc/auth/PennantLogin";
import FinnacleLoginPage from "./Features/bot-poc/auth/FinnacleLogin";
// import PennantHomePage from "./Features/Home/PennantHome";
// import OracleHomePage from "./Features/Home/OracleHome";
// import FinnacleHomePage from "./Features/Home/FinnacleHome";
import UploadPage from "./Features/Home/autobot-home";
import AutoBotLoginPage from "./Features/bot-poc/auth/autobot-login";
import SystemDashboard from "./Features/bot-poc/home/SystemDashboard";
import TaxInvoiceForm from "./Features/bot-poc/invoice/TaxInvoiceForm";
import CreateTransactionScreen from "./Features/bot-poc/transactions/transaction-entry";
import BankLoginPage from "./Features/bot-poc/auth/bank-login";
import AutobotNewHomePage from "./Features/Home/autobot-home-new";

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
          path: "/template-manager/visual",
          element: <Chocolate />,
        },
        {
          path: "/template-manager",
          element: <TemplateManager />,
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
        {
          path: "/oracle-home",
          element: <SystemDashboard />,
        },
        {
          path: "/pennant-home",
          element: <SystemDashboard />,
        },
        {
          path: "/finnacle-home",
          element: <SystemDashboard />,
        },
        {
          path: "/bank-home",
          element: <SystemDashboard />,
        },
        {
          path: "/autobot-home",
          element: <UploadPage />,
        },
        {
          path: "/autobot-new-home",
          element: <AutobotNewHomePage />,
        },
        {
          path: "/transaction-entry",
          element: <CreateTransactionScreen />,
        },
        {
          path: "/invoice-home",
          element: <TaxInvoiceForm />,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/oracle-login",
      element: <OracleLoginPage />,
    },
    {
      path: "/pennant-login",
      element: <PennantLoginPage />,
    },
    {
      path: "/finnacle-login",
      element: <FinnacleLoginPage />,
    },
    {
      path: "/autobot-login",
      element: <AutoBotLoginPage />,
    },
    {
      path: "/bank-login",
      element: <BankLoginPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
