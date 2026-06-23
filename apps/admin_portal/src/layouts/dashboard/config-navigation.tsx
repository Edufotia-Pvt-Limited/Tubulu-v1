import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
// icons
import { MdOutlineQrCode, MdPhoneMissed, MdStars } from 'react-icons/md';
import { GrCatalogOption } from "react-icons/gr";
import { IoStorefrontSharp } from 'react-icons/io5';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData(externalUser?: any) {
  const { t } = useLocales();
  const { user: hookUser } = useAuthContext();
  
  const user = externalUser || hookUser;

  const data = useMemo(
    () => {
      const role = user?.role?.toLowerCase();
      const isMasterPhoneNumber = ['9999999999', '9844982389', '+919999999999', '+919844982389', '09844982389', '09999999999'].includes(String(user?.phoneNumber || ''));

      const isSuperAdmin = role === 'super_admin' || isMasterPhoneNumber;
      const isPartner = role === 'regional_partner';
      const isOps = ['ops_admin', 'onboarding_specialist', 'content_moderator', 'finance_admin'].includes(role);
      const isOpsManager = role === 'ops_manager';
      const isRegionalManager = role === 'regional_manager';
      const isStateManager = role === 'state_manager';
      const isCityManager = role === 'city_manager';
      const isEnabler = role === 'enabler';
      const isManager = isRegionalManager || isStateManager || isCityManager;

      const isAdminType = isSuperAdmin || isPartner || isOps || isManager || isOpsManager || isEnabler;

      const isMerchantAdmin = !isAdminType && (role === 'merchant_admin' || role === 'vendor');

      const overviewItems: any[] = [
        {
          title: t('Dashboard'),
          path: paths.dashboard.general.analytics,
          icon: ICONS.dashboard,
        },
      ];

      // Only show merchant tools if explicitly a merchant
      if (isMerchantAdmin) {
        if (user?.isApproved) {
          overviewItems.push(
            {
              title: t('Conversation'),
              path: paths.dashboard.general.conversation,
              icon: ICONS.ecommerce,
            },
            {
              title: t('Vendor Store'),
              path: paths.dashboard.general.store.catalogue,
              icon: <IoStorefrontSharp />,
              children: [
                { title: t('Catalogue'), path: paths.dashboard.general.store.catalogue },
                { title: t('Orders'), path: paths.dashboard.general.store.orders },
                { title: t('Customers'), path: paths.dashboard.general.store.customer },
                { title: t('Store Feed & Moments'), path: paths.dashboard.general.store.feeds },
                { title: t('Advertisement'), path: paths.dashboard.general.store.advertisement },
                { title: t('Manage QR Code'), path: paths.dashboard.general.qrcode },
                ...(!user?.parentId ? [{ title: t('Manage Branches'), path: paths.dashboard.general.store.branches }] : []),
              ]
            },
            {
              title: t('Settings'),
              path: '/dashboard/settings',
              icon: <Iconify icon="solar:settings-bold-duotone" />,
              children: [
                { title: t('Payment Settings'), path: paths.dashboard.general.store.payment },
                { title: t('Business Profile'), path: '/dashboard/merchant/profile' },
                { title: t('AI Bot Settings'), path: '/dashboard/ai-bot' },
                { title: t('Themes'), path: '/dashboard/merchant/themes' },
              ]
            },
            {
              title: t('Support Tickets'),
              path: '/dashboard/support/tickets',
              icon: <Iconify icon="solar:bill-list-bold-duotone" />,
            }
          );
        }
        // Removed Business Profile from vendor navigation
      }

      const adminSectionItems: any[] = [];

      if (isPartner) {
        adminSectionItems.push(
          {
            title: 'My Vendors',
            path: '/dashboard/merchants',
            icon: ICONS.ecommerce,
          },
          {
            title: 'My Commissions',
            path: paths.dashboard.commissions.root,
            icon: ICONS.banking,
          }
        );
      } else if (isSuperAdmin) {
        adminSectionItems.push(
          {
            title: 'Vendor Management',
            path: '/dashboard/merchants',
            icon: ICONS.ecommerce,
          },
          {
            title: 'App Modules',
            path: '/dashboard/modules',
            icon: <Iconify icon="solar:widget-5-bold-duotone" />,
          },
          {
            title: 'Regional Manager Creation',
            path: '/superadmin/users',
            icon: ICONS.user,
          },
          {
            title: 'AI Playbooks',
            path: '/dashboard/ai-playbooks',
            icon: <Iconify icon="solar:cpu-bolt-bold-duotone" sx={{ color: 'primary.main' }} />,
          },
          {
            title: 'Billing & Plans',
            path: '/dashboard/superadmin/billing',
            icon: <Iconify icon="solar:card-2-bold-duotone" />,
          },
          {
            title: 'Settings',
            path: '/dashboard/settings',
            icon: <Iconify icon="solar:settings-bold" />,
          }
        );
      } else if (isRegionalManager || isStateManager) {
        adminSectionItems.push(
          {
            title: 'Vendor Management',
            path: '/dashboard/merchants',
            icon: ICONS.ecommerce,
          },
          {
            title: 'City Manager Creation',
            path: '/superadmin/users',
            icon: ICONS.user,
          },
          {
            title: 'Settings',
            path: '/dashboard/settings',
            icon: <Iconify icon="solar:settings-bold" />,
          }
        );
      } else if (isCityManager) {
        adminSectionItems.push(
          {
            title: 'Vendor Management',
            path: '/dashboard/merchants',
            icon: ICONS.ecommerce,
          },
          {
            title: 'Manage Enablers',
            path: '/dashboard/enablers',
            icon: ICONS.user,
          },
          {
            title: 'Advertisements',
            path: paths.dashboard.general.store.advertisement,
            icon: <Iconify icon="solar:bill-list-bold-duotone" />,
          },
          {
            title: 'Settings',
            path: '/dashboard/settings',
            icon: <Iconify icon="solar:settings-bold" />,
          }
        );
      } else if (isEnabler) {
        adminSectionItems.push(
          {
            title: 'Onboard a Merchant',
            path: '/dashboard/enabler/onboard',
            icon: <Iconify icon="solar:buildings-3-bold-duotone" />,
          },
          {
            title: 'My Submissions',
            path: '/dashboard/enabler/submissions',
            icon: <Iconify icon="solar:clipboard-list-bold-duotone" />,
          }
        );
      } else if (isOps) {
        adminSectionItems.push(
          {
            title: 'Vendor Management',
            path: '/dashboard/merchants',
            icon: ICONS.ecommerce,
          }
        );
        if (role === 'ops_admin') {
          adminSectionItems.push({
            title: 'Branch Approvals',
            path: paths.dashboard.merchants.branchApprovals,
            icon: <Iconify icon="solar:branching-paths-bold-duotone" />,
          });
        }
        adminSectionItems.push(
          {
            title: 'AI Playbooks',
            path: '/dashboard/ai-playbooks',
            icon: <Iconify icon="solar:cpu-bolt-bold-duotone" sx={{ color: 'primary.main' }} />,
          },
          {
            title: 'Advertisements',
            path: paths.dashboard.general.store.advertisement,
            icon: <Iconify icon="solar:bill-list-bold-duotone" />,
          }
        );
      } else if (isOpsManager) {
        adminSectionItems.push(
          {
            title: 'Support Tickets',
            path: '/dashboard/support/tickets',
            icon: <Iconify icon="solar:bill-list-bold-duotone" />,
          }
        );
      }

      const superAdminSection = adminSectionItems.length > 0 ? [
        {
          subheader: isPartner ? 'Partner Portal' : isManager ? 'Manager Portal' : isEnabler ? 'Enabler Portal' : 'Platform Management',
          items: adminSectionItems
        },
      ] : [];

      const navData = [
        {
          subheader: isSuperAdmin ? 'Platform' : isManager ? 'Overview' : 'My Store',
          items: overviewItems,
        },
        ...superAdminSection
      ];

      if (isSuperAdmin || isManager || isOpsManager || isEnabler) {
        navData[0].items = navData[0].items.filter((item: any) => 
          !["/dashboard/product", '/dashboard/order', '/dashboard/invoice', '/dashboard/post', '/dashboard/job', '/dashboard/tour', '/dashboard/file-manager', '/dashboard/mail', '/dashboard/chat', '/dashboard/calendar', '/dashboard/kanban', '/dashboard/settlements', '/dashboard/merchant/profile', '/dashboard/catalogue', '/dashboard/ai-bot'].some(path => item.path?.startsWith(path))
        );
      }

      if (isOpsManager || isEnabler) {
        navData[0].items = navData[0].items.filter((item: any) => item.path !== paths.dashboard.general.analytics);
      }

      return navData;
    },
    [t, user]
  );

  return data;
}
