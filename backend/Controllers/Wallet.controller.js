const { Wallet, LoyaltyTransaction } = require('../Utils/Postgres');

// Helper to get or create wallet
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) {
    const referralCode = 'TUB' + Math.random().toString(36).substring(2, 8).toUpperCase();
    wallet = await Wallet.create({
      userId,
      points: 0,
      cashBalance: 0.00,
      referralCode,
    });
  }
  return wallet;
};

const getWallet = async (req, res, next) => {
  try {
    const userId = req.id;
    const wallet = await getOrCreateWallet(userId);
    
    const transactions = await LoyaltyTransaction.findAll({
      where: { walletId: wallet.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.status(200).json({
      success: true,
      data: {
        id: wallet.id,
        points: wallet.points,
        cashBalance: wallet.cashBalance,
        referralCode: wallet.referralCode,
        transactions,
      }
    });
  } catch (error) {
    next(error);
  }
};

const redeemPoints = async (req, res, next) => {
  try {
    const userId = req.id;
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid points value' });
    }

    const wallet = await getOrCreateWallet(userId);
    if (wallet.points < points) {
      return res.status(400).json({ success: false, message: 'Insufficient points balance' });
    }

    // Conversion rate: 10 points = 1 INR
    const cashValue = parseFloat((points / 10).toFixed(2));

    wallet.points -= parseInt(points);
    wallet.cashBalance = parseFloat((parseFloat(wallet.cashBalance) + cashValue).toFixed(2));
    await wallet.save();

    await LoyaltyTransaction.create({
      walletId: wallet.id,
      type: 'redeem',
      points: -parseInt(points),
      description: `Redeemed ${points} points for ₹${cashValue} cashback`,
    });

    res.status(200).json({
      success: true,
      message: `Successfully redeemed ${points} points for ₹${cashValue}`,
      data: {
        points: wallet.points,
        cashBalance: wallet.cashBalance,
      }
    });
  } catch (error) {
    next(error);
  }
};

const getReferralCode = async (req, res, next) => {
  try {
    const userId = req.id;
    const wallet = await getOrCreateWallet(userId);
    res.status(200).json({
      success: true,
      referralCode: wallet.referralCode,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWallet,
  redeemPoints,
  getReferralCode,
  getOrCreateWallet,
};
