import AppError from '../error/appError.js';
import {
    createQueue,
    findQueueByServiceAndDate,
    updateQueueStatus,
    getQueueStats,
} from '../model/queueModel.js';
import { getOwnedService } from './serviceController.js';

/** États autorisés par la colonne queue_status. */
const VALID_STATUS = [
    'OPEN',
    'PAUSED',
    'REGISTRATION_CLOSED',
    'CLOSED',
];

/**
 * Transitions autorisées depuis chaque état.
 * CLOSED est terminal : une file fermée ne se rouvre pas (nouvelle journée).
 */
const ALLOWED_TRANSITIONS = {
    OPEN: ['PAUSED', 'REGISTRATION_CLOSED', 'CLOSED'],
    PAUSED: ['OPEN', 'REGISTRATION_CLOSED', 'CLOSED'],
    REGISTRATION_CLOSED: ['OPEN', 'CLOSED'],
    CLOSED: [],
};

/**
 * Charge le service de l'URL et la file d'attente du jour.
 *
 * Vérifie la propriété du service, puis cherche la file du jour.
 *
 * @param {import('express').Request} req - Requête HTTP (params establishmentId, serviceId).
 * @param {string} userId - Identifiant de l'utilisateur connecté.
 * @returns {Promise<Object>} { service, queue }.
 * @throws {AppError} 404 si le service ou la file du jour est introuvable,
 *                    403 si l'utilisateur n'en est pas le gestionnaire.
 */
async function getOwnedQueue(req, userId) {
    const service = await getOwnedService(
        req.params.establishmentId,
        req.params.serviceId,
        userId
    );

    const queue = await findQueueByServiceAndDate(service.id);

    if (!queue) {
        throw new AppError(
            "Aucune file d'attente pour ce service aujourd'hui.",
            404
        );
    }

    return { service, queue };
}

/**
 * POST /api/establishments/:establishmentId/services/:serviceId/queue
 * Ouvre la file d'attente du jour pour un service géré.
 *
 * @param {import('express').Request} req - Requête HTTP.
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 201 avec la file créée, 409 si elle existe déjà.
 */
async function openQueueHandler(req, res, next) {
    try {
        const service = await getOwnedService(
            req.params.establishmentId,
            req.params.serviceId,
            req.user.id
        );

        const existing = await findQueueByServiceAndDate(service.id);

        if (existing) {
            throw new AppError(
                "Une file d'attente est déjà ouverte pour ce service aujourd'hui.",
                409
            );
        }

        const queue = await createQueue({
            establishmentId: service.establishment_id,
            serviceId: service.id,
        });

        res.status(201).json({
            success: true,
            data: { queue },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/establishments/:establishmentId/services/:serviceId/queue
 * Retourne l'état de la file du jour : statut, personnes présentes,
 * ticket en cours appelé.
 *
 * @param {import('express').Request} req - Requête HTTP.
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec la file et ses statistiques.
 */
async function getQueueHandler(req, res, next) {
    try {
        const { queue } = await getOwnedQueue(req, req.user.id);
        const stats = await getQueueStats(queue.id);

        res.status(200).json({
            success: true,
            data: { queue, stats },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/establishments/:establishmentId/services/:serviceId/queue
 * Change l'état de la file du jour (pause, reprise, fermeture...).
 *
 * @param {import('express').Request} req - Requête HTTP (body : status).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec la file mise à jour.
 */
async function updateQueueStatusHandler(req, res, next) {
    try {
        const { queue } = await getOwnedQueue(req, req.user.id);

        const { status } = req.body || {};

        if (typeof status !== 'string' || !VALID_STATUS.includes(status)) {
            throw new AppError(
                'Statut invalide. Valeurs attendues : OPEN, PAUSED, REGISTRATION_CLOSED, CLOSED.',
                400
            );
        }

        if (status === queue.status) {
            throw new AppError(
                `La file est déjà dans l'état ${status}.`,
                400
            );
        }

        if (!ALLOWED_TRANSITIONS[queue.status].includes(status)) {
            throw new AppError(
                `Transition impossible : ${queue.status} → ${status}.`,
                400
            );
        }

        const updated = await updateQueueStatus(queue.id, status);

        res.status(200).json({
            success: true,
            data: { queue: updated },
        });
    } catch (error) {
        next(error);
    }
}

export {
    openQueueHandler,
    getQueueHandler,
    updateQueueStatusHandler,
};
