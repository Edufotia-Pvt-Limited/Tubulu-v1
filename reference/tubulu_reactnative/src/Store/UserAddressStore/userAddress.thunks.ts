import { createAsyncThunk } from "@reduxjs/toolkit";
import { Address, UserAddresses } from "./address.state";
import { addDeliveryAddress, fetchUserAddress } from "../../Utils/ApiActions";

export const addAddress = createAsyncThunk<
  Address,       
  Address,  
  { rejectValue: string }
>("address/addAddress", async (address, { rejectWithValue }) => {
  try {
    const res: Address = await addDeliveryAddress(address);
    return res;
  } catch (err) {
    console.error("addAddress error:", err);
    return rejectWithValue("Unable to add address");
  }
});


export const getAddress = createAsyncThunk<
  Address[],      
  string | undefined, 
  { rejectValue: string }
>("address/getAddress", async (query, { rejectWithValue }) => {
  try {
    const res = await fetchUserAddress(query);
    console.log("fetch add res", res);
    return res;
  } catch (err) {
    console.error("getAddress error:", err);
    return rejectWithValue("Unable to fetch addresses");
  }
});

