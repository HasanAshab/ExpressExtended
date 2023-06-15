import {
  ObjectSchema
} from "joi";
import FileValidator from "illuminate/utils/FileValidator";
import Mailable from "illuminate/mails/Mailable";
import middlewarePairs from "register/middlewares";

export type RawResponse = {
  status?: number,
  message?: string,
  data?: any[] | Record < string,
  any >
} & Record < string, any >;

export type ApiResponse = {
  success: boolean,
  message?: string,
  data?: any[] | any,
};

export type Recipient = {
  from: string,
  to: string,
  subject: string,
  template: string,
  context: Record < string,
  any >
};


export type RecipientEmails = string | string[] | ({
  email: string
} & Record < string, any >) | ({
  email: string
} & Record < string, any >)[];

export type TransportConfig = {
  host: string,
  port: number,
  secure: boolean,
  auth: {
    user: string,
    pass: string,
  }
}

export type ValidationSchema = {
  urlencoded?: {
    target: "body" | "params" | "query",
    rules: ObjectSchema
  },
  multipart?: FileValidator
}

export type MailMockedData = Record < string, Record < string, {
  mailable: Mailable,
  count: number
}>>;


export type CacheDataArg = string | number | boolean | Buffer;

export type CacheArgs =
| {
  action: "get";
  key: string;
}
| {
  action: "put";
  key: string;
  data: CacheDataArg;
  expiry?: number;
}

| {
  action: "flush";
}

export type CacheDriverHandler = < Action extends CacheArgs["action"], Return = Action extends "get" ? string | null: void > (
  ...args:
  Extract < CacheArgs, {
    action: Action
  } > extends {
    key: string
  }
  ? Extract < CacheArgs, {
    action: Action
  } > extends {
    data: CacheDataArg;
    expiry?: infer Expiry;
  }
  ? [action: Action, key: string, data: CacheDataArg, expiry?: Expiry]
  : [action: Action, key: string]
  : [action: Action]
) => Promise < Return > | Return;