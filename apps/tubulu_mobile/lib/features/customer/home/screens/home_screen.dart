import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/api/api_provider.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/theme_provider.dart';
import '../../../../core/widgets/tubulu_image.dart';
import '../../../../core/providers/preferences_provider.dart';
import '../widgets/merchant_card.dart';
import '../../orders/screens/orders_list_screen.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';


// ---------------------------------------------------------------------------
// Providers
// Define static industries for visual grid
class IndustryItem {
  final String name;
  final IconData icon;
  final Color color;
  const IndustryItem({required this.name, required this.icon, required this.color});
}

const List<IndustryItem> kIndustries = [
  IndustryItem(name: 'Food & Restaurant', icon: Icons.restaurant_rounded, color: Color(0xFFE15B4D)),
  IndustryItem(name: 'Groceries', icon: Icons.shopping_basket_rounded, color: Color(0xFF57CA8C)),
  IndustryItem(name: 'Computer Institute', icon: Icons.computer_rounded, color: Color(0xFF7D50F0)),
  IndustryItem(name: 'Healthcare & Utilities', icon: Icons.medical_services_rounded, color: Color(0xFFE91E63)),
  IndustryItem(name: 'Hotel', icon: Icons.hotel_rounded, color: Color(0xFF4A90E2)),
  IndustryItem(name: 'Real Estate', icon: Icons.location_city_rounded, color: Color(0xFFF39C12)),
  IndustryItem(name: 'Automotive', icon: Icons.directions_car_filled_rounded, color: Color(0xFF34495E)),
  IndustryItem(name: 'Education', icon: Icons.school_rounded, color: Color(0xFF1ABC9C)),
  IndustryItem(name: 'Travel', icon: Icons.flight_takeoff_rounded, color: Color(0xFF2ECC71)),
  IndustryItem(name: 'Fashion', icon: Icons.checkroom_rounded, color: Color(0xFFD81B60)),
  IndustryItem(name: 'Govt Sector', icon: Icons.domain_rounded, color: Color(0xFF607D8B)),
];

// ---------------------------------------------------------------------------

final categoriesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/categories');
    final rawData = response.data['data'];
    if (rawData == null) return [];
    return List<Map<String, dynamic>>.from(rawData);
  } catch (e) {
    debugPrint('Error fetching categories: $e');
    return [];
  }
});

final adsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final prefs = ref.watch(preferencesProvider);
  // Wait until GPS is resolved before fetching ads
  if (!prefs.locationReady) return [];
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/advertisement/discovery?lat=${prefs.lat}&lng=${prefs.lng}');
    final List<Map<String, dynamic>> ads = List<Map<String, dynamic>>.from(response.data['data']);
    return ads;
  } catch (e) {
    debugPrint('Error fetching ads: $e');
    return [];
  }
});

final featuredMerchantsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final prefs = ref.watch(preferencesProvider);
  // Gate on locationReady — don't fetch with stale default coords
  if (!prefs.locationReady) return [];
  final dio = ref.watch(dioProvider);

  String url = '/integrations/discovery?lat=${prefs.lat}&lng=${prefs.lng}&radius=${prefs.radius}';
  if (prefs.category != 'All') {
    url += '&category=${Uri.encodeComponent(prefs.category)}';
  }

  try {
    final response = await dio.get(url);
    final rawData = response.data['data'];
    if (rawData == null) return [];
    return List<Map<String, dynamic>>.from(rawData);
  } catch (e) {
    debugPrint('Error fetching featured merchants: $e');
    return [];
  }
});

final merchantsSearchProvider = FutureProvider.family.autoDispose<List<Map<String, dynamic>>, String>((ref, query) async {
  if (query.trim().isEmpty) return [];
  final prefs = ref.watch(preferencesProvider);
  if (!prefs.locationReady) return [];
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/integrations/discovery?lat=${prefs.lat}&lng=${prefs.lng}&radius=${prefs.radius}&search=${Uri.encodeComponent(query)}');
    final rawData = response.data['data'];
    if (rawData == null) return [];
    return List<Map<String, dynamic>>.from(rawData);
  } catch (e) {
    debugPrint('Error searching merchants: $e');
    return [];
  }
});

final topRatedMerchantsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final prefs = ref.watch(preferencesProvider);
  if (!prefs.locationReady) return [];
  final dio = ref.watch(dioProvider);

  String url = '/integrations/discovery?lat=${prefs.lat}&lng=${prefs.lng}&radius=${prefs.radius}&sort=topRated';
  if (prefs.category != 'All') {
    url += '&category=${Uri.encodeComponent(prefs.category)}';
  }

  try {
    final response = await dio.get(url);
    final rawData = response.data['data'];
    if (rawData == null) return [];
    return List<Map<String, dynamic>>.from(rawData);
  } catch (e) {
    debugPrint('Error fetching top rated merchants: $e');
    return [];
  }
});



final personalizedRecommendationsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final prefs = ref.watch(preferencesProvider);
  if (!prefs.locationReady) return [];
  final dio = ref.watch(dioProvider);

  // 1. Fetch friend recommendations
  final List<String> friendRecommendedMerchantIds = [];
  final Map<String, List<Map<String, dynamic>>> friendRecommendationsByMerchant = {};
   try {
    final friendRecsResponse = await dio.get('/user/friend-recommendations?lat=${prefs.lat}&lng=${prefs.lng}');
    final rawData = friendRecsResponse.data;
    if (rawData is Map) {
      final rawDataObj = rawData['data'];

      if (rawDataObj is Map) {
        final carouselList = rawDataObj['carousel'];
        if (carouselList is List) {
          for (var entry in carouselList) {
            if (entry is Map) {
              final mId = entry['integrationId']?.toString();
              final recsList = entry['recommendations'];
              if (mId != null && recsList is List) {
                final List<Map<String, dynamic>> parsedRecs = [];
                for (var r in recsList) {
                  if (r is Map) {
                    final cleanRec = <String, dynamic>{};
                    r.forEach((key, val) {
                      cleanRec[key.toString()] = val;
                    });
                    parsedRecs.add(cleanRec);
                  }
                }
                if (parsedRecs.isNotEmpty) {
                  final String lowerMId = mId.trim().toLowerCase();
                  if (!friendRecommendedMerchantIds.contains(lowerMId)) {
                    friendRecommendedMerchantIds.add(lowerMId);
                  }
                  friendRecommendationsByMerchant[lowerMId] = parsedRecs;
                }
              }
            }
          }
        }
      } else if (rawDataObj is List) {
        for (var rec in rawDataObj) {
          if (rec is Map) {
            final mId = rec['integrationId']?.toString();
            if (mId != null) {
              final String lowerMId = mId.trim().toLowerCase();
              if (!friendRecommendedMerchantIds.contains(lowerMId)) {
                friendRecommendedMerchantIds.add(lowerMId);
              }
              final cleanRec = <String, dynamic>{};
              rec.forEach((key, val) {
                cleanRec[key.toString()] = val;
              });
              friendRecommendationsByMerchant.putIfAbsent(lowerMId, () => []).add(cleanRec);
            }
          }
        }
      }
    }
  } catch (e) {
    debugPrint('Error fetching friend recommendations: $e');
  }

  // 2. Fetch visited shops (user orders)
  List<dynamic> orders = [];
  try {
    orders = await ref.read(customerOrdersProvider.future);
  } catch (e) {
    debugPrint('Error fetching orders for personalization: $e');
  }

  final List<String> visitedMerchantIds = [];
  for (var order in orders) {
    final merchantId = order['integrationId']?.toString();
    if (merchantId != null) {
      final String lowerId = merchantId.trim().toLowerCase();
      if (!visitedMerchantIds.contains(lowerId)) {
        visitedMerchantIds.add(lowerId);
      }
    }
  }

  String url = '/integrations/discovery?lat=${prefs.lat}&lng=${prefs.lng}&radius=${prefs.radius}';
  if (prefs.category != 'All') {
    url += '&category=${Uri.encodeComponent(prefs.category)}';
  }
  List<Map<String, dynamic>> allMerchants = [];
  try {
    final response = await dio.get(url);
    final rawData = response.data['data'];
    if (rawData != null) {
      allMerchants = List<Map<String, dynamic>>.from(rawData);
    }
  } catch (e) {
    debugPrint('Error fetching all merchants for recommendations: $e');
  }

  final List<Map<String, dynamic>> personalizedList = [];
  final List<String> addedIds = [];

  // Matcher helper - Case insensitive and safe
  Map<String, dynamic>? findMerchantMatch(String id) {
    final searchId = id.trim().toLowerCase();
    for (var m in allMerchants) {
      final mId = m['id']?.toString().trim().toLowerCase() ?? 
                  m['_id']?.toString().trim().toLowerCase();
      if (mId == searchId) {
        return m;
      }
    }
    return null;
  }

  // A. Add friend-recommended merchants first
  debugPrint('friendRecommendedMerchantIds: $friendRecommendedMerchantIds');
  for (var id in friendRecommendedMerchantIds) {
    Map<String, dynamic>? match = findMerchantMatch(id);
    debugPrint('Processing recommended merchant $id. Found in allMerchants: ${match != null}');
    
    // If not found in discovery list (due to pagination or category filters), fetch it explicitly
    if (match == null) {
      try {
        final res = await dio.get('/integrations/byId/$id');
        if (res.data['success'] == true && res.data['data'] != null) {
          match = res.data['data'];
          debugPrint('Successfully fetched fallback merchant for $id from /byId');
        } else {
          debugPrint('Fallback fetch succeeded but no data for $id');
        }
      } catch (e) {
        debugPrint('Error fetching missing recommended merchant $id: $e');
      }
    }

    if (match != null) {
      final mId = (match['id']?.toString() ?? match['_id']?.toString())!.trim().toLowerCase();
      if (!addedIds.contains(mId)) {
        final enriched = Map<String, dynamic>.from(match);
        final recs = friendRecommendationsByMerchant[id];
        if (recs != null && recs.isNotEmpty) {
          enriched['recommendedByFriend'] = recs.first['friendName'];
          enriched['friendRecommendations'] = recs;
          debugPrint('Enriched $mId with recommendation by ${recs.first['friendName']}');
        } else {
          debugPrint('WARNING: No recs found in friendRecommendationsByMerchant for $id');
        }
        personalizedList.add(enriched);
        addedIds.add(mId);
      }
    } else {
      debugPrint('WARNING: Match is STILL null for $id');
    }
  }

  // B. Add visited merchants second (or if no friend recommendations are present)
  for (var id in visitedMerchantIds) {
    final match = findMerchantMatch(id);
    if (match != null) {
      final mId = (match['id']?.toString() ?? match['_id']?.toString())!;
      if (!addedIds.contains(mId)) {
        personalizedList.add(match);
        addedIds.add(mId);
      }
    }
  }

  // C. Add remaining nearby merchants to fill up
  for (var merchant in allMerchants) {
    final mId = (merchant['id']?.toString() ?? merchant['_id']?.toString());
    if (mId != null && !addedIds.contains(mId)) {
      personalizedList.add(merchant);
      addedIds.add(mId);
    }
  }

  debugPrint('personalizedList length: ${personalizedList.length}');
  final testFriendRecs = personalizedList.where((m) => m['friendRecommendations'] != null).toList();
  debugPrint('testFriendRecs length: ${testFriendRecs.length}');

  return personalizedList;
});


// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class CustomerHomeScreen extends ConsumerStatefulWidget {
  const CustomerHomeScreen({super.key});

  @override
  ConsumerState<CustomerHomeScreen> createState() => _CustomerHomeScreenState();
}

