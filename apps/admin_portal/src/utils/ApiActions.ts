import axios, { AxiosRequestConfig } from 'axios';
import { HOST_API } from 'src/config-global';
import { AdvertisementPayload } from 'src/components/advertisement/modal/advertisement-modal';
import { Advertisement } from 'src/pages/dashboard/advertisement';
import { CustomizationPayload, Option } from 'src/types/customization';
import { Deal } from 'src/types/deals';

export interface IVerifyCodeResponse {
    authToken: string;
    refreshToken: string;
    phoneNumber: string;
    role?: 'super_admin' | 'merchant_admin' | 'user';
    isOnboarded?: boolean;
    isDocumentsUploaded?: boolean;
    isTubuluAppSetupDone?: boolean;
}

export const baseUrl = `${HOST_API}/api/v1`;

export interface ICustomApiResponse<T> {
    success: boolean;
    data?: T;
}

export function storeLoginDetails(data: IVerifyCodeResponse) {
    localStorage.setItem('tubulu_session', JSON.stringify(data));
}

export function getSessionDetails(): IVerifyCodeResponse | undefined {
    const data = localStorage.getItem('tubulu_session');
    return data ? JSON.parse(data) : undefined;
}

export function VerifyPhoneNumber(phoneNumber: string): Promise<void> {
    return axios.post(`${baseUrl}/integrations/verifyIntegrationPhoneNumber`, { phoneNumber });
}

export async function VerifyIntegrationCode(phoneNumber: string, code: string): Promise<IVerifyCodeResponse | undefined> {
    const response = await axios.post<ICustomApiResponse<IVerifyCodeResponse>>(`${baseUrl}/integrations/confirmIntegrationPhoneAndCode`, { phoneNumber, code });
    return response.data?.data;
}

export async function AdminLogin(username: string, password: string): Promise<IVerifyCodeResponse | undefined> {
    const response = await axios.post<ICustomApiResponse<IVerifyCodeResponse>>(`${baseUrl}/integrations/admin/login`, { username, password });
    return response.data?.data;
}

export async function OnboardIntegration(reqBody: any): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/update/unregisteredIntegration`,
        data: reqBody,
        method: 'POST',
    });
    return true
}

export async function updateIntegrationDocuments(reqBody: any): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/unregisteredIntegration/documents`,
        data: reqBody,
        method: 'POST',
    });
    return true;
}

export async function createIntegration(reqBody: any): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/unregisteredIntegration/createIntegration`,
        data: reqBody,
        method: 'POST'
    });
    return true;
}

export async function serverCallWithToken<T>(config: AxiosRequestConfig<T>) {
    const token = getSessionDetails()?.authToken;
    if (!token) {
        window.location.href = '/';
        throw new Error('Token not found');
    } else {
        const prefixed = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers = config.headers ? { ...config.headers, authorization: prefixed } : { authorization: prefixed };
        return axios(config);
    }
}

export async function addContactIntegration(reqBody: any): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/new-phonebook`,
        data: reqBody,
        method: 'POST',
    });
    return true
}

export async function getAllContactsIntegration() {
    const response: any = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/all-phonebook`,
        method: 'GET',
    });
    return response;
}

export async function getUserDetailsFromPhoneNumber(reqBody: any) {
    const response: any = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/phone-book-phone-details`,
        data: reqBody,
        method: 'POST',
    });
    return response;
}

export async function deleteContactIntegration(id: string) {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/delete-phone-book/${id}`,
        method: 'DELETE'
    });
    return true;
}

export async function editContactIntegration(reqBody: any, id: string): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/update-phonebook/${id}`,
        data: reqBody,
        method: 'POST',
    });
    return true
}

export async function importPhoneBookContacts(reqBody: any): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/phoneBookGroup/import`,
        data: reqBody,
        method: 'POST'
    });
    return true;
}

export async function addGroupIntegration(reqBody: any): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/phoneBookGroup/new`,
        data: reqBody,
        method: 'POST',
    });
    return true
}

