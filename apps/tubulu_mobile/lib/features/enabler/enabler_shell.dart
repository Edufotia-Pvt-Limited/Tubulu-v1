import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:tubulu_mobile/core/auth/auth_provider.dart';

class EnablerShell extends ConsumerWidget {
  final Widget child;
  const EnablerShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _calculateSelectedIndex(context),
        onTap: (index) => _onItemTapped(index, context, ref),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.add_business_outlined), activeIcon: Icon(Icons.add_business), label: 'Onboard'),
          BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), activeIcon: Icon(Icons.assignment), label: 'Submissions'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Account'),
        ],
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/enabler/dashboard')) return 0;
    if (location.startsWith('/enabler/onboard')) return 1;
    if (location.startsWith('/enabler/submissions')) return 2;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context, WidgetRef ref) {
    switch (index) {
      case 0: context.go('/enabler/dashboard'); break;
      case 1: context.go('/enabler/onboard'); break;
      case 2: context.go('/enabler/submissions'); break;
      case 3: _showAccountSheet(context, ref); break;
    }
  }

  void _showAccountSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _AccountSheet(onLogout: () async {
        Navigator.pop(context);
        await ref.read(authProvider.notifier).logout();
      }),
    );
  }
}

class _AccountSheet extends ConsumerWidget {
  final VoidCallback onLogout;
  const _AccountSheet({required this.onLogout});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
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
              backgroundColor: Colors.indigo,
              child: Icon(Icons.person_pin, size: 36, color: Colors.white),
            ),
            const SizedBox(height: 16),
            const Text(
              'Enabler Executive Account',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            if (authState.phoneNumber != null)
              Text(
                'Phone: ${authState.phoneNumber}',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            const SizedBox(height: 24),
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
}
