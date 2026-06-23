import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import MainLayout from 'src/layouts/main';
// config
// import { PATH_AFTER_LOGIN } from 'src/config-global';
//
import LoginScreen from 'src/pages/verify-phone-number/verify-phone-number.screen';
import { IntegrationCreateAccount } from 'src/pages/integration-create-account/integration-create-account';
import { IntegrationDocumentUploader } from 'src/pages/integration-document-uploader/integration-document-uploader';
import { TubuluAppOnboarding } from 'src/pages/tubulu-app-onboarding/tubbulu-app-onboarding';
import OverviewAppPage from 'src/pages/dashboard/app';
import DashboardLayout from 'src/layouts/dashboard/layout';
import { ManagePhoneBookGroups } from 'src/pages/dashboard/manage-phonebook-groups';
import { ManagePhoneBook } from 'src/pages/dashboard/manage-phonebook';
// import { Conversation } from 'src/pages/dashboard/conversation';
import ChatPage from 'src/pages/dashboard/chat';
import { mainRoutes } from './main';
import { authRoutes } from './auth';
import { authDemoRoutes } from './auth-demo';
import { componentsRoutes } from './components';
import { ManageQRCode } from 'src/pages/dashboard/manage-QRcode';
import { ManageBroadcastCampaign } from 'src/pages/dashboard/manage-broadcast-campaign';
import { ManageBroadcastTemplate } from 'src/pages/dashboard/manage-broadcast-template';
import { MissedCallManagement } from 'src/pages/dashboard/missed-call-management';
import { UserProfile } from 'src/pages/dashboard/user-profile';
import { RoleGuard } from 'src/auth/guard/role-guard';
import MerchantsListPage from 'src/pages/dashboard/merchants/list';
import AccountPage from 'src/pages/dashboard/user/account';
import SuperAdminSettingsPage from 'src/pages/dashboard/superadmin-settings';
import ModulesPage from 'src/pages/dashboard/modules';
import OverviewAnalyticsPage from 'src/pages/dashboard/analytics';
import SuperAdminUsersPage from 'src/pages/dashboard/superadmin-users';
import SuperAdminBillingPage from 'src/pages/dashboard/superadmin-billing';
import AIPlaybooksPage from 'src/pages/dashboard/ai-playbooks';
import MerchantOnboardPage from 'src/pages/dashboard/merchants/onboard';
import MerchantDetailsPage from 'src/pages/dashboard/merchants/details';
import BranchApprovalsPage from 'src/pages/dashboard/branch-approvals';
import StaffListPage from 'src/pages/dashboard/staff/list';
import CommissionsPage from 'src/pages/dashboard/commissions';
import { CreateNewTemplate } from 'src/pages/dashboard/create-new-template';
import Catalogue from 'src/pages/dashboard/catalogue';
import Product from 'src/pages/dashboard/product';
import CreateProduct from 'src/pages/dashboard/CreateProduct';
import EditProduct from 'src/pages/dashboard/EditProduct';
import { CustomerPage } from 'src/pages/dashboard/customer';
import { Order } from 'src/pages/dashboard/order';
import { CustomerOrder } from 'src/components/customer/customer-order';
import Customization from 'src/pages/dashboard/customization';
import ApplyCustomization from 'src/pages/ApplyCusomization';
import CustomizationOptions from 'src/pages/dashboard/customization-options';
import Deals from 'src/pages/dashboard/deals';
import Advertisement from 'src/pages/dashboard/advertisement';
import ApplyDeals from 'src/pages/ApplyDeals';
import Payment from 'src/pages/dashboard/Payment';
import PaymentFailure from 'src/pages/dashboard/payment-failure';
import MerchantSettlementsPage from 'src/pages/dashboard/settlements';
import MerchantProfilePage from 'src/pages/dashboard/merchant/profile';
import MerchantThemesPage from 'src/pages/dashboard/merchant/themes';
import PendingApprovalPage from 'src/pages/dashboard/pending-approval';
import AIBotPage from 'src/pages/dashboard/ai-bot';
import ManageBranchesPage from 'src/pages/dashboard/manage-branches';
import ManageRegionsPage from 'src/pages/dashboard/manage-regions';
import SupportTicketsPage from 'src/pages/dashboard/support/tickets';
import FeedsPage from 'src/pages/dashboard/feeds';

