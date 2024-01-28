import { model, Schema, Document } from 'mongoose';
import { UserDocument } from './User';


export interface TokenDocument extends Document {
  userID: UserDocument['id'];
  token: string;
}

const tokenSchema = new Schema<TokenDocument>({
    userID: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Missing userID, Token"]
    },
    token: {
        type: String,
        required: [true, "Missing token, Token"]
    }
});

export const Token = model<TokenDocument>('Token', tokenSchema);

  