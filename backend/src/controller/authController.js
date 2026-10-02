import AppError from '../error/appError.js';
import { findUserByEmail, createUser } from '../model/userModel.js';
import { hashPassword, verifyPassword } from '../util/password.js';
import { generateToken } from '../util/token.js';

/**
 * Valide les champs obligatoires d'une inscription.
 *
 * @param {Object} body - Corps de la requête.
 * @param {string} body.name - Nom de l'utilisateur.
 * @param {string} body.email - Adresse email.
 * @param {string} body.password - Mot de passe.
 * @throws {AppError} 400 si un champ est absent ou invalide.
 */
function validateRegisterBody({ name, email, password }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
        throw new AppError('Le nom est obligatoire.', 400);
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new AppError('Une adresse email valide est obligatoire.', 400);
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        throw new AppError('Le mot de passe doit contenir au moins 6 caractères.', 400);
    }
}

/**
 * Inscrit un nouvel utilisateur.
 *
 * @param {import('express').Request} req - Requête HTTP (body : name, email, phone?, password).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 201 avec l'utilisateur et son token.
 */
async function register(req, res, next) {
    try {
        const { name, email, phone, password } = req.body || {};

        validateRegisterBody({ name, email, password });

        const existing = await findUserByEmail(email.trim().toLowerCase());
        if (existing) {
            throw new AppError('Un compte existe déjà avec cet email.', 409);
        }

        const passwordHash = await hashPassword(password);

        const user = await createUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone,
            passwordHash,
        });

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            data: { user, token },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Connecte un utilisateur.
 *
 * @param {import('express').Request} req - Requête HTTP (body : email, password).
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec l'utilisateur et son token.
 */
async function login(req, res, next) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            throw new AppError('Email et mot de passe sont obligatoires.', 400);
        }

        const user = await findUserByEmail(email.trim().toLowerCase());

        const valid = user && (await verifyPassword(password, user.password_hash));
        if (!valid) {
            throw new AppError('Email ou mot de passe incorrect.', 401);
        }

        const token = generateToken(user.id);

        const { password_hash, ...safeUser } = user;

        res.status(200).json({
            success: true,
            data: { user: safeUser, token },
        });
    } catch (error) {
        next(error);
    }
}

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

export { register, login, getMe };
