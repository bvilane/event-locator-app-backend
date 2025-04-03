module.exports = {
  translation: {
    welcome: 'Bienvenue à l\'API de Localisateur d\'Événements',
    events: {
      created: 'Événement créé avec succès',
      updated: 'Événement mis à jour avec succès',
      deleted: 'Événement supprimé avec succès',
      notFound: 'Événement non trouvé',
      unauthorized: 'Non autorisé à modifier cet événement',
      attendanceConfirmed: 'Votre participation a été confirmée',
      attendanceCancelled: 'Votre participation a été annulée',
      locationRequired: 'La longitude et la latitude sont requises'
    },
    users: {
      registered: 'Utilisateur enregistré avec succès',
      loggedIn: 'Utilisateur connecté avec succès',
      notFound: 'Utilisateur non trouvé',
      invalidCredentials: 'Identifiants invalides',
      profileUpdated: 'Profil mis à jour avec succès',
      passwordUpdated: 'Mot de passe mis à jour avec succès',
      alreadyExists: 'Un utilisateur avec cet email existe déjà'
    },
    notifications: {
      queued: 'Notification mise en file d\'attente avec succès',
      upcomingQueued: 'Notifications mises en file d\'attente pour les événements à venir',
      sent: 'Notification envoyée avec succès',
      upcoming: 'Événement à venir:'
    },
    validation: {
      requiredField: 'Ce champ est obligatoire',
      invalidEmail: 'Veuillez fournir un email valide',
      passwordLength: 'Le mot de passe doit comporter au moins 6 caractères',
      invalidCoordinates: 'Les coordonnées de localisation doivent être un tableau [longitude, latitude]',
      invalidDate: 'Format de date invalide',
      categoryRequired: 'Au moins une catégorie est requise',
      languageSupport: 'La langue doit être soit en ou fr'
    },
    errors: {
      general: 'Une erreur s\'est produite',
      unauthorized: 'Authentification requise',
      invalidToken: 'Jeton invalide',
      notFound: 'Ressource non trouvée',
      serverError: 'Erreur interne du serveur',
      redisNotConnected: 'Service de notification temporairement indisponible'
    }
  },
};