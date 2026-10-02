import bcrypt from 'bcrypt';

async function seedCategories(client) {
    const categories = [
        'Administration',
        'Santé',
        'Beauté',
        'Banque',
        'Services publics'
    ];

    for (const designation of categories) {
        await client.query(
            `
            INSERT INTO categories (designation)
            VALUES ($1)
            `,
            [designation]
        );
    }

    console.log('Catégories insérées.');
}

async function seedUsers(client) {
    const users = [
        {
            name: 'Chris',
            email: 'adelininfo08@gmail.com',
            phone: '0600000000',
            password: 'Chris',
            isAdmin: true
        },
        {
            name: 'Gestionnaire Test',
            email: 'gestionnaire@maplace.com',
            phone: '0611111111',
            password: 'password',
            isAdmin: false
        },
        {
            name: 'Client Test',
            email: 'client@maplace.com',
            phone: '0622222222',
            password: 'password',
            isAdmin: false
        }
    ];

    for (const user of users) {
        const passwordHash = await bcrypt.hash(
            user.password,
            12
        );

        await client.query(
            `
            INSERT INTO users (
                name,
                email,
                phone,
                password_hash,
                is_admin
            )
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
                user.name,
                user.email,
                user.phone,
                passwordHash,
                user.isAdmin
            ]
        );
    }

    console.log('Utilisateurs insérés.');
}

async function seedEstablishments(client) {
    const categoryResult = await client.query(
        `
        SELECT id
        FROM categories
        WHERE designation = $1
        `,
        ['Administration']
    );

    const managerResult = await client.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
        `,
        ['gestionnaire@maplace.com']
    );

    const category = categoryResult.rows[0];
    const manager = managerResult.rows[0];

    if (!category) {
        throw new Error(
            'La catégorie Administration est introuvable.'
        );
    }

    if (!manager) {
        throw new Error(
            'Le gestionnaire de test est introuvable.'
        );
    }

    await client.query(
        `
        INSERT INTO establishments (
            category_id,
            manager_id,
            name,
            address,
            description,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
            category.id,
            manager.id,
            'Mairie centrale',
            'Brazzaville',
            'Service administratif',
            'ACTIVE'
        ]
    );

    console.log('Établissement inséré.');
}

export {
    seedCategories,
    seedUsers,
    seedEstablishments
};