export async function getAllGroupsIntegration() {
    const response: any = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/phoneBookGroup/all`,
        method: 'GET',
    });
    return response;
}

export async function editGroupIntegration(reqBody: any, id: string): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/phoneBookGroup/update/${id}`,
        data: reqBody,
        method: 'POST',
    });
    return true
}


export async function deleteGroupIntegration(groupId: string): Promise<boolean> {
  await serverCallWithToken<ICustomApiResponse<boolean>>({
    url: `${baseUrl}/integrations/phoneBookGroup/delete/${groupId}`,
    method: 'DELETE',
  });
  return true;
}




export async function getAllQRCategories() {
    const response: any = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/qrcode/allCategories`,
        method: 'GET',
    });
    return response
}

export async function addNewQRCategory(reqBody: any): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/qrcode/newCategory`,
        data: reqBody,
        method: 'POST'
    });
    return true;
}

export async function getAllQRCodes() {
    const response: any = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/qrcode/all`,
        method: 'GET'
    })
    return response;
}

export async function addNewQRCode(reqBody: any) {
    const response = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/qrcode/newQRCode`,
        data: reqBody,
        method: 'POST'
    });
    return response?.data;
}

export async function editQRCode(reqBody: any, id: string) {
    const response = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/qrcode/updateQRCode/${id}`,
        data: reqBody,
        method: 'POST'
    });
    return response?.data;
}

export async function deleteQRCode(id: string) {
    const response = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/qrcode/remove/byId/${id}`,
        method: 'DELETE'
    });
    return response;
}

export async function getAllTemplates(search = "") {
    const response: any = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/campaign/allTemplates?search=${encodeURIComponent(search)}`,
        method: 'GET'
    });
    return response;
}

export async function addNewTemplate(reqBody: any): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/campaign/newTemplate`,
        data: reqBody,
        method: 'POST'
    })
    return true;
}

export async function editNewTemplate(reqBody: any, id: string): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/campaign/updateTemplate/${id}`,
        data: reqBody,
        method: 'PUT'
    });
    return true;
}

export async function removeTemplate(id: string): Promise<boolean> {
    await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/campaign/deleteTemplate/${id}`,
        method: 'GET',
    });
    return true;
}

export async function getAllCampaigns() {
    const response: any = await serverCallWithToken<ICustomApiResponse<unknown>>({
        url: `${baseUrl}/campaign/allCampaigns`,
        method: 'GET'
    });
    return response;
}

export async function addNewCampaign(reqBody: any) {
    const response: any = await serverCallWithToken<ICustomApiResponse<unknown>>({
        url: `${baseUrl}/campaign/newCampaign`,
        method: 'POST',
        data: reqBody,
    });
    return response;
}

export async function removeCampaign(id: string) {
    const response: any = await serverCallWithToken<ICustomApiResponse<unknown>>({
        url: `${baseUrl}/campaign/cancelCampaign/${id}`,
        method: 'GET'
    });
    return response;
}

export async function deleteCampaign(id: string) {
    const response: any = await serverCallWithToken<ICustomApiResponse<unknown>>({
        url: `${baseUrl}/campaign/deleteCampaign/${id}`,
        method: 'GET'
    });
    return response;
}

export async function getDashboardData(duration: string = 'all') {
    const response: any = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/dashboard/stats?duration=${duration}`,
        method: 'GET'
    });
    return response;
}

export async function getMyBranches() {
    const response: any = await serverCallWithToken<ICustomApiResponse<any>>({
        url: `${baseUrl}/integrations/branch/all`,
        method: 'GET'
    });
    return response;
}

export async function createBranch(data: any) {
    const response: any = await serverCallWithToken<ICustomApiResponse<any>>({
        url: `${baseUrl}/integrations/branch/create`,
        method: 'POST',
        data
    });
    return response;
}

export async function deleteBranch(branchId: string) {
    const response: any = await serverCallWithToken<ICustomApiResponse<any>>({
        url: `${baseUrl}/integrations/branch/delete/${branchId}`,
        method: 'DELETE'
    });
    return response;
}

export async function getSuperAdminStats() {
    const response: any = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/admin/stats`,
        method: 'GET'
    });
    return response;
}

