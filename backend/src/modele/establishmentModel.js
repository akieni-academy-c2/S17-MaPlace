import pool from '../config/database.js';

// Recherche un établissement à partir de son email.
// On récupère le password_hash uniquement ici,
// car il est nécessaire pour vérifier le mot de passe.
const findByEmail = async (email) => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        phone,
        queue_status
      FROM establishments
      WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
};

// Récupère un établissement à partir de son ID.
// Ici, le password_hash n'est pas nécessaire.
const findById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        phone,
        queue_status
      FROM establishments
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

export {
  findByEmail,
  findById,
};