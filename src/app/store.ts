import {
  combineReducers,
  configureStore,
  Reducer,
  UnknownAction,
} from "@reduxjs/toolkit";
import userSlice from "./AuthSlice";
import categorySlice from "../Features/Masters/Category/categorySlice";
import ProductTypeSlice from "../Features/Masters/ProductType/productTypeSlice";
import ProductTypeAttributeSlice from "../Features/Mapping/ProductTypeAttribute/productTypeAttributeSlice";
import AttributeSlice from "../Features/Masters/Attribute/attributeSlice";
import AttributeValuesSlice from "../Features/Masters/AttributeValues/attributeValuesSlice";
import { orderSlice } from "./OrderSlice";
import { packedOrderSlice } from "./packedOrderSlice";
import { deliverOrderSlice } from "./deliveredOrderSlice";
import { pendingOrderSlice } from "./pendingOrderSlice";
import { shippedOrderSlice } from "./shippedOrderSlice";
import { orderStatusSlice } from "@/Features/Masters/OrderStatus/orderStatusSlice";
import { productSlice } from "./ProductSlice";
import { collectionSlice } from "@/Features/Collections/collectionSlice";
import { grpCompaniesSlice } from "@/app/grpCompaniesSlice";
import { sidebarSlice } from "@/components/sidebarManager/sidebarSlice";
import { companiesSlice } from "@/app/companySlice";
import { branchCompaniesSlice } from "@/app/branchCompanySlice";
import customerSlice from "./customerSlice";
import priceListSlice from "./priceListSlice";
import ledgerProductsSlice from "./ledgerProductsSlice";
import ledgerSheetSlice from './ledgerSheetSlice';

const reducers = {
  user: userSlice,
  category: categorySlice,
  products: ProductTypeSlice,
  productTypeAttribute: ProductTypeAttributeSlice,
  attribute: AttributeSlice,
  attributeValue: AttributeValuesSlice,
  order: orderSlice.reducer,
  orderStatus: orderStatusSlice.reducer,
  packedorder: packedOrderSlice.reducer,
  pendingOrder: pendingOrderSlice.reducer,
  deliverOrder: deliverOrderSlice.reducer,
  shippedOrder: shippedOrderSlice.reducer,
  product: productSlice.reducer,
  collection: collectionSlice.reducer,
  sidebarManager: sidebarSlice.reducer,
  grpCompanies: grpCompaniesSlice.reducer,
  companies: companiesSlice.reducer,
  branchCompanies: branchCompaniesSlice.reducer,
  customer: customerSlice,
  priceList: priceListSlice,
  ledgerProducts: ledgerProductsSlice,
  ledgerSheet: ledgerSheetSlice
};

const rootReducer = combineReducers(reducers);

export type RootState = ReturnType<typeof rootReducer>;

const resettableRootReducer: Reducer<RootState, UnknownAction> = (
  state,
  action
) => {
  if (action.type === "store/reset") {
    return rootReducer(undefined, action);
  }
  return rootReducer(state, action);
};

export const store = configureStore({
  reducer: resettableRootReducer,
});

// export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
