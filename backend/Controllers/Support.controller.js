const { SupportTicket } = require('../Utils/Postgres');
const { sendOrderUpdate, sendUserOrderUpdate } = require('../Utils/sseConnection');

const createTicket = async (req, res, next) => {
  try {
    const { orderId, subject, category, description, attachments, priority } = req.body;
    const userId = req.id;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    const ticket = await SupportTicket.create({
      userId,
      orderId: orderId || null,
      subject,
      category: category || 'General',
      description,
      priority: priority || 'medium',
      attachments: attachments || [],
      replies: [],
    });

    const { Order } = require('../Utils/Postgres');
    let integrationId = null;
    if (ticket.orderId) {
      try {
        const order = await Order.findByPk(ticket.orderId);
        if (order) {
          integrationId = order.integrationId;
        }
      } catch (err) {
        console.error('Error fetching order for ticket creation SSE:', err);
      }
    }

    sendOrderUpdate({
      type: 'SUPPORT_TICKET_UPDATE',
      action: 'create',
      ticket,
      integrationId,
      orderId: ticket.orderId
    });

    sendUserOrderUpdate(ticket.userId, {
      type: 'SUPPORT_TICKET_UPDATE',
      action: 'create',
      ticketId: ticket.id,
      ticket
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

const listUserTickets = async (req, res, next) => {
  try {
    const userId = req.id;
    const tickets = await SupportTicket.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

const getTicketDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Verify ownership or check if staff
    const isStaff = req.role && req.role !== 'User' && req.role !== 'customer';
    if (ticket.userId !== req.id && !isStaff) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (isStaff) {
      const { Order } = require('../Utils/Postgres');
      if (req.role === 'city_manager' || req.role === 'regional_manager' || req.role === 'state_manager') {
        if (ticket.orderId !== null) {
          return res.status(403).json({ success: false, message: 'Forbidden - Managers only handle app related issues' });
        }
      } else if (req.role === 'merchant_admin' || req.role === 'merchant') {
        if (ticket.orderId === null) {
          return res.status(403).json({ success: false, message: 'Forbidden - Vendors only handle order support issues' });
        }
        const order = await Order.findByPk(ticket.orderId);
        if (!order || order.integrationId !== req.id) {
          return res.status(403).json({ success: false, message: 'Forbidden - Order does not belong to this merchant' });
        }
      }
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const replyTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const isStaff = req.role && req.role !== 'User' && req.role !== 'customer';
    if (ticket.userId !== req.id && !isStaff) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (isStaff) {
      const { Order } = require('../Utils/Postgres');
      if (req.role === 'city_manager' || req.role === 'regional_manager' || req.role === 'state_manager') {
        if (ticket.orderId !== null) {
          return res.status(403).json({ success: false, message: 'Forbidden - Managers only handle app related issues' });
        }
      } else if (req.role === 'merchant_admin' || req.role === 'merchant') {
        if (ticket.orderId === null) {
          return res.status(403).json({ success: false, message: 'Forbidden - Vendors only handle order support issues' });
        }
        const order = await Order.findByPk(ticket.orderId);
        if (!order || order.integrationId !== req.id) {
          return res.status(403).json({ success: false, message: 'Forbidden - Order does not belong to this merchant' });
        }
      }
    }

    const sender = isStaff ? 'staff' : 'user';

    const newReply = {
      sender,
      message,
      timestamp: new Date()
    };

    const currentReplies = ticket.replies || [];
    ticket.replies = [...currentReplies, newReply];
    await ticket.save();

    const { Order } = require('../Utils/Postgres');
    let integrationId = null;
    if (ticket.orderId) {
      try {
        const order = await Order.findByPk(ticket.orderId);
        if (order) {
          integrationId = order.integrationId;
        }
      } catch (err) {
        console.error('Error fetching order for ticket reply SSE:', err);
      }
    }

    sendOrderUpdate({
      type: 'SUPPORT_TICKET_UPDATE',
      action: 'reply',
      ticket,
      integrationId,
      orderId: ticket.orderId
    });

    sendUserOrderUpdate(ticket.userId, {
      type: 'SUPPORT_TICKET_UPDATE',
      action: 'reply',
      ticketId: ticket.id,
      ticket
    });

    res.status(200).json({ success: true, message: 'Reply added successfully', data: ticket });
  } catch (error) {
    next(error);
  }
};

const closeTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = 'closed';
    ticket.resolvedAt = new Date();
    await ticket.save();

    const { Order } = require('../Utils/Postgres');
    let integrationId = null;
    if (ticket.orderId) {
      try {
        const order = await Order.findByPk(ticket.orderId);
        if (order) {
          integrationId = order.integrationId;
        }
      } catch (err) {
        console.error('Error fetching order for ticket close SSE:', err);
      }
    }

    sendOrderUpdate({
      type: 'SUPPORT_TICKET_UPDATE',
      action: 'close',
      ticket,
      integrationId,
      orderId: ticket.orderId
    });

    sendUserOrderUpdate(ticket.userId, {
      type: 'SUPPORT_TICKET_UPDATE',
      action: 'close',
      ticketId: ticket.id,
      ticket
    });

    res.status(200).json({ success: true, message: 'Ticket closed successfully', data: ticket });
  } catch (error) {
    next(error);
  }
};

const listAllTickets = async (req, res, next) => {
  try {
    const role = req.role;
    const integrationId = req.id;

    let tickets;
    if (role === 'city_manager' || role === 'regional_manager' || role === 'state_manager') {
      // App related issues (orderId is null)
      tickets = await SupportTicket.findAll({
        where: { orderId: null },
        order: [['createdAt', 'DESC']]
      });
    } else if (role === 'merchant_admin' || role === 'merchant') {
      // Order support tickets for this merchant
      const { Order } = require('../Utils/Postgres');
      tickets = await SupportTicket.findAll({
        include: [{
          model: Order,
          required: true,
          where: { integrationId: integrationId }
        }],
        order: [['createdAt', 'DESC']]
      });
    } else {
      // SuperAdmin or fallback: see all
      tickets = await SupportTicket.findAll({
        order: [['createdAt', 'DESC']]
      });
    }

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = new Date();
    }
    await ticket.save();

    const { Order } = require('../Utils/Postgres');
    let integrationId = null;
    if (ticket.orderId) {
      try {
        const order = await Order.findByPk(ticket.orderId);
        if (order) {
          integrationId = order.integrationId;
        }
      } catch (err) {
        console.error('Error fetching order for ticket status update SSE:', err);
      }
    }

    sendOrderUpdate({
      type: 'SUPPORT_TICKET_UPDATE',
      action: 'update',
      ticket,
      integrationId,
      orderId: ticket.orderId
    });

    sendUserOrderUpdate(ticket.userId, {
      type: 'SUPPORT_TICKET_UPDATE',
      action: 'update',
      ticketId: ticket.id,
      ticket
    });

    res.status(200).json({ success: true, message: 'Ticket updated successfully', data: ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  listUserTickets,
  getTicketDetails,
  replyTicket,
  closeTicket,
  listAllTickets,
  updateTicketStatus,
};
