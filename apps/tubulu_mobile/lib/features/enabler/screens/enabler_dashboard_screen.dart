import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_provider.dart';
import '../../../core/auth/auth_provider.dart';

class EnablerDashboardScreen extends ConsumerStatefulWidget {
  const EnablerDashboardScreen({super.key});

  @override
  ConsumerState<EnablerDashboardScreen> createState() => _EnablerDashboardScreenState();
}

class _EnablerDashboardScreenState extends ConsumerState<EnablerDashboardScreen> {
  bool _isLoading = true;
  int _submitted = 0;
  int _approved = 0;
  int _rejected = 0;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/enabler/my-stats');
      if (response.data['success'] == true) {
        final stats = response.data['data'] ?? {};
        setState(() {
          _submitted = stats['totalSubmitted'] ?? 0;
          _approved = stats['totalApproved'] ?? 0;
          _rejected = stats['totalRejected'] ?? 0;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final theme = Theme.of(context);
    final pending = (_submitted - _approved - _rejected).clamp(0, 999999);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Enabler Dashboard'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchStats,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Header Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Colors.indigo, Colors.indigoAccent],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.indigo.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome Back 👋',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: Colors.white70,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${authState.firstName ?? 'Field'} ${authState.lastName ?? 'Executive'}',
                      style: theme.textTheme.headlineSmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Onboard local merchants to Tubulu and capture key KYC/GPS scopes.',
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              Text(
                'Your Onboarding Performance',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              if (_isLoading)
                const Center(child: Padding(
                  padding: EdgeInsets.all(24.0),
                  child: CircularProgressIndicator(),
                ))
              else
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.3,
                  children: [
                    _buildStatCard('Total Submissions', _submitted, Colors.indigo, Icons.upload_file),
                    _buildStatCard('Approved Stores', _approved, Colors.green, Icons.verified_user),
                    _buildStatCard('Rejected Submissions', _rejected, Colors.red, Icons.cancel_presentation),
                    _buildStatCard('Pending Review', pending, Colors.orange, Icons.hourglass_empty),
                  ],
                ),

              const SizedBox(height: 32),

              Text(
                'Quick Actions',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: _buildActionButton(
                      context,
                      'Onboard Merchant',
                      Icons.add_business,
                      Colors.indigo,
                      () => context.go('/enabler/onboard'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildActionButton(
                      context,
                      'My Submissions',
                      Icons.view_list,
                      Colors.grey[800]!,
                      () => context.go('/enabler/submissions'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, int count, Color color, IconData icon) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: color, size: 24),
                Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
            Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(
    BuildContext context,
    String label,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return ElevatedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, color: Colors.white),
      label: Text(label, style: const TextStyle(color: Colors.white)),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
