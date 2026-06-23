import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_provider.dart';

class MobileSubmissionsScreen extends ConsumerStatefulWidget {
  const MobileSubmissionsScreen({super.key});

  @override
  ConsumerState<MobileSubmissionsScreen> createState() => _MobileSubmissionsScreenState();
}

class _MobileSubmissionsScreenState extends ConsumerState<MobileSubmissionsScreen> {
  bool _isLoading = true;
  List<dynamic> _submissions = [];

  @override
  void initState() {
    super.initState();
    _fetchSubmissions();
  }

  Future<void> _fetchSubmissions() async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/enabler/my-submissions');
      if (response.data['success'] == true) {
        setState(() {
          _submissions = response.data['data'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return Colors.green;
      case 'rejected':
        return Colors.red;
      case 'submitted':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Submissions'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchSubmissions,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _submissions.isEmpty
                ? ListView(
                    children: [
                      SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                      const Center(
                        child: Column(
                          children: [
                            Icon(Icons.assignment_late_outlined, size: 60, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              'No submissions found.',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ],
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _submissions.length,
                    itemBuilder: (context, index) {
                      final item = _submissions[index];
                      final merchant = item['merchant'] ?? {};
                      final status = item['status'] ?? 'submitted';
                      final city = item['city']?['name'] ?? 'Mysuru';
                      
                      String dateStr = '';
                      if (item['submittedAt'] != null) {
                        try {
                          final date = DateTime.parse(item['submittedAt']);
                          dateStr = DateFormat('dd MMM yyyy, hh:mm a').format(date);
                        } catch (_) {}
                      }

                      return Card(
                        elevation: 1,
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(
                          side: BorderSide(color: Colors.grey[200]!),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      merchant['integrationName'] ?? 'Unknown Store',
                                      style: theme.textTheme.titleMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(status).withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      status.toString().toUpperCase(),
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: _getStatusColor(status),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Icon(Icons.category, size: 14, color: Colors.grey[600]),
                                  const SizedBox(width: 6),
                                  Text(
                                    merchant['verticalType'] ?? 'Retail',
                                    style: TextStyle(color: Colors.grey[700], fontSize: 13),
                                  ),
                                  const SizedBox(width: 16),
                                  Icon(Icons.location_on, size: 14, color: Colors.grey[600]),
                                  const SizedBox(width: 6),
                                  Text(
                                    city,
                                    style: TextStyle(color: Colors.grey[700], fontSize: 13),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.phone, size: 14, color: Colors.grey[600]),
                                  const SizedBox(width: 6),
                                  Text(
                                    merchant['phoneNumber'] ?? 'N/A',
                                    style: TextStyle(color: Colors.grey[700], fontSize: 13),
                                  ),
                                ],
                              ),
                              if (dateStr.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text(
                                  'Submitted: $dateStr',
                                  style: TextStyle(color: Colors.grey[500], fontSize: 12),
                                ),
                              ],
                              if (status.toLowerCase() == 'rejected' && item['rejectionReason'] != null) ...[
                                const SizedBox(height: 12),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.red[50],
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: Colors.red[100]!),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Rejection Reason:',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.red,
                                          fontSize: 12,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        item['rejectionReason'],
                                        style: TextStyle(
                                          color: Colors.red[900],
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
