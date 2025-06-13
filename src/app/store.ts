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
import { inventorySlice } from "./inventorySlice";
import { orderSlice } from "./OrderSlice";
import { packedOrderSlice } from "./packedOrderSlice";
import { deliverOrderSlice } from "./deliveredOrderSlice";
import { pendingOrderSlice } from "./pendingOrderSlice";
import { shippedOrderSlice } from "./shippedOrderSlice";
import { orderStatusSlice } from "@/Features/Masters/OrderStatus/orderStatusSlice";
import { returnSlice } from "./ReturnSlice";
import { exchangeSlice } from "./ExchangeSlice";
import { productSlice } from "./ProductSlice";
import { collectionSlice } from "@/Features/Collections/collectionSlice";
import { discountSlice } from "./DiscountSlice";
import { promoSlice } from "./PromoSlice";
import { offerSlice } from "./OfferSlice";

const reducers = {
  user: userSlice,
  category: categorySlice,
  products: ProductTypeSlice,
  productTypeAttribute: ProductTypeAttributeSlice,
  attribute: AttributeSlice,
  attributeValue: AttributeValuesSlice,
  inventory: inventorySlice.reducer,
  order: orderSlice.reducer,
  orderStatus: orderStatusSlice.reducer,
  return: returnSlice.reducer,
  exchange: exchangeSlice.reducer,
  packedorder: packedOrderSlice.reducer,
  pendingOrder: pendingOrderSlice.reducer,
  deliverOrder: deliverOrderSlice.reducer,
  shippedOrder: shippedOrderSlice.reducer,
  product: productSlice.reducer,
  collection: collectionSlice.reducer,
  discount: discountSlice.reducer,
  promo: promoSlice.reducer,
  offer: offerSlice.reducer,
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
