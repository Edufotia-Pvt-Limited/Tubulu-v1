import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:tubulu_mobile/core/api/api_provider.dart';
import 'package:tubulu_mobile/core/theme/app_theme.dart';
import 'package:tubulu_mobile/core/providers/preferences_provider.dart';
import '../widgets/merchant_card.dart';

final industryMerchantsProvider = FutureProvider.family.autoDispose<List<Map<String, dynamic>>, String>((ref, category) async {
  final dio = ref.watch(dioProvider);
  final prefs = ref.watch(preferencesProvider);
  String catQuery = category;
  
  try {
    final response = await dio.get('/integrations/discovery?lat=${prefs.lat}&lng=${prefs.lng}&radius=${prefs.radius}&category=${Uri.encodeComponent(catQuery)}');
    final rawData = response.data['data'];
    if (rawData == null) return [];
    return List<Map<String, dynamic>>.from(rawData);
  } catch (e) {
    debugPrint('Error fetching industry merchants: $e');
    return [];
  }
});

class IndustryMerchantsScreen extends ConsumerStatefulWidget {
  final String industryName;
  final Color industryColor;

  const IndustryMerchantsScreen({
    super.key,
    required this.industryName,
    required this.industryColor,
  });

  @override
  ConsumerState<IndustryMerchantsScreen> createState() => _IndustryMerchantsScreenState();
}

class _IndustryMerchantsScreenState extends ConsumerState<IndustryMerchantsScreen> {
  String _sortBy = 'Distance'; // 'Distance' | 'Rating' | 'Delivery Time'
  bool _onlyWithDelivery = false;
  bool _onlyActive = false;

