import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tubulu_mobile/core/auth/auth_provider.dart';
import 'package:tubulu_mobile/features/auth/screens/loading_transition_screen.dart';
import 'package:tubulu_mobile/features/auth/screens/login_screen.dart';
import 'package:tubulu_mobile/features/auth/screens/splash_screen.dart';
import 'package:tubulu_mobile/features/merchant/dashboard/screens/merchant_dashboard_screen.dart';
import 'package:tubulu_mobile/features/merchant/dashboard/screens/merchant_feed_management_screen.dart';
import 'package:tubulu_mobile/features/merchant/orders/screens/orders_list_screen.dart';
import 'package:tubulu_mobile/features/merchant/products/screens/products_list_screen.dart';
import 'package:tubulu_mobile/features/customer/home/screens/home_screen.dart';
import 'package:tubulu_mobile/features/customer/catalogue/screens/catalogue_screen.dart';
import 'package:tubulu_mobile/features/customer/catalogue/screens/product_details_screen.dart';
import 'package:tubulu_mobile/features/customer/cart/screens/cart_screen.dart';
import 'package:tubulu_mobile/features/customer/orders/screens/orders_list_screen.dart';
import 'package:tubulu_mobile/features/customer/orders/screens/tracking_webview_screen.dart';
import 'package:tubulu_mobile/features/merchant/merchant_shell.dart';
import 'package:tubulu_mobile/features/merchant/products/screens/add_product_screen.dart';
import 'package:tubulu_mobile/features/merchant/catalogue/screens/merchant_catalogue_screen.dart';
import 'package:tubulu_mobile/features/customer/customer_shell.dart';
import 'package:tubulu_mobile/features/customer/chat/screens/chat_screen.dart';
import 'package:tubulu_mobile/features/customer/chat/screens/chat_history_screen.dart';
import 'package:tubulu_mobile/features/customer/explore/screens/explore_screen.dart';
import 'package:tubulu_mobile/features/customer/chat/screens/global_ai_chat_screen.dart';
import 'package:tubulu_mobile/features/customer/home/screens/industry_merchants_screen.dart';
import 'package:tubulu_mobile/features/auth/screens/set_pin_screen.dart';
import 'package:tubulu_mobile/features/auth/screens/onboard_screen.dart';
import 'package:tubulu_mobile/features/merchant/chat/screens/merchant_chat_history_screen.dart';
import 'package:tubulu_mobile/features/merchant/chat/screens/merchant_chat_screen.dart';
import 'package:tubulu_mobile/features/customer/rewards/screens/rewards_screen.dart';
import 'package:tubulu_mobile/features/customer/support/screens/support_tickets_screen.dart';
import 'package:tubulu_mobile/features/customer/profile/screens/addresses_screen.dart';
import 'package:tubulu_mobile/features/enabler/enabler_shell.dart';
import 'package:tubulu_mobile/features/enabler/screens/enabler_dashboard_screen.dart';
import 'package:tubulu_mobile/features/enabler/screens/mobile_onboard_screen.dart';
import 'package:tubulu_mobile/features/enabler/screens/mobile_submissions_screen.dart';


/// A [ChangeNotifier] that bridges Riverpod's [AuthNotifier] and transition loading to GoRouter's
/// [refreshListenable], so the router re-evaluates its redirect when auth
/// state or loading state changes without creating a new GoRouter instance.
class _AuthNotifierListenable extends ChangeNotifier {
  _AuthNotifierListenable(this._ref) {
    _ref.listen<AuthState>(authProvider, (_, __) => notifyListeners());
    _ref.listen<bool>(loadingCompletedProvider, (_, __) => notifyListeners());
  }

  final Ref _ref;
  AuthState get authState => _ref.read(authProvider);
}

