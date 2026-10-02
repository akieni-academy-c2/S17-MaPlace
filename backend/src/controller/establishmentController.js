import AppError from '../error/appError.js';
import {
    createEstablishment,
    findEstablishmentsByManager,
    findEstablishmentById,
    updateEstablishment,
    updateEstablishmentStatus,
} from '../model/establishmentModel.js';
import { findCategoryById } from '../model/categoryModel.js';

/** Statuts autorisés pour un établissement (enum du schéma PostgreSQL). */
const ALLOWED_STATUSES = ['ACTIVE', 'INACTIVE'];

/**
 * Charge un établissement et vérifie que l'utilisateur en est le gestionnaire.
 *
 * @param {string} id - Identifiant UUID de l'établissement.
 * @param {string} userId - Identifiant de l'utilisateur connecté.
 * @returns {Promise<Object>} L'établissement.
 * @throws {AppError} 404 si introuvable, 403 si l'utilisateur n'en est pas le gestionnaire.
 */
async function getOwnedEstablishment(id, userId) {
    const establishment = await findEstablishmentById(id);

    if (!establishment) {
        throw new AppError('Établissement introuvable.', 404);
    }

    if (establishment.manager_id !== userId) {
        throw new AppError("Vous n'êtes pas gestionnaire de cet établissement.", 403);
    }

    return establishment;
}

/**
 * Crée un établissement pour l'utilisateur connecté.
 *
 * @param {import('express').Request} req - Requête HTTP (body : name, address, category_id, description?).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 201 avec l'établissement créé.
 */
async function createEstablishmentHandler(req, res, next) {
    try {
        const { name, address, description, category_id } = req.body || {};

        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new AppError("Le nom de l'établissement est obligatoire.", 400);
        }

        if (name.trim().length > 150) {
            throw new AppError("Le nom de l'établissement dépasse 150 caractères.", 400);
        }

        if (!address || typeof address !== 'string' || !address.trim()) {
            throw new AppError("L'adresse de l'établissement est obligatoire.", 400);
        }

        if (description !== undefined && description !== null && typeof description !== 'string') {
            throw new AppError('La description est invalide.', 400);
        }

        if (!category_id) {
            throw new AppError('La catégorie est obligatoire.', 400);
        }

        const category = await findCategoryById(category_id);
        if (!category) {
            throw new AppError('Catégorie introuvable.', 404);
        }

        const establishment = await createEstablishment({
            categoryId: category_id,
            managerId: req.user.id,
            name: name.trim(),
            address: address.trim(),
            description: description ? description.trim() : null,
        });

        res.status(201).json({
            success: true,
            data: { establishment },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Liste les établissements gérés par l'utilisateur connecté.
 *
 * @param {import('express').Request} req - Requête HTTP.
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec les établissements de l'utilisateur.
 */
async function listMyEstablishments(req, res, next) {
    try {
        const establishments = await findEstablishmentsByManager(req.user.id);

        res.status(200).json({
            success: true,
            data: { establishments },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Retourne le détail d'un établissement géré par l'utilisateur connecté.
 *
 * @param {import('express').Request} req - Requête HTTP (params : id).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec l'établissement.
 */
async function getEstablishment(req, res, next) {
    try {
        const establishment = await getOwnedEstablishment(req.params.id, req.user.id);

        res.status(200).json({
            success: true,
            data: { establishment },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Met à jour un établissement géré par l'utilisateur connecté.
 *
 * @param {import('express').Request} req - Requête HTTP (params : id, body : name?, address?, description?, category_id?).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec l'établissement mis à jour.
 */
async function updateEstablishmentHandler(req, res, next) {
    try {
        await getOwnedEstablishment(req.params.id, req.user.id);

        const body = req.body || {};
        const data = {};

        if (body.name !== undefined) {
            if (typeof body.name !== 'string' || !body.name.trim()) {
                throw new AppError("Le nom de l'établissement ne peut pas être vide.", 400);
            }
            if (body.name.trim().length > 150) {
                throw new AppError("Le nom de l'établissement dépasse 150 caractères.", 400);
            }
            data.name = body.name.trim();
        }

        if (body.address !== undefined) {
            if (typeof body.address !== 'string' || !body.address.trim()) {
                throw new AppError("L'adresse ne peut pas être vide.", 400);
            }
            data.address = body.address.trim();
        }

        if (body.description !== undefined) {
            if (body.description !== null && typeof body.description !== 'string') {
                throw new AppError('La description est invalide.', 400);
            }
            data.description = body.description ? body.description.trim() : null;
        }

        if (body.category_id !== undefined) {
            const category = await findCategoryById(body.category_id);
            if (!category) {
                throw new AppError('Catégorie introuvable.', 404);
            }
            data.category_id = body.category_id;
        }

        if (Object.keys(data).length === 0) {
            throw new AppError('Aucune donnée à mettre à jour.', 400);
        }

        const establishment = await updateEstablishment(req.params.id, data);

        res.status(200).json({
            success: true,
            data: { establishment },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Change le statut d'un établissement (ACTIVE / INACTIVE).
 *
 * @param {import('express').Request} req - Requête HTTP (params : id, body : status).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec l'établissement mis à jour.
 */
async function updateEstablishmentStatusHandler(req, res, next) {
    try {
        await getOwnedEstablishment(req.params.id, req.user.id);

        const { status } = req.body || {};

        if (!ALLOWED_STATUSES.includes(status)) {
            throw new AppError(`Le statut doit être : ${ALLOWED_STATUSES.join(' ou ')}.`, 400);
        }

        const establishment = await updateEstablishmentStatus(req.params.id, status);

        res.status(200).json({
            success: true,
            data: { establishment },
        });
    } catch (error) {
        next(error);
    }
}

export {
    createEstablishmentHandler,
    listMyEstablishments,
    getEstablishment,
    updateEstablishmentHandler,
    updateEstablishmentStatusHandler,
};
