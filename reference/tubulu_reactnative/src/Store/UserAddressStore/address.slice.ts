
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AddressState, defaultAddressState, Address } from "./address.state";
import { addAddress, getAddress } from "./userAddress.thunks";

const addressSlice = createSlice({
  name: "address",
  initialState: defaultAddressState,
  reducers: {
    clearError: (state) => {
      state.error = undefined;
    },

    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.map(addr => ({
        ...addr,
        isDefault: addr._id === action.payload
      }));
    },
  },
  extraReducers: (builder) => {
    // Add Address
    builder.addCase(addAddress.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(addAddress.fulfilled, (state, action: PayloadAction<Address>) => {
      state.loading = false;
      state.addresses.push(action.payload); // add new address to array
    });
    builder.addCase(addAddress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "Failed to add address";
    });

    // Get Address
    builder.addCase(getAddress.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(getAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
      state.loading = false;
      state.addresses = action.payload; // store as array directly
    });
    builder.addCase(getAddress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "Failed to fetch addresses";
    });
  },
});

export const { clearError, setDefaultAddress } = addressSlice.actions;
export default addressSlice.reducer;
