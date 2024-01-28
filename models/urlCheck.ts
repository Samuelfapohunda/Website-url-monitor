import { Document, Schema, model } from 'mongoose';
import Joi from 'joi';
import { UserDocument } from './User';

const intervalTime = 1000 * 60;
const timeoutTime = 5000;
const threshold = 1;

interface IAuthentication {
  username: string;
  password: string;
}

interface IHttpHeaders {
  [key: string]: string;
}

interface IHandle {
  // Define the structure as needed
}

export interface CheckDocument extends Document {
  name: string;
  url: string;
  path?: string;
  userID: UserDocument['id'];
  protocol: 'https:' | 'http:' | 'tcp:';
  port?: number;
  webhook?: string;
  authentication?: IAuthentication | null;
  httpHeaders?: IHttpHeaders;
  tags?: string[];
  timeout: number;
  ignoreSSL: boolean;
  interval: number;
  threshold: number;
  active: boolean;
  handle?: IHandle | null;
}

function validateCheck(check: any, update: boolean = false): Joi.ValidationResult {
  let schema = Joi.object<CheckDocument>({
    name: Joi.string().required().min(5).max(100),
    url: Joi.string().required(),
    path: Joi.string().optional(),
    port: Joi.number().optional().min(0).max(65536),
    webhook: Joi.string().optional(),
    timeout: Joi.number().optional().max(3 * timeoutTime),
    interval: Joi.number().optional().max(3 * intervalTime),
    threshold: Joi.number().optional(),
    authentication: Joi.object({
      username: Joi.string(),
      password: Joi.string(),
    }).optional(),
    httpHeaders: Joi.object().optional(),
    tags: Joi.array().optional(),
    ignoreSSL: Joi.bool().optional(),
  });

  if (update) {
    schema = Joi.object<CheckDocument>({
      name: Joi.string().min(5).max(100),
      url: Joi.string(),
      path: Joi.string(),
      port: Joi.number().min(0).max(65536),
      webhook: Joi.string(),
      timeout: Joi.number().max(3 * timeoutTime),
      interval: Joi.number().max(3 * intervalTime),
      threshold: Joi.number(),
      active: Joi.bool(),
    //   headers: Joi.object().optional(),
      handle: Joi.object(),
      authentication: Joi.object({
        username: Joi.string(),
        password: Joi.string(),
      }),
      httpHeaders: Joi.object(),
      tags: Joi.array(),
      ignoreSSL: Joi.bool(),
    }).optional();
  }

  return schema.validate(check);
}

const urlCheckSchema = new Schema<CheckDocument> ({
  name: {
    type: String,
    required: [true, 'Provide a Name for url check'],
  },
  url: {
    type: String,
    required: [true, 'Check needs URL'],
  },
  path: {
    type: String,
    default: null,
  },
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Missing User ID'],
  },
  protocol: {
    type: String,
    enum: ['https:', 'http:', 'tcp:'],
    required: true,
  },
  port: {
    type: Number,
    default: null,
  },
  webhook: {
    type: String,
    default: null,
  },
  authentication: {
    type: {
      username: String,
      password: String,
    },
    default: null,
  },
  httpHeaders: {
    type: Object,
    default: {},
  },
  tags: {
    type: [String],
    default: [],
  },
  timeout: {
    type: Number,
    default: timeoutTime,
  },
  ignoreSSL: {
    type: Boolean,
    default: true,
  },
  interval: {
    type: Number,
    default: intervalTime,
  },
  threshold: {
    type: Number,
    default: threshold,
  },
  active: {
    type: Boolean,
    default: false,
  },
  handle: {
    type: Object,
    default: null,
  },
});

const Check = model<CheckDocument>('Check', urlCheckSchema);

export { Check, validateCheck };