export async function getScopedAdminStats() {
    const response: any = await serverCallWithToken<ICustomApiResponse<any>>({
        url: `${baseUrl}/admin/stats`,
        method: 'GET'
    });
    return response;
}

export async function getProfileDetails() {
    const response: any = await serverCallWithToken<ICustomApiResponse<boolean>>({
        url: `${baseUrl}/integrations/myDetails`,
        method: 'GET'
    });
    return response;
}

export async function updateProfileDetails(reqBody: any) {
    const response: any = await serverCallWithToken<ICustomApiResponse<unknown>>({
        url: `${baseUrl}/integrations/update/unregisteredIntegration`,
        method: 'POST',
        data: reqBody,
    });
    return response;
}

export async function updateProfileLogo(reqBody: any) {
    const response: any = await serverCallWithToken<ICustomApiResponse<unknown>>({
        url: `${baseUrl}/integrations/updateProfilePic`,
        method: 'POST',
        data: reqBody,
    });
    return response;
}

export function fetchDocument(documentUrl: string) {
    return new Promise<Response>((resolve, reject) => {
        fetch(documentUrl).then((response: Response) => {
            resolve(response);
        }).catch((error: Error) => {
            reject(error);
        })
    })
}

export async function fetchCategories() {
    const response: any = await serverCallWithToken<ICustomApiResponse<unknown>>({
        url: `${baseUrl}/categories/integration-all`,
        method: 'GET'
    });
    return response;
}



export async function addNewCatalogue(reqBody: FormData) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/catalogue/upload-catalogue`,
    method: 'POST',
    data: reqBody,
  });

  return response.data ;
}


export async function createManualCatalogue(reqBody: { name: string; description: string; displayType?: string }) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/catalogue/create-catalogue`,
    method: 'POST',
    data: reqBody,
  });

  return response.data;
}

export async function getAllCatalogues(
  status = "all",
  search = "",
  page = 1,
  limit = 5
) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/catalogue/catalogues?status=${status}&search=${search}&page=${page}&limit=${limit}`,
    method: "GET",
  });

  return response.data.data;

}

export async function updateCatalogue(
  catalogueId: string,
  formData: FormData
) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/catalogue/update-catalogue/${catalogueId}`,
    method: 'PUT',
    data: formData,
  });

  return response.data;
}

export async function deleteCatalogue(catalogueId: string) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/catalogue/${catalogueId}`,
    method: 'DELETE',
  });

  return response.data;
}

export async function updateCatalogueStatus(
  catalogueId: string,
  isActive: boolean
) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/catalogue/update-status`,
    method: "POST",
    data: { catalogueId, isActive }, 
  });

  return response.data;
}


export async function searchProductsApi(catalogueId: string, query: string = "", page: number = 1, limit: number = 10) {
  const url = `${baseUrl}/products/search/${catalogueId}?page=${page}&limit=${limit}${query ? `&query=${encodeURIComponent(query)}` : ""}`;

  const response = await serverCallWithToken<any>({
    url,
    method: "GET",
  });

  return response.data; 
}



export async function deleteProduct(deleteId:string){
    const response =  await  serverCallWithToken<any>({
        url: `${baseUrl}/products/delete/${deleteId}`,
        method:"DELETE"
    });
    response.data;
}



export async function addNewCatalogueProduct(
  reqBody: FormData,
 catalogueId?: string
) {

  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/products/create/${catalogueId}`,
    method: "POST",
    data: reqBody,
  });

  return response.data;
}



export async function editCatalogueProduct(
  reqBody: FormData,
 productId?: string,
 catalogueId?:string
) {


  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/products/edit/${productId}/${catalogueId}`,
    method: "PUT",
    data: reqBody,
  });

  return response.data;
}


