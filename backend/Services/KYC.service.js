const { Integration } = require('../Utils/Postgres');

/**
 * Mocks GST Verification API call.
 * In production, this would call a service like Karza, Razorpay, or Signzy.
 */
async function verifyGST(gstNumber) {
  if (!gstNumber) return false;
  // Mock logic: Valid GSTs in India follow a specific pattern
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const isValid = gstRegex.test(gstNumber);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return isValid;
}

/**
 * Mocks PAN Verification API call.
 */
async function verifyPAN(panNumber) {
  if (!panNumber) return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const isValid = panRegex.test(panNumber);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return isValid;
}

/**
 * Mocks Aadhaar Verification API call.
 */
async function verifyAadhar(aadharNumber) {
  if (!aadharNumber) return false;
  const aadharRegex = /^[0-9]{12}$/;
  const isValid = aadharRegex.test(aadharNumber.replace(/\s/g, ''));
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return isValid;
}

/**
 * Calculates and updates the trust score for a merchant.
 */
async function updateTrustScore(integrationId) {
  try {
    const merchant = await Integration.findByPk(integrationId);
    if (!merchant) return 0;

    let score = 0;

    // 1. Basic Identity (+20)
    if (merchant.phoneNumber) score += 10;
    if (merchant.integrationName && merchant.integrationName !== 'Pending Onboarding') score += 10;

    // 2. Profile Quality (+10)
    if (merchant.logo) score += 10;

    // 3. GST Verification (+30)
    if (merchant.gstNumber) {
      score += 10;
      if (merchant.isGstVerified) score += 20;
    }

    // 4. PAN Verification (+20)
    if (merchant.panNumber) {
      score += 10;
      if (merchant.isPanVerified) score += 10;
    }

    // 5. Aadhaar/Identity (+20)
    if (merchant.aadharNumber) {
      score += 10;
      if (merchant.isAadharVerified) score += 10;
    }

    // Cap at 100
    score = Math.min(score, 100);

    await merchant.update({ trustScore: score });
    console.log(`[TRUST ENGINE] Updated score for ${merchant.integrationName}: ${score}`);
    
    return score;
  } catch (error) {
    console.error('[TRUST ENGINE] Error updating score:', error);
    return 0;
  }
}

/**
 * Runs full automated KYC pipeline.
 */
async function runAutomatedKYC(integrationId) {
  try {
    const merchant = await Integration.findByPk(integrationId);
    if (!merchant) return;

    console.log(`[KYC PIPELINE] Starting for: ${merchant.integrationName}`);

    const updates = {};

    if (merchant.gstNumber && !merchant.isGstVerified) {
      updates.isGstVerified = await verifyGST(merchant.gstNumber);
    }

    if (merchant.panNumber && !merchant.isPanVerified) {
      updates.isPanVerified = await verifyPAN(merchant.panNumber);
    }

    if (merchant.aadharNumber && !merchant.isAadharVerified) {
      updates.isAadharVerified = await verifyAadhar(merchant.aadharNumber);
    }

    // Auto-approve if Trust Score hits a threshold (e.g., 70)
    // and they have verified GST/PAN
    await merchant.update(updates);
    const finalScore = await updateTrustScore(integrationId);

    // Re-read from DB to get the saved verification state
    const updatedMerchant = await Integration.findByPk(integrationId);

    // Check if we have all four documents: GST, PAN, Aadhaar, Shop license
    const hasAllNumbers = 
      !!updatedMerchant.gstNumber && 
      !!updatedMerchant.panNumber && 
      !!updatedMerchant.aadharNumber && 
      !!updatedMerchant.shopEstablishmentNumber;

    const documentsList = updatedMerchant.documents || [];
    const hasGstDoc = documentsList.some(d => d.type === 'GST');
    const hasPanDoc = documentsList.some(d => d.type === 'PAN');
    const hasAadharDoc = documentsList.some(d => ['AADHAAR', 'AADHAR', 'Aadhar', 'Aadhaar'].includes(d.type));
    const hasShopDoc = documentsList.some(d => ['SHOP_ACT', 'shopEstablishment', 'shop', 'license', 'Shop Establishment'].includes(d.type));
    
    const hasAllDocsInArray = hasGstDoc && hasPanDoc && hasAadharDoc && hasShopDoc;

    if (hasAllNumbers || hasAllDocsInArray || (finalScore >= 70 && updatedMerchant.isGstVerified)) {
      await updatedMerchant.update({ 
        isApproved: true,
        isOnboarded: true,
        isDocumentsUploaded: true,
        isTubuluAppSetupDone: true
      });
      console.log(`[KYC PIPELINE] AUTO-APPROVED & ONBOARDED: ${updatedMerchant.integrationName}`);
    }

    return { score: finalScore, updates };
  } catch (error) {
    console.error('[KYC PIPELINE] Error running pipeline:', error);
  }
}

module.exports = {
  verifyGST,
  verifyPAN,
  verifyAadhar,
  updateTrustScore,
  runAutomatedKYC
};
