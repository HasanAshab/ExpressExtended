const joi = require('joi'); 

class UpdateProfile {

  static schema = {
    urlencoded: {
      target: 'body',
      rules:joi.object({
        name: joi.string().min(3).max(12).required(),
        email: joi.string().email().required(),
      })
    },
    /*
    multipart: {
      profile: {
        required: false,
        mimetypes: ['image/jpeg', 'image/png'],
        maxFiles: 1,
        max: 1000*1000,
      },
    }
    */
  }

}

module.exports = UpdateProfile;