// Fetch product details
export async function fetchProductDetails(productId: string, catalogueId:string) {


  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/products/single/${productId}/${catalogueId}`,
    method: "GET",
  });

  return response.data;
}

export async function updateProductStatus(catalogueId:string,productId: string,isActive:boolean ) {


  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/products/toggle-active/${catalogueId}/${productId}`,
    method: "PATCH",
     data: { isActive }, 
  });

  return response.data;
}

export async function getAllOrders(query?: { 
  status?: string; 
  search?: string; 
  page?: number; 
  limit?: number 
}) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/orders/all`,
    method: "GET",
    params: query,
  });
  return response.data;
}



export async function updateOrderStatus(
  orderId: string,
  status:string,
) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/orders/update-order-status`,
    method: "PUT",
    data: { orderId, status }, 
  });
  return response.data;
}


export async function getCustomersSummary(query?: { 
  search?: string; 
  page?: number; 
  limit?: number; 
  lastOrderDate?: string; // new optional date filter
}) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/customer/get-customer`,
    method: "GET",
    params: query, // search, page, limit, lastOrderDate will all go to backend
  });
  return response.data;
}



export async function getAllCustomerOrder(
  userId: string,
  query?: { status?: string; search?: string; page?: number; limit?: number }
) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/customer/get-customer-orders/${userId}`,
    method: "GET",
    params: query, 
  });
  console.log(response)
  return response.data; 
}

export async function updateCustomer(userId: string, firstName: string, lastName: string) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/customer/update-customer`,
    method: 'PUT',
    data: { userId, firstName, lastName }
  });
  return response.data;
}

export async function addCustomerCredits(userId: string, amount: number) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/customer/add-credits`,
    method: 'POST',
    data: { userId, amount }
  });
  return response.data;
}

export async function createCustomization(reqBody: any) {
    const response = await serverCallWithToken<any>({
        url: `${baseUrl}/customization/create`,
        method: "POST",
        data: reqBody,
    });
    return response.data;
}


export async function getCustomization(search = "", page = 1) {
  return await serverCallWithToken({
    url: `${baseUrl}/customization/all?search=${search}&page=${page}`,
    method: "GET",
  });
}


export async function deleteCustomization(deleteId:string){
    const response =  await  serverCallWithToken<any>({
        url: `${baseUrl}/customization/delete/${deleteId}`,
        method:"DELETE"
    });
    response.data;
}

export async function editCustomization(editId: string, payload: CustomizationPayload) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/customization/edit/${editId}`,
    method: "PUT",
    data: payload, // ✅ send updated data
  });

  return response.data;
}


export const updateCustomizationStatus = async (customizationId: string, isActive: boolean) => {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/customization/update-status`,
    method: "PUT",
    data: { customizationId, isActive },
  });

  return response.data;
};


export async function getApplyCustomizationDetails(customizationId: string) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/customization/get/apply/${customizationId}`,
    method: "GET",
  });

  return response.data;
}



export async function applyCustomizationApi(
  customizationId: string,
  productIds: string[],
  catalogueId: string,
  removedProductIds: string[]
) {
  const response = await serverCallWithToken<any>({
    url:`${baseUrl}/customization/apply`,
    method: "POST",
    data: { customizationId, productIds, catalogueId, removedProductIds },
  });

  return response.data;
}

export async function getCustomizationOptions(customizationId: string) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/customization/options/all/${customizationId}`,
    method: "GET",
  });

  return response.data;
}


export async function deleteCustomizationOption(customizationId:string,optionId:string){
    const response =  await  serverCallWithToken<any>({
        url: `${baseUrl}/customization/options/delete/${customizationId}/${optionId}`,
        method:"DELETE"
    });
    response.data;
}


export async function addNewOption(reqBody:any,customizationId:string) {
    const response = await serverCallWithToken<any>({
        url: `${baseUrl}/customization/options/add/${customizationId}`,
        method: "POST",
        data: reqBody,
    });
    return response.data;
}

