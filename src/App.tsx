import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import Home from "./Features/Home/Home";
import Masters from "./Features/Masters/Masters";
import LoginPage from "./Features/Auth/Login";
import ProtectedRoutes from "./components/Protected";
import AddCompany from "./Features/AddCompany/AddCompany";
import Collections from "./Features/Collections/Collections";
import axios from "axios";
import { BASE_URL } from "./lib/constants";
import AddProducts from "./Features/Products/AddProducts";
import { toast } from "sonner";
import Mapping from "./Features/Mapping/Mapping";
import ProductList from "./Features/Products/Components/ProductList";
import InventoryList from "./Features/inventory/Inventory";
import TransactionHistory from "./Features/transactionHistory/TransactionHistory";
import NewOrder from "./Features/Orders/Order";
import Returns from "./Features/Returns/Returns";
import Exchange from "./Features/Exchange/Exchange";
import DiscountForm from "./Features/Discounts/DiscountForm";
import DiscountList from "./Features/Discounts/DiscountList";
import DiscountPromoTabs from "./pages/DiscountPromoTabs";
import LandingPage from "./Features/LandingPage/LandingPage";
import Enquires from "./Features/Products/Components/Enquires/Enquires";
// import AllProduct from "./Features/Products/Components/AllProduct";

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
          path: "",
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
          path: "/add-company",
          element: <AddCompany />,
        },
        {
          path: "/collections",
          element: <Collections />,
        },
        {
          path: "/inventory",
          element: <InventoryList />,
        }, {
          path: '/enquires',
          element: <Enquires />
        },
        {
          path: "/orders",
          element: <NewOrder />,
        },
        {
          path: "/returns",
          element: <Returns />,
        },
        {
          path: "/exchange",
          element: <Exchange />,
        },
        {
          path: "/transaction",
          element: <TransactionHistory />,
        },
        {
          path: "/product",
          children: [
            {
              path: "/product/add",
              element: <AddProducts />,
            },
            {
              path: '/product/addLandingPage',
              element: <LandingPage />


            },
            // {
            //   path: '/product/allproduct',
            //   element: <AllProduct />

            // },

            {
              path: "/product/list",
              element: <ProductList />,
            },
          ],
        },
        {
          path: "/discountPromoList",
          element: <DiscountPromoTabs />,
        },
        {
          path: "/createDiscountPromo",
          element: <DiscountForm />,
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
