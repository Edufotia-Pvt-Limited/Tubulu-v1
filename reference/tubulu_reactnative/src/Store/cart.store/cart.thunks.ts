// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { Cart, CartItem } from "./cart.state";
// import { fetchCartAsync, addToCartAsync,updateCartQuantityAsync  } from "../../Utils/ApiActions";
// import { optimisticUpdateQuantity, rollbackQuantityUpdate } from "./Cart.slice";
// import { AppDispatch } from "../Store";


// // Fetch cart from API
// export const fetchCart = createAsyncThunk<
//   Cart, 
//   { integrationId: string; catalogueId: string }, 
//   { rejectValue: string } 
// >(
//   "cart/fetchCart",
//   async (
//     { integrationId, catalogueId },
//     { rejectWithValue }
//   ): Promise<Cart | ReturnType<typeof rejectWithValue>> => {
//     try {

//       const res = await fetchCartAsync(integrationId,catalogueId)
//       return {
//         integrationId,
//         catalogueId,
//         cart: res.items,
//         cartId: res.cartId,
//         totalQuantity: res.items.reduce((s: number, i: any) => s + i.quantity, 0),
//         totalPrice: res.totalPrice || 0,
//       };
//     } catch (err) {
//         console.log('fetchCart error:', err);
//       return rejectWithValue("Unable to fetch cart");
//     }
//   }
// );

// // 🔹 Add product to cart
// export const addToCart = createAsyncThunk<
//   Cart, 
//   { integrationId: string; catalogueId: string; productId: string }, 
//   { rejectValue: string }
// >(
//   "cart/addToCart",
//   async (
//     { integrationId, catalogueId, productId },
//     { rejectWithValue }
//   ): Promise<Cart | ReturnType<typeof rejectWithValue>> => {
//     try {
//       // const tokenRes = await getTokenPair();
//       // const token = tokenRes.authToken;

//       // await axios.post(
//       //   `http://10.0.2.2:3008/api/v1/cart/create`,
//       //   { integrationId, catalogueId, productId },
//       //   { headers: { Authorization: `${token}` } }
//       // );

//       // // fetch updated cart
//       // const res = await axios.get(
//       //   `http://10.0.2.2:3008/api/v1/cart/items/${integrationId}/${catalogueId}`,
//       //   { headers: { Authorization: `${token}` } }
//       // );

//       const res = await addToCartAsync(integrationId,catalogueId,productId)

//       console.log("add to cart thunk res",res.data)

//       return {
//         integrationId,
//         catalogueId,
//         cart: res.items,
//         cartId: res.cartId,
//         totalQuantity: res.items.reduce((s: number, i: any) => s + i.quantity, 0),
//         totalPrice: res.totalPrice || 0,
//       };
//     } catch {
//       return rejectWithValue("Unable to add to cart");
//     }
//   }
// );

// // 🔹 Update quantity (increase/decrease)
// // export const updateCartQuantity = createAsyncThunk<
// //   Cart,
// //   { integrationId: string; catalogueId: string; productId: string; isIncrease: boolean; currentQty: number },
// //   { rejectValue: string }
// // >(
// //   "cart/updateQuantity",
// //   async ({ integrationId, catalogueId, productId, isIncrease, currentQty }, { rejectWithValue }): Promise<Cart | ReturnType<typeof rejectWithValue> > => {
// //     try {

// //       const res = await updateCartQuantityAsync(integrationId,catalogueId,productId,isIncrease)
// //       return {
// //         integrationId,
// //         catalogueId,
// //         cart: res.items,
// //         cartId: res.cartId,
// //         totalQuantity: res.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
// //         totalPrice: res.totalPrice || 0,
// //       };
// //     } catch(err) {
// //       console.log("quantity err", err)
// //       return rejectWithValue("Unable to update quantity");
// //     }
// //   }
// // );


// export const updateCartQuantity = createAsyncThunk<
//   Cart,
//   { integrationId: string; catalogueId: string; productId: string; isIncrease: boolean; currentQty: number },
//   { rejectValue: string; dispatch: AppDispatch }
// >(
//   "cart/updateQuantity",
//   async ({ integrationId, catalogueId, productId, isIncrease, currentQty }, { rejectWithValue, dispatch }) => {
//     const newQty = isIncrease ? currentQty + 1 : Math.max(0, currentQty - 1);

//     // Optimistically update UI
//     dispatch(optimisticUpdateQuantity({ integrationId, catalogueId, productId, newQty }));

//     try {
//       const res = await updateCartQuantityAsync(integrationId, catalogueId, productId, isIncrease);
//       return {
//         integrationId,
//         catalogueId,
//         cart: res.items,
//         cartId: res.cartId,
//         totalQuantity: res.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
//         totalPrice: res.totalPrice || 0,
//       };
//     } catch (err) {
//       // Rollback UI to old quantity + show error
//       dispatch(
//         rollbackQuantityUpdate({
//           integrationId,
//           catalogueId,
//           productId,
//           oldQty: currentQty,
//           error: "Failed to update quantity. Please try again.",
//         })
//       );
//       return rejectWithValue("Unable to update quantity");
//     }
//   }
// );



import { createAsyncThunk } from "@reduxjs/toolkit";
import { Cart } from "./cart.state";
import {
  fetchCartAsync,
  addToCartAsync,
  updateCartQuantityAsync,
} from "../../Utils/ApiActions";
import {
  incrementQtyOptimistic,
  decrementQtyOptimistic,
  setSyncSuccess,
  setSyncError,
} from "./Cart.slice";
import type { AppDispatch } from "../../Store/Store";

