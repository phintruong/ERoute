import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;

const hospitals = [
  {
    name: 'Toronto General Hospital',
    city: 'toronto',
    latitude: 43.6592,
    longitude: -79.3882,
    totalBeds: 471,
    erBeds: 60,
    phone: '416-340-4800',
    website: 'https://www.uhn.ca'
  },
  {
    name: "St. Michael's Hospital",
    city: 'toronto',
    latitude: 43.6537,
    longitude: -79.3777,
    totalBeds: 463,
    erBeds: 55,
    phone: '416-360-4000',
    website: 'https://unityhealth.to'
  },
  {
    name: 'Sunnybrook Health Sciences Centre',
    city: 'toronto',
    latitude: 43.7224,
    longitude: -79.3725,
    totalBeds: 1325,
    erBeds: 72,
    phone: '416-480-6100',
    website: 'https://sunnybrook.ca'
  },
  {
    name: 'Mount Sinai Hospital',
    city: 'toronto',
    latitude: 43.6575,
    longitude: -79.3906,
    totalBeds: 442,
    erBeds: 40,
    phone: '416-596-4200',
    website: 'https://www.sinaihealth.ca'
  },
  {
    name: 'Toronto Western Hospital',
    city: 'toronto',
    latitude: 43.6536,
    longitude: -79.4054,
    totalBeds: 272,
    erBeds: 45,
    phone: '416-603-2581',
    website: 'https://www.uhn.ca'
  },
  {
    name: 'Scarborough Health Network - General',
    city: 'toronto',
    latitude: 43.7315,
    longitude: -79.2548,
    totalBeds: 620,
    erBeds: 50,
    phone: '416-438-2911',
    website: 'https://www.shn.ca'
  },
  {
    name: 'North York General Hospital',
    city: 'toronto',
    latitude: 43.7663,
    longitude: -79.3655,
    totalBeds: 420,
    erBeds: 48,
    phone: '416-756-6000',
    website: 'https://www.nygh.on.ca'
  },
  {
    name: 'Humber River Hospital',
    city: 'toronto',
    latitude: 43.7556,
    longitude: -79.5167,
    totalBeds: 656,
    erBeds: 52,
    phone: '416-747-3400',
    website: 'https://www.hrh.ca'
  }
];

async function seed() {
  if (!uri) {
    console.error('MONGODB_URI not set. Pass it as an environment variable.');
    console.error('Usage: MONGODB_URI="mongodb+srv://..." npx tsx scripts/seedHospitals.ts');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('clearpath');

    await db.collection('hospitals').deleteMany({});
    const result = await db.collection('hospitals').insertMany(hospitals);
    console.log(`Inserted ${result.insertedCount} hospitals`);

    const count = await db.collection('hospitals').countDocuments();
    console.log(`Total hospitals in collection: ${count}`);

    if (count > 0) {
      console.log('Seed completed successfully');
    } else {
      console.error('Seed failed — no documents found');
      process.exit(1);
    }
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
