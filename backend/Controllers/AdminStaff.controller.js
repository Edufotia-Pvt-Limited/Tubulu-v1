const { Integration, AdminStaff, AuditLog } = require('../Utils/Postgres');

const createStaffAccount = async (req, res, next) => {
  try {
    const isSuperAdmin = req.role === 'super_admin' || req.role === 'SuperAdmin';
    
    if (isSuperAdmin) {
      // Global Ops staff creation (legacy/super admin flow)
      const { name, phoneNumber, email, role, assignedCity, commissionRate } = req.body;

      if (!['ops_admin', 'onboarding_specialist', 'content_moderator', 'finance_admin', 'regional_partner'].includes(role)) {
        return res.status(400).json({ message: 'Invalid staff role' });
      }

      const existing = await Integration.findOne({ where: { phoneNumber } });
      if (existing) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }

      const { generateUUID } = require('../Utils/Helper');
      const staff = await Integration.create({
        integrationName: name,
        phoneNumber,
        email,
        role,
        isApproved: true,
        isOnboarded: true,
        isActive: true,
        apiAuthKey: generateUUID(),
        ...(role === 'regional_partner' && {
          assignedCity: assignedCity || null,
          commissionRate: parseFloat(commissionRate) || 0
        })
      });

      return res.status(201).json({
        message: 'Global staff account created successfully',
        data: staff
      });
    } else {
      // Merchant-level AdminStaff creation
      const { name, email, role, permissions } = req.body;
      const integrationId = req.id; // From verifyIntegrationToken

      if (!['manager', 'cashier', 'support', 'delivery'].includes(role)) {
        return res.status(400).json({ message: 'Invalid store staff role' });
      }

      const staff = await AdminStaff.create({
        integrationId,
        name,
        email,
        role,
        permissions: permissions || { canManageOrders: true, canManageProducts: false },
        isActive: true,
      });

      // Audit Log
      await AuditLog.create({
        staffId: req.id, // Current user / merchant id
        integrationId,
        action: 'create_staff',
        metadata: { staffId: staff.id, name, role }
      });

      res.status(201).json({
        message: 'Store staff account created successfully',
        data: staff
      });
    }
  } catch (error) {
    next(error);
  }
};

const getAllStaff = async (req, res, next) => {
  try {
    const isSuperAdmin = req.role === 'super_admin' || req.role === 'SuperAdmin';

    if (isSuperAdmin) {
      const staff = await Integration.findAll({
        where: {
          role: ['ops_admin', 'onboarding_specialist', 'content_moderator', 'finance_admin', 'regional_partner']
        },
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json({ data: staff });
    } else {
      const integrationId = req.id;
      const staff = await AdminStaff.findAll({
        where: { integrationId },
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json({ data: staff });
    }
  } catch (error) {
    next(error);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isSuperAdmin = req.role === 'super_admin' || req.role === 'SuperAdmin';

    if (isSuperAdmin) {
      await Integration.destroy({ where: { id } });
      return res.status(200).json({ message: 'Global staff account deleted successfully' });
    } else {
      const integrationId = req.id;
      const staff = await AdminStaff.findOne({ where: { id, integrationId } });
      if (!staff) {
        return res.status(404).json({ message: 'Staff account not found' });
      }
      await staff.destroy();

      // Audit Log
      await AuditLog.create({
        staffId: req.id,
        integrationId,
        action: 'delete_staff',
        metadata: { staffId: id, name: staff.name }
      });

      res.status(200).json({ message: 'Store staff account deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};

const getActivityLog = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const integrationId = req.id;

    const logs = await AuditLog.findAll({
      where: { staffId, integrationId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ data: logs });
  } catch (error) {
    next(error);
  }
};

const toggleStaffAccount = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const integrationId = req.id;

    const staff = await AdminStaff.findOne({ where: { id: staffId, integrationId } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staff.isActive = !staff.isActive;
    await staff.save();

    await AuditLog.create({
      staffId: req.id,
      integrationId,
      action: 'toggle_staff_status',
      metadata: { staffId, name: staff.name, isActive: staff.isActive }
    });

    res.status(200).json({ message: 'Staff status toggled successfully', data: staff });
  } catch (error) {
    next(error);
  }
};

const assignDelegate = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const { delegateStaffId } = req.body;
    const integrationId = req.id;

    const staff = await AdminStaff.findOne({ where: { id: staffId, integrationId } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staff.delegatedToStaffId = delegateStaffId || null;
    await staff.save();

    await AuditLog.create({
      staffId: req.id,
      integrationId,
      action: 'delegate_staff',
      metadata: { staffId, name: staff.name, delegatedToStaffId: delegateStaffId }
    });

    res.status(200).json({ message: 'Staff delegated successfully', data: staff });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStaffAccount,
  getAllStaff,
  deleteStaff,
  getActivityLog,
  toggleStaffAccount,
  assignDelegate,
};
