import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import pool from '../src/config/database.js';

// Établissements de démonstration à Brazzaville (adresses indicatives).
// Mot de passe commun : password123.
const DEMO_PASSWORD = 'password123';

const establishments = [
  // ---------- Administrations ----------
  {
    name: 'Mairie centrale de Brazzaville',
    email: 'mairie.centrale@example.com',
    phone: '064001010',
    category: 'ADMINISTRATION',
    description: 'État civil, légalisations, certificats de résidence et autorisations municipales. Munissez-vous de vos pièces justificatives originales.',
    address: 'Boulevard Denis Sassou Nguesso',
    district: 'Centre-ville',
    openingHours: 'Lun – Ven · 8h00 – 15h30',
    queueStatus: 'OPEN',
    averageServiceMinutes: 10,
    waitingTickets: 14,
  },
  {
    name: 'Mairie de Bacongo',
    email: 'mairie.bacongo@example.com',
    phone: '064001011',
    category: 'ADMINISTRATION',
    description: 'Mairie du 2e arrondissement : actes de naissance, de mariage et de décès, légalisation de documents.',
    address: 'Avenue Matsoua, face au marché Total',
    district: 'Bacongo',
    openingHours: 'Lun – Ven · 8h00 – 15h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 8,
    waitingTickets: 6,
  },
  {
    name: 'Mairie de Talangaï',
    email: 'mairie.talangai@example.com',
    phone: '064001012',
    category: 'ADMINISTRATION',
    description: 'Mairie du 6e arrondissement : état civil, certificats et démarches administratives de proximité.',
    address: 'Avenue Marien Ngouabi',
    district: 'Talangaï',
    openingHours: 'Lun – Ven · 8h00 – 15h00',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 8,
  },
  {
    name: 'CNSS — Direction de Brazzaville',
    email: 'cnss@example.com',
    phone: '064001013',
    category: 'ADMINISTRATION',
    description: 'Caisse nationale de sécurité sociale : immatriculation, pensions, allocations familiales et attestations.',
    address: 'Avenue Amilcar Cabral',
    district: 'Centre-ville',
    openingHours: 'Lun – Ven · 7h30 – 14h30',
    queueStatus: 'OPEN',
    averageServiceMinutes: 15,
    waitingTickets: 9,
  },
  {
    name: 'Direction générale des impôts et des domaines',
    email: 'impots@example.com',
    phone: '064001014',
    category: 'ADMINISTRATION',
    description: 'Déclarations fiscales, paiement des impôts et taxes, délivrance de quitus et attestations de non-redevance.',
    address: 'Boulevard Denis Sassou Nguesso, Plateau',
    district: 'Centre-ville',
    openingHours: 'Lun – Ven · 8h00 – 15h00',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 12,
  },
  {
    name: 'Centre de délivrance des passeports',
    email: 'passeports@example.com',
    phone: '064001015',
    category: 'ADMINISTRATION',
    description: 'Dépôt des demandes et retrait des passeports biométriques. Prise d’empreintes et photo sur place.',
    address: 'Avenue Félix Éboué',
    district: 'Centre-ville',
    openingHours: 'Lun – Ven · 8h00 – 14h00',
    queueStatus: 'PAUSED',
    averageServiceMinutes: 20,
    waitingTickets: 4,
  },

  // ---------- Santé ----------
  {
    name: 'CHU de Brazzaville — Consultations externes',
    email: 'chu@example.com',
    phone: '064002020',
    category: 'SANTE',
    description: 'Centre hospitalier universitaire : consultations de médecine générale et de spécialités. Présentez votre carnet de santé à l’accueil.',
    address: 'Boulevard Auxence Ickonga',
    district: 'Centre-ville',
    openingHours: 'Lun – Sam · 7h30 – 16h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 15,
    waitingTickets: 18,
  },
  {
    name: 'Hôpital de base de Talangaï',
    email: 'hopital.talangai@example.com',
    phone: '064002021',
    category: 'SANTE',
    description: 'Consultations générales, pédiatrie et maternité pour les quartiers nord de Brazzaville.',
    address: 'Avenue Marien Ngouabi',
    district: 'Talangaï',
    openingHours: 'Tous les jours · 7h00 – 18h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 12,
    waitingTickets: 11,
  },
  {
    name: 'Hôpital de base de Makélékélé',
    email: 'hopital.makelekele@example.com',
    phone: '064002022',
    category: 'SANTE',
    description: 'Consultations de médecine générale, soins infirmiers et vaccinations pour le sud de la ville.',
    address: 'Avenue de l’OUA',
    district: 'Makélékélé',
    openingHours: 'Tous les jours · 7h00 – 18h00',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 12,
  },
  {
    name: 'Hôpital mère-enfant Blanche Gomez',
    email: 'blanche.gomez@example.com',
    phone: '064002023',
    category: 'SANTE',
    description: 'Suivi de grossesse, consultations pédiatriques et vaccinations des enfants.',
    address: 'Avenue de la Paix',
    district: 'Poto-Poto',
    openingHours: 'Lun – Sam · 7h30 – 16h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 10,
    waitingTickets: 7,
  },
  {
    name: 'Centre de santé intégré de Ouenzé',
    email: 'csi.ouenze@example.com',
    phone: '064002024',
    category: 'SANTE',
    description: 'Soins de premier niveau, consultations prénatales et dépistages gratuits.',
    address: 'Rue Mayama, près du marché de Ouenzé',
    district: 'Ouenzé',
    openingHours: 'Lun – Ven · 7h30 – 15h30',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 10,
  },

  // ---------- Banques ----------
  {
    name: 'BGFIBank Congo — Agence centrale',
    email: 'bgfibank@example.com',
    phone: '055003030',
    category: 'BANQUE',
    description: 'Ouverture de compte, dépôts et retraits, virements et services aux entreprises.',
    address: 'Avenue Amilcar Cabral',
    district: 'Centre-ville',
    openingHours: 'Lun – Ven · 8h00 – 15h30 · Sam · 8h30 – 12h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 7,
    waitingTickets: 5,
  },
  {
    name: 'LCB Bank — Agence Poto-Poto',
    email: 'lcb.potopoto@example.com',
    phone: '055003031',
    category: 'BANQUE',
    description: 'Opérations courantes au guichet, cartes bancaires et transferts d’argent.',
    address: 'Avenue de la Paix',
    district: 'Poto-Poto',
    openingHours: 'Lun – Ven · 8h00 – 15h30',
    queueStatus: 'OPEN',
    averageServiceMinutes: 6,
    waitingTickets: 3,
  },
  {
    name: 'Ecobank Congo — Agence Moungali',
    email: 'ecobank.moungali@example.com',
    phone: '055003032',
    category: 'BANQUE',
    description: 'Dépôts, retraits, ouverture de compte et services Ecobank Mobile.',
    address: 'Avenue des Trois Martyrs',
    district: 'Moungali',
    openingHours: 'Lun – Ven · 8h00 – 16h00 · Sam · 9h00 – 12h00',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 6,
  },
  {
    name: 'UBA Congo — Agence Plateau',
    email: 'uba@example.com',
    phone: '055003033',
    category: 'BANQUE',
    description: 'Comptes particuliers et professionnels, cartes prépayées et transferts internationaux.',
    address: 'Avenue Amilcar Cabral, Plateau',
    district: 'Centre-ville',
    openingHours: 'Lun – Ven · 8h00 – 15h30',
    queueStatus: 'OPEN',
    averageServiceMinutes: 8,
    waitingTickets: 12,
  },
  {
    name: 'Crédit du Congo — Agence Bacongo',
    email: 'creditducongo.bacongo@example.com',
    phone: '055003034',
    category: 'BANQUE',
    description: 'Opérations de guichet, crédits aux particuliers et conseils en épargne.',
    address: 'Avenue Matsoua',
    district: 'Bacongo',
    openingHours: 'Lun – Ven · 8h00 – 15h30',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 8,
  },
  {
    name: 'MUCODEC — Caisse de Talangaï',
    email: 'mucodec.talangai@example.com',
    phone: '055003035',
    category: 'BANQUE',
    description: 'Mutuelle d’épargne et de crédit : dépôts, retraits, microcrédits et adhésions.',
    address: 'Avenue Marien Ngouabi',
    district: 'Talangaï',
    openingHours: 'Lun – Ven · 7h30 – 15h30 · Sam · 8h00 – 12h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 5,
    waitingTickets: 16,
  },

  // ---------- Télécoms ----------
  {
    name: 'MTN Congo — Agence centrale',
    email: 'mtn.centre@example.com',
    phone: '066004040',
    category: 'TELECOM',
    description: 'Cartes SIM, identification des abonnés, forfaits internet et services Mobile Money.',
    address: 'Boulevard Denis Sassou Nguesso',
    district: 'Centre-ville',
    openingHours: 'Lun – Sam · 8h00 – 18h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 5,
    waitingTickets: 10,
  },
  {
    name: 'MTN Congo — Agence Moungali',
    email: 'mtn.moungali@example.com',
    phone: '066004041',
    category: 'TELECOM',
    description: 'Remplacement de carte SIM, réclamations et opérations Mobile Money.',
    address: 'Rond-point Moungali',
    district: 'Moungali',
    openingHours: 'Lun – Sam · 8h00 – 18h00',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 5,
  },
  {
    name: 'Airtel Congo — Agence Poto-Poto',
    email: 'airtel.potopoto@example.com',
    phone: '056004042',
    category: 'TELECOM',
    description: 'Identification SIM, forfaits, Airtel Money et vente de téléphones.',
    address: 'Avenue de la Paix',
    district: 'Poto-Poto',
    openingHours: 'Lun – Sam · 8h00 – 18h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 5,
    waitingTickets: 2,
  },
  {
    name: 'Airtel Congo — Agence Bacongo',
    email: 'airtel.bacongo@example.com',
    phone: '056004043',
    category: 'TELECOM',
    description: 'Services clients Airtel : SIM, recharges, Airtel Money et réclamations.',
    address: 'Avenue Matsoua',
    district: 'Bacongo',
    openingHours: 'Lun – Sam · 8h00 – 17h30',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 5,
  },
  {
    name: 'Congo Telecom — Agence commerciale',
    email: 'congotelecom@example.com',
    phone: '066004044',
    category: 'TELECOM',
    description: 'Abonnements fibre et ADSL, téléphonie fixe et règlement des factures.',
    address: 'Rond-point de la Poste',
    district: 'Centre-ville',
    openingHours: 'Lun – Ven · 8h00 – 16h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 10,
    waitingTickets: 4,
  },

  // ---------- Esthétique & beauté ----------
  {
    name: 'Salon Élégance',
    email: 'salon@example.com',
    phone: '069005050',
    category: 'BEAUTE',
    description: 'Coiffure, tresses, soins et mise en beauté, sans rendez-vous grâce à la file en ligne.',
    address: 'Avenue des Trois Martyrs',
    district: 'Plateau des 15 ans',
    openingHours: 'Mar – Sam · 9h00 – 19h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 30,
    waitingTickets: 3,
  },
  {
    name: 'Institut Beauté Divine',
    email: 'beaute.divine@example.com',
    phone: '069005051',
    category: 'BEAUTE',
    description: 'Soins du visage, maquillage, épilation et manucure.',
    address: 'Rue Bouenza',
    district: 'Centre-ville',
    openingHours: 'Lun – Sam · 9h00 – 19h00',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 40,
  },
  {
    name: 'Le Boss Barber Shop',
    email: 'leboss.barber@example.com',
    phone: '069005052',
    category: 'BEAUTE',
    description: 'Coupes homme, dégradés, taille de barbe et soins capillaires.',
    address: 'Avenue de la Paix',
    district: 'Moungali',
    openingHours: 'Tous les jours · 9h00 – 21h00',
    queueStatus: 'OPEN',
    averageServiceMinutes: 20,
    waitingTickets: 5,
  },
  {
    name: 'Onglerie Perle d’Ébène',
    email: 'perle.ebene@example.com',
    phone: '069005053',
    category: 'BEAUTE',
    description: 'Pose d’ongles, vernis semi-permanent, manucure et pédicure.',
    address: 'Avenue Matsoua',
    district: 'Bacongo',
    openingHours: 'Mar – Dim · 10h00 – 19h00',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 45,
  },
  {
    name: 'Spa Bien-Être Mfilou',
    email: 'spa.mfilou@example.com',
    phone: '069005054',
    category: 'BEAUTE',
    description: 'Massages, hammam et soins du corps dans un cadre calme.',
    address: 'Route de la Corniche, quartier Ngamakosso',
    district: 'Mfilou',
    openingHours: 'Lun – Sam · 10h00 – 20h00',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 60,
  },
];

