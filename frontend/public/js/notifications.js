// Fonctionnalité 10 — Notifications (polling, badge, localStorage)

const POLL_INTERVAL = 30000;
const ARCHIVE_KEY = 'archivedNotifications';

let notifications = [];

function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return `il y a ${diff} seconde${diff > 1 ? 's' : ''}`;
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `il y a ${m} minute${m > 1 ? 's' : ''}`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `il y a ${h} heure${h > 1 ? 's' : ''}`;
  }
  const d = Math.floor(diff / 86400);
  return `il y a ${d} jour${d > 1 ? 's' : ''}`;
}

function getArchivedNotifications() {
  return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]');
}

function archiveToLocalStorage(notificationId) {
  const archived = getArchivedNotifications();
  const notif = notifications.find((n) => n._id === notificationId);
  if (notif && !archived.find((n) => n._id === notificationId)) {
    archived.push({
      ...notif,
      read: true,
      archivedAt: new Date().toISOString(),
    });
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archived));
  }
}

function updateBadge(count) {
  const badge = document.getElementById('notification-badge');
  if (!badge) return;

  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

function renderNotifications(notifs) {
  const container = document.getElementById('notification-list');
  if (!container) return;

  const archived = getArchivedNotifications();
  const allItems = [
    ...notifs,
    ...archived.filter((a) => !notifs.some((n) => n._id === a._id)),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = '';

  if (allItems.length === 0) {
    container.innerHTML = '<p class="muted">Aucune notification</p>';
    return;
  }

  allItems.forEach((notif) => {
    const item = document.createElement('div');
    item.className = `notification-item ${notif.read ? 'read' : 'unread'}`;
    item.innerHTML = `
      <span>${notif.message}</span>
      <small>${timeAgo(notif.createdAt)}</small>
      ${
        !notif.read
          ? `<button type="button" data-id="${notif._id}" class="mark-read-btn">Marquer comme lu</button>`
          : '<em>Lu</em>'
      }
    `;
    container.appendChild(item);
  });

  container.querySelectorAll('.mark-read-btn').forEach((btn) => {
    btn.addEventListener('click', () => markAsRead(btn.dataset.id));
  });
}

async function fetchNotifications() {
  try {
    const response = await axios.get(apiUrl('/api/notifications'));
    const { data, unreadCount } = response.data;

    notifications = data;
    updateBadge(unreadCount ?? notifications.filter((n) => !n.read).length);
    renderNotifications(notifications);
  } catch (err) {
    console.error('Erreur lors du chargement des notifications:', err.message);
  }
}

async function markAsRead(notificationId) {
  try {
    const response = await axios.patch(apiUrl(`/api/notifications/${notificationId}/read`));

    notifications = notifications.map((n) =>
      n._id === notificationId ? { ...n, read: true } : n
    );

    const unreadCount =
      response.data.unreadCount ?? notifications.filter((n) => !n.read).length;
    updateBadge(unreadCount);
    archiveToLocalStorage(notificationId);
    renderNotifications(notifications);
  } catch (err) {
    console.error('Erreur lors du marquage comme lu:', err.message);
  }
}

function toggleNotificationPanel() {
  const panel = document.getElementById('notification-panel');
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  if (isOpen) {
    fetchNotifications();
  }
}

function initNotifications() {
  const bell = document.getElementById('notification-bell');
  if (bell) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotificationPanel();
    });
  }

  document.addEventListener('click', (e) => {
    const panel = document.getElementById('notification-panel');
    const bellEl = document.getElementById('notification-bell');
    if (!panel || !panel.classList.contains('open')) return;
    if (!panel.contains(e.target) && !bellEl?.contains(e.target)) {
      panel.classList.remove('open');
    }
  });

  if (localStorage.getItem('token')) {
    fetchNotifications();
    setInterval(fetchNotifications, POLL_INTERVAL);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNotifications);
} else {
  initNotifications();
}