export async function searchProductsForCustomization(
  catalogueId: string,
  query: string = "",
  page: number = 1,
  limit: number = 5,
  customizationId?: string,
) {
 const url = `${baseUrl}/customization/search-products/${catalogueId}/${customizationId}?page=${page}&limit=${limit}${
    query ? `&query=${encodeURIComponent(query)}` : ""
  }`;
  const response = await serverCallWithToken<any>({ url, method: "GET" });
  return response.data.data;
}



export async function editCustomizationOption
(optionId: string,customizationId:string, payload: Option) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/customization/options/edit/${customizationId}/${optionId}`,
    method: "PUT",
    data: payload, // ✅ send updated data
  });

  return response.data;
}

export const updateCustomizationOptionStatus = async (customizationId: string,optionId:string, isActive: boolean) => {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/customization/options/update-status`,
    method: "PUT",
    data: { customizationId, optionId,isActive },
  });

  return response.data;
};


export async function createDeal(reqBody: Deal) {
    const response = await serverCallWithToken<any>({
        url: `${baseUrl}/deal/create`,
        method: "POST",
        data: reqBody,
    });
    return response.data;
}

export async function getDeals(page: number = 1, search: string = "") {
  return await serverCallWithToken({
    url: `${baseUrl}/deal/get-deals?page=${page}&search=${search}`,
    method: "GET",
  });
}
export async function deleteDeal(deleteId:string){
    const response =  await  serverCallWithToken<any>({
        url: `${baseUrl}/deal/delete/${deleteId}`,
        method:"DELETE"
    });
    response.data;
}


export async function updateDeal(dealId: string, payload: Deal) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/deal/edit/${dealId}`,
    method: "PATCH",
    data: payload, 
  });

  return response.data;
}


export const updateDealStatus = async (dealId: string, isActive: boolean) => {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/deal/update-status`,
    method: "PUT",
    data: { dealId, isActive },
  });

  return response.data;
};


export async function updateDealOfTheDayStatus(dealId:string, isDealOfTheDay: boolean) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/deal/update-dod-status`, 
    method: "PUT",
    data: {dealId,isDealOfTheDay}, 
  });

  return response.data;
}



export async function createAdvertisement(reqBody: FormData,) {
    const response = await serverCallWithToken<any>({
        url: `${baseUrl}/advertisement/create`,
        method: "POST",
        data: reqBody,
    });
    return response.data;
}

export async function getAllAdvertisements(page = 1, search = "") {
  const response = await serverCallWithToken({
    url: `${baseUrl}/advertisement/all?search=${search}&page=${page}`,
    method: "GET",
  });

  return response.data.data; // <-- FIX
}


export async function deleteAdvertisement(deleteId:string){
    const response =  await  serverCallWithToken<any>({
        url: `${baseUrl}/advertisement/delete/${deleteId}`,
        method:"DELETE"
    });
    response.data;
}


export const updateAdvertisementStatus = async(advertisementId: string, isActive: boolean) => {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/advertisement/update-status/${advertisementId}`,
    method: "PATCH",
    data: { isActive },
  });

  return response.data;
};


export async function updateAdvertisement(advertisementId: string, reqBody: FormData) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/advertisement/edit/${advertisementId}`,
    method: "PUT",
    data: reqBody,
  });

  return response.data;
}


// 1. Get deal + catalogues for Apply Deals screen
export async function getApplyDealsDetails(dealId: string) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/deal/get/apply/${dealId}`,
    method: "GET",
  });

  return response.data;
}


// 2. Get products for selected catalogue while applying deal
export async function getDealProductsForApply(
  dealId: string,
  catalogueId: string,
  page: number = 1,
  limit: number = 10,
  query: string = ""
) {
  const url = `${baseUrl}/deal/get/products/${dealId}/${catalogueId}?page=${page}&limit=${limit}${
    query ? `&query=${query}` : ""
  }`;

  const response = await serverCallWithToken<any>({
    url,
    method: "GET",
  });

  return response.data;
}


