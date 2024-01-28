import { model, Schema, Document } from 'mongoose';
import Joi from 'joi';


export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  verified: boolean;
}

function validate(user: any, login: boolean = false): Joi.ValidationResult {
  let schema: Joi.ObjectSchema<UserDocument>;

  if (login) {
    schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
  } else {
    schema = Joi.object<UserDocument>({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });
  }

  return schema.validate(user);
}

const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: [true, 'Username is not Provided'],
  },
  email: {
    type: String,
    required: [true, 'Email must be Provided'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a Password for the Account'],
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const User = model<UserDocument>('User', userSchema);

export { User, validate };
