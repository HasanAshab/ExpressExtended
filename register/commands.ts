const commands: {[key: string]: {[key: string]: string}} = {
  invoked: {
    test: "app/commands/Test",
    secret: "app/commands/GenerateSecret",
    doc: "app/commands/GenerateDoc",
    seed: "app/commands/Seed"
  },
  
  nested: {
    make: "app/commands/Make",
    clear: "app/commands/Clear"
  }
}

export default commands;