import pool from '../config/database.js';

// Récupère tous les établissements.
// On ne retourne jamais le password_hash.
const findAll = async () => {
  const result = await pool.query(`
    SELECT
      id,
      name,
      email,
      phone,
      queue_status
    FROM establishments
    ORDER BY name ASC
  `);

  return result.rows;
};

// Récupère un établissement à partir de son ID.
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

// Utilisé par l'authentification.
// Ici, le password_hash est nécessaire pour bcrypt.
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

export {
  findAll,
  findById,
  findByEmail,
};