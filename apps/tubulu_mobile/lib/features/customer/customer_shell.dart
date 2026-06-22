import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui' as ui;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:tubulu_mobile/core/auth/auth_provider.dart';
import 'package:tubulu_mobile/core/api/api_provider.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:convert' show base64Encode;
import 'package:image_picker/image_picker.dart' show ImagePicker, ImageSource;
import 'package:url_launcher/url_launcher.dart';
import 'package:dio/dio.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/providers/location_service.dart';
import '../../core/providers/preferences_provider.dart';
import 'package:flutter/foundation.dart';
import 'home/screens/home_screen.dart';

class CustomerShell extends ConsumerStatefulWidget {
  final Widget child;
  const CustomerShell({super.key, required this.child});

  @override
  ConsumerState<CustomerShell> createState() => _CustomerShellState();
}

class _CustomerShellState extends ConsumerState<CustomerShell> {
  static bool _hasPromptedContacts = false;

  @override
  void initState() {
    super.initState();
    // Request location permission and update GPS coords on first load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        initLocationService(ref, context);
        _autoSyncContacts();
        
        final prefs = ref.read(preferencesProvider);
        if (prefs.selectedContactNames == null && !_hasPromptedContacts) {
          _hasPromptedContacts = true;
          _showContactRecommendationsPicker(context, ref);
        }
      }
    });
  }

  Future<void> _autoSyncContacts() async {
    try {
      final status = await Permission.contacts.status;
      if (status.isGranted) {
        final deviceContacts = await FlutterContacts.getContacts(withProperties: true);
        final List<Map<String, String>> payload = [];
        for (var contact in deviceContacts) {
          final name = '${contact.name.first} ${contact.name.last}'.trim();
          for (var phone in contact.phones) {
            final clean = phone.number.replaceAll(RegExp(r'[^0-9]'), '');
            if (clean.isNotEmpty) {
              payload.add({'name': name.isEmpty ? 'Contact' : name, 'phoneNumber': clean});
            }
          }
        }
        final dio = ref.read(dioProvider);
        await dio.post('/user/contacts/sync', data: {'contacts': payload});
        debugPrint('[CONTACTS] Auto-sync complete. Synced ${payload.length} contacts.');
      }
    } catch (e) {
      debugPrint('[CONTACTS] Auto-sync failed: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeRole = ref.watch(authProvider).activeRole;
    final bool isMerchant = activeRole == UserRole.merchantAdmin || activeRole == UserRole.superAdmin;

    final activeTheme = ref.watch(themeProvider);
    final isDark = activeTheme == AppThemeType.sleekDark;

    Widget buildActiveIcon(IconData iconData) {
      if (!isDark) return Icon(iconData);
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFFA594F9).withOpacity(0.18),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Icon(iconData, color: const Color(0xFFA594F9)),
      );
    }

    final List<BottomNavigationBarItem> items = [
      if (isMerchant)
        BottomNavigationBarItem(
          icon: const Icon(Icons.business_center_outlined),
          activeIcon: buildActiveIcon(Icons.business_center),
          label: 'My Business',
        ),
      BottomNavigationBarItem(
        icon: const Icon(Icons.explore_outlined),
        activeIcon: buildActiveIcon(Icons.explore),
        label: 'Explore',
      ),
      BottomNavigationBarItem(
        icon: const Icon(Icons.chat_outlined),
        activeIcon: buildActiveIcon(Icons.chat),
        label: 'Chat',
      ),
      BottomNavigationBarItem(
        icon: const Icon(Icons.receipt_long_outlined),
        activeIcon: buildActiveIcon(Icons.receipt_long),
        label: 'Orders',
      ),
      BottomNavigationBarItem(
        icon: const Icon(Icons.settings_outlined),
        activeIcon: buildActiveIcon(Icons.settings),
        label: 'Settings',
      ),
    ];

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _calculateSelectedIndex(context, isMerchant),
        onTap: (index) => _onItemTapped(index, context, ref, isMerchant),
        backgroundColor: Theme.of(context).bottomNavigationBarTheme.backgroundColor,
        selectedItemColor: isDark ? const Color(0xFFA594F9) : Theme.of(context).colorScheme.primary,
        unselectedItemColor: isDark ? Colors.white54 : Colors.grey,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        items: items,
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context, bool isMerchant) {
    final String location = GoRouterState.of(context).matchedLocation;
    
    if (isMerchant) {
      if (location.startsWith('/merchant/dashboard')) return 0;
      if (location.startsWith('/customer/home')) return 1;
      if (location.startsWith('/customer/chat/history')) return 2;
      if (location.startsWith('/customer/orders')) return 3;
      return 4; // Settings
    } else {
      if (location.startsWith('/customer/home')) return 0;
      if (location.startsWith('/customer/chat/history')) return 1;
      if (location.startsWith('/customer/orders')) return 2;
      return 3; // Settings
    }
  }

  void _onItemTapped(int index, BuildContext context, WidgetRef ref, bool isMerchant) {
    if (isMerchant) {
      switch (index) {
        case 0: context.go('/merchant/dashboard'); break;
        case 1: context.go('/customer/home'); break;
        case 2: context.go('/customer/chat/history'); break;
        case 3: context.go('/customer/orders'); break;
        case 4: _showAccountSheet(context, ref); break;
      }
    } else {
      switch (index) {
        case 0: context.go('/customer/home'); break;
        case 1: context.go('/customer/chat/history'); break;
        case 2: context.go('/customer/orders'); break;
        case 3: _showAccountSheet(context, ref); break;
      }
    }
  }
}