// 3. Apply deal to selected products
export async function applyDealsOnProductsApi(
  dealId: string,
  productIds: string[],
  catalogueId: string,
  removedProductIds: string[]
) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/deal/apply`,
    method: "POST",
    data: {
      dealId,
      productIds,
      catalogueId,
      removedProductIds,
    },
  });

  return response.data;
}


export async function connectRazorpay() {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/payment-connection/connect`,
    method: "GET",
    // ensure cookies/session auth works
  });

  return response.data; // backend handles OAuth redirect / state
}


export async function getPaymentDetails() {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/payment-connection/me/integrations/razorpay`,
    method: "GET",
    // ensure cookies/session auth works
  });
   return response.data; 
}


  export async function revokeRazorpayIntegration() {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/payment-connection/integrations/razorpay/revoke`,
    method: "GET",
  });

  return response.data; 
}


export async function updateUPIDetails(vpa: string, merchantName?: string) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/payment-connection/upi/update`,
    method: "POST",
    data: { vpa, merchantName }
  });
  return response.data;
}

export async function disconnectUPI() {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/payment-connection/upi/disconnect`,
    method: "GET",
  });
  return response.data;
}

export async function updateManualRazorpay(keyId: string, keySecret: string) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/payment-connection/manual/update`,
    method: "POST",
    data: { keyId, keySecret },
  });
  return response.data;
}

export async function disconnectManualRazorpay() {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/payment-connection/manual/disconnect`,
    method: "GET",
  });
  return response.data;
}


// --- Location Hierarchy ---
export async function getCountries() {
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/countries`, method: 'GET' });
    return response.data;
}
export async function createCountry(data: { name: string; code: string }) {
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/countries`, method: 'POST', data });
    return response.data;
}
export async function updateCountry(id: string, data: Partial<{ name: string; code: string; isActive: boolean }>) {
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/countries/${id}`, method: 'PUT', data });
    return response.data;
}
export async function deleteCountry(id: string) {
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/countries/${id}`, method: 'DELETE' });
    return response.data;
}

export async function getStates(countryId?: string) {
    const q = countryId ? `?countryId=${countryId}` : '';
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/states${q}`, method: 'GET' });
    return response.data;
}
export async function createState(data: { name: string; countryId: string }) {
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/states`, method: 'POST', data });
    return response.data;
}
export async function updateState(id: string, data: any) {
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/states/${id}`, method: 'PUT', data });
    return response.data;
}
export async function deleteState(id: string) {
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/states/${id}`, method: 'DELETE' });
    return response.data;
}

export async function getCities(stateId?: string) {
    const q = stateId ? `?stateId=${stateId}` : '';
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/cities${q}`, method: 'GET' });
    return response.data;
}
export async function createCity(data: { name: string; stateId: string }) {
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/cities`, method: 'POST', data });
    return response.data;
}
export async function updateCity(id: string, data: any) {
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/cities/${id}`, method: 'PUT', data });
    return response.data;
}
export async function deleteCity(id: string) {
    const response = await serverCallWithToken<any>({ url: `${baseUrl}/locations/cities/${id}`, method: 'DELETE' });
    return response.data;
}

export async function assignVendorLocation(id: string, data: {
    countryId?: string | null;
    stateId?: string | null;
    cityId?: string | null;
    parentId?: string | null;
}) {
    const response = await serverCallWithToken<any>({
        url: `${baseUrl}/admin/integration/${id}/assign-location`,
        method: 'POST',
        data,
    });
    return response.data;
}

export async function getFeeds() {
  return await serverCallWithToken<any>({
    url: `${baseUrl}/feeds/merchants/feeds`,
    method: "GET",
  });
}

export async function createFeed(payload: any) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/feeds/merchants/feeds`,
    method: "POST",
    data: payload,
  });
  return response.data;
}

export async function deleteFeed(id: string) {
  const response = await serverCallWithToken<any>({
    url: `${baseUrl}/feeds/merchants/feeds/${id}`,
    method: "DELETE",
  });
  return response.data;
}
