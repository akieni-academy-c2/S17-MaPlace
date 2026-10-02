import AppError from '../error/appError.js';
import {
    createTicket,
    findActiveTicketByUser,
    findByTrackingToken,
    getPosition,
    countPeopleAhead,
    cancelTicket,
} from '../model/ticketModel.js';
import { findQueueByServiceAndDate } from '../model/queueModel.js';
import { findEstablishmentById } from '../model/establishmentModel.js';
import { findServiceById } from '../model/serviceModel.js';

/** Canaux autorisés (enum ticket_channel). */
const VALID_CHANNEL = ['ONLINE', 'PHYSICAL'];

/** États de file dans lesquels l'inscription est possible. */
const OPEN_FOR_REGISTRATION = ['OPEN', 'PAUSED'];

/**
 * Charge le service et la file d'attente du jour (parcours public).
 *
 * Contrairement aux routes gérées, aucun contrôle de propriété : n'importe
 * qui peut rejoindre la file d'un service. On vérifie seulement que
 * l'établissement existe, que le service lui appartient, et que la file du
 * jour existe.
 *
 * @param {import('express').Request} req - Requête HTTP (params establishmentId, serviceId).
 * @returns {Promise<Object>} { establishment, service, queue }.
 * @throws {AppError} 404 si l'établissement, le service ou la file est introuvable.
 */
async function resolveQueue(req) {
    const establishment = await findEstablishmentById(req.params.establishmentId);

    if (!establishment) {
        throw new AppError('Établissement introuvable.', 404);
    }

    const service = await findServiceById(req.params.serviceId);

    if (!service || service.establishment_id !== establishment.id) {
        throw new AppError('Service introuvable.', 404);
    }

    const queue = await findQueueByServiceAndDate(service.id);

    if (!queue) {
        throw new AppError(
            "Aucune file d'attente pour ce service aujourd'hui.",
            404
        );
    }

    return { establishment, service, queue };
}

/**
 * Valide les champs obligatoires d'une inscription à la file.
 *
 * @param {Object} body - Corps de la requête.
 * @returns {Object} { name, phone, channel } normalisés.
 * @throws {AppError} 400 si un champ est absent ou invalide.
 */
function validateJoinPayload(body) {
    const { name, phone, channel } = body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
        throw new AppError('Le nom est obligatoire.', 400);
    }

    if (name.trim().length > 100) {
        throw new AppError('Le nom dépasse 100 caractères.', 400);
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
        throw new AppError('Le téléphone est obligatoire.', 400);
    }

    if (phone.trim().length > 30) {
        throw new AppError('Le téléphone dépasse 30 caractères.', 400);
    }

    if (channel !== undefined && !VALID_CHANNEL.includes(channel)) {
        throw new AppError(
            'Canal invalide. Valeurs attendues : ONLINE, PHYSICAL.',
            400
        );
    }

    return {
        name: name.trim(),
        phone: phone.trim(),
        channel: channel || 'ONLINE',
    };
}

/**
 * POST /api/establishments/:establishmentId/services/:serviceId/queue/tickets
 * Rejoint la file d'attente du jour : crée un ticket numéroté.
 *
 * Route publique : un client anonyme peut prendre un ticket ; si un JWT est
 * fourni, le ticket est rattaché à son compte.
 *
 * @param {import('express').Request} req - Requête HTTP (body : name, phone, channel?).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 201 avec le ticket, sa position et le nombre de
 *                          personnes devant lui.
 */
async function joinQueueHandler(req, res, next) {
    try {
        const { queue } = await resolveQueue(req);

        if (!OPEN_FOR_REGISTRATION.includes(queue.status)) {
            throw new AppError(
                "Les inscriptions sont fermées pour cette file d'attente.",
                400
            );
        }

        const payload = validateJoinPayload(req.body);

        // Un compte ne peut avoir qu'un seul ticket actif par file.
        if (req.user) {
            const existing = await findActiveTicketByUser(
                queue.id,
                req.user.id
            );

            if (existing) {
                throw new AppError(
                    'Vous avez déjà un ticket dans cette file.',
                    409
                );
            }
        }

        const ticket = await createTicket({
            queueId: queue.id,
            userId: req.user ? req.user.id : null,
            name: payload.name,
            phone: payload.phone,
            channel: payload.channel,
        });

        const peopleAhead = await countPeopleAhead(queue.id, ticket.number);

        res.status(201).json({
            success: true,
            data: {
                ticket,
                position: peopleAhead + 1,
                peopleAhead,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/establishments/:establishmentId/services/:serviceId/queue/tickets/:trackingToken
 * Retourne un ticket, sa position et les personnes devant lui.
 *
 * @param {import('express').Request} req - Requête HTTP (params : trackingToken).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec le ticket et sa position.
 */
async function getTicketHandler(req, res, next) {
    try {
        const { queue } = await resolveQueue(req);

        const ticket = await findByTrackingToken(req.params.trackingToken);

        if (!ticket || ticket.queue_id !== queue.id) {
            throw new AppError('Ticket introuvable.', 404);
        }

        const position = await getPosition(ticket);
        const peopleAhead = await countPeopleAhead(queue.id, ticket.number);

        res.status(200).json({
            success: true,
            data: { ticket, position, peopleAhead },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/establishments/:establishmentId/services/:serviceId/queue/tickets/:trackingToken
 * Quitte la file : annulation logique du ticket (status → CANCELLED).
 *
 * @param {import('express').Request} req - Requête HTTP (params : trackingToken).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec le ticket annulé.
 */
async function leaveQueueHandler(req, res, next) {
    try {
        const { queue } = await resolveQueue(req);

        const ticket = await findByTrackingToken(req.params.trackingToken);

        if (!ticket || ticket.queue_id !== queue.id) {
            throw new AppError('Ticket introuvable.', 404);
        }

        const cancelled = await cancelTicket(
            ticket,
            req.user ? req.user.id : null
        );

        if (!cancelled) {
            throw new AppError(
                `Ce ticket ne peut plus être annulé (état : ${ticket.status}).`,
                409
            );
        }

        res.status(200).json({
            success: true,
            data: { ticket: cancelled },
        });
    } catch (error) {
        next(error);
    }
}

export {
    joinQueueHandler,
    getTicketHandler,
    leaveQueueHandler,
};
