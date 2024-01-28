import { Document, Schema, model } from 'mongoose';
import Joi from 'joi';
import { UserDocument } from './User';
import { CheckDocument } from './urlCheck';

interface ReportHistory {
  timestamp: Date;
  status: 'available' | 'unavailable' | 'error' | '-';
  availability: number;
}

export interface ReportDocument extends Document {
  urlID: CheckDocument['id'];
  userID: UserDocument['id'];
  status: 'available' | 'unavailable' | 'error' | '-';
  availability: number;
  outages: number;
  downtime: number;
  uptime: number;
  responseTime: number;
  history: ReportHistory[];
}

const reportSchema = new Schema<ReportDocument> ({
  urlID: {
    type: Schema.Types.ObjectId,
    ref: 'Check',
    required: [true, 'Missing Check IO'],
  },
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Missing User ID'],
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'error', '-'],
    default: '-',
  },
  availability: {
    type: Number,
    default: 0,
  },
  outages: {
    type: Number,
    default: 0,
  },
  downtime: {
    type: Number,
    default: 0,
  },
  uptime: {
    type: Number,
    default: 0,
  },
  responseTime: {
    type: Number,
    default: 0,
  },
  history: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['available', 'unavailable', 'error', '-'],
        default: '-',
      },
      availability: {
        type: Number,
        default: 0,
      },
    },
  ],
});

const Report = model<ReportDocument>('Report', reportSchema);

function validateReport(report: any): Joi.ValidationResult {
  const schema = Joi.object({
    status: Joi.string().valid('available', 'unavailable', 'error', '-'),
    availability: Joi.number().min(0),
    outages: Joi.number().min(0),
    downtime: Joi.number().min(0),
    uptime: Joi.number().min(0),
    responseTime: Joi.number().min(0),
    history: Joi.array().optional(),
  });

  return schema.validate(report);
}

export { Report, validateReport };

