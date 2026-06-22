import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/widgets/tubulu_image.dart';


class MerchantCard extends StatefulWidget {
  final Map<String, dynamic> merchant;
  final double? width;

  const MerchantCard({
    super.key,
    required this.merchant,
    this.width,
  });

  @override
  State<MerchantCard> createState() => _MerchantCardState();
}

class _MerchantCardState extends State<MerchantCard> {
  bool _isFavorite = false;
  late List<String> _productImages;

  @override
  void initState() {
    super.initState();
    _productImages = _getImagesForCard();
  }

  @override
  void didUpdateWidget(covariant MerchantCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.merchant['id'] != oldWidget.merchant['id'] ||
        widget.merchant['bannerImage'] != oldWidget.merchant['bannerImage'] ||
        widget.merchant['logo'] != oldWidget.merchant['logo']) {
      _productImages = _getImagesForCard();
    }
  }

  List<String> _getImagesForCard() {
    final List<String> images = [];
    
    // 1. Try to get banner images first (these are the main slider images for the shop card)
    final String bannerStr = widget.merchant['bannerImage'] ?? '';
    if (bannerStr.isNotEmpty) {
      final bannerUrls = bannerStr.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty);
      for (var url in bannerUrls) {
        if (!images.contains(url)) {
          images.add(url);
        }
      }
    }
    
    // 2. Also append product images to showcase actual products
    final catalogues = widget.merchant['catalogues'];
    if (catalogues is List) {
      for (var cat in catalogues) {
        if (cat is Map && cat['products'] is List) {
          for (var prod in cat['products']) {
            if (prod is Map && prod['imageUrls'] != null) {
              final urls = prod['imageUrls'];
              if (urls is List) {
                for (var url in urls) {
                  if (url != null) {
                    final cleanUrl = url.toString().trim();
                    if (cleanUrl.isNotEmpty && !images.contains(cleanUrl)) {
                      images.add(cleanUrl);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (images.isNotEmpty) {
      images.shuffle();
    }
    return images;
  }

  bool _getIsOpen() {
    try {
      if (widget.merchant['isSuspended'] == true) return false;
      if (widget.merchant['isActive'] == false) return false;
      if (widget.merchant['isApproved'] == false) return false;
      final openingHours = widget.merchant['openingHours'];
      if (openingHours == null) return true;
      final now = DateTime.now();
      final days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      final dayName = days[now.weekday - 1];
      final dayConfig = openingHours[dayName];
      if (dayConfig == null) return true;
      if (dayConfig['isOpen'] == false) return false;
      
      final openStr = dayConfig['open'] as String?;
      final closeStr = dayConfig['close'] as String?;
      if (openStr == null || closeStr == null) return true;
      
      final openParts = openStr.split(':');
      final closeParts = closeStr.split(':');
      final openMinutes = int.parse(openParts[0]) * 60 + int.parse(openParts[1]);
      final closeMinutes = int.parse(closeParts[0]) * 60 + int.parse(closeParts[1]);
      final nowMinutes = now.hour * 60 + now.minute;
      
      return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
    } catch (e) {
      return true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final rawDistance = widget.merchant['distance'];
    final double? dist = (rawDistance != null) ? double.tryParse(rawDistance.toString()) : null;
    // Delivery time calculations
    final int? customMins = widget.merchant['estimatedDeliveryTime'] != null
        ? int.tryParse(widget.merchant['estimatedDeliveryTime'].toString())
        : null;
    final int mins = (customMins != null && customMins != 30)
        ? customMins
        : (dist != null ? (10 + (dist * 6).round()) : 20);
    final timeRangeText = '${(mins - 5).clamp(5, 100)}-$mins mins';

    final distanceText = dist != null ? '${dist.toStringAsFixed(1)} km' : 'Nearby';

    // Stable mock rating and rating count based on the merchant info
    final String idStr = widget.merchant['id']?.toString() ?? widget.merchant['integrationName']?.toString() ?? 'default';
    final int hash = idStr.hashCode.abs();
    
    final double ratingVal = widget.merchant['rating'] != null 
        ? double.parse(widget.merchant['rating'].toString()) 
        : (4.1 + (hash % 7) * 0.1);

    final int ratingCountVal = widget.merchant['ratingCount'] != null 
        ? int.parse(widget.merchant['ratingCount'].toString()) 
        : (50 + (hash % 18) * 150);

    final String ratingCountText = ratingCountVal > 999 
        ? '${(ratingCountVal / 1000).toStringAsFixed(1)}K+' 
        : '$ratingCountVal+';

    // Show Bolt label for food delivery categories
    final String category = widget.merchant['category']?.toString() ?? 'General';
    final isFood = category.toLowerCase().contains('food') || category.toLowerCase().contains('restaurant');

    final isOpen = _getIsOpen();
    final isHorizontalScroll = widget.width != null;

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => context.push('/customer/catalogue', extra: widget.merchant),
      child: Container(
        width: widget.width,
        margin: isHorizontalScroll ? const EdgeInsets.only(right: 12, top: 4, bottom: 8) : EdgeInsets.zero,
        padding: isHorizontalScroll 
            ? const EdgeInsets.all(10)
            : const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF2A2826) : Colors.white,
          borderRadius: isHorizontalScroll ? BorderRadius.circular(16) : BorderRadius.zero,
          boxShadow: isHorizontalScroll ? [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.15 : 0.04),
              blurRadius: 8,
              offset: const Offset(0, 3),
            )
          ] : null,
          border: isHorizontalScroll
              ? Border.all(
                  color: isDark ? const Color(0xFF383532) : Colors.grey.shade200,
                  width: 1,
                )
              : null,
        ),
        child: isHorizontalScroll
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Image Stack
                  Stack(
                    children: [
                      Container(
                        height: 110,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: AutoImageSlider(
                            images: _productImages,
                            fallbackLogo: widget.merchant['logo'] ?? '',
                            height: 110,
                            borderRadius: 12,
                            isDark: isDark,
                          ),
                        ),
                      ),
                      // Wishlist heart
                      Positioned(
                        top: 6,
                        right: 6,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _isFavorite = !_isFavorite;
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              _isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                              color: _isFavorite ? Colors.red : Colors.white,
                              size: 13,
                            ),
                          ),
                        ),
                      ),
                      // Open/Closed Badge
                      Positioned(
                        bottom: 6,
                        left: 6,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isOpen ? const Color(0xFF0091FF).withOpacity(0.9) : Colors.red.shade700.withOpacity(0.9),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            isOpen ? 'OPEN' : 'CLOSED',
                            style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                          ),
                        ),
                      ),
                      if (widget.merchant['recommendedByFriend'] != null)
                        Positioned(
                          top: 6,
                          left: 6,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2ECC71).withOpacity(0.95),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.people_rounded, size: 9, color: Colors.white),
                                const SizedBox(width: 3),
                                Text(
                                  'By ${widget.merchant['recommendedByFriend']}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 8,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // Details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.merchant['integrationName'] ?? 'Merchant',
                          style: TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w900,
                            color: isDark ? Colors.white : const Color(0xFF2C2C2C),
                            letterSpacing: -0.3,
                            height: 1.15,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 3),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(1.5),
                              decoration: const BoxDecoration(
                                color: Colors.green,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.star_rounded,
                                color: Colors.white,
                                size: 8,
                              ),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              ratingVal.toStringAsFixed(1),
                              style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                  color: isDark ? Colors.white.withOpacity(0.9) : Colors.black87),
                            ),
                            const Spacer(),
                            Text(
                              timeRangeText,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: isDark ? Colors.white70 : Colors.black54,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          category,
                          style: TextStyle(
                            color: isDark ? Colors.white60 : Colors.black45,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 1),
                        Text(
                          distanceText,
                          style: TextStyle(
                            color: isDark ? Colors.white54 : Colors.black38,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        // Quick actions removed
                      ],
                    ),
                  ),
                ],
              )
            : Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Side: Rounded Image Stack matching Swiggy design
                  Stack(
                    children: [
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.06),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            )
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: AutoImageSlider(
                            images: _productImages,
                            fallbackLogo: widget.merchant['logo'] ?? '',
                            height: 120,
                            borderRadius: 16,
                            isDark: isDark,
                          ),
                        ),
                      ),
                      // Heart wishlist button (Top-Right)
                      Positioned(
                        top: 8,
                        right: 8,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _isFavorite = !_isFavorite;
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.all(5),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              _isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                              color: _isFavorite ? Colors.red : Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ),
                      // Open/Closed Badge (Bottom Left)
                      Positioned(
                        bottom: 6,
                        left: 6,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isOpen ? const Color(0xFF0091FF).withOpacity(0.9) : Colors.red.shade700.withOpacity(0.9),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            isOpen ? 'OPEN' : 'CLOSED',
                            style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  // Right Side: Details matching Swiggy premium layout
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (widget.merchant['recommendedByFriend'] != null) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2ECC71).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFF2ECC71).withOpacity(0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.people_rounded, color: Color(0xFF2ECC71), size: 10),
                                const SizedBox(width: 4),
                                Text(
                                  'Recommended by ${widget.merchant['recommendedByFriend']}',
                                  style: const TextStyle(
                                    color: Color(0xFF2ECC71),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 9,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 6),
                        ],
                        // Brand Label / Bolt Delivery line
                        FittedBox(
                          fit: BoxFit.scaleDown,
                          alignment: Alignment.centerLeft,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (isFood) ...[
                                Text(
                                  'Bolt',
                                  style: TextStyle(
                                    color: Colors.orange.shade800,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 12,
                                    letterSpacing: -0.3,
                                  ),
                                ),
                                const SizedBox(width: 1),
                                const Icon(Icons.flash_on, color: Colors.amber, size: 14),
                                const SizedBox(width: 2),
                                Text(
                                  'Food in 10-15 min',
                                  style: TextStyle(
                                    color: isDark ? Colors.white.withOpacity(0.9) : Colors.black87,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 10.5,
                                  ),
                                ),
                              ] else ...[
                                Icon(Icons.check_circle_rounded, color: Colors.deepPurpleAccent.shade200, size: 13),
                                const SizedBox(width: 4),
                                Text(
                                  'Verified Store',
                                  style: TextStyle(
                                    color: isDark ? Colors.white.withOpacity(0.9) : Colors.black87,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.merchant['integrationName'] ?? 'Merchant',
                          style: TextStyle(
                            fontSize: 15.5,
                            fontWeight: FontWeight.w900,
                            color: isDark ? Colors.white : const Color(0xFF2C2C2C),
                            letterSpacing: -0.3,
                            height: 1.15,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 3),
                        // Rating & Time Row
                        FittedBox(
                          fit: BoxFit.scaleDown,
                          alignment: Alignment.centerLeft,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(
                                  color: Colors.green,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.star_rounded,
                                  color: Colors.white,
                                  size: 10,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                ratingVal.toStringAsFixed(1),
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w900,
                                  color: isDark ? Colors.white.withOpacity(0.9) : Colors.black87,
                                ),
                              ),
                              const SizedBox(width: 3),
                              Text(
                                '($ratingCountText)',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: isDark ? Colors.white60 : Colors.black45,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '•',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isDark ? Colors.white60 : Colors.black45,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                timeRangeText,
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w900,
                                  color: isDark ? Colors.white.withOpacity(0.9) : Colors.black87,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 3),
                        // Delivery fee, min order, ETA row
                        FittedBox(
                          fit: BoxFit.scaleDown,
                          alignment: Alignment.centerLeft,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.delivery_dining_rounded, size: 14, color: Colors.orange),
                              const SizedBox(width: 4),
                              Text(
                                '₹${widget.merchant['deliveryFee'] ?? '25'} delivery',
                                style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: isDark ? Colors.white70 : Colors.black54),
                              ),
                              const SizedBox(width: 6),
                              Text('•', style: TextStyle(fontSize: 11, color: isDark ? Colors.white38 : Colors.black38)),
                              const SizedBox(width: 6),
                              Text(
                                'Min ₹${widget.merchant['minimumOrderValue'] ?? '100'}',
                                style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: isDark ? Colors.white70 : Colors.black54),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 3),
                        // Cuisines/Category
                        Text(
                          category,
                          style: TextStyle(
                            color: isDark ? Colors.white60 : Colors.black54,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        // Location & Distance
                        Text(
                          '${widget.merchant['city'] ?? 'Mysore City'} • $distanceText',
                          style: TextStyle(
                            color: isDark ? Colors.white54 : Colors.black38,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        // Quick actions removed
                      ],
                    ),
                  ),
                  // Ellipsis Menu Icon
                  IconButton(
                    icon: Icon(Icons.more_vert, color: isDark ? Colors.white54 : Colors.black38, size: 20),
                    onPressed: () {},
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildCardQuickAction(IconData icon, VoidCallback onTap, {double size = 10, double padding = 4}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(padding),
        decoration: BoxDecoration(
          color: Colors.orange.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.orange, size: size),
      ),
    );
  }
}

class AutoImageSlider extends StatefulWidget {
  final List<String> images;
  final String fallbackLogo;
  final double height;
  final double borderRadius;
  final bool isDark;

  const AutoImageSlider({
    super.key,
    required this.images,
    required this.fallbackLogo,
    required this.height,
    required this.borderRadius,
    required this.isDark,
  });

  @override
  State<AutoImageSlider> createState() => _AutoImageSliderState();
}

class _AutoImageSliderState extends State<AutoImageSlider> {
  late List<String> _images;
  int _currentPage = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _images = widget.images.isNotEmpty
        ? widget.images
        : (widget.fallbackLogo.isNotEmpty ? [widget.fallbackLogo] : []);
        
    if (_images.length > 1) {
      _startTimer();
    }
  }

  @override
  void didUpdateWidget(covariant AutoImageSlider oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.images != oldWidget.images || widget.fallbackLogo != oldWidget.fallbackLogo) {
      _timer?.cancel();
      setState(() {
        _images = widget.images.isNotEmpty
            ? widget.images
            : (widget.fallbackLogo.isNotEmpty ? [widget.fallbackLogo] : []);
        _currentPage = 0;
      });
      if (_images.length > 1) {
        _startTimer();
      }
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (!mounted) return;
      setState(() {
        _currentPage = (_currentPage + 1) % _images.length;
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_images.isEmpty) {
      return Container(
        color: widget.isDark ? const Color(0xFF383532) : Colors.grey.shade100,
        child: Icon(Icons.store_rounded, size: widget.height * 0.35, color: widget.isDark ? Colors.white24 : Colors.grey),
      );
    }

    if (_images.length == 1) {
      return TubuluImage(
        imageUrl: _images.first,
        fit: BoxFit.cover,
        borderRadius: widget.borderRadius,
        errorWidget: Container(
          color: widget.isDark ? const Color(0xFF383532) : Colors.grey.shade100,
          child: Icon(Icons.store_rounded, size: widget.height * 0.35, color: widget.isDark ? Colors.white24 : Colors.grey),
        ),
      );
    }

    return Stack(
      children: [
        SizedBox.expand(
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
            child: SizedBox.expand(
              key: ValueKey<int>(_currentPage),
              child: TubuluImage(
                imageUrl: _images[_currentPage],
                fit: BoxFit.cover,
                borderRadius: widget.borderRadius,
                errorWidget: Container(
                  color: widget.isDark ? const Color(0xFF383532) : Colors.grey.shade100,
                  child: Icon(Icons.store_rounded, size: widget.height * 0.35, color: widget.isDark ? Colors.white24 : Colors.grey),
                ),
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 12,
          right: 12,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(_images.length, (index) {
              final isSelected = index == _currentPage;
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 1.5),
                width: isSelected ? 8 : 4,
                height: 4,
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF0091FF) : const Color(0xFF0091FF).withOpacity(0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