// Clients fictifs pour peupler les files ouvertes.
const CLIENT_NAMES = [
  'Grâce Mabiala', 'Junior Okemba', 'Merveille Nkounkou', 'Christ Moukoko',
  'Divine Ngoma', 'Exaucé Mboungou', 'Prisca Loubaki', 'Rodrigue Itoua',
  'Fortunat Ndinga', 'Ornella Massamba', 'Jordy Bouanga', 'Chancelvie Ibara',
];

// Clients déjà servis au début de chaque file active.
const SERVED_TICKETS = 3;

const clientName = (index) => CLIENT_NAMES[index % CLIENT_NAMES.length];

// Numéros fictifs distincts (un ticket en cours par numéro et par file).
const clientPhone = (index) => `06${String(5000000 + index).padStart(7, '0')}`;

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('Starting database seed...');

    await client.query('BEGIN');

    await client.query('DELETE FROM tickets');
    await client.query('DELETE FROM queues');
    await client.query('DELETE FROM establishments');

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    for (const establishment of establishments) {
      const result = await client.query(
        `
          INSERT INTO establishments (
            name,
            email,
            password_hash,
            phone,
            category,
            description,
            address,
            district,
            opening_hours,
            queue_status,
            average_service_minutes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `,
        [
          establishment.name,
          establishment.email,
          passwordHash,
          establishment.phone,
          establishment.category,
          establishment.description,
          establishment.address,
          establishment.district,
          establishment.openingHours,
          establishment.queueStatus,
          establishment.averageServiceMinutes,
        ]
      );

      const establishmentId = result.rows[0].id;

      if (establishment.queueStatus === 'CLOSED') {
        continue;
      }

      // File active (OPEN ou PAUSED) : quelques clients déjà servis, un client
      // au guichet si la file est ouverte, puis les tickets en attente.
      const waitingTickets = establishment.waitingTickets ?? 0;
      const statuses = [
        ...Array(SERVED_TICKETS).fill('COMPLETED'),
        ...(establishment.queueStatus === 'OPEN' ? ['SERVING'] : []),
        ...Array(waitingTickets).fill('WAITING'),
      ];

      const queueResult = await client.query(
        `
          INSERT INTO queues (
            establishment_id,
            status,
            last_number,
            opened_at
          )
          VALUES ($1, $2, $3, NOW() - INTERVAL '2 hours')
          RETURNING id
        `,
        [establishmentId, establishment.queueStatus, statuses.length]
      );

      const queueId = queueResult.rows[0].id;

      for (const [index, status] of statuses.entries()) {
        await client.query(
          `
            INSERT INTO tickets (
              queue_id,
              number,
              name,
              phone,
              cancel_token,
              status,
              created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW() - ($7 * INTERVAL '4 minutes'))
          `,
          [
            queueId,
            index + 1,
            clientName(index),
            clientPhone(index + 1),
            crypto.randomBytes(32).toString('hex'),
            status,
            statuses.length - index,
          ]
        );
      }
    }

    await client.query('COMMIT');

    console.log(
      `Database seed completed successfully (${establishments.length} establishments).`
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

seed();