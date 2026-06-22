import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
// PRODUCT
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// INVOICE
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// USER
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// BLOG
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// JOB
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// TOUR
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// FILE MANAGER
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// APP
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// BLANK PAGE
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));
const MerchantSettlementsPage = lazy(() => import('src/pages/dashboard/settlements'));
// SUPER ADMIN
const SuperAdminIntegrationsPage = lazy(() => import('src/pages/dashboard/superadmin-integrations'));
const SuperAdminUsersPage = lazy(() => import('src/pages/dashboard/superadmin-users'));
const SuperAdminBillingPage = lazy(() => import('src/pages/dashboard/superadmin-billing'));
const MerchantProfilePage = lazy(() => import('src/pages/dashboard/merchant/profile'));

// MERCHANTS (SUPER ADMIN)
const MerchantsListPage = lazy(() => import('src/pages/dashboard/merchants/list'));
const MerchantDetailsPage = lazy(() => import('src/pages/dashboard/merchants/details'));
const MerchantOnboardPage = lazy(() => import('src/pages/dashboard/merchants/onboard'));
const CataloguePage = lazy(() => import('src/pages/dashboard/catalogue'));
const AIPlaybooksPage = lazy(() => import('src/pages/dashboard/ai-playbooks'));
const SuperAdminSettingsPage = lazy(() => import('src/pages/dashboard/superadmin-settings'));
const StaffListPage = lazy(() => import('src/pages/dashboard/staff/list'));
const SupportTicketsPage = lazy(() => import('src/pages/dashboard/support/tickets'));
const CommissionsPage = lazy(() => import('src/pages/dashboard/commissions'));

// ENABLER
const EnablerOnboardPage = lazy(() => import('src/pages/dashboard/enabler/onboard'));
const EnablerSubmissionsPage = lazy(() => import('src/pages/dashboard/enabler/submissions'));
const ManageEnablersPage = lazy(() => import('src/pages/dashboard/enablers/index'));

import { RoleGuard } from 'src/auth/guard/role-guard';

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <IndexPage />, index: true },
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      {
        path: 'user',
        element: (
          <RoleGuard allowedRoles={['merchant_admin', 'super_admin', 'regional_manager', 'state_manager', 'city_manager']}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { element: <UserProfilePage />, index: true },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: 'account', element: <UserAccountPage /> },
        ],
      },
      {
        path: 'product',
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'order',
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> },
        ],
      },
      {
        path: 'invoice',
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
      {
        path: 'post',
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { element: <BlogPostsPage />, index: true },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      {
        path: 'job',
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { element: <JobListPage />, index: true },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> },
        ],
      },
      {
        path: 'tour',
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { element: <TourListPage />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      { 
        path: 'file-manager', 
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <FileManagerPage />
          </RoleGuard>
        ) 
      },
      { 
        path: 'mail', 
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <MailPage />
          </RoleGuard>
        ) 
      },
      { 
        path: 'chat', 
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <ChatPage />
          </RoleGuard>
        ) 
      },
      { 
        path: 'calendar', 
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <CalendarPage />
          </RoleGuard>
        ) 
      },
      { 
        path: 'kanban', 
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <KanbanPage />
          </RoleGuard>
        ) 
      },
      { 
        path: 'catalogue', 
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <CataloguePage />
          </RoleGuard>
        ) 
      },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'blank', element: <BlankPage /> },
      { 
        path: 'settlements', 
        element: (
          <RoleGuard allowedRoles={['merchant_admin']}>
            <MerchantSettlementsPage />
          </RoleGuard>
        ) 
      },
      {
        path: 'merchants',
        children: [
          { 
            element: <MerchantsListPage />, 
            index: true 
          },
          { 
            path: 'onboard', 
            element: (
              <RoleGuard allowedRoles={['super_admin', 'regional_manager', 'state_manager', 'city_manager']}>
                <MerchantOnboardPage />
              </RoleGuard>
            ) 
          },
          { 
            path: ':id', 
            element: (
              <RoleGuard allowedRoles={['super_admin', 'regional_manager', 'state_manager', 'city_manager']}>
                <MerchantDetailsPage />
              </RoleGuard>
            ) 
          },
        ],
      },
      {
        path: 'ai-playbooks',
        element: (
          <RoleGuard allowedRoles={['super_admin']}>
            <AIPlaybooksPage />
          </RoleGuard>
        )
      },
      {
        path: 'superadmin',
        children: [
          { path: 'integrations', element: <SuperAdminIntegrationsPage /> },
          { path: 'users', element: <SuperAdminUsersPage /> },
          { path: 'billing', element: <SuperAdminBillingPage /> },
        ],
      },
      {
        path: 'merchant',
        element: (
          <RoleGuard allowedRoles={['super_admin', 'merchant_admin']}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: 'profile', element: <MerchantProfilePage /> },
        ],
      },
      {
        path: 'staff',
        element: (
          <RoleGuard allowedRoles={['super_admin', 'merchant_admin']}>
            <StaffListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'support',
        children: [
          {
            path: 'tickets',
            element: (
              <RoleGuard allowedRoles={['super_admin', 'merchant_admin', 'ops_manager']}>
                <SupportTicketsPage />
              </RoleGuard>
            ),
          },
        ],
      },
      {
        path: 'commissions',
        element: (
          <RoleGuard allowedRoles={['regional_partner']}>
            <CommissionsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'enabler',
        element: (
          <RoleGuard allowedRoles={['enabler']}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: 'onboard', element: <EnablerOnboardPage /> },
          { path: 'submissions', element: <EnablerSubmissionsPage /> },
        ],
      },
      {
        path: 'enablers',
        element: (
          <RoleGuard allowedRoles={['city_manager']}>
            <ManageEnablersPage />
          </RoleGuard>
        ),
      },
    ],
  },
];
