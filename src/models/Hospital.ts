import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
    name: string;
    city: string;
    lat: number;
    lng: number;
    erBeds: number;
    totalBeds: number;
    phone: string;
}

const HospitalSchema: Schema = new Schema({
    name: { type: String, required: true },
    city: { type: String, required: true, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    erBeds: { type: Number, required: true },
    totalBeds: { type: Number, required: true },
    phone: { type: String, required: true }
}, {
    timestamps: true
});

export const Hospital = mongoose.models.Hospital || mongoose.model<IHospital>('Hospital', HospitalSchema);
