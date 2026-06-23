import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_provider.dart';
import '../../catalogue/screens/merchant_catalogue_screen.dart';
import '../../products/providers/products_provider.dart';

final merchantFeedsProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/feeds/merchants/feeds');
  if (response.data['success'] == true && response.data['data'] != null) {
    return List<dynamic>.from(response.data['data']);
  }
  return [];
});

class MerchantFeedManagementScreen extends ConsumerStatefulWidget {
  const MerchantFeedManagementScreen({super.key});

  @override
  ConsumerState<MerchantFeedManagementScreen> createState() => _MerchantFeedManagementScreenState();
}

class _MerchantFeedManagementScreenState extends ConsumerState<MerchantFeedManagementScreen> {
  String _formatImageUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    final baseHost = ApiConfig.baseUrl.replaceAll('/api/v1', '');
    return '$baseHost$url';
  }

  String _formatDateTimeString(String? isoString) {
    if (isoString == null) return '';
    try {
      final dateTime = DateTime.parse(isoString).toLocal();
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final month = months[dateTime.month - 1];
      final day = dateTime.day;
      final hour24 = dateTime.hour;
      final amPm = hour24 >= 12 ? 'PM' : 'AM';
      final hour12 = hour24 % 12 == 0 ? 12 : hour24 % 12;
      final minute = dateTime.minute.toString().padLeft(2, '0');
      return '$month $day, $hour12:$minute $amPm';
    } catch (_) {
      return isoString;
    }
  }

  @override
  Widget build(BuildContext context) {
    final feedsAsync = ref.watch(merchantFeedsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Store Feed & Moments'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(merchantFeedsProvider),
          ),
        ],
      ),
      body: feedsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 12),
              const Text('Could not load feeds', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(err.toString(), style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ),
        data: (feeds) {
          if (feeds.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.campaign_outlined, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  const Text(
                    'No moments posted yet',
                    style: TextStyle(fontSize: 16, color: Colors.grey, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Tap the + button to share updates, campaigns,\nor celebrity visits with your customers!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: feeds.length,
            itemBuilder: (context, index) {
              final feed = feeds[index];
              final String? mediaUrl = feed['mediaUrl'];
              final Map<String, dynamic>? product = feed['linkedProduct'];

              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.grey[200]!),
                ),
                elevation: 0,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (mediaUrl != null && mediaUrl.isNotEmpty)
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                        child: Image.network(
                          _formatImageUrl(mediaUrl),
                          width: double.infinity,
                          height: 150,
                          fit: BoxFit.cover,
                          errorBuilder: (c, e, s) => const SizedBox.shrink(),
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  feed['title'] ?? '',
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Builder(
                                builder: (context) {
                                  final String status = feed['status'] ?? 'active';
                                  Color badgeColor;
                                  IconData badgeIcon;
                                  switch (status) {
                                    case 'scheduled':
                                      badgeColor = Colors.blue;
                                      badgeIcon = Icons.schedule;
                                      break;
                                    case 'expired':
                                      badgeColor = Colors.grey;
                                      badgeIcon = Icons.timer_off;
                                      break;
                                    default:
                                      badgeColor = Colors.green;
                                      badgeIcon = Icons.check_circle;
                                  }
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: badgeColor.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(color: badgeColor.withOpacity(0.3)),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(badgeIcon, size: 10, color: badgeColor),
                                        const SizedBox(width: 2),
                                        Text(
                                          status.toUpperCase(),
                                          style: TextStyle(
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                            color: badgeColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: Colors.red),
                                onPressed: () => _confirmDelete(context, feed['id']),
                              ),
                            ],
                          ),
                          if (feed['startsAt'] != null || feed['expiresAt'] != null) ...[
                            Row(
                              children: [
                                if (feed['startsAt'] != null) ...[
                                  const Icon(Icons.play_arrow, size: 12, color: Colors.grey),
                                  const SizedBox(width: 2),
                                  Text(
                                    'Starts: ${_formatDateTimeString(feed['startsAt'])}',
                                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                                  ),
                                  if (feed['expiresAt'] != null) const SizedBox(width: 12),
                                ],
                                if (feed['expiresAt'] != null) ...[
                                  const Icon(Icons.stop, size: 12, color: Colors.grey),
                                  const SizedBox(width: 2),
                                  Text(
                                    'Expires: ${_formatDateTimeString(feed['expiresAt'])}',
                                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 6),
                          ],
                          Text(
                            feed['description'] ?? '',
                            style: TextStyle(fontSize: 13, color: Colors.grey[800]),
                          ),
                          if (product != null) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey[200]!),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.link, size: 16, color: Colors.orange),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'Linked Product: ${product['name'] ?? 'Item'} (₹${product['price'] ?? '0'})',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateFeedDialog(context),
        backgroundColor: Colors.orange,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Moment', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  void _confirmDelete(BuildContext context, String feedId) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('Delete Moment'),
        content: const Text('Are you sure you want to delete this post? It will be removed from your customer feeds instantly.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(dialogCtx);
              try {
                final dio = ref.read(dioProvider);
                await dio.delete('/feeds/merchants/feeds/$feedId');
                ref.invalidate(merchantFeedsProvider);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Moment deleted successfully')),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: ${e.toString()}')),
                  );
                }
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }  void _showCreateFeedDialog(BuildContext context) {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    
    XFile? selectedImage;
    final ImagePicker picker = ImagePicker();
    bool isPosting = false;

    String? selectedCatalogueId;
    String? selectedProductId;

    DateTime? startsAt;
    DateTime? expiresAt;

    Future<void> pickImage(ImageSource source, StateSetter setDialogState) async {
      try {
        final pickedFile = await picker.pickImage(
          source: source,
          maxWidth: 1024,
          maxHeight: 1024,
          imageQuality: 85,
        );
        if (pickedFile != null) {
          setDialogState(() {
            selectedImage = pickedFile;
          });
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to access photos: $e'), backgroundColor: Colors.red),
          );
        }
      }
    }

    Future<DateTime?> pickDateTime(BuildContext ctx, DateTime? initial) async {
      final date = await showDatePicker(
        context: ctx,
        initialDate: initial ?? DateTime.now(),
        firstDate: DateTime.now().subtract(const Duration(days: 1)),
        lastDate: DateTime.now().add(const Duration(days: 365)),
      );
      if (date == null) return null;
      
      if (!ctx.mounted) return null;
      final time = await showTimePicker(
        context: ctx,
        initialTime: TimeOfDay.fromDateTime(initial ?? DateTime.now()),
      );
      if (time == null) return null;
      
      return DateTime(date.year, date.month, date.day, time.hour, time.minute);
    }

    void showImageSourceSheet(StateSetter setDialogState) {
      showModalBottomSheet(
        context: context,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        builder: (sheetContext) => SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'Select Moment Image Source',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Photo Gallery'),
                onTap: () async {
                  Navigator.pop(sheetContext);
                  await pickImage(ImageSource.gallery, setDialogState);
                },
              ),
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Camera'),
                onTap: () async {
                  Navigator.pop(sheetContext);
                  await pickImage(ImageSource.camera, setDialogState);
                },
              ),
            ],
          ),
        ),
      );
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) => Consumer(
          builder: (consumerCtx, ref, child) => Padding(
            padding: EdgeInsets.only(
              left: 24,
              right: 24,
              top: 24,
              bottom: MediaQuery.of(sheetCtx).viewInsets.bottom + 24,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Post New Moment / Vibe',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(sheetCtx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: titleController,
                    decoration: const InputDecoration(
                      labelText: 'Headline *',
                      border: OutlineInputBorder(),
                      hintText: 'e.g. Celebrity Guest Visit!',
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: descController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Announcement / Offer Description *',
                      border: OutlineInputBorder(),
                      hintText: 'Share what is happening at your kitchen...',
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Image Uploader/Preview
                  const Text(
                    'Moment Media (Optional)',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  if (selectedImage == null)
                    InkWell(
                      onTap: () => showImageSourceSheet(setDialogState),
                      child: Container(
                        width: double.infinity,
                        height: 120,
                        decoration: BoxDecoration(
                          color: Colors.grey[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey[300]!, style: BorderStyle.solid),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_photo_alternate_outlined, size: 40, color: Colors.orange[400]),
                            const SizedBox(height: 8),
                            Text(
                              'Upload Image',
                              style: TextStyle(color: Colors.orange[700], fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'JPEG or PNG format',
                              style: TextStyle(color: Colors.grey[500], fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.file(
                            File(selectedImage!.path),
                            width: double.infinity,
                            height: 180,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: 8,
                          right: 8,
                          child: CircleAvatar(
                            backgroundColor: Colors.black.withOpacity(0.6),
                            radius: 16,
                            child: IconButton(
                              icon: const Icon(Icons.close, size: 16, color: Colors.white),
                              onPressed: () {
                                setDialogState(() {
                                  selectedImage = null;
                                });
                              },
                              padding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 16),
                  const Text(
                    'Link a Product to this Post (Optional)',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  // Catalogues Dropdown
                  ref.watch(merchantCataloguesProvider).when(
                    loading: () => const LinearProgressIndicator(),
                    error: (e, _) => Text('Could not load inventory: $e'),
                    data: (catalogues) {
                      if (catalogues.isEmpty) {
                        return const Text('Create a catalogue first to link products');
                      }
                      return Column(
                        children: [
                          DropdownButtonFormField<String>(
                            value: selectedCatalogueId,
                            isExpanded: true,
                            decoration: const InputDecoration(
                              labelText: 'Select Catalogue',
                              border: OutlineInputBorder(),
                            ),
                            items: catalogues
                                .map((cat) => DropdownMenuItem(
                                      value: cat.id,
                                      child: Text(
                                        cat.name,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ))
                                .toList(),
                            onChanged: (val) {
                              setDialogState(() {
                                  selectedCatalogueId = val;
                                  selectedProductId = null; // reset selected product
                              });
                            },
                          ),
                          if (selectedCatalogueId != null) ...[
                            const SizedBox(height: 12),
                            // Products Dropdown
                            ref.watch(merchantProductsProvider(selectedCatalogueId!)).when(
                              loading: () => const CircularProgressIndicator(),
                              error: (e, _) => Text('Error loading products: $e'),
                              data: (products) {
                                if (products.isEmpty) {
                                  return const Text('No products in this catalogue');
                                }
                                return DropdownButtonFormField<String>(
                                  value: selectedProductId,
                                  isExpanded: true,
                                  decoration: const InputDecoration(
                                    labelText: 'Select Product to Link',
                                    border: OutlineInputBorder(),
                                  ),
                                  items: products
                                      .map((prod) => DropdownMenuItem(
                                            value: prod.id,
                                            child: Text(
                                              '${prod.name} (₹${prod.price.toStringAsFixed(0)})',
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ))
                                      .toList(),
                                  onChanged: (val) {
                                    setDialogState(() {
                                      selectedProductId = val;
                                    });
                                  },
                                );
                              },
                            ),
                          ]
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 8),
                  const Row(
                    children: [
                      Icon(Icons.schedule, color: Colors.orange, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Scheduling Options',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // StartsAt picker
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            final dt = await pickDateTime(dialogCtx, startsAt);
                            if (dt != null) {
                              setDialogState(() {
                                startsAt = dt;
                              });
                            }
                          },
                          style: OutlinedButton.styleFrom(
                            alignment: Alignment.centerLeft,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          ),
                          icon: const Icon(Icons.play_arrow, size: 16, color: Colors.green),
                          label: Text(
                            startsAt == null
                                ? 'Publish Immediately'
                                : 'Start: ${_formatDateTimeString(startsAt!.toIso8601String())}',
                            style: const TextStyle(fontSize: 13, color: Colors.black87),
                          ),
                        ),
                      ),
                      if (startsAt != null) ...[
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.clear, color: Colors.red),
                          onPressed: () {
                            setDialogState(() {
                              startsAt = null;
                            });
                          },
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),
                  // ExpiresAt picker
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            final dt = await pickDateTime(dialogCtx, expiresAt);
                            if (dt != null) {
                              setDialogState(() {
                                expiresAt = dt;
                              });
                            }
                          },
                          style: OutlinedButton.styleFrom(
                            alignment: Alignment.centerLeft,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          ),
                          icon: const Icon(Icons.stop, size: 16, color: Colors.red),
                          label: Text(
                            expiresAt == null
                                ? 'Never Expires'
                                : 'Expire: ${_formatDateTimeString(expiresAt!.toIso8601String())}',
                            style: const TextStyle(fontSize: 13, color: Colors.black87),
                          ),
                        ),
                      ),
                      if (expiresAt != null) ...[
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.clear, color: Colors.red),
                          onPressed: () {
                            setDialogState(() {
                              expiresAt = null;
                            });
                          },
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: isPosting
                          ? null
                          : () async {
                              final title = titleController.text.trim();
                              final desc = descController.text.trim();

                              if (title.isEmpty || desc.isEmpty) {
                                ScaffoldMessenger.of(dialogCtx).showSnackBar(
                                  const SnackBar(content: Text('Headline and Description are required')),
                                );
                                return;
                              }

                              if (startsAt != null && expiresAt != null && expiresAt!.isBefore(startsAt!)) {
                                ScaffoldMessenger.of(dialogCtx).showSnackBar(
                                  const SnackBar(content: Text('Expiration time must be after start time')),
                                );
                                return;
                              }

                              setDialogState(() {
                                isPosting = true;
                              });

                              try {
                                String? mediaUrl;
                                if (selectedImage != null) {
                                  final bytes = await selectedImage!.readAsBytes();
                                  final base64String = base64Encode(bytes);
                                  mediaUrl = 'data:image/jpeg;base64,$base64String';
                                }

                                final dio = ref.read(dioProvider);
                                await dio.post('/feeds/merchants/feeds', data: {
                                  'title': title,
                                  'description': desc,
                                  'mediaUrl': mediaUrl,
                                  'actionProductId': selectedProductId,
                                  'startsAt': startsAt?.toUtc().toIso8601String(),
                                  'expiresAt': expiresAt?.toUtc().toIso8601String(),
                                });
                                ref.invalidate(merchantFeedsProvider);
                                if (context.mounted) {
                                  Navigator.pop(sheetCtx); // Close sheet
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Moment posted successfully!')),
                                  );
                                }
                              } catch (e) {
                                setDialogState(() {
                                  isPosting = false;
                                });
                                if (dialogCtx.mounted) {
                                  String errorMsg = 'Error posting moment. Please try again.';
                                  if (e is DioException) {
                                    final statusCode = e.response?.statusCode;
                                    final serverMsg = e.response?.data?['message'] as String?;
                                    if (statusCode == 401 || statusCode == 403) {
                                      errorMsg = serverMsg ?? 'Session expired. Please log out and log back in.';
                                    } else if (serverMsg != null && serverMsg.isNotEmpty) {
                                      errorMsg = serverMsg;
                                    } else if (statusCode != null) {
                                      errorMsg = 'Server error ($statusCode). Please try again.';
                                    }
                                  }
                                  ScaffoldMessenger.of(dialogCtx).showSnackBar(
                                    SnackBar(
                                      content: Text(errorMsg),
                                      backgroundColor: Colors.red[700],
                                      duration: const Duration(seconds: 5),
                                    ),
                                  );
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: isPosting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text('Post Moment', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
}
