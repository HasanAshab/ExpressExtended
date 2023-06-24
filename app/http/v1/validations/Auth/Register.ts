import {
  ValidationSchema
} from "types";
import Joi from "joi";
import FileValidator from "illuminate/utils/FileValidator";


const schema: ValidationSchema = {
  urlencoded: {
    target: "body",
    rules: Joi.object({
      name: Joi.string().min(3).max(12).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      password_confirmation: Joi.string().required().valid(Joi.ref("password")),
    })
  },
  multipart: FileValidator.schema({
    logo: FileValidator.required().parts(1).max(1000*1000).mimetypes("image/jpeg", "image/png"),
  })
}

export default schema;