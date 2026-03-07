import mongoose from 'mongoose';
import { connectDB } from './db';
import { Hospital } from './models/Hospital';
import { mockHospitals } from './mocks';

const seedDatabase = async () => {
    await connectDB();

    try {
        console.log('Clearing existing hospitals...');
        await Hospital.deleteMany({});

        console.log('Seeding hospitals from mocks...');

        // the mockHospitals have an string "id", but mongoose uses "_id".
        // We can map the data to remove the mock "id" and let mongo generate ObjectIds.
        const hospitalsToInsert = mockHospitals.map(({ id, ...rest }) => rest);

        const inserted = await Hospital.insertMany(hospitalsToInsert);
        console.log(`Successfully seeded ${inserted.length} hospitals.`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        console.log('Disconnecting from database...');
        await mongoose.disconnect();
    }
};

seedDatabase();
