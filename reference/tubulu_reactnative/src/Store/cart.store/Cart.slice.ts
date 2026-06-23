
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { defaultCartState, ICartState, Cart } from "./cart.state";
// import { fetchCart, addToCart, updateCartQuantity } from "./cart.thunks";

// const cartSlice = createSlice({
//   name: "cart",
//   initialState: defaultCartState,
//   reducers: {
//     setActiveIntegration(state, action: PayloadAction<string>) {
//       state.activeIntegrationId = action.payload;
//     },
//     clearCart(state, action: PayloadAction<{ integrationId: string; catalogueId: string }>) {
//       const key = `${action.payload.integrationId}:${action.payload.catalogueId}`;
//       delete state.carts[key];
//     },
//   },
//   extraReducers: (builder) => {
//     builder.addCase(fetchCart.pending, (state) => {
//       state.loading = true;
//       state.error = undefined;
//     });
//     builder.addCase(fetchCart.fulfilled, (state, action) => {
//       state.loading = false;
//       const cart = action.payload;
//       const key = `${cart.integrationId}:${cart.catalogueId}`;
//       state.carts[key] = cart;
//     });
//     builder.addCase(fetchCart.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     });

//     builder.addCase(addToCart.fulfilled, (state, action) => {
//       const cart = action.payload;
//       const key = `${cart.integrationId}:${cart.catalogueId}`;
//       state.carts[key] = cart;
//     });

//     builder.addCase(updateCartQuantity.fulfilled, (state, action) => {
//       const cart = action.payload;
//       const key = `${cart.integrationId}:${cart.catalogueId}`;
//       state.carts[key] = cart;
//     });
//   },
// });

// export const { setActiveIntegration, clearCart } = cartSlice.actions;
// export default cartSlice.reducer;


// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { defaultCartState, ICartState, Cart } from "./cart.state";
// import { fetchCart, addToCart, updateCartQuantity } from "./cart.thunks";

// const cartSlice = createSlice({
//   name: "cart",
//   initialState: defaultCartState,
//   reducers: {
//     setActiveIntegration(state, action: PayloadAction<string>) {
//       state.activeIntegrationId = action.payload;
//     },
//     clearCart(state, action: PayloadAction<{ integrationId: string; catalogueId: string }>) {
//       const key = `${action.payload.integrationId}:${action.payload.catalogueId}`;
//       delete state.carts[key];
//     },

//     optimisticUpdateQuantity(state, action: PayloadAction<{ integrationId: string; catalogueId: string; productId: string; newQty: number }>) {
//       const { integrationId, catalogueId, productId, newQty } = action.payload;
//       const key = `${integrationId}:${catalogueId}`;
//       const cart = state.carts[key];
//       if (cart) {
//         const item = cart.cart.find(i => i.productId === productId);
//         if (item) {
//           item.quantity = newQty;
//           item.syncing = true;
//           item.syncError = undefined;
//         }
//         cart.totalQuantity = cart.cart.reduce((sum, i) => sum + i.quantity, 0);
//         cart.totalPrice = cart.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
//       }
//     },

//     rollbackQuantityUpdate(state, action: PayloadAction<{ integrationId: string; catalogueId: string; productId: string; oldQty: number; error: string }>) {
//       const { integrationId, catalogueId, productId, oldQty, error } = action.payload;
//       const key = `${integrationId}:${catalogueId}`;
//       const cart = state.carts[key];
//       if (cart) {
//         const item = cart.cart.find(i => i.productId === productId);
//         if (item) {
//           item.quantity = oldQty;
//           item.syncing = false;
//           item.syncError = error;
//         }
//         cart.totalQuantity = cart.cart.reduce((sum, i) => sum + i.quantity, 0);
//         cart.totalPrice = cart.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
//       }
//     },

