jest.mock('../models/Notification');

const Notification = require('../models/Notification');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} = require('../controllers/notificationController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('notificationController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    test('returns notifications sorted by newest first with unread count', async () => {
      const req = { user: { _id: 'user1' } };
      const res = createMockRes();
      const notifications = [{ _id: 'n1' }, { _id: 'n2' }];
      const sortMock = jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(notifications) });
      Notification.find.mockReturnValue({ sort: sortMock });
      Notification.countDocuments.mockResolvedValue(2);

      await getNotifications(req, res);

      expect(Notification.find).toHaveBeenCalledWith({ user: 'user1' });
      expect(Notification.countDocuments).toHaveBeenCalledWith({ user: 'user1', read: false });
      expect(res.json).toHaveBeenCalledWith({ notifications, unreadCount: 2 });
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { _id: 'user1' } };
      const res = createMockRes();
      Notification.find.mockImplementation(() => {
        throw new Error('db down');
      });

      await getNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('markAsRead', () => {
    test('marks a notification as read and returns it', async () => {
      const req = { params: { id: 'n1' }, user: { _id: 'user1' } };
      const res = createMockRes();
      const updated = { _id: 'n1', read: true };
      Notification.findOneAndUpdate.mockResolvedValue(updated);

      await markAsRead(req, res);

      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'n1', user: 'user1' },
        { read: true },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    test('returns 404 when the notification does not belong to the user or does not exist', async () => {
      const req = { params: { id: 'missing' }, user: { _id: 'user1' } };
      const res = createMockRes();
      Notification.findOneAndUpdate.mockResolvedValue(null);

      await markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
    });
  });

  describe('markAllAsRead', () => {
    test('marks all notifications as read for the user', async () => {
      const req = { user: { _id: 'user1' } };
      const res = createMockRes();
      Notification.markAllRead.mockResolvedValue({ acknowledged: true });

      await markAllAsRead(req, res);

      expect(Notification.markAllRead).toHaveBeenCalledWith('user1');
      expect(res.json).toHaveBeenCalledWith({ message: 'All notifications marked as read' });
    });
  });

  describe('deleteNotification', () => {
    test('deletes a notification belonging to the user', async () => {
      const req = { params: { id: 'n1' }, user: { _id: 'user1' } };
      const res = createMockRes();
      Notification.findOneAndDelete.mockResolvedValue({ _id: 'n1' });

      await deleteNotification(req, res);

      expect(Notification.findOneAndDelete).toHaveBeenCalledWith({ _id: 'n1', user: 'user1' });
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification deleted' });
    });

    test('returns 404 when trying to delete a notification that does not exist', async () => {
      const req = { params: { id: 'missing' }, user: { _id: 'user1' } };
      const res = createMockRes();
      Notification.findOneAndDelete.mockResolvedValue(null);

      await deleteNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('clearReadNotifications', () => {
    test('deletes all read notifications and reports the count', async () => {
      const req = { user: { _id: 'user1' } };
      const res = createMockRes();
      Notification.deleteMany.mockResolvedValue({ deletedCount: 3 });

      await clearReadNotifications(req, res);

      expect(Notification.deleteMany).toHaveBeenCalledWith({ user: 'user1', read: true });
      expect(res.json).toHaveBeenCalledWith({ message: '3 read notification(s) cleared' });
    });
  });
});
