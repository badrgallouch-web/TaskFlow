// ============================================================
// notifications.js — Fonctionnalité 10
// Polling + Badge + LocalStorage
// ============================================================

const API_URL = 'http://localhost:3000/api/notifications';
const POLL_INTERVAL = 30000; // 30 secondes

// Tableau en mémoire des notifications actives (non lues)
let notifications = [];

// ── 1. Récupérer les notifications depuis le serveur ─────────
async function fetchNotifications() {
    try {
        const response = await axios.get(API_URL);
        const { data, unreadCount } = response.data;

        // Mise à jour du tableau en mémoire
        notifications = data;

        // Mise à jour du badge
        updateBadge(unreadCount);

        // Affichage dans l'interface
        renderNotifications(notifications);

    } catch (err) {
        console.error('Erreur lors du chargement des notifications:', err.message);
    }
}

// ── 2. Marquer une notification comme lue ────────────────────
async function markAsRead(notificationId) {
    try {
        await axios.patch(`${API_URL}/${notificationId}/read`);

        // Mise à jour locale sans recharger la page
        notifications = notifications.map(n =>
            n._id === notificationId ? { ...n, isRead: true } : n
        );

        // Recalcule le badge en temps réel
        const unreadCount = notifications.filter(n => !n.isRead).length;
        updateBadge(unreadCount);

        // Archive dans localStorage
        archiveToLocalStorage(notificationId);

        // Rafraîchit l'affichage
        renderNotifications(notifications);

    } catch (err) {
        console.error('Erreur lors du marquage comme lu:', err.message);
    }
}

// ── 3. Mettre à jour le badge de la cloche ───────────────────
function updateBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// ── 4. Afficher les notifications dans l'interface ───────────
function renderNotifications(notifs) {
    const container = document.getElementById('notification-list');
    if (!container) return;

    container.innerHTML = '';

    if (notifs.length === 0) {
        container.innerHTML = '<p>Aucune notification</p>';
        return;
    }

    notifs.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item ${notif.isRead ? 'read' : 'unread'}`;
        item.innerHTML = `
            <span>${notif.message}</span>
            <small>${timeAgo(notif.createdAt)}</small>
            ${!notif.isRead
                ? `<button onclick="markAsRead('${notif._id}')">Marquer comme lu</button>`
                : '<em>Lu</em>'
            }
        `;
        container.appendChild(item);
    });
}

// ── 5. Archivage des notifications lues dans localStorage ────
function archiveToLocalStorage(notificationId) {
    const archived = JSON.parse(localStorage.getItem('archivedNotifications') || '[]');

    // Trouve la notification dans le tableau mémoire
    const notif = notifications.find(n => n._id === notificationId);
    if (notif && !archived.find(n => n._id === notificationId)) {
        archived.push({ ...notif, isRead: true, archivedAt: new Date().toISOString() });
        localStorage.setItem('archivedNotifications', JSON.stringify(archived));
    }
}

// ── 6. Afficher les notifications archivées (optionnel) ──────
function getArchivedNotifications() {
    return JSON.parse(localStorage.getItem('archivedNotifications') || '[]');
}

// ── 7. Utilitaire : affichage relatif du temps ───────────────
function timeAgo(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (diff < 60) return `il y a ${diff} secondes`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} minutes`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} heures`;
    return `il y a ${Math.floor(diff / 86400)} jours`;
}

// ── 8. Démarrage : premier appel + polling toutes les 30s ────
fetchNotifications();
setInterval(fetchNotifications, POLL_INTERVAL);