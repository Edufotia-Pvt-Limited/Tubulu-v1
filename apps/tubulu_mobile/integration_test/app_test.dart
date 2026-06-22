import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:tubulu_mobile/main.dart' as app;
import 'package:pinput/pinput.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tubulu_mobile/core/theme/app_theme.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  GoogleFonts.config.allowRuntimeFetching = false;
  AppTheme.isTestMode = true;

  // Helper function to wait for a finder to be present on screen
  Future<void> waitFor(WidgetTester tester, Finder finder, {int maxTries = 20}) async {
    int count = 0;
    while (finder.evaluate().isEmpty && count < maxTries) {
      await tester.pump(const Duration(milliseconds: 500));
      count++;
    }
    expect(finder, findsWidgets); // Assert it is present
  }

  group('End-to-End App Test', () {
    testWidgets('Verify app boots, login, add product to cart, place order and verify orders tab', (tester) async {
      // 1. Boot the application
      app.main();
      
      // Wait for splash screen and initial routing redirect
      await tester.pumpAndSettle(const Duration(seconds: 4));

      // 2. We should be on the Login screen. Let's verify we see the welcome text.
      await waitFor(tester, find.text('Welcome to Tubulu'));

      // Find the phone number input field
      final phoneField = find.byType(TextField);
      expect(phoneField, findsOneWidget);

      // Enter our test phone number
      await tester.enterText(phoneField, '8888888888');
      await tester.pumpAndSettle(const Duration(seconds: 1));

      // Tap the Next button
      final nextButton = find.widgetWithText(ElevatedButton, 'Next');
      expect(nextButton, findsOneWidget);
      await tester.tap(nextButton);
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // 3. OTP Verification. Let's check if we are in PIN flow or OTP flow.
      int count = 0;
      while (find.text('Security PIN').evaluate().isEmpty && find.byType(Pinput).evaluate().isEmpty && count < 20) {
        await tester.pump(const Duration(milliseconds: 500));
        count++;
      }

      final isPinFlow = find.text('Security PIN').evaluate().isNotEmpty;
      debugPrint('[TEST] isPinFlow = $isPinFlow');

      if (!isPinFlow) {
        // OTP flow - enter bypass OTP '000000'
        final pinputFinder = find.byType(Pinput);
        expect(pinputFinder, findsOneWidget);
        await tester.enterText(pinputFinder, '000000');
        await tester.pumpAndSettle(const Duration(seconds: 1));

        final verifyButton = find.widgetWithText(ElevatedButton, 'Verify & Login');
        if (verifyButton.evaluate().isNotEmpty) {
          await tester.tap(verifyButton);
          await tester.pumpAndSettle(const Duration(seconds: 3));
        }

        // Now we should be redirected to the PIN Setup screen
        await waitFor(tester, find.text('Setup Security PIN'));
        expect(find.text('Create a 4-digit PIN'), findsOneWidget);

        // Enter PIN '1234'
        final pinSetupFinder = find.byKey(const ValueKey('setup_pin_input'));
        expect(pinSetupFinder, findsOneWidget);
        await tester.enterText(pinSetupFinder, '1234');
        
        // Wait for it to change to the Confirm PIN step
        await waitFor(tester, find.text('Confirm your PIN'));

        // Now confirm the PIN '1234'
        final pinConfirmFinder = find.byKey(const ValueKey('confirm_pin_input'));
        expect(pinConfirmFinder, findsOneWidget);
        await tester.enterText(pinConfirmFinder, '1234');
        await tester.pumpAndSettle(const Duration(seconds: 4));
      } else {
        // PIN flow - enter security PIN '1234'
        final pinputFinder = find.byType(Pinput);
        expect(pinputFinder, findsOneWidget);
        await tester.enterText(pinputFinder, '1234');
        await tester.pumpAndSettle(const Duration(seconds: 1));

        final loginButton = find.widgetWithText(ElevatedButton, 'Login');
        if (loginButton.evaluate().isNotEmpty) {
          await tester.tap(loginButton);
          await tester.pumpAndSettle(const Duration(seconds: 4));
        }
      }

      // 4. We should now be logged in and on the Customer Home page.
      await waitFor(tester, find.text('Nearby Shops'));
      expect(find.text('Tubulu'), findsWidgets);

      // Handle Contacts Permission Dialog if it appears
      final notNowFinder = find.text('Not Now');
      if (notNowFinder.evaluate().isNotEmpty) {
        debugPrint('[TEST] Contacts permission dialog detected. Dismissing...');
        await tester.tap(notNowFinder);
        await tester.pumpAndSettle(const Duration(seconds: 2));
      }

      // 5. Select a Merchant
      // We seeded "Test Coffee Shop" (from seedMerchant.js) and 5 grocery stores.
      // Let's look for "Test Coffee Shop".
      final merchantCard = find.text('Test Coffee Shop');
      expect(merchantCard, findsOneWidget);
      await tester.tap(merchantCard);
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // 6. Catalogue Page
      // We should be on the Catalogue screen for Test Coffee Shop.
      await waitFor(tester, find.text('Espresso'));
      expect(find.text('Test Coffee Shop'), findsWidgets);

      // Add "Espresso" to cart by tapping the Add button
      final espressoCard = find.ancestor(
        of: find.text('Espresso'),
        matching: find.byType(Card),
      );
      final addButton = find.descendant(
        of: espressoCard,
        matching: find.widgetWithText(ElevatedButton, 'Add'),
      );
      expect(addButton, findsOneWidget);
      await tester.tap(addButton);
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // 7. Go back to Home Screen
      final backButton = find.byIcon(Icons.arrow_back_ios_new_rounded);
      expect(backButton, findsOneWidget);
      await tester.tap(backButton);
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Now we are back on Home screen. Tap the shopping cart icon in the AppBar.
      final cartIcon = find.byIcon(Icons.shopping_cart_outlined);
      expect(cartIcon, findsOneWidget);
      await tester.tap(cartIcon);
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // 8. Cart Screen
      // Verify we are on My Cart screen and Espresso is in the cart.
      await waitFor(tester, find.text('My Cart'));
      expect(find.text('Espresso'), findsOneWidget);

      // Tap Proceed to Checkout button
      final checkoutButton = find.widgetWithText(ElevatedButton, 'Proceed to Checkout');
      expect(checkoutButton, findsOneWidget);
      await tester.tap(checkoutButton);
      await tester.pumpAndSettle(const Duration(seconds: 4));

      // 9. Success Modal
      // Verify the Success Dialog shows up.
      await waitFor(tester, find.text('Order Placed!'));
      final doneButton = find.widgetWithText(ElevatedButton, 'Done');
      expect(doneButton, findsOneWidget);
      await tester.tap(doneButton);
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // 10. Orders Screen
      // The Success Dialog redirects back to Home on tapping Done.
      // Now tap the Orders tab on the bottom navigation bar.
      final ordersTab = find.byIcon(Icons.receipt_long_outlined);
      if (ordersTab.evaluate().isEmpty) {
        final ordersTab2 = find.byIcon(Icons.receipt_long);
        expect(ordersTab2, findsOneWidget);
        await tester.tap(ordersTab2);
      } else {
        await tester.tap(ordersTab);
      }
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify that the order for Test Coffee Shop is present in the orders list.
      await waitFor(tester, find.text('Test Coffee Shop'));
      debugPrint('[TEST] End-to-End Test completed successfully!');
    });
  });
}
