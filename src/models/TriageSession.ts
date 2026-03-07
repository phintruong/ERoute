import mongoose, { Schema, Document } from 'mongoose';

export interface ITriageSession extends Document {
    patientId?: string;
    hospitalId: mongoose.Types.ObjectId;
    symptoms: string[];
    assignedPriority: number;
}

const TriageSessionSchema: Schema = new Schema({
    patientId: { type: String },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    symptoms: [{ type: String }],
    assignedPriority: { type: Number, required: true }
}, {
    timestamps: true
});

export const TriageSession = mongoose.models.TriageSession || mongoose.model<ITriageSession>('TriageSession', TriageSessionSchema);