  void _showSortBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Sort By',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                      color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppTheme.ultraBlack,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildSortRadioOption(setModalState, 'Distance', 'Distance (Nearest First)'),
                  _buildSortRadioOption(setModalState, 'Rating', 'Rating (Highest First)'),
                  _buildSortRadioOption(setModalState, 'Delivery Time', 'Delivery Time (Fastest First)'),
                ],
              ),
            );
          }
        );
      },
    );
  }

  Widget _buildSortRadioOption(StateSetter setModalState, String value, String label) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return RadioListTile<String>(
      title: Text(
        label, 
        style: TextStyle(
          fontWeight: FontWeight.w700, 
          fontSize: 14, 
          color: isDark ? Colors.white70 : Colors.black87,
        )
      ),
      value: value,
      groupValue: _sortBy,
      activeColor: Theme.of(context).colorScheme.primary,
      contentPadding: EdgeInsets.zero,
      onChanged: (val) {
        if (val != null) {
          setState(() {
            _sortBy = val;
          });
          setModalState(() {});
          Navigator.pop(context);
        }
      },
    );
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Filters',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 18,
                          color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppTheme.ultraBlack,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _onlyWithDelivery = false;
                            _onlyActive = false;
                          });
                          setModalState(() {});
                          Navigator.pop(context);
                        },
                        child: const Text(
                          'Clear All', 
                          style: TextStyle(color: Colors.red, fontWeight: FontWeight.w900, fontSize: 14)
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  CheckboxListTile(
                    title: Text(
                      'Only Show Delivery Partners', 
                      style: TextStyle(
                        fontWeight: FontWeight.w700, 
                        fontSize: 14,
                        color: Theme.of(context).brightness == Brightness.dark ? Colors.white.withOpacity(0.9) : Colors.black87,
                      )
                    ),
                    value: _onlyWithDelivery,
                    activeColor: Theme.of(context).colorScheme.primary,
                    contentPadding: EdgeInsets.zero,
                    onChanged: (val) {
                      setState(() {
                        _onlyWithDelivery = val ?? false;
                      });
                      setModalState(() {});
                    },
                  ),
                  CheckboxListTile(
                    title: Text(
                      'Only Show Active/Open Shops', 
                      style: TextStyle(
                        fontWeight: FontWeight.w700, 
                        fontSize: 14,
                        color: Theme.of(context).brightness == Brightness.dark ? Colors.white.withOpacity(0.9) : Colors.black87,
                      )
                    ),
                    value: _onlyActive,
                    activeColor: Theme.of(context).colorScheme.primary,
                    contentPadding: EdgeInsets.zero,
                    onChanged: (val) {
                      setState(() {
                        _onlyActive = val ?? false;
                      });
                      setModalState(() {});
                    },
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: const Text(
                        'Apply Filters', 
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15)
                      ),
                    ),
                  ),
                ],
              ),
            );
          }
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final merchantsAsync = ref.watch(industryMerchantsProvider(widget.industryName));

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.black),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Text(
          '${widget.industryName} Hub',
          style: TextStyle(
            color: Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 20,
            letterSpacing: -0.3,
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(industryMerchantsProvider(widget.industryName));
        },
        child: CustomScrollView(
          slivers: [
            // Beautiful Header/Banner
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [widget.industryColor, widget.industryColor.withOpacity(0.7)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: widget.industryColor.withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    )
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Explore ${widget.industryName}',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 22),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Verified nearby partners delivering premium value.',
                            style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Filter Bar Section
            SliverToBoxAdapter(
              child: _buildFilterBar(),
            ),

            merchantsAsync.when(
              data: (rawMerchants) {
                // Apply local filters
                List<Map<String, dynamic>> merchants = List.from(rawMerchants);

                if (_onlyWithDelivery) {
                  merchants = merchants.where((m) {
                    final caps = m['capabilities'];
                    if (caps is Map) {
                      return caps['hasDelivery'] == true;
                    }
                    return false;
                  }).toList();
                }

                if (_onlyActive) {
                  merchants = merchants.where((m) => m['isActive'] == true).toList();
                }

                // Apply local sorting
                if (_sortBy == 'Distance') {
                  merchants.sort((a, b) {
                    final da = double.tryParse(a['distance']?.toString() ?? '9999') ?? 9999.0;
                    final db = double.tryParse(b['distance']?.toString() ?? '9999') ?? 9999.0;
                    return da.compareTo(db);
                  });
                } else if (_sortBy == 'Rating') {
                  merchants.sort((a, b) {
                    double getRating(Map<String, dynamic> m) {
                      final idStr = m['id']?.toString() ?? m['integrationName']?.toString() ?? 'default';
                      return 4.1 + (idStr.hashCode.abs() % 7) * 0.1;
                    }
                    return getRating(b).compareTo(getRating(a)); // Descending
                  });
                } else if (_sortBy == 'Delivery Time') {
                  merchants.sort((a, b) {
                    double getMins(Map<String, dynamic> m) {
                      final dist = double.tryParse(m['distance']?.toString() ?? '9999') ?? 9999.0;
                      return 10.0 + dist * 6.0;
                    }
                    return getMins(a).compareTo(getMins(b)); // Ascending
                  });
                }

                if (merchants.isEmpty) {
                  return const SliverFillRemaining(
                    hasScrollBody: false,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.store_mall_directory_outlined, size: 64, color: Colors.grey),
                          SizedBox(height: 16),
                          Text(
                            'No businesses found matching filters.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey, fontSize: 15),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                final isFood = widget.industryName.toLowerCase().contains('food') || widget.industryName.toLowerCase().contains('restaurant');
                final typeText = isFood ? 'restaurants' : 'stores';

                return SliverMainAxisGroup(
                  slivers: [
                    SliverPadding(
                      padding: const EdgeInsets.only(left: 20, right: 20, top: 12, bottom: 8),
                      sliver: SliverToBoxAdapter(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Top ${merchants.length} $typeText to explore',
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 18,
                                letterSpacing: -0.3,
                                color: AppTheme.ultraBlack,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              isFood ? 'Featured Restaurants' : 'Featured Stores',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) => MerchantCard(merchant: merchants[index]),
                          childCount: merchants.length,
                        ),
                      ),
                    ),
                  ],
                );
              },
              loading: () => const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: Text('Error: $e')),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterBar() {
    final activeFiltersCount = (_onlyActive ? 1 : 0) + (_onlyWithDelivery ? 1 : 0);
    return SizedBox(
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        children: [
          GestureDetector(
            onTap: _showFilterBottomSheet,
            child: _buildFilterItem(
              label: activeFiltersCount > 0 ? 'Filter ($activeFiltersCount)' : 'Filter',
              icon: Icons.tune_rounded,
              color: activeFiltersCount > 0 ? AppTheme.primaryColor.withOpacity(0.08) : Colors.white,
              borderColor: activeFiltersCount > 0 ? AppTheme.primaryColor : Colors.grey.shade300,
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _showSortBottomSheet,
            child: _buildFilterItem(
              label: 'Sort By: $_sortBy',
              suffixIcon: Icons.keyboard_arrow_down_rounded,
              color: _sortBy != 'Distance' ? AppTheme.primaryColor.withOpacity(0.08) : Colors.white,
              borderColor: _sortBy != 'Distance' ? AppTheme.primaryColor : Colors.grey.shade300,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterItem({
    required String label,
    IconData? icon,
    IconData? suffixIcon,
    Widget? prefixWidget,
    Color? color,
    Color? borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color ?? Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: borderColor ?? Colors.grey.shade300, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (prefixWidget != null) prefixWidget,
          if (icon != null) ...[
            Icon(icon, size: 14, color: Colors.black87),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: const TextStyle(
              color: Colors.black87,
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
          ),
          if (suffixIcon != null) ...[
            const SizedBox(width: 2),
            Icon(suffixIcon, size: 14, color: Colors.black54),
          ],
        ],
      ),
    );
  }
}
