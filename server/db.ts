import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Please provide your MongoDB connection string.",
  );
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("[MongoDB] Connected successfully"))
  .catch((err) => console.error("[MongoDB] Connection error:", err));

export const monitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  interval: { type: Number, required: true, default: 5 },
  status: { type: String, required: true, default: "checking" },
  lastChecked: { type: String, default: null },
  responseTime: { type: Number, default: null },
  uptimePercentage: { type: Number, default: 100 },
  totalChecks: { type: Number, default: 0 },
  successfulChecks: { type: Number, default: 0 },
  passwordHash: { type: String, required: true },
}, { timestamps: false });

export const pingResultSchema = new mongoose.Schema({
  monitorId: { type: String, required: true, index: true },
  status: { type: String, required: true },
  responseTime: { type: Number, default: null },
  timestamp: { type: String, required: true },
}, { timestamps: false });

monitorSchema.virtual('id').get(function() {
  return this._id.toString();
});

pingResultSchema.virtual('id').get(function() {
  return this._id.toString();
});

monitorSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (_doc, ret) => { delete ret._id; return ret; } });
monitorSchema.set('toObject', { virtuals: true, versionKey: false, transform: (_doc, ret) => { delete ret._id; return ret; } });
pingResultSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (_doc, ret) => { delete ret._id; return ret; } });
pingResultSchema.set('toObject', { virtuals: true, versionKey: false, transform: (_doc, ret) => { delete ret._id; return ret; } });

export const MonitorModel = mongoose.model("Monitor", monitorSchema);
export const PingResultModel = mongoose.model("PingResult", pingResultSchema);

export default mongoose;
