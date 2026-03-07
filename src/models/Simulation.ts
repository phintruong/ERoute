import mongoose, { Schema, Document } from 'mongoose';

export interface ISimulation extends Document {
    name: string;
    status: string;
    params: Record<string, any>;
}

const SimulationSchema: Schema = new Schema({
    name: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    params: { type: Schema.Types.Mixed }
}, {
    timestamps: true
});

export const Simulation = mongoose.models.Simulation || mongoose.model<ISimulation>('Simulation', SimulationSchema);