void _showAccountSheet(BuildContext context, WidgetRef ref) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    elevation: 0,
    builder: (context) => DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.4,
      maxChildSize: 0.85,
      expand: false,
      builder: (context, scrollController) {
        return _AccountSheet(
          onLogout: () async {
            Navigator.pop(context);
            await ref.read(authProvider.notifier).logout();
          },
          parentRef: ref,
          parentContext: context,
          scrollController: scrollController,
        );
      },
    ),
  );
}

class MinimalListTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget? subtitle;
  final Widget? trailing;
  final VoidCallback onTap;

  const MinimalListTile({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.grey[700], size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: Colors.grey[900],
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    DefaultTextStyle(
                      style: TextStyle(color: Colors.grey[600]!, fontSize: 13),
                      child: subtitle!,
                    ),
                  ],
                ],
              ),
            ),
            if (trailing != null) trailing! else Icon(Icons.chevron_right, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }
}

class _AccountSheet extends ConsumerWidget {
  final VoidCallback onLogout;
  final WidgetRef parentRef;
  final BuildContext parentContext;
  final ScrollController? scrollController;
  const _AccountSheet({
    required this.onLogout,
    required this.parentRef,
    required this.parentContext,
    this.scrollController,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: SingleChildScrollView(
        controller: scrollController,
        padding: const EdgeInsets.symmetric(vertical: 24),
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
            GestureDetector(
              onTap: () => _pickAndUploadProfileImage(parentContext, parentRef),
              child: CircleAvatar(
                radius: 40,
                backgroundColor: Colors.grey[200],
                backgroundImage: (authState.profilePictureUrl != null && authState.profilePictureUrl!.isNotEmpty)
                    ? NetworkImage(authState.profilePictureUrl!.startsWith('http') 
                        ? authState.profilePictureUrl! 
                        : '${ApiConfig.baseUrl.replaceAll('/api/v1', '')}${authState.profilePictureUrl}')
                    : null,
                child: (authState.profilePictureUrl == null || authState.profilePictureUrl!.isEmpty)
                    ? Icon(Icons.person, size: 48, color: Colors.grey[400])
                    : null,
              ),
            ),
            if (authState.profilePictureUrl != null && authState.profilePictureUrl!.isNotEmpty) ...[
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => _removeProfileImage(parentContext, parentRef),
                child: const Text(
                  'Remove Photo',
                  style: TextStyle(color: Colors.red, fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
            ],
            const SizedBox(height: 16),
            Text(
              (authState.firstName != null && authState.firstName!.isNotEmpty)
                  ? '${authState.firstName} ${authState.lastName ?? ""}'.trim()
                  : 'Set Name',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.grey[900]),
            ),
            Text(
              authState.phoneNumber ?? '',
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
            const SizedBox(height: 32),
            
            MinimalListTile(
              icon: Icons.person_outline,
              title: 'Profile',
              onTap: () {
                Navigator.pop(context);
                _showEditProfileDialog(parentContext, parentRef);
              },
            ),
            MinimalListTile(
              icon: Icons.location_on_outlined,
              title: 'My Addresses',
              onTap: () async {
                Navigator.pop(context);
                await context.push('/customer/addresses');
                if (parentContext.mounted) {
                  _showAccountSheet(parentContext, parentRef);
                }
              },
            ),
            MinimalListTile(
              icon: Icons.share_outlined,
              title: 'Invite Friends',
              subtitle: const Text('Share app with your friends to earn rewards'),
              onTap: () async {
                Navigator.pop(context);
                try {
                  final dio = parentRef.read(dioProvider);
                  final response = await dio.get('/user/wallet');
                  final referralCode = response.data['data']['referralCode'] ?? 'TUBULU';
                  await Share.share(
                    'Join me on Tubulu! Use my referral code: $referralCode to get 100 points on sign up. Download the app today: http://34.135.72.28',
                  );
                } catch (e) {
                  await Share.share(
                    'Join me on Tubulu! Recommend your favorite local shops to me and earn rewards. Download the app today: http://34.135.72.28',
                  );
                }
                if (parentContext.mounted) {
                  _showAccountSheet(parentContext, parentRef);
                }
              },
            ),

            if (authState.role == UserRole.merchantAdmin || authState.role == UserRole.superAdmin)
              MinimalListTile(
                icon: Icons.business_center_outlined,
                title: 'Switch to Merchant Mode',
                onTap: () async {
                  Navigator.pop(context);
                  await parentRef.read(authProvider.notifier).switchRole(UserRole.merchantAdmin);
                  if (context.mounted) context.go('/merchant/dashboard');
                },
              ),

            if (authState.role == UserRole.enabler)
              MinimalListTile(
                icon: Icons.person_pin_outlined,
                title: 'Switch to Enabler Mode',
                onTap: () async {
                  Navigator.pop(context);
                  await parentRef.read(authProvider.notifier).switchRole(UserRole.enabler);
                  if (context.mounted) context.go('/enabler/dashboard');
                },
              ),

            const SizedBox(height: 16),
            MinimalListTile(
              icon: Icons.palette_outlined,
              title: 'App Theme',
              subtitle: Consumer(
                builder: (context, ref, child) {
                  final themeType = ref.watch(themeProvider);
                  final themeName = themeType == AppThemeType.oceanBlue ? 'Tubulu Blue' : 'Regional Theme';
                  return Text(themeName);
                },
              ),
              onTap: () {
                _showThemeSelectionDialog(parentContext, parentRef);
              },
            ),

            MinimalListTile(
              icon: Icons.contacts_outlined,
              title: 'Contact Recommendation',
              subtitle: const Text('Browse and select contacts from your phone'),
              onTap: () {
                Navigator.pop(context);
                _showContactRecommendationsPicker(parentContext, parentRef);
              },
            ),
            MinimalListTile(
              icon: Icons.support_agent,
              title: 'Support Tickets',
              onTap: () async {
                Navigator.pop(context);
                await context.push('/customer/support/tickets');
                if (parentContext.mounted) {
                  _showAccountSheet(parentContext, parentRef);
                }
              },
            ),
            MinimalListTile(
              icon: Icons.location_on,
              title: 'Mock Location (Debug/Staging)',
              subtitle: Consumer(
                builder: (context, ref, child) {
                  final prefs = ref.watch(preferencesProvider);
                  return Text('Coords: ${prefs.lat.toStringAsFixed(5)}, ${prefs.lng.toStringAsFixed(5)}\nRadius: ${prefs.radius.toStringAsFixed(1)} km');
                },
              ),
              onTap: () {
                _showMockLocationDialog(parentContext, parentRef);
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

  void _showEditProfileDialog(BuildContext context, WidgetRef ref) {
    final authState = ref.read(authProvider);
    final firstNameController = TextEditingController(text: authState.firstName ?? '');
    final lastNameController = TextEditingController(text: authState.lastName ?? '');
    final emailController = TextEditingController(text: authState.email ?? '');

    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Edit Profile'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: firstNameController,
                  decoration: const InputDecoration(labelText: 'First Name *'),
                ),
                TextField(
                  controller: lastNameController,
                  decoration: const InputDecoration(labelText: 'Last Name (Optional)'),
                ),
                TextField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email (Optional)'),
                ),
              ],
            ),
          ),
          actions: [
            Row(
              children: [
                TextButton(
                  onPressed: () async {
                    Navigator.pop(dialogContext);
                    await ref.read(authProvider.notifier).logout();
                  },
                  child: const Text('Logout', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                ),
                const Spacer(),
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () async {
                    final firstName = firstNameController.text.trim();
                    final lastName = lastNameController.text.trim();
                    final email = emailController.text.trim();

                    if (firstName.isEmpty) {
                      ScaffoldMessenger.of(dialogContext).showSnackBar(
                        const SnackBar(content: Text('First Name is required')),
                      );
                      return;
                    }

                    if (email.isNotEmpty) {
                      final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
                      if (!emailRegex.hasMatch(email)) {
                        ScaffoldMessenger.of(dialogContext).showSnackBar(
                          const SnackBar(content: Text('Please enter a valid email address')),
                        );
                        return;
                      }
                    }

                    try {
                      final dio = ref.read(dioProvider);
                      final response = await dio.post('/user/onboard', data: {
                        'firstName': firstName,
                        if (lastName.isNotEmpty) 'lastName': lastName,
                        if (email.isNotEmpty) 'email': email,
                      });

                      if (response.data['success'] == true) {
                        await ref.read(authProvider.notifier).updateProfileState(
                          firstName,
                          lastName.isNotEmpty ? lastName : null,
                          email.isNotEmpty ? email : null,
                        );

                        if (dialogContext.mounted) {
                          Navigator.pop(dialogContext);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Profile updated successfully'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        }
                      }
                    } catch (e) {
                      if (dialogContext.mounted) {
                        ScaffoldMessenger.of(dialogContext).showSnackBar(
                          SnackBar(content: Text('Failed to update profile: ${e.toString()}')),
                        );
                      }
                    }
                  },
                  child: const Text('Save'),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  void _showMockLocationDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return FutureBuilder<Response>(
          future: ref.read(dioProvider).get('/locations/cities'),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const AlertDialog(
                content: SizedBox(
                  height: 100,
                  child: Center(child: CircularProgressIndicator()),
                ),
              );
            }
            if (snapshot.hasError || snapshot.data?.data['success'] != true) {
              return AlertDialog(
                title: const Text('Error'),
                content: const Text('Failed to load cities from database.'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(dialogContext),
                    child: const Text('Close'),
                  ),
                ],
              );
            }

            final List<dynamic> cities = snapshot.data?.data['data'] ?? [];
            if (cities.isEmpty) {
              return AlertDialog(
                title: const Text('No Cities'),
                content: const Text('No active cities found in database.'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(dialogContext),
                    child: const Text('Close'),
                  ),
                ],
              );
            }

            final currentPrefs = ref.read(preferencesProvider);
            Map<String, dynamic>? selectedCity;
            for (var c in cities) {
              final double? cLat = double.tryParse(c['latitude'].toString());
              final double? cLng = double.tryParse(c['longitude'].toString());
              if (cLat != null && cLng != null &&
                  (cLat - currentPrefs.lat).abs() < 0.001 &&
                  (cLng - currentPrefs.lng).abs() < 0.001) {
                selectedCity = Map<String, dynamic>.from(c);
                break;
              }
            }

            double? customRadius;
            String searchQuery = '';

            return StatefulBuilder(
              builder: (builderContext, setDialogState) {
                if (selectedCity != null && customRadius == null) {
                  customRadius = double.tryParse(selectedCity!['radius'].toString()) ?? 20.0;
                }
                final filteredCities = cities.where((c) {
                  final name = c['name']?.toString().toLowerCase() ?? '';
                  return name.contains(searchQuery.toLowerCase());
                }).toList();

                return AlertDialog(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  title: const Text('Select Staging City', style: TextStyle(fontWeight: FontWeight.bold)),
                  content: SizedBox(
                    width: double.maxFinite,
                    height: 440,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextField(
                          decoration: const InputDecoration(
                            hintText: 'Search cities...',
                            prefixIcon: Icon(Icons.search),
                            border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                          onChanged: (val) {
                            setDialogState(() {
                              searchQuery = val.trim();
                            });
                          },
                        ),
                        const SizedBox(height: 12),
                        Expanded(
                          child: filteredCities.isEmpty
                              ? const Center(child: Text('No matching cities found.'))
                              : ListView.builder(
                                  itemCount: filteredCities.length,
                                  itemBuilder: (context, index) {
                                    final c = filteredCities[index];
                                    final isSelected = selectedCity != null && selectedCity!['id'] == c['id'];

                                    final String cName = c['name']?.toString() ?? 'Unknown';
                                    final String cNameLower = cName.toLowerCase();
                                    final double? dbLat = double.tryParse(c['latitude']?.toString() ?? '');
                                    final double? dbLng = double.tryParse(c['longitude']?.toString() ?? '');
                                    double resLat = dbLat ?? 12.9716;
                                    double resLng = dbLng ?? 77.5946;
                                    if (cNameLower.contains('mysuru') || cNameLower.contains('mysore')) {
                                      resLat = 12.3086;
                                      resLng = 76.6548;
                                    }

                                    return ListTile(
                                      title: Text(
                                        cName,
                                        style: TextStyle(
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                          color: isSelected ? Colors.purple : null,
                                        ),
                                      ),
                                      subtitle: Text(
                                        'Coords: ${resLat.toStringAsFixed(4)}, ${resLng.toStringAsFixed(4)} (${c['radius']} km)',
                                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                      ),
                                      trailing: isSelected
                                          ? const Icon(Icons.check_circle, color: Colors.purple)
                                          : null,
                                      selected: isSelected,
                                      onTap: () {
                                        setDialogState(() {
                                          selectedCity = Map<String, dynamic>.from(c);
                                          customRadius = double.tryParse(c['radius'].toString()) ?? 20.0;
                                        });
                                      },
                                    );
                                  },
                                ),
                        ),
                        if (selectedCity != null) ...[
                          const SizedBox(height: 12),
                          const Divider(),
                          Builder(
                            builder: (context) {
                              final String selName = selectedCity!['name']?.toString() ?? '';
                              final String selNameLower = selName.toLowerCase();
                              final double? selDbLat = double.tryParse(selectedCity!['latitude']?.toString() ?? '');
                              final double? selDbLng = double.tryParse(selectedCity!['longitude']?.toString() ?? '');
                              double selResLat = selDbLat ?? 12.9716;
                              double selResLng = selDbLng ?? 77.5946;
                              if (selNameLower.contains('mysuru') || selNameLower.contains('mysore')) {
                                selResLat = 12.3086;
                                selResLng = 76.6548;
                              }
                              return Text(
                                'Selected: $selName\nCoords: ${selResLat.toStringAsFixed(4)}, ${selResLng.toStringAsFixed(4)}',
                                style: TextStyle(color: Colors.grey[700], fontSize: 13, fontWeight: FontWeight.w500),
                                textAlign: TextAlign.center,
                              );
                            }
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Text('Radius: ', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                              Expanded(
                                child: Slider(
                                  value: customRadius ?? 20.0,
                                  min: 1.0,
                                  max: 100.0,
                                  divisions: 99,
                                  label: '${(customRadius ?? 20.0).toStringAsFixed(1)} km',
                                  activeColor: Colors.purple,
                                  onChanged: (val) {
                                    setDialogState(() {
                                      customRadius = val;
                                    });
                                  },
                                ),
                              ),
                              Text('${(customRadius ?? 20.0).toStringAsFixed(1)} km', style: const TextStyle(fontSize: 13)),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () async {
                        try {
                          final messenger = ScaffoldMessenger.of(dialogContext);
                          Navigator.pop(dialogContext);
                          Navigator.pop(context);
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Fetching live GPS location...')),
                          );
                          await initLocationService(ref, context);
                        } catch (e) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error resolving live location: $e')),
                          );
                        }
                      },
                      child: const Text('Live Location', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(dialogContext),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: selectedCity == null
                          ? null
                          : () async {
                              try {
                                final String selName = selectedCity!['name']?.toString() ?? '';
                                final String selNameLower = selName.toLowerCase();
                                final double? selDbLat = double.tryParse(selectedCity!['latitude']?.toString() ?? '');
                                final double? selDbLng = double.tryParse(selectedCity!['longitude']?.toString() ?? '');
                                double selResLat = selDbLat ?? 12.9716;
                                double selResLng = selDbLng ?? 77.5946;
                                if (selNameLower.contains('mysuru') || selNameLower.contains('mysore')) {
                                  selResLat = 12.3086;
                                  selResLng = 76.6548;
                                }

                                final double lat = selResLat;
                                final double lng = selResLng;
                                final double radius = customRadius ?? double.parse(selectedCity!['radius'].toString());
                                final String cityName = selectedCity!['name'].toString();

                                final messenger = ScaffoldMessenger.of(dialogContext);

                                 final notifier = ref.read(preferencesProvider.notifier);
                                 final themeNotifier = ref.read(themeProvider.notifier);
                                 final dio = ref.read(dioProvider);
                                 await notifier.updateLocationAndRadius(lat, lng, radius, cityName: cityName);
                                 await resolveCityTheme(notifier, themeNotifier, dio, lat, lng);

                                Navigator.pop(dialogContext);
                                Navigator.pop(context);

                                messenger.showSnackBar(
                                  SnackBar(
                                    content: Text('Mocked Location to: $cityName'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              } catch (e) {
                                ScaffoldMessenger.of(dialogContext).showSnackBar(
                                  SnackBar(content: Text('Error: ${e.toString()}')),
                                );
                              }
                            },
                      child: const Text('Apply'),
                    ),
                  ],
                );
              },
            );
          },
        );
      },
    );
  }

  void _showThemeSelectionDialog(BuildContext context, WidgetRef parentRef) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return Consumer(
          builder: (context, ref, child) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Text('Select App Theme', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildThemeButton(context, ref, AppThemeType.oceanBlue, const Color(0xFF1565C0), 'Tubulu Blue'),
                  _buildThemeButton(context, ref, AppThemeType.regional, const Color(0xFFD4AF37), 'Regional Theme'),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text('Close'),
                ),
              ],
            );
          }
        );
      },
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

Future<void> _pickAndUploadProfileImage(BuildContext context, WidgetRef ref) async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
      if (image == null) return;

      final bytes = await image.readAsBytes();
      final base64String = base64Encode(bytes);
      final authState = ref.read(authProvider);

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Uploading profile photo...')),
        );
      }

      final dio = ref.read(dioProvider);
      final response = await dio.post('/user/onboard', data: {
        'firstName': authState.firstName ?? 'User',
        'file': base64String,
        'mimeType': 'image/jpeg',
        'fileName': 'profile.jpg',
      });

      if (response.data['success'] == true) {
        final profileUrl = response.data['data']['profilePictureUrl'];
        await ref.read(authProvider.notifier).updateProfileState(
          authState.firstName ?? 'User',
          authState.lastName,
          authState.email,
          profilePictureUrl: profileUrl,
        );

        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profile photo updated successfully'), backgroundColor: Colors.green),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Upload failed: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _removeProfileImage(BuildContext context, WidgetRef ref) async {
    try {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Removing profile photo...')),
        );
      }

      final dio = ref.read(dioProvider);
      final authState = ref.read(authProvider);
      final response = await dio.post('/user/onboard', data: {
        'firstName': authState.firstName ?? 'User',
        'removePhoto': true,
      });

      if (response.data['success'] == true) {
        await ref.read(authProvider.notifier).updateProfileState(
          authState.firstName ?? 'User',
          authState.lastName,
          authState.email,
          profilePictureUrl: '',
        );

        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profile photo removed successfully'), backgroundColor: Colors.green),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to remove photo: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _showContactRecommendationsPicker(BuildContext context, WidgetRef ref) async {
    try {
      final hasPermission = await FlutterContacts.requestPermission(readonly: true);
      if (!hasPermission) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Contacts permission is required to browse contacts.')),
          );
        }
        return;
      }

      if (!context.mounted) return;

      final initialPrefs = ref.read(preferencesProvider);
      final initialSelectedNames = initialPrefs.selectedContactNames ?? [];

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) {
          final Set<String> selectedNames = {};
          List<Map<String, dynamic>>? loadedContacts;
          bool hasInitializedSelections = false;

          return Consumer(
            builder: (context, dialogRef, _) {
              String searchQuery = '';
              return StatefulBuilder(
                builder: (context, setState) {
                  return AlertDialog(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                title: const Text('Contact Recommendation', style: TextStyle(fontWeight: FontWeight.bold)),
                content: SizedBox(
                  width: double.maxFinite,
                  height: 440,
                  child: Column(
                    children: [
                      TextField(
                        decoration: const InputDecoration(
                          hintText: 'Search contacts...',
                          prefixIcon: Icon(Icons.search),
                          border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                        onChanged: (val) {
                          setState(() {
                            searchQuery = val.trim().toLowerCase();
                          });
                        },
                      ),
                      const SizedBox(height: 12),
                      Expanded(
                        child: FutureBuilder<List<Map<String, dynamic>>>(
                          future: _loadContactsAndRecommendations(dialogRef),
                          builder: (context, snapshot) {
                            if (snapshot.connectionState == ConnectionState.waiting) {
                              return const Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    CircularProgressIndicator(),
                                    SizedBox(height: 16),
                                    Text('Loading your contacts...'),
                                  ],
                                ),
                              );
                            }

                            if (snapshot.hasError) {
                              return Center(
                                child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.red)),
                              );
                            }

                            loadedContacts = snapshot.data ?? [];

                            if (!hasInitializedSelections) {
                              hasInitializedSelections = true;
                              for (var c in loadedContacts!) {
                                if (initialSelectedNames.contains(c['name'])) {
                                  selectedNames.add(c['name'].toString());
                                }
                              }
                            }

                            final filteredContacts = loadedContacts!.where((c) {
                              final name = c['name']?.toString().toLowerCase() ?? '';
                              final phone = c['phone']?.toString().toLowerCase() ?? '';
                              return name.contains(searchQuery) || phone.contains(searchQuery);
                            }).toList();

                            if (filteredContacts.isEmpty) {
                              return const Center(child: Text('No matching contacts found.'));
                            }

                            return ListView.builder(
                              itemCount: filteredContacts.length,
                              itemBuilder: (ctx, idx) {
                                final c = filteredContacts[idx];
                                final recs = c['recommendations'] as List;
                                final hasRecs = recs.isNotEmpty;
                                final isSelected = selectedNames.contains(c['name']);

                                return ListTile(
                                  leading: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Checkbox(
                                        value: isSelected,
                                        activeColor: Colors.purple,
                                        onChanged: (bool? val) {
                                          setState(() {
                                            if (val == true) {
                                              selectedNames.add(c['name'].toString());
                                            } else {
                                              selectedNames.remove(c['name'].toString());
                                            }
                                          });
                                        },
                                      ),
                                      CircleAvatar(
                                        backgroundColor: hasRecs ? Colors.purple.shade100 : Colors.grey.shade200,
                                        child: Text(
                                          c['name'].isNotEmpty ? c['name'][0].toUpperCase() : '?',
                                          style: TextStyle(color: hasRecs ? Colors.purple : Colors.grey.shade700),
                                        ),
                                      ),
                                    ],
                                  ),
                                  title: Text(c['name'], style: TextStyle(fontWeight: hasRecs ? FontWeight.bold : FontWeight.normal)),
                                  subtitle: Text(
                                    hasRecs 
                                        ? '${c['phone']} • ${recs.length} recommendation(s)' 
                                        : '${c['phone']} • No recommendations yet',
                                    style: TextStyle(color: hasRecs ? Colors.purple : Colors.grey),
                                  ),
                                  trailing: Icon(
                                    hasRecs ? Icons.star_rate_rounded : Icons.add_comment_outlined, 
                                    color: hasRecs ? Colors.amber : Colors.grey,
                                  ),
                                  onTap: () {
                                    setState(() {
                                      if (isSelected) {
                                        selectedNames.remove(c['name'].toString());
                                      } else {
                                        selectedNames.add(c['name'].toString());
                                      }
                                    });
                                  },
                                );
                              },
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () async {
                      if (initialSelectedNames.isEmpty) {
                        await dialogRef.read(preferencesProvider.notifier).updateSelectedContacts([]);
                      }
                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                      }
                    },
                    child: const Text('Close'),
                  ),
                  if (loadedContacts != null)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.purple,
                        foregroundColor: Colors.white,
                      ),
                      onPressed: () async {
                        await dialogRef.read(preferencesProvider.notifier).updateSelectedContacts(selectedNames.toList());
                        if (context.mounted) {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Contact filter applied to your feed!')),
                          );
                        }
                      },
                      child: Text('Apply Filter (${selectedNames.length})'),
                    ),
                ],
              );
                }
              );
            },
          );
        },
      );
    } catch (e) {
      debugPrint('[CONTACTS] Error launching picker: $e');
    }
  }

  Future<List<Map<String, dynamic>>> _loadContactsAndRecommendations(WidgetRef ref) async {
    final dio = ref.read(dioProvider);
    final prefs = ref.read(preferencesProvider);
    final deviceContacts = await FlutterContacts.getContacts(withProperties: true);
    
    final response = await dio.get('/user/friend-recommendations?lat=${prefs.lat}&lng=${prefs.lng}');
    final data = response.data['data'];
    final List<dynamic> carousel = (data is Map && data.containsKey('carousel')) ? data['carousel'] : [];
    
    final List<Map<String, dynamic>> allPhoneContacts = [];

    for (var contact in deviceContacts) {
      final name = '${contact.name.first} ${contact.name.last}'.trim();
      final phone = contact.phones.isNotEmpty ? contact.phones.first.number : '';
      if (phone.isNotEmpty) {
        final List<dynamic> matches = [];
        for (var item in carousel) {
          final List<dynamic> recs = item['recommendations'] ?? [];
          for (var rec in recs) {
            if (rec['friendName']?.toString().toLowerCase() == name.toLowerCase()) {
              matches.add({
                'integrationId': item['integrationId'],
                'rating': rec['rating'],
                'reviewText': rec['reviewText'],
              });
            }
          }
        }
        allPhoneContacts.add({
          'name': name.isEmpty ? 'Contact' : name,
          'phone': phone,
          'recommendations': matches,
        });
      }
    }

    allPhoneContacts.sort((a, b) => a['name'].toLowerCase().compareTo(b['name'].toLowerCase()));
    return allPhoneContacts;
  }

  void _showInviteDialog(BuildContext context, String name, String phone) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text('Invite $name'),
          content: Text('$name is not on Tubulu yet. Would you like to send them a recommendation request/invite?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0091FF),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                final uri = Uri.parse('sms:$phone?body=${Uri.encodeComponent("Hey $name, join me on Tubulu! Recommend your favorite local shops to me.")}');
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri);
                } else {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Could not open messaging for $phone')),
                    );
                  }
                }
              },
              child: const Text('Send Invite'),
            ),
          ],
        );
      },
    );
  }

  void _showRecommendationsList(BuildContext context, String friendName, List<dynamic> recs) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text('Recommendations by $friendName'),
          content: SizedBox(
            width: double.maxFinite,
            height: 300,
            child: ListView.builder(
              itemCount: recs.length,
              itemBuilder: (ctx, idx) {
                final r = recs[idx];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Recommended Store', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            Row(
                              children: List.generate(5, (index) => Icon(
                                Icons.star, 
                                size: 14, 
                                color: index < (r['rating'] ?? 5) ? Colors.amber : Colors.grey.shade300
                              )),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          r['reviewText'] != null && r['reviewText'].toString().isNotEmpty 
                              ? '"${r['reviewText']}"' 
                              : '"No comment left"',
                          style: const TextStyle(fontStyle: FontStyle.italic, fontSize: 13, color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

// ---------------------------------------------------------------------------
// Sync Contacts Tile — standalone widget for the Settings sheet
// ---------------------------------------------------------------------------
class _SyncContactsTile extends ConsumerStatefulWidget {
  @override
  ConsumerState<_SyncContactsTile> createState() => _SyncContactsTileState();
}

class _SyncContactsTileState extends ConsumerState<_SyncContactsTile> {
  bool _isSyncing = false;
  String? _lastSyncStatus;

  Future<void> _syncNow() async {
    if (_isSyncing) return;
    setState(() {
      _isSyncing = true;
      _lastSyncStatus = null;
    });

    try {
      var status = await Permission.contacts.status;

      if (status.isPermanentlyDenied) {
        setState(() => _isSyncing = false);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Contacts permission is blocked. Please enable it in Settings.'),
            action: SnackBarAction(
              label: 'Open Settings',
              onPressed: () => openAppSettings(),
            ),
            duration: const Duration(seconds: 5),
          ),
        );
        return;
      }

      if (status.isDenied || status.isRestricted) {
        status = await Permission.contacts.request();
        if (!status.isGranted) {
          setState(() {
            _isSyncing = false;
            _lastSyncStatus = 'Permission denied';
          });
          return;
        }
      }

      final hasPermission = await FlutterContacts.requestPermission(readonly: true);
      if (!hasPermission) {
        setState(() {
          _isSyncing = false;
          _lastSyncStatus = 'Permission not granted';
        });
        return;
      }

      final deviceContacts = await FlutterContacts.getContacts(withProperties: true);
      final List<Map<String, String>> payload = [];

      for (var contact in deviceContacts) {
        final name = '${contact.name.first} ${contact.name.last}'.trim();
        for (var phone in contact.phones) {
          final clean = phone.number.replaceAll(RegExp(r'[^0-9]'), '');
          if (clean.isNotEmpty) {
            payload.add({'name': name.isEmpty ? 'Contact' : name, 'phoneNumber': clean});
          }
        }
      }

      final dio = ref.read(dioProvider);
      final response = await dio.post('/user/contacts/sync', data: {'contacts': payload});

      if (response.statusCode == 200) {
        ref.invalidate(personalizedRecommendationsProvider);
        setState(() {
          _isSyncing = false;
          _lastSyncStatus = '${payload.length} contacts synced ✓';
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${payload.length} contacts synced! Recommendations updated.'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        _isSyncing = false;
        _lastSyncStatus = 'Sync failed';
      });
      debugPrint('[CONTACTS SYNC] Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: _isSyncing
          ? const SizedBox(
              width: 24, height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.people_alt_outlined, color: Colors.purple),
      title: const Text('Friend Recommendations'),
      subtitle: Text(
        _lastSyncStatus ?? 'Sync contacts to see what your friends recommend',
        style: TextStyle(
          fontSize: 12,
          color: _lastSyncStatus != null && _lastSyncStatus!.contains('✓')
              ? Colors.green
              : Colors.grey.shade600,
        ),
      ),
      trailing: TextButton(
        onPressed: _isSyncing ? null : _syncNow,
        child: Text(
          _isSyncing ? 'Syncing...' : 'Sync Now',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: _isSyncing ? Colors.grey : Colors.purple,
          ),
        ),
      ),
    );
  }
}
