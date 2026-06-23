import axios from 'axios';
import { apiEndPoints, base_url } from '../Config/apiEnv';
import { getTokenPair, removeTokenPair, storeTokenPair } from './StorageUtils';

class ApiOption {
    constructor(method, data, url, params, headers) {
        this.method = method;
        this.data = data;
        this.url = url;
        this.params = params;
        this.headers = headers;
    }
}

export function LoginUser(phoneNumber) {
    return new Promise((resolve, reject) => {
        axios
            .post(base_url + apiEndPoints.loginUser, {
                phoneNumber: phoneNumber,
            })
            .then(response => {
                if (response.status >= 200 && response.status <= 209) {
                    console.log(response);
                    resolve(response.data);
                } else {
                    reject('Unable to login the user at the moment');
                }
            })
            .catch(error => {
                console.log(error);
                reject(
                    error?.response?.data?.errorMessage ||
                    'Unable to login the user at the moment',
                );
            });
    });
}

export function scanQRCode(qrCodeId) {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'POST',
            url: `${base_url}/api/v1/chatMessage/integrationSendByQRScan`,
            data: {
                qrCodeId,
            },
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function VerifyOtp(phoneNumber, otp) {
    return new Promise((resolve, reject) => {
        let _apiData = null;
        axios
            .post(base_url + apiEndPoints.verifyOtp, {
                phoneNumber: phoneNumber,
                otp: otp,
            })
            .then(response => {
                if (response.status >= 200 && response.status <= 209) {
                    _apiData = response.data.data;
                    console.log(_apiData);
                    return storeTokenPair(response.data.data);
                } else {
                    reject('Unable to verify otp at the moment');
                }
            })
            .then(tokenPair => {
                resolve(_apiData);
            })
            .catch(error => {
                reject(
                    error?.response?.data?.errorMessage ||
                    'Unable to verify otp at the moment',
                );
            });
    });
}

export function getIntegrationById(id) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/integrations/byId/${id}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function getCatalogueByIntegrationId(id,str,query) {
    return new Promise(function (resolve, reject) {
        console.log("Inside getCatalogueByIntegrationId", query);
       console.log(`${base_url}/api/v1/products/search-app/${id}?search=${str}${query ? `&${query}` : ''}`);
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/products/search-app/${id}?search=${str}${query ? `&${query}` : ''}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

// 🔹 Fetch Cart
export async function fetchCartAsync(integrationId, catalogueId) {
    console.log("fetchCartAsync called with:", integrationId, catalogueId);
  try {
    const response = await apiActionWithToken({
      method: "GET",
      url: `${base_url}/api/v1/cart/items/${integrationId}/${catalogueId}`,
    });
    console.log("cart",response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("fetchCartApi error:", error);
    throw error;
  }
}


// 🔹 Fetch Cart Item By Id
export async function fetchCartItemById(integrationId, catalogueId, productId) {
  try {
    const response = await apiActionWithToken({
      method: "GET",
      url: `${base_url}/api/v1/cart/product-items/${integrationId}/${catalogueId}/${productId}`,
    });
    return response.data.data;
  } catch (error) {
    console.error("fetchCartItemApi error:", error);
    throw error;
  }
}

// // 🔹 Add to Cart
// export async function addToCartAsync(integrationId,integrationId,productId) {
//   try {
//     await apiActionWithToken({
//       method: "POST",
//       url: `${base_url}/api/v1/cart/create`,
//       data: { integrationId, catalogueId, productId },
//         data: cartPayload
//     });

//     console.log("inside add to cart")
//     const updatedCart = await fetchCartAsync(integrationId, catalogueId)
//     console.log("add to cart", updatedCart)
//    return updatedCart;
//   } catch (error) {
//     console.error("addToCartApi error:", error);
//     throw error;
//   }
// }


// 🔹 Add to Cart
export async function addToCartAsync( integrationId,
  catalogueId,
  productId,
  customizationId,
  quantity,
  selectedOptions, specialRequest) {

  try {
    await apiActionWithToken({
      method: "POST",
      url: `${base_url}/api/v1/cart/create`,
      data: {integrationId,
  catalogueId,
  productId,
  customizationId,
  quantity,
  selectedOptions, specialRequest},
    });

    console.log("inside add to cart");
    const updatedCart = await fetchCartAsync(integrationId, catalogueId);
    console.log("add to cart", updatedCart);
    return updatedCart;
  } catch (error) {
    console.error("addToCartApi error:", error);
    throw error;
  }
}




// 🔹 Update Quantity
export async function updateCartQuantityAsync(
  integrationId,
  catalogueId,
  productId,
  isIncrease,
  isItemId,
) {
  try {
    console.log(integrationId,catalogueId,productId,isIncrease,isItemId)
    const endpoint = isIncrease
      ? `${base_url}/api/v1/cart/increase/${integrationId}/${catalogueId}/${productId}`
      : `${base_url}/api/v1/cart/decrease/${integrationId}/${catalogueId}/${productId}`;

await apiActionWithToken({ method: "PUT", url: endpoint, data : {
    isItemId
} });

      const updatedCart = await fetchCartAsync(integrationId, catalogueId)
    return updatedCart
  } catch (error) {
    console.error("updateCartQuantityApi error:", error);
    throw error;
  }
}


export async function deleteCartItems(integrationId, catalogueId, productId = 'all') {
  try {
    const response = await apiActionWithToken({
      method: "DELETE",
      url: `${base_url}/api/v1/cart/delete/${integrationId}/${catalogueId}`,
      data: {
        productId,
      },
    });

    return response.data; 
  } catch (error) {
    console.error("deleteCartItems error:", error);
    throw error;
  }
}


export async function addDeliveryAddress(address) {
  try {

    const response = await apiActionWithToken({
      method: 'POST',
      url: `${base_url}/api/v1/address/create-address`,
      data: address,
    });

    console.log("add res", response.data)
    return response.data
  } catch (error) {
    console.log('postAddress API error:', error.response?.data?.message || error.message || 'Error saving address');
    const message = error.response?.data?.message || error.message || 'Error saving address';
    throw new Error(message);
  }
}

export async function applyDealAsyc(dealsPayload) {
    console.log("apply payload", dealsPayload)
  try {
    const response = await apiActionWithToken({
      method: 'PATCH',
      url: `${base_url}/api/v1/cart/apply-deal`,
      data: dealsPayload,
    });

    console.log("apply deal res", response.data)
    return response.data
  } catch (error) {
    console.log('apply deal API error:', error.response?.data?.message || error.message || 'Error applying deal');
    const message = error.response?.data?.message || error.message || 'Error applying deal';
    throw new Error(message);
  }
}


export async function removeDealAsync(dealsPayload) {
     console.log("remove payload", dealsPayload)
  try {

    const response = await apiActionWithToken({
      method: 'PATCH',
      url: `${base_url}/api/v1/cart/remove-deal`,
      data: dealsPayload,
    });

    console.log("remove deal res", response.data)
    return response.data
  } catch (error) {
    console.log('remove deal API error:', error.response?.data?.message || error.message || 'remove deal API error');
    const message = error.response?.data?.message || error.message || 'remove deal API error';
    throw new Error(message);
  }
}


export async function clearDealAsync(dealsPayload) {
    console.log("clear deals", dealsPayload)
  try {
    const response = await apiActionWithToken({
      method: 'PATCH',
      url: `${base_url}/api/v1/cart//clear-deal`,
      data: dealsPayload,
    });
    console.log("add res", response.data)
    return response.data
  } catch (error) {
    console.log('clear deal API error:', error.response?.data?.message || error.message || 'clear deal API error');
    const message = error.response?.data?.message || error.message || 'clear deal API error';
    throw new Error(message);
  }
}


export async function handlePaymentCancel(orderId) {
  try {

    const response = await apiActionWithToken({
      method: 'POST',
      url: `${base_url}/api/payments/cancel/${orderId}`,
      data: orderId,
    });
    console.log("add res", response.data)
    return response.data
  } catch (error) {
    console.log('postAddress API error:', error.response?.data?.message || error.message || 'Error saving address');
    const message = error.response?.data?.message || error.message || 'Error saving address';
    throw new Error(message);
  }
}



export async function fetchUserAddress(query) {
  try {

     const url = query
      ? `${base_url}/api/v1/user/selfDetails/?search=${encodeURIComponent(query)}`
      : `${base_url}/api/v1/user/selfDetails/`;

    const response = await apiActionWithToken({
      method: 'GET',
      url: url,
    });
    console.log("fetch add res", response.data.data)
    return response.data.data.addresses
  } catch (error) {
    console.log('postAddress API error:', error.response?.data?.message || error.message || 'Error saving address');
    const message = error.response?.data?.message || error.message || 'Error saving address';
    throw new Error(message);
  }
}


export async function getIntegrationCategory() {
  try {
     const url = `${base_url}/api/v1/integrations/all/categories`
     const response = await apiActionWithToken({
      method: 'GET',
      url: url,
    });

    return response.data.data
  } catch (error) {
    console.log('integration category err:', error.response?.data?.message || error.message || 'Error integration category');
    const message = error.response?.data?.message || error.message || 'Error integration category';
    throw new Error(message);
  }
}


export async function getUserAddressById(addressId,type) {
  try {
    const response = await apiActionWithToken({
      method: 'GET',
      url: `${base_url}/api/v1/address/get-address/${addressId}/?default=${type}`,
    });
    console.log("update address", response.data)
     return response.data
  } catch (error) {
    console.log('updateAddress API error:', error.response?.data?.message || error.message || 'Error updating address');
    const message = error.response?.data?.message || error.message || 'Error updating address';
    throw new Error(message);
  }
}

export async function UpdateUserAddress(addressPayload,addressId) {
  try {
    const response = await apiActionWithToken({
      method: 'PATCH',
      url: `${base_url}/api/v1/address/update/${addressId}`,
     data: addressPayload,
    });
    console.log("update address", response.data)
     return response.data
  } catch (error) {
    console.log('updateAddress API error:', error.response?.data?.message || error.message || 'Error updating address');
    const message = error.response?.data?.message || error.message || 'Error updating address';
    throw new Error(message);
  }
}

export async function getProductCustomization(integrationId, catalogueId, productId) {
  try {
    const response = await apiActionWithToken({
      method: 'GET',
      url: `${base_url}/api/v1/products/customization/${integrationId}/${catalogueId}/${productId}`,
    });
    // console.log("get product customization", response.data)
     return response.data
  } catch (error) {
    console.log('get product customization API error:', error.response?.data?.message || error.message || 'get customization error');
    const message = error.response?.data?.message || error.message || 'get customization error';
    throw new Error(message);
  }
}

export async function createOrder(orderPayload) {
  try {
    const response = await apiActionWithToken({
      method: 'POST',
      url: `${base_url}/api/v1/orders/create`,
     data: orderPayload,
    });
    console.log("order create", response.data)
     return response.data
  } catch (error) {
    console.log('order create API error:', error.response?.data?.message || error.message || 'Error updating address');
    const message = error.response?.data?.message || error.message || 'Error updating address';
    throw new Error(message);
  }
}

export async function verifyPayment(verifyPayload) {

  try {
    const response = await apiActionWithToken({
      method: 'POST',
      url: `${base_url}/api/v1/orders/verify`,
     data: verifyPayload,
    });
    console.log("verify payment", response.data)
     return response
  } catch (error) {
    console.log('verify payment API error:', error.response?.data?.message || error.message || 'Error verify payment');
    const message = error.response?.data?.message || error.message || 'Error verify payment';
    throw new Error(message);
  }
}

export async function DeleteUserAddress(addressId) {
  try {
    const response = await apiActionWithToken({
      method: 'DELETE',
      url: `${base_url}/api/v1/address/delete/${addressId}`,
    });
    console.log("update address", response.data)
     return response.data
  } catch (error) {
    console.log('updateAddress API error:', error.response?.data?.message || error.message || 'Error updating address');
    const message = error.response?.data?.message || error.message || 'Error updating address';
    throw new Error(message);
  }
}



export function markActionPosted(messageId, title) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'POST',
            url: `${base_url}/api/v1/chatMessage/markActionSelected`,
            data: {
                messageId,
                title,
            },
        })
            .then(response => {
                console.log(response);
                resolve(response.data);
            })
            .catch(error => {
                console.log('error in sending message action');
                reject(error);
            });
    });
}

