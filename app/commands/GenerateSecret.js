const Command = require("./Command");
const crypto = require('crypto');
const { setEnv } = require('../../helpers');

class GenerateSecret extends Command {
  handle = () => {
    const key = this.subCommand.toUpperCase() + "_SECRET";
    const secret = crypto.randomBytes(32).toString("hex");
    let obj = {};
    obj[key] = secret;
    setEnv(obj);
    this.success(`Secret generated: ${secret}`);
  };
}

module.exports = GenerateSecret;
