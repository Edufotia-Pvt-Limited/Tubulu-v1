import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:tubulu_mobile/core/auth/auth_provider.dart';
import 'package:tubulu_mobile/features/merchant/dashboard/providers/dashboard_provider.dart';
import 'package:tubulu_mobile/core/providers/location_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';

class MerchantShell extends ConsumerStatefulWidget {
  final Widget child;
  const MerchantShell({super.key, required this.child});

  @override
  ConsumerState<MerchantShell> createState() => _MerchantShellState();
}

class _MerchantShellState extends ConsumerState<MerchantShell> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        initLocationService(ref, context);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _calculateSelectedIndex(context),
        onTap: (index) => _onItemTapped(index, context),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Stats'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory), label: 'Products'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chats'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Account'),
        ],
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/merchant/dashboard')) return 0;
    if (location.startsWith('/merchant/products')) return 1;
    if (location.startsWith('/merchant/orders')) return 2;
    if (location.startsWith('/merchant/chats') || location.startsWith('/merchant/chat')) return 3;
    if (location.startsWith('/merchant/account')) return 4;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0: context.go('/merchant/dashboard'); break;
      case 1: context.go('/merchant/products'); break;
      case 2: context.go('/merchant/orders'); break;
      case 3: context.go('/merchant/chats'); break;
      case 4: _showAccountSheet(context, ref); break;
    }
  }

}

void _showAccountSheet(BuildContext context, WidgetRef ref) {
  showModalBottomSheet(
    context: context,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (_) => _AccountSheet(
      onLogout: () async {
        Navigator.pop(context);
        await ref.read(authProvider.notifier).logout();
      },
      parentRef: ref,
      parentContext: context,
    ),
  );
}

class _AccountSheet extends ConsumerWidget {
  final VoidCallback onLogout;
  final WidgetRef parentRef;
  final BuildContext parentContext;
  const _AccountSheet({
    required this.onLogout,
    required this.parentRef,
    required this.parentContext,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailsAsync = ref.watch(merchantDetailsProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            Container(
              width: 40, height: 4,
              margin: const EdgeInsets.only(bottom: 24),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const CircleAvatar(
              radius: 36,
              backgroundColor: Color(0xFF3D5AFE),
              child: Icon(Icons.store, size: 36, color: Colors.white),
            ),
            const SizedBox(height: 16),
            detailsAsync.when(
              data: (data) => Text(
                data['integrationName']?.toString() ?? 'Merchant Account',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              loading: () => const Text(
                'Loading...',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              error: (_, __) => const Text(
                'Merchant Account',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
            detailsAsync.when(
              data: (data) {
                final phone = data['phoneNumber']?.toString() ?? '';
                final addrLine = data['addressLine']?.toString() ?? '';
                final city = data['city']?.toString() ?? '';
                final pincode = data['pincode']?.toString() ?? '';
                final addressParts = [addrLine, city, pincode].where((s) => s.isNotEmpty).join(', ');

                return Column(
                  children: [
                    if (phone.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.phone_outlined, size: 14, color: Colors.grey[600]),
                          const SizedBox(width: 6),
                          Text(
                            phone,
                            style: TextStyle(fontSize: 13, color: Colors.grey[700], fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                    ],
                    if (addressParts.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(top: 2),
                              child: Icon(Icons.location_on_outlined, size: 14, color: Colors.grey[600]),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                addressParts,
                                textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 13, color: Colors.grey[700]),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 24),
            ListTile(
              leading: const Icon(Icons.campaign_outlined, color: Colors.orange),
              title: const Text('Manage Store Feed'),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () async {
                Navigator.pop(context);
                await context.push('/merchant/feed-management');
                if (parentContext.mounted) {
                  _showAccountSheet(parentContext, parentRef);
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings_outlined),
              title: const Text('Settings'),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.shopping_bag_outlined, color: Colors.green),
              title: const Text('Switch to Customer Mode', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () async {
                 Navigator.pop(context);
                 await ref.read(authProvider.notifier).switchRole(UserRole.customer);
                 if (context.mounted) context.go('/customer/home');
              },
            ),
            const Divider(),
            const SizedBox(height: 8),
            const Text(
              'Select App Theme',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildThemeButton(context, ref, AppThemeType.lavenderPurple, const Color(0xFF7D50F0), 'Purple'),
                _buildThemeButton(context, ref, AppThemeType.forestGreen, const Color(0xFF2E7D32), 'Green'),
                _buildThemeButton(context, ref, AppThemeType.oceanBlue, const Color(0xFF1565C0), 'Blue'),
                _buildThemeButton(context, ref, AppThemeType.sleekDark, const Color(0xFF121212), 'Dark', isDark: true),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Logout', style: TextStyle(color: Colors.red)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: onLogout,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeButton(
    BuildContext context,
    WidgetRef ref,
    AppThemeType themeType,
    Color color,
    String label, {
    bool isDark = false,
  }) {
    final activeTheme = ref.watch(themeProvider);
    final isSelected = activeTheme == themeType;

    return GestureDetector(
      onTap: () => ref.read(themeProvider.notifier).setTheme(themeType),
      child: Column(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected
                    ? (isDark ? Colors.purpleAccent : Colors.black)
                    : Colors.transparent,
                width: 3,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: isSelected
                ? const Icon(Icons.check, color: Colors.white, size: 20)
                : (isDark ? const Icon(Icons.dark_mode, color: Colors.grey, size: 20) : null),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
}
