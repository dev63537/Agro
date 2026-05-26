const ActivityLog = require('../models/ActivityLog');

// GET /api/notifications — fetch recent 30 notifications for this shop
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await ActivityLog.find({ shopId: req.shop._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await ActivityLog.countDocuments({
      shopId: req.shop._id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notifications/read-all — mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await ActivityLog.updateMany(
      { shopId: req.shop._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notifications/:id/read — mark one as read
exports.markOneRead = async (req, res) => {
  try {
    await ActivityLog.findOneAndUpdate(
      { _id: req.params.id, shopId: req.shop._id },
      { $set: { read: true } }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