final appRouterProvider = Provider<GoRouter>((ref) {
  final listenable = _AuthNotifierListenable(ref);

  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: listenable,
    redirect: (context, state) {
      final authState = listenable.authState;

      // Still initialising — stay on splash
      if (authState.isLoading) return '/splash';

      final loggedIn = authState.isAuthenticated;
      final onSplash = state.matchedLocation == '/splash';
      final onLogin = state.matchedLocation == '/login';
      final onLoading = state.matchedLocation == '/auth/loading';
      final loadingCompleted = ref.read(loadingCompletedProvider);

      // Force intermediate animated loading screen for logged in users
      if (loggedIn && !loadingCompleted) {
        if (!onLoading && state.matchedLocation != '/auth/set-pin' && state.matchedLocation != '/auth/onboard') {
          return '/auth/loading';
        }
        return null;
      }

      // Leave splash as soon as we know auth state
      if (onSplash) {
        return loggedIn ? _dashboardFor(authState.activeRole) : '/login';
      }

      // Unauthenticated user trying to access a protected route
      if (!loggedIn && !onLogin && !onLoading) return '/login';

      // Authenticated user landing on login or loading screen → send to dashboard
      if (loggedIn && (onLogin || onLoading)) return _dashboardFor(authState.activeRole);

      // Allow set-pin screen to be accessed by authenticated users
      if (state.matchedLocation == '/auth/set-pin') return null;

      // Force onboarding for customer role if name is not set
      if (loggedIn &&
          authState.activeRole == UserRole.customer &&
          (authState.firstName == null || authState.firstName!.trim().isEmpty)) {
        if (state.matchedLocation != '/auth/onboard' &&
            state.matchedLocation != '/auth/set-pin') {
          return '/auth/onboard';
        }
      }

      // --- ROLE GUARDS ---
      final activeRole = authState.activeRole;
      final location = state.matchedLocation;

      // Merchants/Admins shouldn't be in customer/enabler routes if they are in "Merchant Mode"
      if (activeRole == UserRole.merchantAdmin || activeRole == UserRole.superAdmin) {
        if (location.startsWith('/customer')) return '/merchant/dashboard';
        if (location.startsWith('/enabler')) return '/merchant/dashboard';
      }

      // Customers shouldn't be in merchant/enabler routes if they are in "Customer Mode"
      if (activeRole == UserRole.customer) {
        if (location.startsWith('/merchant')) return '/customer/home';
        if (location.startsWith('/enabler')) return '/customer/home';
      }

      // Enablers shouldn't be in customer/merchant routes if they are in "Enabler Mode"
      if (activeRole == UserRole.enabler) {
        if (location.startsWith('/customer')) return '/enabler/dashboard';
        if (location.startsWith('/merchant')) return '/enabler/dashboard';
      }

      return null; // No redirect needed
    },
    routes: [
      GoRoute(path: '/splash', builder: (c, s) => const SplashScreen()),
      GoRoute(path: '/login',  builder: (c, s) => const LoginScreen()),
      GoRoute(path: '/auth/loading', builder: (c, s) => const LoadingTransitionScreen()),
      GoRoute(path: '/auth/set-pin', builder: (c, s) => const SetPinScreen()),
      GoRoute(path: '/auth/onboard', builder: (c, s) => const OnboardScreen()),
      ShellRoute(
        builder: (c, s, child) => CustomerShell(child: child),
        routes: [
          GoRoute(path: '/customer/home',      builder: (c, s) => const CustomerHomeScreen()),
          GoRoute(path: '/customer/explore',   builder: (c, s) => const ExploreScreen()),
          GoRoute(
            path: '/customer/catalogue', 
            builder: (c, s) {
              final merchant = s.extra as Map<String, dynamic>?;
              return CatalogueScreen(merchant: merchant);
            },
          ),
          GoRoute(
            path: '/customer/product-details/:productId/:catalogueId',
            builder: (c, s) {
              final product = s.extra as Map<String, dynamic>?;
              final productId = s.pathParameters['productId'] ?? '';
              final catalogueId = s.pathParameters['catalogueId'] ?? '';
              return ProductDetailsScreen(
                productId: productId,
                catalogueId: catalogueId,
                product: product,
              );
            },
          ),
          GoRoute(path: '/customer/orders',    builder: (c, s) => const CustomerOrdersScreen()),
          GoRoute(path: '/customer/cart',      builder: (c, s) => const CartScreen()),
          GoRoute(path: '/customer/rewards',   builder: (c, s) => const RewardsScreen()),
          GoRoute(path: '/customer/addresses', builder: (c, s) => const AddressesScreen()),
          GoRoute(path: '/customer/support/tickets', builder: (c, s) => const SupportTicketsScreen()),
          GoRoute(path: '/customer/chat/history', builder: (c, s) => const ChatHistoryScreen()),
          GoRoute(path: '/customer/ai-concierge', builder: (c, s) => const GlobalAIChatScreen()),
          GoRoute(
            path: '/customer/chat',
            builder: (c, s) {
              final extras = s.extra as Map<String, dynamic>?;
              return ChatScreen(
                merchantName: extras?['merchantName'],
                merchantId: extras?['merchantId'],
                chatRoomId: extras?['chatRoomId'],
              );
            },
          ),
          GoRoute(
            path: '/customer/industry',
            builder: (c, s) {
              final extras = s.extra as Map<String, dynamic>?;
              return IndustryMerchantsScreen(
                industryName: extras?['name'] ?? 'Industry',
                industryColor: extras?['color'] ?? Colors.blue,
              );
            },
          ),
          GoRoute(
            path: '/customer/orders/track',
            builder: (c, s) {
              final extras = s.extra as Map<String, dynamic>;
              return TrackingWebviewScreen(
                trackingUrl: extras['url'] as String,
                orderId: extras['orderId'] as String,
              );
            },
          ),
        ],
      ),
      ShellRoute(
        builder: (c, s, child) => MerchantShell(child: child),
        routes: [
          GoRoute(path: '/merchant/dashboard', builder: (c, s) => const MerchantDashboardScreen()),
          GoRoute(path: '/merchant/feed-management', builder: (c, s) => const MerchantFeedManagementScreen()),
          GoRoute(path: '/merchant/chats',     builder: (c, s) => const MerchantChatHistoryScreen()),
          GoRoute(
            path: '/merchant/chat/:roomId',
            builder: (c, s) {
              final extras = s.extra as Map<String, dynamic>?;
              final roomId = s.pathParameters['roomId'] ?? '';
              return MerchantChatScreen(
                roomId: roomId,
                customerName: extras?['customerName'],
                customerPhone: extras?['customerPhone'],
              );
            },
          ),
          GoRoute(path: '/merchant/catalogue', builder: (c, s) => const MerchantCatalogueScreen()),
          GoRoute(path: '/merchant/orders',    builder: (c, s) => const MerchantOrdersScreen()),
          GoRoute(
            path: '/merchant/products',
            builder: (c, s) => const MerchantProductsScreen(),
            routes: [
              GoRoute(
                path: 'add/:catalogueId',
                builder: (c, s) {
                  final catalogueId = s.pathParameters['catalogueId'] ?? '';
                  return AddProductScreen(catalogueId: catalogueId);
                },
              ),
            ],
          ),
        ],
      ),
      ShellRoute(
        builder: (c, s, child) => EnablerShell(child: child),
        routes: [
          GoRoute(path: '/enabler/dashboard', builder: (c, s) => const EnablerDashboardScreen()),
          GoRoute(path: '/enabler/onboard',     builder: (c, s) => const MobileOnboardScreen()),
          GoRoute(path: '/enabler/submissions', builder: (c, s) => const MobileSubmissionsScreen()),
        ],
      ),
    ],
  );
});

String _dashboardFor(UserRole? role) {
  switch (role) {
    case UserRole.superAdmin:    return '/merchant/dashboard';
    case UserRole.merchantAdmin: return '/merchant/dashboard';
    case UserRole.enabler:       return '/enabler/dashboard';
    default:                     return '/customer/home';
  }
}
