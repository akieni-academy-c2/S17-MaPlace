import AppError from '../error/appError.js';
import {
    createService,
    findServicesByEstablishment,
    findServiceById,
    findServiceByName,
    updateService,
    updateServiceStatus,
    deleteService,
} from '../model/serviceModel.js';
import { findEstablishmentById } from '../model/establishmentModel.js';

/**
 * Charge un service et vérifie que l'utilisateur gère son établissement.
 *
 * Vérifie dans l'ordre : l'établissement appartient au connecté,
 * puis le service appartient bien à cet établissement.
 *
 * @param {string} establishmentId - Identifiant UUID de l'établissement.
 * @param {string} serviceId - Identifiant UUID du service.
 * @param {string} userId - Identifiant de l'utilisateur connecté.
 * @returns {Promise<Object>} Le service.
 * @throws {AppError} 404 si l'établissement ou le service est introuvable,
 *                    403 si l'utilisateur n'en est pas le gestionnaire.
 */
async function getOwnedService(establishmentId, serviceId, userId) {
    const establishment = await findEstablishmentById(establishmentId);

    if (!establishment) {
        throw new AppError('Établissement introuvable.', 404);
    }

    if (establishment.manager_id !== userId) {
        throw new AppError("Vous n'êtes pas gestionnaire de cet établissement.", 403);
    }

    const service = await findServiceById(serviceId);

    if (!service || service.establishment_id !== establishmentId) {
        throw new AppError('Service introuvable.', 404);
    }

    return service;
}

/**
 * Liste les services d'un établissement géré.
 *
 * @param {import('express').Request} req - Requête HTTP (params : establishmentId).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec la liste des services.
 */
async function listServices(req, res, next) {
    try {
        const establishment = await findEstablishmentById(req.params.establishmentId);

        if (!establishment) {
            throw new AppError('Établissement introuvable.', 404);
        }

        if (establishment.manager_id !== req.user.id) {
            throw new AppError("Vous n'êtes pas gestionnaire de cet établissement.", 403);
        }

        const services = await findServicesByEstablishment(establishment.id);

        res.status(200).json({
            success: true,
            data: { services },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Crée un service dans un établissement géré.
 *
 * @param {import('express').Request} req - Requête HTTP (params : establishmentId, body : name, description?).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 201 avec le service créé.
 */
async function createServiceHandler(req, res, next) {
    try {
        const { name, description } = req.body || {};

        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new AppError('Le nom du service est obligatoire.', 400);
        }

        if (name.trim().length > 150) {
            throw new AppError('Le nom du service dépasse 150 caractères.', 400);
        }

        if (description !== undefined && description !== null && typeof description !== 'string') {
            throw new AppError('La description est invalide.', 400);
        }

        // L'établissement doit exister et appartenir à l'utilisateur.
        const establishment = await findEstablishmentById(req.params.establishmentId);

        if (!establishment) {
            throw new AppError('Établissement introuvable.', 404);
        }

        if (establishment.manager_id !== req.user.id) {
            throw new AppError("Vous n'êtes pas gestionnaire de cet établissement.", 403);
        }

        const existing = await findServiceByName(establishment.id, name.trim());
        if (existing) {
            throw new AppError('Un service avec ce nom existe déjà.', 409);
        }

        const service = await createService({
            establishmentId: establishment.id,
            name: name.trim(),
            description: description ? description.trim() : null,
        });

        res.status(201).json({
            success: true,
            data: { service },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Retourne le détail d'un service géré.
 *
 * @param {import('express').Request} req - Requête HTTP (params : establishmentId, serviceId).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec le service.
 */
async function getService(req, res, next) {
    try {
        const service = await getOwnedService(
            req.params.establishmentId,
            req.params.serviceId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: { service },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Met à jour un service géré (nom, description).
 *
 * @param {import('express').Request} req - Requête HTTP (params : establishmentId, serviceId, body : name?, description?).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec le service mis à jour.
 */
async function updateServiceHandler(req, res, next) {
    try {
        const service = await getOwnedService(
            req.params.establishmentId,
            req.params.serviceId,
            req.user.id
        );

        const body = req.body || {};
        const data = {};

        if (body.name !== undefined) {
            if (typeof body.name !== 'string' || !body.name.trim()) {
                throw new AppError('Le nom du service ne peut pas être vide.', 400);
            }
            if (body.name.trim().length > 150) {
                throw new AppError('Le nom du service dépasse 150 caractères.', 400);
            }
            data.name = body.name.trim();
        }

        if (body.description !== undefined) {
            if (body.description !== null && typeof body.description !== 'string') {
                throw new AppError('La description est invalide.', 400);
            }
            data.description = body.description ? body.description.trim() : null;
        }

        if (Object.keys(data).length === 0) {
            throw new AppError('Aucune donnée à mettre à jour.', 400);
        }

        if (data.name) {
            const existing = await findServiceByName(
                service.establishment_id,
                data.name,
                service.id
            );
            if (existing) {
                throw new AppError('Un service avec ce nom existe déjà.', 409);
            }
        }

        const updated = await updateService(service.id, data);

        res.status(200).json({
            success: true,
            data: { service: updated },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Active ou désactive un service géré.
 *
 * @param {import('express').Request} req - Requête HTTP (params : establishmentId, serviceId, body : status).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec le service mis à jour.
 */
async function updateServiceStatusHandler(req, res, next) {
    try {
        const service = await getOwnedService(
            req.params.establishmentId,
            req.params.serviceId,
            req.user.id
        );

        const { status } = req.body || {};

        if (typeof status !== 'boolean') {
            throw new AppError('Le statut doit être true ou false.', 400);
        }

        const updated = await updateServiceStatus(service.id, status);

        res.status(200).json({
            success: true,
            data: { service: updated },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Supprime un service géré.
 *
 * @param {import('express').Request} req - Requête HTTP (params : establishmentId, serviceId).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec un message de confirmation.
 */
async function deleteServiceHandler(req, res, next) {
    try {
        const service = await getOwnedService(
            req.params.establishmentId,
            req.params.serviceId,
            req.user.id
        );

        await deleteService(service.id);

        res.status(200).json({
            success: true,
            message: 'Service supprimé.',
        });
    } catch (error) {
        next(error);
    }
}

export {
    listServices,
    createServiceHandler,
    getService,
    updateServiceHandler,
    updateServiceStatusHandler,
    deleteServiceHandler,
};