export function getBlockedList() {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/blockedIntegrations/byUser`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function confirmMessageForm(
    messageId,
    formData,
    integrationId,
    chatRoomId,
) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'POST',
            url: `${base_url}/api/v1/chatMessage/formSubmission`,
            data: {
                formData,
                messageId,
                integrationId,
                chatRoomId,
            },
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function removeBlockedIntegration(integrationId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'DELETE',
            url: `${base_url}/api/v1/blockedIntegrations/remove/${integrationId}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function getBlockedIntegration(integrationId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/blockedIntegrations/all/${integrationId}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function newBlockedIntegration(integrationId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'POST',
            url: `${base_url}/api/v1/blockedIntegrations/new`,
            data: {
                integrationId,
            },
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function getIntegrationByCategory(category) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/categories/integrationByCategory/${category}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function getCategories() {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/categories/all`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function getUserSelfDetails() {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/user/selfDetails`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function getNotesDetailsByChatRoomId(chatRoomId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/notes/all/details/chatRoomId/${chatRoomId}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}


export function getAllCarts() {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/cart/all-integrations`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function deleteAllCarts() {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'DELETE',
            url: `${base_url}/api/v1/cart/delete/all-carts`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}


export function getBookmarksDetailsByChatroomId(chatRoomId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/bookmarks/all/details/chatRoomId/${chatRoomId}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function deleteBookmark(bookmarkId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'DELETE',
            url: `${base_url}/api/v1/bookmarks/remove/${bookmarkId}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function getChatroomBookmarks(chatRoomId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/bookmarks/all/chatRoomId/${chatRoomId}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function newBookmark(chatMessageId, chatRoomId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'POST',
            url: `${base_url}/api/v1/bookmarks/new`,
            data: {
                chatMessageId,
                chatRoomId,
            },
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function deleteNote(noteId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'DELETE',
            url: `${base_url}/api/v1/notes/remove/${noteId}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function editNote(chatMessageId, chatRoomId, noteMessage, noteId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'PUT',
            url: `${base_url}/api/v1/notes/update/${noteId}`,
            data: {
                chatMessageId,
                chatRoomId,
                noteMessage,
            },
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function getChatRoomNotes(chatRoomId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/notes/all/chatRoomId/${chatRoomId}`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function addNewMessageNote(chatMessageId, chatRoomId, noteMessage) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'POST',
            url: `${base_url}${apiEndPoints.newMessageNote}`,
            data: {
                chatMessageId,
                chatRoomId,
                noteMessage,
            },
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function WelcomeUserToIntegration(integrationId) {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'GET',
            url:
                base_url + apiEndPoints.welcomeUserToIntegration + '/' + integrationId,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function OnboardUser(data) {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'POST',
            data: data,
            url: base_url + apiEndPoints.onboardUser,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function getMessageById(messageId) {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'GET',
            url: base_url + apiEndPoints.getMessageById + '/' + messageId,
        })
            .then(response => {
                if (
                    response.status >= 200 &&
                    response.status <= 209 &&
                    response?.data?.success
                ) {
                    resolve(response?.data?.data);
                }
            })
            .catch(error => {
                reject(
                    error?.response?.data?.errorMessage ||
                    error.message ||
                    'Unable to get message by id.',
                );
            });
    });
}

export function uploadUserDocumentFile(fileName, file, mimeType) {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            url: base_url + apiEndPoints.uploadDocumentFile,
            method: 'POST',
            data: {
                fileName: fileName,
                file: file,
                mimeType: mimeType,
            },
        })
            .then(response => {
                resolve(response?.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function GetChatRoom(integrationId) {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            url: base_url + apiEndPoints.getChatRoom,
            method: 'POST',
            data: { integrationId: integrationId },
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function SendChatMessage(chatMessageData) {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'POST',
            url: base_url + apiEndPoints.sendChatMessage,
            data: chatMessageData,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export async function getNonInteractedIntegrations(page, size, search = '') {
    try {
        const { data } = await apiActionWithToken({
            method: 'GET',
            url: base_url + apiEndPoints.getNonInteractedIntegrations,
            params: {
                page,
                size,
            },
        });
        return data;
    } catch (error) {
        console.log('Unable to get the recent integrations');
        console.log(error);
        return [];
    }
}

export function getRecentIntegrations(page, size, search = '', category = '') {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: base_url + apiEndPoints.getRecentIntegrations,
            params: {
                page,
                size,
                search,
                category
            },
        })
            .then(response => {
                console.log("recent integrations on category click",response.data)
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}



export function getAllIntegrations() {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: base_url + apiEndPoints.getAllInteractionsOffline,
        })
            .then(response => {
                console.log("all integrations on homepage load",response.data)
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function syncUserBookmarks() {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/bookmarks/sync-all`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}


export async function getFoodTypes(integrationId) {
  try {
    const url = `${base_url}/api/v1/products/food-types/${integrationId}`;
     const response = await apiActionWithToken({
      method: 'GET',
      url: url,
    });

    console.log("food types res", response.data.data)

    return response.data.data
  } catch (error) {
    console.log('food types:', error.response?.data?.message || error.message || 'food types error');
    const message = error.response?.data?.message || error.message || 'food types error';
    throw new Error(message);
  }
}




export function syncUserNotes() {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/notes/sync-all`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function syncUserMessages() {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/chatMessage/sync-all`,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function GetIntegrationsList(page, size, search = '') {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'GET',
            url: base_url + apiEndPoints.getIntegrationsList,
            params: {
                page,
                size,
                search,
            },
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function GetChatMessages(chatRoomId, search = '', page = 0) {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            url:
                base_url +
                apiEndPoints.getChatMessages.replace('{{page}}', page.toString()),
            method: 'POST',
            data: { chatRoomId },
            params: {
                search,
            },
        })
            .then(response => {
                console.log("chat messages all",response.data)
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function getOrderDetails(orderId) {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'GET',
            url: `${base_url}/api/v1/orders/details/app/${orderId}`,
     
        })
            .then(response => {
                console.log("order details",response.data)
                resolve(response.data.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function CheckUserOnboarded() {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'GET',
            url: base_url + apiEndPoints.checkUserOnboarded,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function AddFcmToken(fcmToken) {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'POST',
            url: base_url + apiEndPoints.upsertFcmToken,
            data: {
                fcmToken: fcmToken,
            },
        })
            .then(response => {
                if (response?.success) {
                    resolve(response.data);
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function RemoveFcmToken(fcmToken) {
    console.log("remove",fcmToken)
    console.log("url: ",base_url + apiEndPoints.removeFcmToken)
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'PATCH',
            url: base_url + apiEndPoints.removeFcmToken,
            data: {
                fcmToken: fcmToken,
            },
        })
            .then(response => {
                if (response.data.success) {
                     console.log(response, "removing fcm succ")
                   resolve(response.data);
                }else {
                    
                reject(new Error("Backend returned success=false"));
            
                }
            })
            .catch(error => {
                console.log(error.message, "error removing fcm token")
               return reject(error);
            });
    });
}

export function LogOut() {
    return new Promise((resolve, reject) => {
        removeTokenPair()
            .then(response => {
                resolve();
            })
            .catch(error => {
                console.log('Error in logout: ', error);
                reject(error);
            });
    });
}

export function DeleteAccount() {
    return new Promise((resolve, reject) => {
        apiActionWithToken({
            method: 'DELETE',
            url: base_url + apiEndPoints.deleteUserAccount,
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function apiActionWithToken(options) {
    return new Promise((resolve, reject) => {
        let _authToken = null;
        let _refreshToken = null;

        getTokenPair()
            .then(response => {
                if (response.authToken && response.refreshToken) {
                    _authToken = response.authToken;
                    _refreshToken = response.refreshToken;
                    options.headers = { ...options, authorization: _authToken };
                    return axios({ ...options });
                } else {
                    reject('Unable to get the token pair');
                }
            })
            .then(apiResponse => {
                resolve(apiResponse);
            })
            .catch(error => {
                if (error?.response?.status == 401) {
                    refreshJWT(_refreshToken)
                        .then(async () => {
                            return apiActionWithToken(options);
                        })
                        .then(apiResult => {
                            resolve(apiResult);
                        })
                        .catch(error => {
                            reject(error);
                        });
                } else {
                    reject(error);
                }
            });
    });
}

export function refreshJWT(refreshToken) {
    return new Promise((resolve, reject) => {
        axios
            .post(base_url + apiEndPoints.refreshToken, {
                refreshToken: refreshToken,
            })
            .then(response => {
                if (response.status >= 200 && response.status <= 209) {
                    let _tokenPair = {
                        authToken: response.data.data.authToken,
                        refreshToken: response.data.data.refreshToken,
                    };
                    return storeTokenPair(_tokenPair);
                } else {
                    reject('Unable to refresh Token at the moment');
                }
            })
            .then(tokenPair => {
                resolve();
            })
            .catch(error => {
                reject('Unable to refresh the Token at the moment');
            });
    });
}

export function processAiChat(message, history, integrationId) {
    return new Promise(function (resolve, reject) {
        apiActionWithToken({
            method: 'POST',
            url: `${base_url}/api/v1/chatbot/chat`,
            data: {
                message,
                history,
                integrationId,
            },
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}
