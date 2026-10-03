import pool from '../config/database.js';

// Les requêtes publiques n'exposent pas password_hash.
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