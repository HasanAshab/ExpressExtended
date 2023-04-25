const Command = require(base('app/commands/Command'));
const User = require(base('app/models/User'));
const componentPaths = require(base('register/componentPaths'));
const fs = require('fs');
const path = require('path');

class Make extends Command {
  admin = async (name, email, password) => {
    await this.connect();
    const user = await User.create({
      name,
      email,
      password,
      isAdmin: true,
      emailVerified: true,
    });
    this.success('Admin account created successfully!');
  }
  
  handle = (name) => {
    try {
      var template = this._getTemplate(name);
    } 
    catch {
      this.error('Component not available');
    }
    const content = template.replace(/{{name}}/g, name);
    const filepath = this._getPath(this.subCommand, name);
    try{
      fs.writeFileSync(base(filepath), content, { flag: 'wx' });
    }
    catch {
      this.error('Component already exist!');
    }
    this.success(`File created successfully: [${filepath}]`);
  };

  _loadDir = (path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  };

  _getTemplate = (name) => {
    const path = (this.hasFlags)
      ? base(`templates/${this.subCommand}/${this.flags[0]}`)
      : base(`templates/${this.subCommand}`);
    return fs.readFileSync(path, 'utf-8');
  }

  _getPath = (componentName, name) => {
    const pathSchema = (this.hasFlags)
      ? componentPaths[componentName][this.flags[0]]
      : componentPaths[componentName];
    return pathSchema.replace('{{name}}', name);
  };
}

module.exports = Make;