class _CustomerHomeScreenState extends ConsumerState<CustomerHomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  bool _dialogOpen = false;

  @override
  void initState() {
    super.initState();
    _searchFocusNode.addListener(_onSearchFocusChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAndSyncContacts();
    });
  }

  void _onSearchFocusChanged() {
    setState(() {});
  }

  // Static flag: sync once per app process lifetime (cleared on hot restart / relaunch)
  static bool _syncedThisSession = false;

  Future<void> _checkAndSyncContacts({bool forceSync = false}) async {
    try {
      // Skip if already synced this session and not a manual force sync
      if (_syncedThisSession && !forceSync) {
        debugPrint('[CONTACTS] Already synced this session. Skipping.');
        return;
      }

      // Check contacts permission
      var status = await Permission.contacts.status;

      if (status.isDenied || status.isRestricted) {
        if (!mounted) return;
        // Only show dialog on first launch or manual force sync
        final prefs = await SharedPreferences.getInstance();
        final askedBefore = prefs.getBool('contacts_permission_asked') ?? false;
        if (askedBefore && !forceSync) {
          debugPrint('[CONTACTS] Permission previously denied and not a manual sync. Skipping dialog.');
          return;
        }

        final bool? proceed = await showDialog<bool>(
          context: context, // ignore: use_build_context_synchronously
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Text('Find Friend Recommendations', style: TextStyle(fontWeight: FontWeight.bold)),
            content: const Text(
              'Tubulu can show you stores and products recommended by your friends. '
              'We need access to your contacts to match who amongst your friends is on Tubulu.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Not Now', style: TextStyle(color: Colors.grey)),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Allow Access', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );

        await prefs.setBool('contacts_permission_asked', true);

        if (proceed == true) {
          status = await Permission.contacts.request();
        } else {
          return;
        }
      }

      if (status.isPermanentlyDenied && forceSync && mounted) {
        // User manually triggered sync but permission is permanently denied
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

      if (status.isGranted) {
        debugPrint('[CONTACTS] Permission granted. Fetching address book...');
        final hasPermission = await FlutterContacts.requestPermission(readonly: true);
        if (!hasPermission) return;

        final deviceContacts = await FlutterContacts.getContacts(withProperties: true);
        final List<Map<String, String>> contactsPayload = [];

        for (var contact in deviceContacts) {
          final String name = '${contact.name.first} ${contact.name.last}'.trim();
          for (var phone in contact.phones) {
            final String cleanNum = phone.number.replaceAll(RegExp(r'[^0-9]'), '');
            if (cleanNum.isNotEmpty) {
              contactsPayload.add({
                'name': name.isEmpty ? 'Contact' : name,
                'phoneNumber': cleanNum,
              });
            }
          }
        }

        debugPrint('[CONTACTS] Syncing ${contactsPayload.length} contacts with backend...');
        final dio = ref.read(dioProvider);
        final response = await dio.post('/user/contacts/sync', data: {
          'contacts': contactsPayload,
        });

        if (response.statusCode == 200) {
          debugPrint('[CONTACTS] Sync complete. ${contactsPayload.length} contacts uploaded.');
          _syncedThisSession = true;
          // Refresh recommendations immediately after sync
          ref.invalidate(personalizedRecommendationsProvider);
          if (forceSync && mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Contacts synced! ${contactsPayload.length} contacts uploaded.'),
                backgroundColor: Colors.green,
              ),
            );
          }
        }
      }
    } catch (e) {
      debugPrint('[CONTACTS] Error syncing contacts: $e');
      if (forceSync && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sync failed: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _checkAndShowRatingDialog(List<dynamic> orders) {
    if (_dialogOpen) return;

    final unratedOrder = orders.cast<Map<String, dynamic>?>().firstWhere(
      (order) {
        if (order == null) return false;
        final status = order['status']?.toString();
        final isRated = order['isRated'];
        return status == 'delivered' && isRated != true;
      },
      orElse: () => null,
    );

    if (unratedOrder != null) {
      _dialogOpen = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _showRatingDialog(context, unratedOrder);
      });
    }
  }

  void _showRatingDialog(BuildContext context, Map<String, dynamic> order) {
    final merchant = order['Integration'] ?? {};
    final storeName = merchant['integrationName'] ?? 'Unknown Store';
    final merchantId = order['integrationId'];
    final orderId = order['id'];
    
    int selectedRating = 5;
    final textController = TextEditingController();
    bool isSubmitting = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => PopScope(
        canPop: false,
        child: StatefulBuilder(
          builder: (builderContext, setDialogState) {
            final isDark = Theme.of(builderContext).brightness == Brightness.dark;
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Column(
                children: [
                  const Icon(Icons.stars_rounded, size: 50, color: Colors.amber),
                  const SizedBox(height: 12),
                  Text(
                    'Rate Your Order',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Please rate your delivered order from $storeName to continue.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      final starVal = index + 1;
                      return IconButton(
                        iconSize: 36,
                        icon: Icon(
                          starVal <= selectedRating ? Icons.star_rounded : Icons.star_outline_rounded,
                          color: Colors.amber,
                        ),
                        onPressed: isSubmitting ? null : () {
                          setDialogState(() {
                            selectedRating = starVal;
                          });
                        },
                      );
                    }),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: textController,
                    enabled: !isSubmitting,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Share a recommendation or feedback (optional)...',
                      hintStyle: TextStyle(color: isDark ? Colors.white30 : Colors.black38),
                      border: const OutlineInputBorder(
                        borderRadius: BorderRadius.all(Radius.circular(12)),
                      ),
                      contentPadding: const EdgeInsets.all(12),
                    ),
                  ),
                ],
              ),
              actionsAlignment: MainAxisAlignment.center,
              actions: [
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                    onPressed: isSubmitting
                        ? null
                        : () async {
                            setDialogState(() => isSubmitting = true);
                            try {
                              final dio = ref.read(dioProvider);
                              await dio.post('/user/reviews', data: {
                                'integrationId': merchantId,
                                'rating': selectedRating,
                                'reviewText': textController.text.trim(),
                              });
                              await dio.put('/orders/details/app/$orderId/rate');
                              
                              if (dialogContext.mounted) {
                                Navigator.pop(dialogContext);
                                ScaffoldMessenger.of(dialogContext).showSnackBar(
                                  const SnackBar(
                                    content: Text('Thank you for rating!'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              }
                              ref.invalidate(customerOrdersProvider);
                              ref.invalidate(personalizedRecommendationsProvider);
                            } catch (e) {
                              setDialogState(() => isSubmitting = false);
                              if (dialogContext.mounted) {
                                ScaffoldMessenger.of(dialogContext).showSnackBar(
                                  SnackBar(
                                    content: Text('Failed to submit rating: $e'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                    child: isSubmitting
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                            ),
                          )
                        : const Text(
                            'Submit',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    ).then((_) {
      _dialogOpen = false;
    });
  }

  @override
  void dispose() {
    _searchFocusNode.removeListener(_onSearchFocusChanged);
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(customerOrdersProvider);
    if (!ordersAsync.isLoading) {
      ordersAsync.whenOrNull(
        data: (orders) {
          _checkAndShowRatingDialog(orders);
        },
      );
    }

    final merchantsAsync = ref.watch(featuredMerchantsProvider);
    final activeTheme = ref.watch(themeProvider);
    final isDark = activeTheme == AppThemeType.sleekDark;
    final prefs = ref.watch(preferencesProvider);
    final authState = ref.watch(authProvider);
    final profileLetter = (() {
      final name = '${authState.firstName ?? ''} ${authState.lastName ?? ''}'.trim();
      return name.isNotEmpty
          ? name[0].toUpperCase()
          : (authState.phoneNumber != null && authState.phoneNumber!.isNotEmpty
              ? authState.phoneNumber![0]
              : 'U');
    })();
    final isNagpur = prefs.cityTheme != null
        ? (prefs.cityTheme!.themeName.toLowerCase().contains('nagpur'))
        : ((prefs.lat - 21.15).abs() < 0.2 && (prefs.lng - 79.09).abs() < 0.2);
    final showMysore = activeTheme == AppThemeType.regional && !isNagpur;
    final showNagpur = activeTheme == AppThemeType.regional && isNagpur;
    final activeOrders = ordersAsync.value?.where((o) {
      final status = o['status']?.toString().toLowerCase() ?? 'waiting';
      return status != 'delivered' && status != 'canceled' && status != 'rejected';
    }).toList() ?? [];

    return GestureDetector(
      onTap: () {
        if (_searchFocusNode.hasFocus || _searchController.text.isNotEmpty) {
          _searchFocusNode.unfocus();
          _searchController.clear();
          setState(() {});
        }
      },
      behavior: HitTestBehavior.translucent,
      child: Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradientForType(
              activeTheme,
              cityTheme: prefs.cityTheme,
              isMysore: showMysore,
              isNagpur: showNagpur,
            ),
          ),
        ),
        elevation: 0,
        toolbarHeight: 70,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.asset(
                  'assets/images/splash_logo.png',
                  width: 32,
                  height: 32,
                  fit: BoxFit.contain,
                  errorBuilder: (c, e, s) => const Icon(Icons.layers_outlined, color: AppTheme.primaryColor, size: 24),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Tubulu',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Consumer(
                    builder: (context, ref, child) {
                      final fullAddress = ref.watch(preferencesProvider.select((p) => p.fullAddress));
                      final cityName = ref.watch(preferencesProvider.select((p) => p.cityName));
                      return Text(
                        fullAddress ?? cityName ?? 'Mysuru',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 2,
                        softWrap: true,
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          _buildCircularAction(
            icon: Icons.chat_bubble_outline_rounded,
            onTap: () => context.push('/customer/ai-concierge'),
          ),
          _buildCircularAction(
            icon: Icons.shopping_cart_outlined,
            onTap: () => context.push('/customer/cart'),
          ),
          PopupMenuButton<String>(
            offset: const Offset(0, 50),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            itemBuilder: (context) {
              final name = '${authState.firstName ?? ''} ${authState.lastName ?? ''}'.trim();
              final displayName = name.isNotEmpty ? name : (authState.phoneNumber ?? 'User');
              return [
                PopupMenuItem<String>(
                  enabled: false,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Logged in as',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        displayName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Divider(height: 1, thickness: 0.5),
                    ],
                  ),
                ),
                PopupMenuItem<String>(
                  value: 'logout',
                  child: Row(
                    children: const [
                      Icon(Icons.logout_rounded, color: Colors.redAccent, size: 20),
                      SizedBox(width: 8),
                      Text('Logout', style: TextStyle(color: Colors.redAccent)),
                    ],
                  ),
                ),
              ];
            },
            onSelected: (value) async {
              if (value == 'logout') {
                await ref.read(authProvider.notifier).logout();
              }
            },
            child: Container(
              margin: const EdgeInsets.only(left: 10),
              height: 42,
              width: 42,
              decoration: isDark ? null : BoxDecoration(
                border: Border.all(color: Colors.white, width: 1.5),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  profileLetter,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(76),
          child: _buildSearchBox(),
        ),
      ),
      body: Stack(
        children: [
          if (activeTheme == AppThemeType.regional)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: prefs.cityTheme != null
                        ? prefs.cityTheme!.gradientColors.map((c) => c.withOpacity(0.07)).toList()
                        : (showNagpur
                            ? [
                                const Color(0xFFFFA800).withOpacity(0.07),
                                const Color(0xFFE15B4D).withOpacity(0.07),
                              ]
                            : [
                                const Color(0xFF1565C0).withOpacity(0.07),
                                const Color(0xFFD4AF37).withOpacity(0.07),
                              ]),
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),
          if (activeTheme == AppThemeType.regional)
            Positioned.fill(
              child: Opacity(
                opacity: 0.35,
                child: (prefs.cityTheme?.backgroundPatternUrl != null && prefs.cityTheme!.backgroundPatternUrl!.startsWith('http'))
                    ? Image.network(
                        prefs.cityTheme!.backgroundPatternUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          final isNagpurTheme = prefs.cityTheme?.themeName.toLowerCase().contains('nagpur') ?? false;
                          return Image.asset(
                            isNagpurTheme ? 'assets/images/nagpur_bg.png' : 'assets/images/mysore_bg.png',
                            fit: BoxFit.cover,
                          );
                        },
                      )
                    : Image.asset(
                        showNagpur ? 'assets/images/nagpur_bg.png' : 'assets/images/mysore_bg.png',
                        fit: BoxFit.cover,
                      ),
              ),
            ),
          RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(categoriesProvider);
              ref.invalidate(featuredMerchantsProvider);
              ref.invalidate(adsProvider);
              ref.invalidate(topRatedMerchantsProvider);
              ref.invalidate(personalizedRecommendationsProvider);
            },
            child: CustomScrollView(
              slivers: [
            ValueListenableBuilder<TextEditingValue>(
              valueListenable: _searchController,
              builder: (context, value, child) {
                final query = value.text.trim();
                final isSearching = query.isNotEmpty;

                if (isSearching) {
                  // Watch searches within the builder for reactive lazy evaluation
                  return Consumer(
                    builder: (context, ref, child) {
                      final searchAsync = ref.watch(merchantsSearchProvider(query));
                      return SliverMainAxisGroup(
                        slivers: [
                          const SliverPadding(
                            padding: EdgeInsets.only(top: 24, left: 16, right: 16, bottom: 12),
                            sliver: SliverToBoxAdapter(
                              child: Text(
                                'Search Results',
                                style: TextStyle(
                                  fontSize: 19,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.3,
                                ),
                              ),
                            ),
                          ),
                          searchAsync.when(
                            data: (results) {
                              if (results.isEmpty) {
                                return const SliverToBoxAdapter(
                                  child: Padding(
                                    padding: EdgeInsets.all(40.0),
                                    child: Center(child: Text('No stores found matching that search.', style: TextStyle(color: Colors.grey))),
                                  ),
                                );
                              }
                              return SliverPadding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                sliver: SliverList(
                                  delegate: SliverChildBuilderDelegate(
                                    (context, index) => _buildMerchantCard(context, results[index]),
                                    childCount: results.length,
                                  ),
                                ),
                              );
                            },
                            loading: () => const SliverToBoxAdapter(
                              child: Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator())),
                            ),
                            error: (e, _) => SliverToBoxAdapter(child: Center(child: Text('Error: $e'))),
                          ),
                        ],
                      );
                    }
                  );
                }

                // Default Grid fallback when not searching
                return SliverMainAxisGroup(
                  slivers: [
                    _buildActiveOrderTracker(activeOrders, isDark),
                    // 📺 AD BOARD SECTION
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 16),
                        child: _buildAdBoard(context, ref),
                      ),
                    ),

                    // 🏷️ CATEGORY FILTER CHIPS
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.only(top: 12),
                        child: _CategoryChips(),
                      ),
                    ),

                    // 🌟 Featured/Nearby Section
                    SliverPadding(
                      padding: const EdgeInsets.only(top: 24, left: 16, right: 16, bottom: 4),
                      sliver: SliverToBoxAdapter(
                        child: Row(
                          children: [
                            Text(
                              'Nearby Shops',
                              style: GoogleFonts.publicSans(
                                textStyle: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.3,
                                  color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppTheme.ultraBlack,
                                ),
                              ),
                            ),

                          ],
                        ),
                      ),
                    ),
                    Consumer(
                      builder: (ctx, ref, _) {
                        final prefs = ref.watch(preferencesProvider);
                        if (!prefs.locationReady) {
                          return const SliverToBoxAdapter(
                            child: Center(
                              child: Padding(
                                padding: EdgeInsets.all(20),
                                child: Column(
                                  children: [
                                    CircularProgressIndicator(),
                                    SizedBox(height: 10),
                                    Text('Finding your location...', style: TextStyle(color: Colors.grey)),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }
                        return merchantsAsync.when(
                          data: (merchants) {
                            if (merchants.isEmpty) {
                              return const SliverToBoxAdapter(
                                child: Center(child: Padding(padding: EdgeInsets.all(20), child: Text('No nearby stores found', style: TextStyle(color: Colors.grey)))),
                              );
                            }
                            return SliverToBoxAdapter(
                              child: SizedBox(
                                height: 235,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  padding: const EdgeInsets.only(left: 16),
                                  itemCount: merchants.length,
                                  itemBuilder: (context, index) {
                                    return _buildMerchantCard(context, merchants[index], width: 160);
                                  },
                                ),
                              ),
                            );
                          },
                          loading: () => const SliverToBoxAdapter(
                            child: Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),
                          ),
                          error: (e, _) => SliverToBoxAdapter(
                            child: Center(child: Padding(padding: EdgeInsets.all(20), child: Text('Error: $e'))),
                          ),
                        );
                      },
                    ),

                    // 🏆 TOP RATED NEAR YOU
                    SliverPadding(
                      padding: const EdgeInsets.only(top: 24, left: 16, right: 16, bottom: 12),
                      sliver: SliverToBoxAdapter(
                        child: Text(
                          'Top Rated Near You',
                          style: GoogleFonts.publicSans(
                            textStyle: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.3,
                              color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppTheme.ultraBlack,
                            ),
                          ),
                        ),
                      ),
                    ),
                    ref.watch(topRatedMerchantsProvider).when(
                      data: (merchants) {
                        if (merchants.isEmpty) {
                          return const SliverToBoxAdapter(child: SizedBox.shrink());
                        }
                        return SliverToBoxAdapter(
                          child: SizedBox(
                            height: 235,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              padding: const EdgeInsets.only(left: 16),
                              itemCount: merchants.length > 5 ? 5 : merchants.length,
                              itemBuilder: (context, index) {
                                return _buildMerchantCard(context, merchants[index], width: 160);
                              },
                            ),
                          ),
                        );
                      },
                      loading: () => const SliverToBoxAdapter(
                        child: Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),
                      ),
                      error: (e, _) => SliverToBoxAdapter(
                        child: Center(child: Padding(padding: EdgeInsets.all(20), child: Text('Error: $e'))),
                      ),
                    ),



                    // ❤ Recommended for You (Personalized Recommendations)
                    ref.watch(personalizedRecommendationsProvider).when(
                      data: (merchants) {
                        if (merchants.isEmpty) {
                          return const SliverToBoxAdapter(child: SizedBox.shrink());
                        }

                        final friendRecMerchants = merchants.where((m) =>
                          m['friendRecommendations'] != null &&
                          (m['friendRecommendations'] as List).isNotEmpty
                        ).toList();

                        return SliverToBoxAdapter(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.only(top: 24, left: 16, right: 16, bottom: 12),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Recommended for You',
                                      style: GoogleFonts.publicSans(
                                        textStyle: TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w900,
                                          letterSpacing: -0.3,
                                          color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppTheme.ultraBlack,
                                        ),
                                      ),
                                    ),
                                    if (friendRecMerchants.isNotEmpty)
                                      TextButton(
                                        onPressed: () {
                                          _showAllFriendRecommendationsBottomSheet(context, friendRecMerchants);
                                        },
                                        style: TextButton.styleFrom(
                                          foregroundColor: const Color(0xFF0091FF), // Tubulu brand blue
                                          padding: EdgeInsets.zero,
                                          minimumSize: Size.zero,
                                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                        ),
                                        child: const Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              'More',
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                            SizedBox(width: 4),
                                            Icon(
                                              Icons.arrow_forward_rounded,
                                              size: 16,
                                            ),
                                          ],
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              if (friendRecMerchants.isNotEmpty)
                                SizedBox(
                                  height: 235,
                                  child: ListView.builder(
                                    scrollDirection: Axis.horizontal,
                                    padding: const EdgeInsets.only(left: 16),
                                    itemCount: friendRecMerchants.length > 5 ? 5 : friendRecMerchants.length,
                                    itemBuilder: (context, index) {
                                      return _buildMerchantCard(context, friendRecMerchants[index], width: 160);
                                    },
                                  ),
                                )
                              else
                                SizedBox(
                                  height: 235,
                                  child: ListView.builder(
                                    scrollDirection: Axis.horizontal,
                                    padding: const EdgeInsets.only(left: 16),
                                    itemCount: merchants.length > 5 ? 5 : merchants.length,
                                    itemBuilder: (context, index) {
                                      return _buildMerchantCard(context, merchants[index], width: 160);
                                    },
                                  ),
                                ),
                            ],
                          ),
                        );
                      },
                      loading: () => const SliverToBoxAdapter(
                        child: Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),
                      ),
                      error: (e, _) => SliverToBoxAdapter(
                        child: Center(child: Padding(padding: EdgeInsets.all(20), child: Text('Error: $e'))),
                      ),
                    ),

                    SliverPadding(
                      padding: const EdgeInsets.only(top: 24, left: 16, right: 16, bottom: 16),
                      sliver: SliverToBoxAdapter(
                        child: Text(

                          'Explore Industries',
                          style: GoogleFonts.publicSans(
                            textStyle: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.3,
                              color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppTheme.ultraBlack,
                            ),
                          ),
                        ),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      sliver: SliverGrid(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 16,
                          crossAxisSpacing: 16,
                          childAspectRatio: 1.0, // Increased height to prevent text overflows
                        ),
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            return _IndustryCard(
                              industry: kIndustries[index],
                              index: index,
                            );
                          },
                          childCount: kIndustries.length,
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
            
            const SliverToBoxAdapter(child: SizedBox(height: 40)),
          ],
        ),
      ),
    ],
  ),
),
  );
}

  Widget _buildCircularAction({required IconData icon, required VoidCallback onTap, bool isAlert = false}) {
    final activeTheme = ref.watch(themeProvider);
    final isDark = activeTheme == AppThemeType.sleekDark;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(left: 10),
        height: 42,
        width: 42,
        decoration: isDark ? null : BoxDecoration(
          border: Border.all(color: Colors.white, width: 1.5),
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Icon(
            icon, 
            color: Colors.white, 
            size: isDark ? 24 : 22
          ),
        ),
      ),
    );
  }

  Widget _buildActiveOrderTracker(List<dynamic> activeOrders, bool isDark) {
    if (activeOrders.isEmpty) return const SliverToBoxAdapter(child: SizedBox.shrink());
    
    final latestOrder = activeOrders.first;
    final merchant = latestOrder['Integration'] ?? {};
    final storeName = merchant['integrationName'] ?? 'Store';
    final status = latestOrder['status']?.toString().toUpperCase() ?? 'WAITING';
    
    Color themeColor = Colors.orange;
    IconData statusIcon = Icons.fastfood_rounded;
    
    final lowerStatus = status.toLowerCase();
    if (lowerStatus.contains('accept') || lowerStatus.contains('pack')) {
      themeColor = Colors.blue;
      statusIcon = Icons.soup_kitchen_rounded;
    } else if (lowerStatus.contains('dispatch') || lowerStatus.contains('transit')) {
      themeColor = Colors.green;
      statusIcon = Icons.delivery_dining_rounded;
    }
    
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: isDark 
                ? [const Color(0xFF2C2C2E), const Color(0xFF1C1C1E)]
                : [themeColor.withOpacity(0.06), Colors.white],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? Colors.white12 : themeColor.withOpacity(0.15),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: (isDark ? Colors.black : themeColor).withOpacity(0.04),
                blurRadius: 12,
                offset: const Offset(0, 6),
              )
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => context.push('/customer/orders'),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: themeColor.withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(statusIcon, color: themeColor, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  'Active Order • ',
                                  style: TextStyle(
                                    color: themeColor,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                Expanded(
                                  child: Text(
                                    storeName,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: isDark ? Colors.white70 : Colors.black54,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Status: $status',
                              style: TextStyle(
                                color: isDark ? Colors.white.withOpacity(0.9) : const Color(0xFF1B1A18),
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: themeColor,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Track',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                  fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(width: 2),
                            Icon(Icons.chevron_right_rounded, color: Colors.white, size: 14),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBox() {
    final activeTheme = ref.watch(themeProvider);
    final isDark = activeTheme == AppThemeType.sleekDark;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: Material(
        elevation: isDark ? 0 : 6,
        shadowColor: isDark ? Colors.transparent : Colors.black.withOpacity(0.3),
        color: const Color(0xFFF7F2E9), // Sand/Cream background color
        borderRadius: BorderRadius.circular(28), // Pill shape rounded corners
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: TextField(
            controller: _searchController,
            focusNode: _searchFocusNode,
            keyboardType: TextInputType.text,
            textInputAction: TextInputAction.search,
            enableInteractiveSelection: true,
            selectionControls: MaterialTextSelectionControls(),
            autofocus: false,
            onSubmitted: (_) {
              _searchFocusNode.unfocus();
            },
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: Color(0xFF1B1A18)), // Dark charcoal input text
            decoration: InputDecoration(
              hintText: 'SEARCH',
              hintStyle: const TextStyle(color: Colors.black38, fontSize: 15, fontWeight: FontWeight.normal),
              prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF1B1A18), size: 24),
              suffixIcon: ValueListenableBuilder<TextEditingValue>(
                valueListenable: _searchController,
                builder: (context, val, _) {
                  if (val.text.isEmpty) return const SizedBox.shrink();
                  return IconButton(
                    icon: const Icon(Icons.close_rounded, color: Color(0xFF1B1A18), size: 20),
                    onPressed: () {
                      _searchController.clear();
                      _searchFocusNode.unfocus();
                    },
                  );
                },
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategorySection(List<Map<String, dynamic>> categories) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Text(
            'Top Categories',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ),
        SizedBox(
          height: 95,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: categories.length,
            itemBuilder: (c, i) {
              final cat = categories[i];
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 6),
                width: 70,
                child: Column(
                  children: [
                    Container(
                      height: 60,
                      width: 60,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(30), // Perfect circle
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(30),
                        child: TubuluImage(
                          imageUrl: cat['logo'] ?? '',
                          fit: BoxFit.cover,
                          errorWidget: const Icon(Icons.fastfood_outlined, color: Colors.grey),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      cat['name'] ?? '',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.black87),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildAdBoard(BuildContext context, WidgetRef ref) {
    final adsAsync = ref.watch(adsProvider);

    return adsAsync.when(
      data: (ads) {
        if (ads.isEmpty) return const SizedBox.shrink();
        return SizedBox(
          height: 90,
          child: _AdBoardCarousel(ads: ads),
        );
      },
      loading: () => Center(
        child: Container(
          height: 90,
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(14),
          ),
          child: const Center(child: CircularProgressIndicator()),
        ),
      ),
      error: (e, _) => const SizedBox.shrink(),
    );
  }

  Widget _buildMerchantCard(BuildContext context, Map<String, dynamic> merchant, {double? width}) {
    return MerchantCard(merchant: merchant, width: width);
  }
}

class _AdBoardCarousel extends StatefulWidget {
  final List<dynamic> ads;
  const _AdBoardCarousel({required this.ads});

  @override
  State<_AdBoardCarousel> createState() => _AdBoardCarouselState();
}

class _AdBoardCarouselState extends State<_AdBoardCarousel> {
  int _currentPage = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (widget.ads.length > 1) {
      _startTimer();
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (!mounted) return;
      _nextPage();
    });
  }

  void _nextPage() {
    setState(() {
      _currentPage = (_currentPage + 1) % widget.ads.length;
    });
  }

  void _prevPage() {
    setState(() {
      _currentPage = (_currentPage - 1 + widget.ads.length) % widget.ads.length;
    });
  }

  void _handleSwipe(int direction) {
    _timer?.cancel();
    if (direction < 0) {
      _nextPage();
    } else {
      _prevPage();
    }
    if (widget.ads.length > 1) {
      _startTimer();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ad = widget.ads[_currentPage];
    return GestureDetector(
      onHorizontalDragEnd: (details) {
        if (details.primaryVelocity == null) return;
        if (details.primaryVelocity! < 0) {
          _handleSwipe(-1);
        } else if (details.primaryVelocity! > 0) {
          _handleSwipe(1);
        }
      },
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 500),
        switchInCurve: Curves.easeOutBack,
        switchOutCurve: Curves.easeIn,
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(
            opacity: animation,
            child: ScaleTransition(
              scale: Tween<double>(begin: 0.90, end: 1.0).animate(animation),
              child: child,
            ),
          );
        },
        child: Container(
          key: ValueKey<int>(_currentPage),
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 6,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Stack(
              fit: StackFit.expand,
              children: [
                TubuluImage(
                  imageUrl: ad['bannerUrl'] ?? '',
                  fit: BoxFit.cover,
                  errorWidget: Container(
                    color: Colors.grey.shade200,
                    child: const Icon(Icons.broken_image, size: 24, color: Colors.grey),
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.65),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
                Positioned(
                  bottom: 10,
                  left: 12,
                  right: 12,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        ad['name'] ?? '',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (ad['description'] != null)
                        Text(
                          ad['description'],
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 10,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

}

class _IndustryCard extends StatefulWidget {
  final IndustryItem industry;
  final int index;

  const _IndustryCard({required this.industry, required this.index});

  @override
  State<_IndustryCard> createState() => _IndustryCardState();
}

class _IndustryCardState extends State<_IndustryCard> {
  double _scale = 1.0;
  bool _isVisible = false;

  @override
  void initState() {
    super.initState();
    // Stagger based on index: (index % 10) ensures loop safety
    Future.delayed(Duration(milliseconds: 100 + (widget.index * 80)), () {
      if (mounted) {
        setState(() {
          _isVisible = true;
        });
      }
    });
  }

  void _onTapDown(TapDownDetails details) => setState(() => _scale = 0.90);
  void _onTapUp(TapUpDetails details) => setState(() => _scale = 1.0);
  void _onTapCancel() => setState(() => _scale = 1.0);

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: _isVisible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeOut,
      child: AnimatedTransform(
        transform: Matrix4.translationValues(0, _isVisible ? 0 : 30, 0),
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeOutCubic,
        child: AnimatedScale(
          scale: _scale,
          duration: Duration(milliseconds: _scale == 1.0 ? 600 : 80),
          curve: _scale == 1.0 ? Curves.elasticOut : Curves.easeOutCubic,
          child: GestureDetector(
            onTapDown: _onTapDown,
            onTapUp: _onTapUp,
            onTapCancel: _onTapCancel,
            onTap: () {
              final isComingSoon = widget.industry.name != 'Food & Restaurant' && widget.industry.name != 'Groceries';
              if (isComingSoon) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${widget.industry.name} is coming soon!'),
                    backgroundColor: Colors.orange.shade800,
                    duration: const Duration(seconds: 2),
                  ),
                );
                return;
              }
              context.push('/customer/industry', extra: {
                'name': widget.industry.name,
                'color': widget.industry.color,
              });
            },
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF2A2826) : Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: widget.industry.color.withOpacity(Theme.of(context).brightness == Brightness.dark ? 0.05 : 0.14),
                    blurRadius: 24,
                    spreadRadius: -6,
                    offset: const Offset(0, 12),
                  ),
                ],
                border: Border.all(
                  color: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF383532) : Colors.white,
                  width: 2,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Stack(
                  children: [
                    Positioned(
                      right: -20,
                      bottom: -20,
                      child: Icon(
                        widget.industry.icon,
                        size: 100,
                        color: widget.industry.color.withOpacity(0.06),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: widget.industry.color.withOpacity(0.12),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              widget.industry.icon,
                              color: widget.industry.color,
                              size: 32,
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.industry.name,
                                style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 15,
                                  letterSpacing: -0.3,
                                  color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppTheme.ultraBlack,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                (widget.industry.name != 'Food & Restaurant' && widget.industry.name != 'Groceries') ? 'Coming Soon' : 'Explore now',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: (widget.industry.name != 'Food & Restaurant' && widget.industry.name != 'Groceries')
                                      ? (Theme.of(context).brightness == Brightness.dark ? Colors.orange.shade300 : Colors.orange.shade800)
                                      : (Theme.of(context).brightness == Brightness.dark ? Colors.white70 : Colors.grey.shade600),
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Custom Animated Transform widget definition as direct utility since it isn't native in older Flutter releases
class AnimatedTransform extends ImplicitlyAnimatedWidget {
  final Matrix4 transform;
  final Widget child;
  const AnimatedTransform({
    super.key,
    required this.transform,
    required super.duration,
    super.curve = Curves.linear,
    required this.child,
  });
  @override
  ImplicitlyAnimatedWidgetState<AnimatedTransform> createState() => _AnimatedTransformState();
}

class _AnimatedTransformState extends AnimatedWidgetBaseState<AnimatedTransform> {
  Matrix4Tween? _transform;
  @override
  void forEachTween(TweenVisitor<dynamic> visitor) {
    _transform = visitor(_transform, widget.transform, (dynamic value) => Matrix4Tween(begin: value as Matrix4)) as Matrix4Tween?;
  }
  @override
  Widget build(BuildContext context) {
    return Transform(
      transform: _transform?.evaluate(animation) ?? widget.transform,
      child: widget.child,
    );
  }
}

class _CategoryChips extends ConsumerWidget {
  const _CategoryChips();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final prefs = ref.watch(preferencesProvider);
    final activeTheme = ref.watch(themeProvider);
    final isDark = activeTheme == AppThemeType.sleekDark;

    return SizedBox(
      height: 50,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        children: [
          _buildChip(context, ref, 'All', prefs.category == 'All', isDark),
          ...kIndustries.map((ind) => _buildChip(context, ref, ind.name, prefs.category == ind.name, isDark, icon: ind.icon, color: ind.color)),
        ],
      ),
    );
  }

  Widget _buildChip(BuildContext context, WidgetRef ref, String name, bool isSelected, bool isDark, {IconData? icon, Color? color}) {
    final themeColor = color ?? AppTheme.primaryColor;

    if (isDark) {
      // Glow/Outline Custom Chip for Sleek Dark theme
      return Padding(
        padding: const EdgeInsets.only(right: 8),
        child: GestureDetector(
          onTap: () {
            final isComingSoon = name != 'All' && name != 'Food & Restaurant' && name != 'Groceries';
            if (isComingSoon) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('$name is coming soon!'),
                  backgroundColor: Colors.orange.shade800,
                  duration: const Duration(seconds: 2),
                ),
              );
              return;
            }
            ref.read(preferencesProvider.notifier).updateCategory(name);
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? themeColor.withOpacity(0.18) : const Color(0xFF2A2826),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? themeColor : themeColor.withOpacity(0.4),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: themeColor.withOpacity(isSelected ? 0.35 : 0.08),
                  blurRadius: isSelected ? 10 : 4,
                  spreadRadius: isSelected ? 1 : 0,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null || (name == 'All' && isSelected)) ...[
                  Icon(
                    name == 'All' ? Icons.check_rounded : icon,
                    size: 16,
                    color: isSelected ? Colors.white : themeColor,
                  ),
                  const SizedBox(width: 6),
                ],
                Text(
                  name,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.white.withOpacity(0.9),
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Original ChoiceChip for light themes
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 16, color: isSelected ? Colors.white : themeColor),
              const SizedBox(width: 6),
            ],
            Text(
              name,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black87,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ],
        ),
        selected: isSelected,
        selectedColor: themeColor,
        backgroundColor: Colors.white,
        side: BorderSide(color: isSelected ? Colors.transparent : themeColor.withOpacity(0.4)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        onSelected: (val) {
          if (val) {
            final isComingSoon = name != 'All' && name != 'Food & Restaurant' && name != 'Groceries';
            if (isComingSoon) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('$name is coming soon!'),
                  backgroundColor: Colors.orange.shade800,
                  duration: const Duration(seconds: 2),
                ),
              );
              return;
            }
            ref.read(preferencesProvider.notifier).updateCategory(name);
          }
        },
      ),
    );
  }
}

class _FriendRecoCarousel extends StatefulWidget {
  final List<Map<String, dynamic>> merchants;

  const _FriendRecoCarousel({required this.merchants});

  @override
  State<_FriendRecoCarousel> createState() => _FriendRecoCarouselState();
}

class _FriendRecoCarouselState extends State<_FriendRecoCarousel> {
  int _currentPage = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (widget.merchants.length > 1) {
      _startTimer();
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (!mounted) return;
      _nextPage();
    });
  }

  void _nextPage() {
    setState(() {
      _currentPage = (_currentPage + 1) % widget.merchants.length;
    });
  }

  void _prevPage() {
    setState(() {
      _currentPage = (_currentPage - 1 + widget.merchants.length) % widget.merchants.length;
    });
  }

  void _handleSwipe(int direction) {
    _timer?.cancel();
    if (direction < 0) {
      _nextPage();
    } else {
      _prevPage();
    }
    if (widget.merchants.length > 1) {
      _startTimer();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Column(
      children: [
        SizedBox(
          height: 200,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: GestureDetector(
              onHorizontalDragEnd: (details) {
                if (details.primaryVelocity == null) return;
                if (details.primaryVelocity! < 0) {
                  _handleSwipe(-1); // Swipe left -> Next
                } else if (details.primaryVelocity! > 0) {
                  _handleSwipe(1); // Swipe right -> Prev
                }
              },
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 500),
                switchInCurve: Curves.easeOutBack,
                switchOutCurve: Curves.easeIn,
                transitionBuilder: (Widget child, Animation<double> animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: ScaleTransition(
                      scale: Tween<double>(begin: 0.90, end: 1.0).animate(animation),
                      child: child,
                    ),
                  );
                },
                child: KeyedSubtree(
                  key: ValueKey<int>(_currentPage),
                  child: _buildCarouselCard(context, widget.merchants[_currentPage], isDark),
                ),
              ),
            ),
          ),
        ),
        if (widget.merchants.length > 1) ...[
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(widget.merchants.length, (index) {
              final isSelected = index == _currentPage;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: isSelected ? 18 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: isSelected 
                      ? const Color(0xFF0091FF)
                      : (isDark ? Colors.white24 : Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
        ],
      ],
    );
  }

  Widget _buildCarouselCard(BuildContext context, Map<String, dynamic> merchant, bool isDark) {
    final name = merchant['integrationName'] ?? 'Merchant';
    final category = merchant['category'] ?? 'General';
    final rawDistance = merchant['distance'];
    final double? dist = (rawDistance != null) ? double.tryParse(rawDistance.toString()) : null;
    final distanceText = dist != null ? '${dist.toStringAsFixed(1)} km away' : 'Nearby';

    final logo = merchant['logo'] ?? '';
    final bannerImage = merchant['bannerImage'] ?? '';
    final String imageToShow = bannerImage.isNotEmpty 
        ? bannerImage.split(',').first.trim() 
        : logo;

    final recommendations = merchant['friendRecommendations'] as List? ?? [];
    final latestRec = recommendations.isNotEmpty ? recommendations.first : null;
    final friendName = latestRec?['friendName'] ?? 'Your friend';
    final rating = latestRec?['rating'] ?? 5;
    final reviewText = latestRec?['reviewText'] ?? 'Highly recommended!';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2A2826) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF383532) : Colors.grey.shade200,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () => _showRecommendationsBottomSheet(context, merchant),
            child: Padding(
              padding: const EdgeInsets.all(14.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: isDark ? const Color(0xFF383532) : Colors.grey.shade100,
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: TubuluImage(
                            imageUrl: imageToShow,
                            fit: BoxFit.cover,
                            errorWidget: const Icon(Icons.store_rounded, color: Colors.grey),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : const Color(0xFF2C2C2C),
                                letterSpacing: -0.3,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '$category • $distanceText',
                              style: TextStyle(
                                fontSize: 11,
                                color: isDark ? Colors.white60 : Colors.black54,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(height: 1, thickness: 0.5),
                  const SizedBox(height: 8),
                  Expanded(
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF383532).withOpacity(0.5) : const Color(0xFFF9FAFB),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isDark ? const Color(0xFF383532) : const Color(0xFFE5E7EB),
                          width: 0.5,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.people_rounded, 
                                size: 12, 
                                color: isDark ? const Color(0xFF2ECC71) : const Color(0xFF27AE60),
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  '$friendName recommends this',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: isDark ? const Color(0xFF2ECC71) : const Color(0xFF27AE60),
                                  ),
                                ),
                              ),
                              Row(
                                children: List.generate(5, (starIdx) {
                                  return Icon(
                                    Icons.star_rounded,
                                    color: starIdx < rating ? Colors.amber : Colors.grey.shade300,
                                    size: 11,
                                  );
                                }),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Expanded(
                            child: Text(
                              '"$reviewText"',
                              style: TextStyle(
                                fontSize: 12,
                                fontStyle: FontStyle.italic,
                                color: isDark ? Colors.white70 : Colors.black87,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showRecommendationsBottomSheet(BuildContext context, Map<String, dynamic> merchant) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final recommendations = merchant['friendRecommendations'] as List? ?? [];
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF2A2826) : Colors.white,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(28),
              topRight: Radius.circular(28),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              Container(
                width: 45,
                height: 5,
                decoration: BoxDecoration(
                  color: isDark ? Colors.white24 : Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            merchant['integrationName'] ?? 'Merchant',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Friend Recommendations (${recommendations.length})',
                            style: const TextStyle(
                              fontSize: 13,
                              color: Colors.grey,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Divider(),
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.45,
                ),
                child: ListView.builder(
                  shrinkWrap: true,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  itemCount: recommendations.length,
                  itemBuilder: (context, index) {
                    final rec = recommendations[index];
                    final friend = rec['friendName'] ?? 'Your friend';
                    final ratingVal = rec['rating'] ?? 5;
                    final text = rec['reviewText'] ?? '';
                    final dateStr = rec['createdAt'] != null
                        ? DateTime.tryParse(rec['createdAt'].toString())?.toLocal().toString().substring(0, 10) ?? ''
                        : '';
                        
                    return Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF383532) : const Color(0xFFF9FAFB),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isDark ? Colors.transparent : Colors.grey.shade200,
                          width: 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 16,
                                backgroundColor: Colors.green.withOpacity(0.1),
                                child: const Icon(Icons.person_rounded, size: 18, color: Colors.green),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      friend,
                                      style: TextStyle(
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.bold,
                                        color: isDark ? Colors.white : Colors.black87,
                                      ),
                                    ),
                                    if (dateStr.isNotEmpty)
                                      Text(
                                        dateStr,
                                        style: const TextStyle(
                                          fontSize: 10,
                                          color: Colors.grey,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              Row(
                                children: List.generate(5, (starIdx) {
                                  return Icon(
                                    Icons.star_rounded,
                                    color: starIdx < ratingVal ? Colors.amber : Colors.grey.shade300,
                                    size: 14,
                                  );
                                }),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            text,
                            style: TextStyle(
                              fontSize: 13,
                              color: isDark ? Colors.white : Colors.black87,
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 20, right: 20, top: 12, bottom: 24),
                child: SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    onPressed: () {
                      Navigator.pop(context);
                      context.push('/customer/catalogue', extra: merchant);
                    },
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Visit Store',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward_rounded, size: 18),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

void _showAllFriendRecommendationsBottomSheet(BuildContext context, List<Map<String, dynamic>> merchants) {
  final isDark = Theme.of(context).brightness == Brightness.dark;
  
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF2A2826) : Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(28),
            topRight: Radius.circular(28),
          ),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(
              width: 45,
              height: 5,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : Colors.grey.shade300,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'All Recommendations',
                          style: GoogleFonts.publicSans(
                            textStyle: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.3,
                              color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppTheme.ultraBlack,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'From your friends on Tubulu',
                          style: TextStyle(
                            fontSize: 13,
                            color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const Divider(height: 1),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(20),
                itemCount: merchants.length,
                itemBuilder: (context, index) {
                  final merchant = merchants[index];
                  final name = merchant['integrationName'] ?? 'Merchant';
                  final category = merchant['category'] ?? 'General';
                  final recommendations = merchant['friendRecommendations'] as List? ?? [];
                  
                  return Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF383532) : Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isDark ? const Color(0xFF4A4845) : Colors.grey.shade200,
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(isDark ? 0.3 : 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Merchant Header Row
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      name,
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: isDark ? Colors.white : Colors.black87,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      category,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              ElevatedButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                  context.push('/customer/catalogue', extra: merchant);
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF0091FF), // Tubulu brand blue
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  minimumSize: Size.zero,
                                  elevation: 0,
                                ),
                                child: const Text(
                                  'Visit',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Divider(height: 1),
                        // List of recommendations for this merchant
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          padding: const EdgeInsets.all(16),
                          itemCount: recommendations.length,
                          itemBuilder: (context, recIdx) {
                            final rec = recommendations[recIdx];
                            final friend = rec['friendName'] ?? 'Your friend';
                            final ratingVal = rec['rating'] ?? 5;
                            final text = rec['reviewText'] ?? '';
                            final dateStr = rec['createdAt'] != null
                                ? DateTime.tryParse(rec['createdAt'].toString())?.toLocal().toString().substring(0, 10) ?? ''
                                : '';
                            
                            return Padding(
                              padding: EdgeInsets.only(bottom: recIdx == recommendations.length - 1 ? 0 : 16),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CircleAvatar(
                                    radius: 16,
                                    backgroundColor: const Color(0xFF0091FF).withOpacity(0.1),
                                    child: const Icon(Icons.person_rounded, size: 18, color: Color(0xFF0091FF)),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              friend,
                                              style: TextStyle(
                                                fontSize: 13.5,
                                                fontWeight: FontWeight.bold,
                                                color: isDark ? Colors.white : Colors.black87,
                                              ),
                                            ),
                                            Row(
                                              children: List.generate(5, (starIdx) {
                                                return Icon(
                                                  Icons.star_rounded,
                                                  color: starIdx < ratingVal ? Colors.amber : Colors.grey.shade300,
                                                  size: 14,
                                                );
                                              }),
                                            ),
                                          ],
                                        ),
                                        if (dateStr.isNotEmpty) ...[
                                          const SizedBox(height: 2),
                                          Text(
                                            dateStr,
                                            style: const TextStyle(
                                              fontSize: 10,
                                              color: Colors.grey,
                                            ),
                                          ),
                                        ],
                                        const SizedBox(height: 6),
                                        Text(
                                          text,
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: isDark ? Colors.grey.shade300 : Colors.black87,
                                            height: 1.35,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      );
    },
  );
}

class _TopRatedCarousel extends StatefulWidget {
  final List<Map<String, dynamic>> merchants;

  const _TopRatedCarousel({required this.merchants});

  @override
  State<_TopRatedCarousel> createState() => _TopRatedCarouselState();
}

class _TopRatedCarouselState extends State<_TopRatedCarousel> {
  int _currentPage = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (widget.merchants.length > 1) {
      _startTimer();
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (!mounted) return;
      _nextPage();
    });
  }

  void _nextPage() {
    setState(() {
      _currentPage = (_currentPage + 1) % widget.merchants.length;
    });
  }

  void _prevPage() {
    setState(() {
      _currentPage = (_currentPage - 1 + widget.merchants.length) % widget.merchants.length;
    });
  }

  void _handleSwipe(int direction) {
    _timer?.cancel();
    if (direction < 0) {
      _nextPage();
    } else {
      _prevPage();
    }
    if (widget.merchants.length > 1) {
      _startTimer();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Column(
      children: [
        SizedBox(
          height: 180,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GestureDetector(
              onHorizontalDragEnd: (details) {
                if (details.primaryVelocity == null) return;
                if (details.primaryVelocity! < 0) {
                  _handleSwipe(-1);
                } else if (details.primaryVelocity! > 0) {
                  _handleSwipe(1);
                }
              },
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 500),
                switchInCurve: Curves.easeOutBack,
                switchOutCurve: Curves.easeIn,
                transitionBuilder: (Widget child, Animation<double> animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: ScaleTransition(
                      scale: Tween<double>(begin: 0.90, end: 1.0).animate(animation),
                      child: child,
                    ),
                  );
                },
                child: KeyedSubtree(
                  key: ValueKey<int>(_currentPage),
                  child: MerchantCard(merchant: widget.merchants[_currentPage]),
                ),
              ),
            ),
          ),
        ),
        if (widget.merchants.length > 1) ...[
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(widget.merchants.length, (index) {
              final isSelected = index == _currentPage;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: isSelected ? 18 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: isSelected 
                      ? const Color(0xFF0091FF)
                      : (isDark ? Colors.white24 : Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
        ],
      ],
    );
  }
}