export const fetchCart = createAsyncThunk<
  Cart,
  { integrationId: string; catalogueId: string },
  { rejectValue: string }
>(
  "cart/fetchCart",
  async ({ integrationId, catalogueId }, { rejectWithValue }) => {
    try {
      console.log("Fetching cart for thunk:", integrationId, catalogueId);
      const res = await fetchCartAsync(integrationId, catalogueId);
      console.log("cart res------------------", res)
      return {
        integrationId,
        catalogueId,
        cart: res.items,
        cartId: res.cartId,
        deliveryType: res.deliveryType,
        taxes : res.taxes,
         itemsTotal : res.itemsTotal,
          billPrice : res.billPrice,
        deals : res.deals,
        totalQuantity: res.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
        totalPrice: res.totalPrice || 0,
        totalSaved : res.totalSaved
      };
    } catch (err) {
      console.error("fetchCart error:", err);
      return rejectWithValue("Unable to fetch cart");
    }
  }
);

// export const addToCart = createAsyncThunk<
//   Cart,
//   { integrationId: string; catalogueId: string; productId: string },
//   { rejectValue: string }
// >(
//   "cart/addToCart",
//   async ({ integrationId, catalogueId, productId }, { rejectWithValue }) => {
//     try {
//       const res = await addToCartAsync(integrationId, catalogueId, productId);
//       return {
//         integrationId,
//         catalogueId,
//         cart: res.items,
//         cartId: res.cartId,
//         totalQuantity: res.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
//         totalPrice: res.totalPrice || 0,
//       };
//     } catch (err) {
//       console.error("addToCart error:", err);
//       return rejectWithValue("Unable to add to cart");
//     }
//   }
// );

export const addToCart = createAsyncThunk<
  Cart,
  {
    integrationId: string;
    catalogueId: string;
    productId: string;
    customizationId?: string;           
    quantity?: number;  
    specialRequest?: string;              
    selectedOptions?: {               
      optionId: string;
      selectedChoices: string[];
    }[];
  },
  { rejectValue: string }
>(
  "cart/addToCart",
  async (
    {
      integrationId,
      catalogueId,
      productId,
      customizationId,
      quantity = 1,
      selectedOptions = [],
         specialRequest,
    },
    { rejectWithValue }
  ) => {
    try {
      // Adjust your backend API to accept and handle the new fields

      console.log("Adding to cart with options:" ,integrationId,
      catalogueId,
      productId,)

      const res = await addToCartAsync(
        integrationId,
        catalogueId,
        productId,
        customizationId,
        quantity,
        selectedOptions,
        specialRequest
      );
      return {
        integrationId,
        catalogueId,
        cart: res.items,
        cartId: res.cartId,
         deliveryType: res.deliveryType,
        deals : res.deals,
          taxes : res.taxes,
         itemsTotal : res.itemsTotal,
         totalSaved : res.totalSaved,
           billPrice : res.billPrice,
        totalQuantity: res.items.reduce(
          (s: number, i: { quantity: number }) => s + i.quantity,
          0
        ),
        totalPrice: res.totalPrice || 0,
      };
    } catch (err) {
      console.error("addToCart error:", err);
      return rejectWithValue("Unable to add to cart");
    }
  }
);


export const updateCartQuantity = createAsyncThunk<
  Cart,
  {
    integrationId: string;
    catalogueId: string;
    productId: string;
    isIncrease: boolean;
    currentQty: number;
    isItemId: boolean
  },
  { rejectValue: string; dispatch: AppDispatch }
>(
  "cart/updateQuantity",
  async (args, { rejectWithValue, dispatch }) => {
    const { integrationId, catalogueId, productId, isIncrease, currentQty, isItemId } =
      args;
    const oldQty = currentQty;

    // Optimistic update locally
    if (isIncrease) {
      dispatch(incrementQtyOptimistic({ integrationId, catalogueId, productId, }));
    } else {
      dispatch(decrementQtyOptimistic({ integrationId, catalogueId, productId, }));
    }

    // Optionally introduce a short delay to batch fast changes
    // await new Promise(res => setTimeout(res, 100)); // 100ms delay (adjust as needed)

    console.log("qty qty",integrationId,catalogueId,productId,isIncrease,currentQty)

    try {
      const res = await updateCartQuantityAsync(
        integrationId,
        catalogueId,
        productId,
        isIncrease,
        isItemId,
      );

      console.log("update qty", res)
      const updatedCart: Cart = {
        integrationId,
        catalogueId,
        cart: res.items,
        cartId: res.cartId,
        deliveryType: res.deliveryType,
          taxes : res.taxes,
         itemsTotal : res.itemsTotal,
         totalSaved : res.totalSaved,
            billPrice : res.billPrice,
        deals : res.deals,
        totalQuantity: res.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
        totalPrice: res.totalPrice || 0,
      };

      // Dispatch success — replace cart from server
      dispatch(
        setSyncSuccess({
          integrationId,
          catalogueId,
          productId,
          updatedCart,
        })
      );

      return updatedCart;
    } catch (err) {
      console.error("update quantity error:", err);
      dispatch(
        setSyncError({
          integrationId,
          catalogueId,
          productId,
          oldQty,
          error: "Unable to update. Tap to retry.",
        })
      );
      return rejectWithValue("Unable to update quantity");
    }
  }
);