//     clearSyncFlags(state, action: PayloadAction<{ integrationId: string; catalogueId: string; productId: string }>) {
//       const { integrationId, catalogueId, productId } = action.payload;
//       const key = `${integrationId}:${catalogueId}`;
//       const cart = state.carts[key];
//       if (cart) {
//         const item = cart.cart.find(i => i.productId === productId);
//         if (item) {
//           item.syncing = false;
//           item.syncError = undefined;
//         }
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder.addCase(fetchCart.pending, (state) => {
//       state.loading = true;
//       state.error = undefined;
//     });
//     builder.addCase(fetchCart.fulfilled, (state, action) => {
//       state.loading = false;
//       const cart = action.payload;
//       const key = `${cart.integrationId}:${cart.catalogueId}`;
//       state.carts[key] = cart;
//     });
//     builder.addCase(fetchCart.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     });

//     builder.addCase(addToCart.fulfilled, (state, action) => {
//       const cart = action.payload;
//       const key = `${cart.integrationId}:${cart.catalogueId}`;
//       state.carts[key] = cart;
//     });

//     builder.addCase(updateCartQuantity.fulfilled, (state, action) => {
//       const cart = action.payload;
//       const key = `${cart.integrationId}:${cart.catalogueId}`;
//       state.carts[key] = cart;

//       // Clear syncing flags after success
//       cart.cart.forEach(item => {
//         item.syncing = false;
//         item.syncError = undefined;
//       });
//     });

//     builder.addCase(updateCartQuantity.rejected, (state, action) => {
//       // The rollback logic is handled inside thunk via dispatch, so no need here
//     });
//   },
// });

// export const { setActiveIntegration, clearCart, optimisticUpdateQuantity, rollbackQuantityUpdate, clearSyncFlags } = cartSlice.actions;
// export default cartSlice.reducer;



import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultCartState, ICartState, Cart, CartItem } from "./cart.state";
import { fetchCart, addToCart, updateCartQuantity } from "./cart.thunks";

interface OptimisticQtyPayload {
  integrationId: string;
  catalogueId: string;
  productId: string;
}

interface OptimisticUpdateQtyPayload extends OptimisticQtyPayload {
  newQty: number;
}

interface RollbackPayload extends OptimisticQtyPayload {
  oldQty: number;
  error: string;
}

interface SyncSuccessPayload extends OptimisticQtyPayload {
  updatedCart: Cart;
}

const cartSlice = createSlice({
  name: "cart",
  initialState: defaultCartState,
  reducers: {
    setActiveIntegration(state, action: PayloadAction<string>) {
      state.activeIntegrationId = action.payload;
    },
    clearCart(
      state,
      action: PayloadAction<{ integrationId: string; catalogueId: string }>
    ) {
      const key = `${action.payload.integrationId}:${action.payload.catalogueId}`;
      delete state.carts[key];
    },

    // Immediately update local quantity (optimistic)
    incrementQtyOptimistic(
      state,
      action: PayloadAction<OptimisticQtyPayload>
    ) {
      const { integrationId, catalogueId, productId } = action.payload;
      const key = `${integrationId}:${catalogueId}`;
      const cart = state.carts[key];
      if (!cart) return;

      const item = cart.cart.find((i) => i.productId === productId);
      if (item) {
        item.quantity += 1;
        item.syncing = true;
        item.syncError = undefined;
      }
      // Recompute totals
      cart.totalQuantity = cart.cart.reduce((sum, i) => sum + i.quantity, 0);
      cart.totalPrice = cart.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    },

    decrementQtyOptimistic(
      state,
      action: PayloadAction<OptimisticQtyPayload>
    ) {
      const { integrationId, catalogueId, productId } = action.payload;
      const key = `${integrationId}:${catalogueId}`;
      const cart = state.carts[key];
      if (!cart) return;

      const item = cart.cart.find((i) => i.productId === productId);
      if (item && item.quantity > 0) {
        item.quantity -= 1;
        item.syncing = true;
        item.syncError = undefined;
      }
      cart.totalQuantity = cart.cart.reduce((sum, i) => sum + i.quantity, 0);
      cart.totalPrice = cart.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    },

    // Called when backend sync succeeds — replace cart from server
    setSyncSuccess(
      state,
      action: PayloadAction<SyncSuccessPayload>
    ) {
      const { integrationId, catalogueId, updatedCart } = action.payload;
      const key = `${integrationId}:${catalogueId}`;
      state.carts[key] = updatedCart;
    },

    // Called when backend sync fails — rollback local change, set error
    setSyncError(
      state,
      action: PayloadAction<RollbackPayload>
    ) {
      const { integrationId, catalogueId, productId, oldQty, error } =
        action.payload;
      const key = `${integrationId}:${catalogueId}`;
      const cart = state.carts[key];
      if (!cart) return;

      const item = cart.cart.find((i) => i.productId === productId);
      if (item) {
        item.quantity = oldQty;
        item.syncing = false;
        item.syncError = error;
      }
      cart.totalQuantity = cart.cart.reduce((sum, i) => sum + i.quantity, 0);
      cart.totalPrice = cart.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      const cart = action.payload;
      const key = `${cart.integrationId}:${cart.catalogueId}`;
      state.carts[key] = cart;
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(addToCart.fulfilled, (state, action) => {
      const cart = action.payload;
      const key = `${cart.integrationId}:${cart.catalogueId}`;
      state.carts[key] = cart;
    });

    builder.addCase(updateCartQuantity.fulfilled, (state, action) => {
      const cart = action.payload;
      const key = `${cart.integrationId}:${cart.catalogueId}`;
      state.carts[key] = cart;
    });

    builder.addCase(updateCartQuantity.rejected, (state, action) => {
      // We handle rollback inside thunk using `dispatch(setSyncError(...))`
      state.error = state.error || action.payload;
    });
  },
});

export const {
  setActiveIntegration,
  clearCart,
  incrementQtyOptimistic,
  decrementQtyOptimistic,
  setSyncSuccess,
  setSyncError,
} = cartSlice.actions;

export default cartSlice.reducer;