import EnablerOnboardPage from 'src/pages/dashboard/enabler/onboard';
import EnablerSubmissionsPage from 'src/pages/dashboard/enabler/submissions';
import ManageEnablersPage from 'src/pages/dashboard/enablers/index';
// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    // SET INDEX PAGE WITH SKIP HOME PAGE
    // {
    //   path: '/',
    //   element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    // },

    // ----------------------------------------------------------------------

    // SET INDEX PAGE WITH HOME PAGE
    {
      path: '/',
      element: (
        <LoginScreen />
        // <MainLayout>
        //   <HomePage />
        // </MainLayout>
      ),
    },
    {
      path: '/create-account',
      element: (
        <IntegrationCreateAccount />
      )
    },
    {
      path: '/verify-documents',
      element: (
        <IntegrationDocumentUploader />
      )
    },
    {
      path: '/create-integration',
      element: (
        <TubuluAppOnboarding />
      )
    },
    {
      path: '/dashboard',
      element: (
        <DashboardLayout>
          <OverviewAppPage />
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/merchants',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin', 'regional_manager', 'state_manager', 'city_manager']}>
             <MerchantsListPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/merchants/onboard',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin', 'regional_manager', 'state_manager', 'city_manager']}>
            <MerchantOnboardPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/merchants/:id',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin', 'regional_manager', 'state_manager', 'city_manager']}>
            <MerchantDetailsPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/merchants/branch-approvals',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin', 'ops_admin']}>
            <BranchApprovalsPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/analytics',
      element: (
        <DashboardLayout>
          <OverviewAnalyticsPage />
        </DashboardLayout>
      )
    },
    {
      path: '/superadmin/users',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin', 'regional_manager', 'state_manager']}>
            <SuperAdminUsersPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/superadmin/billing',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin']}>
            <SuperAdminBillingPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/ai-playbooks',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin']}>
            <AIPlaybooksPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/settings',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin', 'regional_manager', 'state_manager', 'city_manager']}>
            <SuperAdminSettingsPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/modules',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin']}>
            <ModulesPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/regions',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin', 'city_manager']}>
            <ManageRegionsPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/staff',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin']}>
            <StaffListPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/commissions',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['regional_partner']}>
            <CommissionsPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },

    {
      path: '/manage-phonebook',
      element: (
        <DashboardLayout>
          <ManagePhoneBook />
        </DashboardLayout>
      )
    },
    {
      path: '/manage-phonebook-groups',
      element: (
        <DashboardLayout>
          <ManagePhoneBookGroups />
        </DashboardLayout>
      )
    },
    {
      path: '/manage-qr-code',
      element: (
        <DashboardLayout>
          <ManageQRCode />
        </DashboardLayout>
      )
    }, {
      path: '/dashboard/chat',
      element: (
        <DashboardLayout>
          <ChatPage />
        </DashboardLayout>
      )
    }, {
      path: '/broadcast/manage-campaign',
      element: (
        <DashboardLayout>
          <ManageBroadcastCampaign />
        </DashboardLayout>
      )
    }, {
      path: '/broadcast/manage-template',
      element: (
        <DashboardLayout>
          <ManageBroadcastTemplate />
        </DashboardLayout>
      )
    },
    {
      path: '/manage-missed-call-number',
      element: (
        <DashboardLayout>
          <MissedCallManagement />
        </DashboardLayout>
      )
    },
    {
      path: '/user/profile',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['merchant_admin', 'regional_partner', 'regional_manager', 'state_manager', 'city_manager', 'ops_admin', 'onboarding_specialist', 'content_moderator', 'finance_admin']}>
            <UserProfile />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/broadcast/create-template',
      element: (
        <DashboardLayout>
          <CreateNewTemplate />
        </DashboardLayout>
      )
    },
    {
      path:'/dashboard/catalogue',
      element:(
        <DashboardLayout>     
          <Catalogue/>
        </DashboardLayout>
      )
    },
    {
      path:'/dashboard/feeds',
      element:(
        <DashboardLayout>     
          <FeedsPage/>
        </DashboardLayout>
      )
    },
    {
      path:'/dashboard/orders',
      element:(
        <DashboardLayout>     
          <Order/>
        </DashboardLayout>
      )
    },
    {
      path:'/dashboard/customers',
      element:(
        <DashboardLayout>     
          <CustomerPage/>
        </DashboardLayout>
      )
    },
    {
      path:'/catalogue/product/create/:catalogueId',
      element:(
         <DashboardLayout>     
          <CreateProduct/>
        </DashboardLayout>
      )
    },
    {
    path: "/catalogue/:catalogueId/product/edit/:productId",
      element:(
         <DashboardLayout>     
          <EditProduct/>
        </DashboardLayout>
      )
    },
    {
      path:'catalogue/:id',
      element:(
         <DashboardLayout>     
          <Product/>
        </DashboardLayout>
      )
    },
    {
      path:'customers/:id',
      element:(
         <DashboardLayout>     
          <CustomerOrder/>
        </DashboardLayout>
      )
    },
    {
      path:'/dashboard/customization',
      element:(
        <DashboardLayout>
          <Customization/>
        </DashboardLayout>
      )
    },
     {
      path:'/dashboard/customization/apply/:customizationId',
      element:(
        <DashboardLayout>
          <ApplyCustomization/>
        </DashboardLayout>
      )
    },
      {
      path:'/dashboard/customization/:customizationId',
      element:(
        <DashboardLayout>
          <CustomizationOptions/>
        </DashboardLayout>
      )
    },
    {
      path:'/dashboard/deals',
      element:(
        <DashboardLayout>
          <Deals/>
        </DashboardLayout>
      )
    },
     {
      path:'/dashboard/advertisement',
      element:(
        <DashboardLayout>
          <Advertisement/>
        </DashboardLayout>
      )
    },
     {
      path:'/dashboard/deals/apply/:dealId',
      element:(
        <DashboardLayout>
          <ApplyDeals/>
        </DashboardLayout>
      )
    },
     {
      path:'/dashboard/payment',
      element:(
        <DashboardLayout>
          <RoleGuard allowedRoles={['merchant_admin', 'super_admin']}>
            <Payment/>
          </RoleGuard>
        </DashboardLayout>
      )
    },
     {
      path:'/dashboard/payment-failure',
      element:(
        <DashboardLayout>
          <RoleGuard allowedRoles={['merchant_admin', 'super_admin']}>
            <PaymentFailure />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/settlements',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['merchant_admin', 'super_admin']}>
            <MerchantSettlementsPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/merchant/profile',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['merchant_admin']}>
            <MerchantProfilePage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/merchant/themes',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['merchant_admin']}>
            <MerchantThemesPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/pending-approval',
      element: (
        <DashboardLayout>
          <PendingApprovalPage />
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/ai-bot',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['merchant_admin', 'super_admin']}>
            <AIBotPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/branches',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['merchant_admin', 'super_admin']}>
            <ManageBranchesPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/support/tickets',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['super_admin', 'merchant_admin']}>
            <SupportTicketsPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/enabler/onboard',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['enabler']}>
            <EnablerOnboardPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/enabler/submissions',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['enabler']}>
            <EnablerSubmissionsPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
    {
      path: '/dashboard/enablers',
      element: (
        <DashboardLayout>
          <RoleGuard allowedRoles={['city_manager']}>
            <ManageEnablersPage />
          </RoleGuard>
        </DashboardLayout>
      )
    },
   
    
    // Auth routes
    ...authRoutes,
    ...authDemoRoutes,

    // Dashboard routes
    // ...dashboardRoutes,

    // Main routes
    ...mainRoutes,

    // Components routes
    ...componentsRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
