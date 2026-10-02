import { listCategories as fetchCategories } from '../model/categoryModel.js';

/**
 * Liste les catégories disponibles.
 *
 * @param {import('express').Request} req - Requête HTTP.
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} 200 avec la liste des catégories.
 */
async function listCategories(req, res, next) {
    try {
        const categories = await fetchCategories();

        res.status(200).json({
            success: true,
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
}

export { listCategories };
