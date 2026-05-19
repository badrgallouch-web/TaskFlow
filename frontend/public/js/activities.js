// Fonctionnalité 9 — Fil d'activité du projet

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

async function loadProjectActivities(projectId) {
  const container = document.getElementById('activity-feed');
  if (!container || !projectId) return;

  container.innerHTML = '<p class="muted">Chargement de l\'historique…</p>';

  try {
    const response = await axios.get(apiUrl(`/api/projects/${projectId}/activities`));
    const activities = response.data.data || [];

    if (activities.length === 0) {
      container.innerHTML = '<p class="muted">Aucune activité pour ce projet.</p>';
      return;
    }

    container.innerHTML = '';
    activities.forEach((activity) => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      item.innerHTML = `
        <p class="activity-message">${activity.message}</p>
        <small class="activity-time">${timeAgo(activity.createdAt)}</small>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = '<p class="muted">Impossible de charger l\'historique.</p>';
    console.error('Activity feed error:', err.message);
  }
}
