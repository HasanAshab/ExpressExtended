import { model, Schema, Document, InferSchemaType } from "mongoose";
import URL from "illuminate/utils/URL"
import bcrypt from "bcryptjs";
import Mailable from "illuminate/mails/Mailable";
import Authenticatable, { IAuthenticatable } from "app/plugins/Authenticatable";
import Timestamps, { ITimestamps } from "app/plugins/Timestamps";
import HasFactory, { IHasFactory } from "app/plugins/HasFactory";
import HasApiTokens, { IHasApiTokens } from "app/plugins/HasApiTokens";
import Notifiable, { INotifiable } from "app/plugins/Notifiable";
import Mediable, { IMediable } from "app/plugins/Mediable";

const UserSchema = new Schema({
  name: {
    type: String,
    maxlength: 12,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  logoUrl: {
    type: String,
    default: URL.resolve("/static/user-profile.jpg"),
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true
  },
});

UserSchema.pre("save", async function(next) {
  const bcryptRounds = Number(process.env.BCRYPT_ROUNDS);
  if (!this.isModified("password")) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, bcryptRounds);
  this.password = hash as string;
  next();
});

UserSchema.plugin(Authenticatable);
UserSchema.plugin(Timestamps);
UserSchema.plugin(HasFactory);
UserSchema.plugin(HasApiTokens);
UserSchema.plugin(Notifiable);
UserSchema.plugin(Mediable);

type IPlugins = IAuthenticatable & ITimestamps & IHasFactory & IHasApiTokens & INotifiable & IMediable;
export interface IUser extends Document, InferSchemaType<typeof UserSchema>, IPlugins {}

export default model<IUser>("User", UserSchema);