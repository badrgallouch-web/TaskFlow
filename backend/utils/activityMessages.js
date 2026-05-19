const STATUS_LABELS = {
  todo: 'À faire',
  doing: 'En cours',
  done: 'Terminé',
};

function statusLabel(status) {
  return STATUS_LABELS[status] || status || '';
}

/**
 * Build a human-readable activity line for the UI feed.
 */
function formatActivityMessage(activity) {
  const name = activity.user?.fullName || 'Utilisateur';
  const meta = activity.meta || {};
  const taskTitle = meta.title || meta.taskTitle || 'une tâche';
  const memberName = meta.memberName || meta.memberEmail || 'un membre';
  const projectName = meta.projectName || 'le projet';

  switch (activity.type) {
    case 'task_created':
      return `${name} a créé la tâche « ${taskTitle} »`;
    case 'task_deleted':
      return `${name} a supprimé la tâche « ${taskTitle} »`;
    case 'task_status_changed':
      return `${name} a changé le statut de « ${taskTitle} » à ${statusLabel(meta.newStatus)}`;
    case 'task_assigned':
      return `${name} a assigné la tâche « ${taskTitle} »`;
    case 'member_added':
      return `${name} a ajouté ${memberName} au projet`;
    case 'member_removed':
      return `${name} a retiré ${memberName} du projet`;
    case 'project_updated':
      return `${name} a modifié le projet « ${projectName} »`;
    default:
      return meta.description || `${name} a effectué une action sur le projet`;
  }
}

module.exports = { formatActivityMessage, statusLabel };
