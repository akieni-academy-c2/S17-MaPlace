import AppError from '../error/appError.js';
import {
    findUserByEmail,
    findUserWithHashById,
    updateUser,
    updateUserPassword,
} from '../model/userModel.js';
import { hashPassword, verifyPassword } from '../util/password.js';

/** Longueur minimale d'un mot de passe. */
const MIN_PASSWORD_LENGTH = 6;

/**
 * Retourne l'utilisateur connecté.
 *
 * @param {import('express').Request} req - Requête HTTP (req.user injecté par authenticate).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec l'utilisateur courant.
 */
async function getMe(req, res, next) {
    try {
        res.status(200).json({
            success: true,
            data: { user: req.user },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Met à jour le profil de l'utilisateur connecté (nom, email, téléphone).
 *
 * @param {import('express').Request} req - Requête HTTP (body : name?, email?, phone?).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec l'utilisateur mis à jour.
 */
async function updateMe(req, res, next) {
    try {
        const body = req.body || {};
        const data = {};

        if (body.name !== undefined) {
            if (typeof body.name !== 'string' || !body.name.trim()) {
                throw new AppError('Le nom ne peut pas être vide.', 400);
            }
            data.name = body.name.trim();
        }

        if (body.email !== undefined) {
            if (typeof body.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email)) {
                throw new AppError('Adresse email invalide.', 400);
            }
            data.email = body.email.trim().toLowerCase();
        }

        if (body.phone !== undefined) {
            if (body.phone !== null && typeof body.phone !== 'string') {
                throw new AppError('Numéro de téléphone invalide.', 400);
            }
            data.phone = body.phone ? body.phone.trim() : null;
        }

        if (Object.keys(data).length === 0) {
            throw new AppError('Aucune donnée à mettre à jour.', 400);
        }

        // L'email doit rester unique.
        if (data.email && data.email !== req.user.email) {
            const existing = await findUserByEmail(data.email);
            if (existing) {
                throw new AppError('Un compte existe déjà avec cet email.', 409);
            }
        }

        const user = await updateUser(req.user.id, data);

        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Change le mot de passe de l'utilisateur connecté.
 *
 * @param {import('express').Request} req - Requête HTTP (body : currentPassword, newPassword).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec un message de confirmation.
 */
async function updateMyPassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body || {};

        if (!currentPassword || !newPassword) {
            throw new AppError('Mot de passe actuel et nouveau mot de passe sont obligatoires.', 400);
        }

        if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
            throw new AppError(`Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`, 400);
        }

        const credentials = await findUserWithHashById(req.user.id);
        if (!credentials) {
            throw new AppError('Utilisateur introuvable.', 404);
        }

        const valid = await verifyPassword(currentPassword, credentials.password_hash);
        if (!valid) {
            throw new AppError('Mot de passe actuel incorrect.', 403);
        }

        const passwordHash = await hashPassword(newPassword);
        await updateUserPassword(req.user.id, passwordHash);

        res.status(200).json({
            success: true,
            message: 'Mot de passe mis à jour.',
        });
    } catch (error) {
        next(error);
    }
}

export { getMe, updateMe, updateMyPassword };
