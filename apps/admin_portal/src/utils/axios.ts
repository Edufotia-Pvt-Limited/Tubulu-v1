import axiosPackage, { AxiosRequestConfig } from 'axios';
// config
import { HOST_API } from 'src/config-global';
import { getSessionDetails } from './ApiActions';

// ----------------------------------------------------------------------

const axiosInstance = axiosPackage.create({ baseURL: HOST_API });

axiosInstance.interceptors.request.use(
  (config) => {
    // Only inject token if no Authorization header is already set (e.g. by setSession())
    if (!config.headers.Authorization) {
      const token = getSessionDetails()?.authToken;
      if (token) {
        // Always send as "Bearer <token>" — backend middleware expects this format
        const prefixed = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = prefixed;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res: any) => res,
  (error: any) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export const axios = axiosInstance;

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const authToken = getSessionDetails()?.authToken;
  const prefixed = authToken
    ? (authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`)
    : undefined;
  const res = await axiosInstance.get(url, { ...config, headers: {
    ...(prefixed ? { Authorization: prefixed } : {}),
  } });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/v1/chatRoom/all/integration',
  chatConversation: '/api/v1/chatRoom/all/integration',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/v1/integrations/myDetails',
    sendOtp: '/api/v1/integrations/verifyIntegrationPhoneNumber',
    verifyOtp: '/api/v1/integrations/confirmIntegrationPhoneAndCode',
    // Legacy aliases (kept for template compatibility)
    register: '/api/v1/integrations/verifyIntegrationPhoneNumber',
    verify: '/api/v1/integrations/confirmIntegrationPhoneAndCode',
    login: '/api/v1/integrations/verifyIntegrationPhoneNumber',
    adminLogin: '/api/v1/integrations/admin/login',
    verifyPin: '/api/v1/integrations/verifyPin',
    setPin: '/api/v1/integrations/set-pin',
  },
  orders: {
    list: '/api/v1/orders/all',
    updateStatus: '/api/v1/orders/update-order-status',
    details: (orderId: string) => `/api/v1/orders/details/admin/${orderId}`,
  },
  products: {
    list: (catalogueId: string) => `/api/v1/products/search/${catalogueId}`,
    create: (catalogueId: string) => `/api/v1/products/create/${catalogueId}`,
    edit: (productId: string, catalogueId: string) => `/api/v1/products/edit/${productId}/${catalogueId}`,
    delete: (productId: string) => `/api/v1/products/delete/${productId}`,
    toggleActive: (catalogueId: string, productId: string) => `/api/v1/products/toggle-active/${catalogueId}/${productId}`,
  },
  catalogues: {
    list: '/api/v1/catalogue/catalogues',
    updateStatus: '/api/v1/catalogue/update-status',
  },
  deals: {
    list: '/api/v1/deals/get-deals',
    create: '/api/v1/deals/create',
    edit: (dealId: string) => `/api/v1/deals/edit/${dealId}`,
    delete: (dealId: string) => `/api/v1/deals/delete/${dealId}`,
  },
  merchants: {
    list: '/api/v1/admin/integrations',
    create: '/api/v1/integrations/admin/create',
  },
  customers: {
    list: '/api/v1/customers/get-customer',
    orders: (userId: string) => `/api/v1/customers/get-customer-orders/${userId}`,
  },
  settlements: {
    list: '/api/v1/settlements/merchant',
  },
  admin: {
    integrations: '/api/v1/admin/integrations',
    approve: '/api/v1/admin/integration/approve',
    suspend: '/api/v1/admin/integration/suspend',
    update: '/api/v1/admin/integration/update',
    delete: (id: string) => `/api/v1/admin/integration/${id}`,
    settings: '/api/v1/admin/settings',
    updateSettings: '/api/v1/admin/settings/update',
    modulesHealth: '/api/v1/admin/modules/health',
    pendingBranches: '/api/v1/integrations/admin/branches/pending',
    approveBranch: (branchId: string) => `/api/v1/integrations/admin/branches/${branchId}/approve`,
  },
  ai: {
    config: '/api/v1/ai/config',
  },
  dashboardStats: '/api/v1/integrations/dashboard/stats',
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
