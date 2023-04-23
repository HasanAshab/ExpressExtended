// Register all commands here
commands = {
  invoked: {
    'test': 'app/commands/Test'
  },
  
  nested: {
    'make': 'app/commands/Make',
    'secret': 'app/commands/GenerateSecret',
    'clear': 'app/commands/Clear',
  }
}

module.exports = commands;