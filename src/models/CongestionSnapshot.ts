import mongoose, { Schema, Document } from 'mongoose';

export interface ICongestionSnapshot extends Document {
    hospitalId: mongoose.Types.ObjectId;
    timestamp: Date;
    liveWaitTime: number;
    baselineWaitTime: number;
    mergedCongestionScore: number;
}

const CongestionSnapshotSchema: Schema = new Schema({
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    liveWaitTime: { type: Number, required: true },
    baselineWaitTime: { type: Number, required: true },
    mergedCongestionScore: { type: Number, required: true }
});

export const CongestionSnapshot = mongoose.models.CongestionSnapshot || mongoose.model<ICongestionSnapshot>('CongestionSnapshot', CongestionSnapshotSchema);
