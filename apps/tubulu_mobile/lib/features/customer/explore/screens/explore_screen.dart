import 'package:flutter/material.dart';

class ExploreScreen extends StatelessWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Explore', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF2355C4),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.dashboard_customize_outlined, size: 100, color: Colors.grey.shade300),
            const SizedBox(height: 24),
            const Text(
              'Explore Feature Coming Soon',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                'Discover new stores, exclusive collections and trending products personalized just for you!',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
