import ArtisanError from "illuminate/exceptions/utils/ArtisanError";

export type Foo<Keys extends string[]> = {
  [Key in Keys[number]]: string;
}


export default abstract class Command {
  constructor(
    public subCommand?: string,
    public fromShell: boolean = true,
    public flags: string[] = [],
    public params: Record<string, string> = {}
  ) {
    this.subCommand = subCommand;
    this.fromShell = fromShell;
    this.flags = flags;
    this.params = params;
  }

  subCommandRequired(name: string): asserts this is this & { subCommand: string } {
    if (typeof this.subCommand === "undefined") {
      throw ArtisanError.type("SUB_COMMAND_REQUIRED").create({ name });
    }
  }

  requiredParams<Keys extends string[]>(requiredParamsName: Keys): asserts this is this & {params: Foo<Keys>} {
    for (const name of requiredParamsName) {
      if (typeof this.params[name] === "undefined") {
        throw ArtisanError.type("REQUIRED_PARAM_MISSING").create({ param: name });
      }
    }
  }

  info(text: string) {
    if (this.fromShell) console.log("\x1b[33m", text, "\x1b[0m");
  }

  success(text = "") {
    if (this.fromShell) {
      console.log("\x1b[32m", "\n", text, "\n", "\x1b[0m");
      process.exit(0);
    }
  }

  error(text = "") {
    if (this.fromShell) {
      console.log("\x1b[31m", "\n", text, "\n", "\x1b[0m");
      process.exit(1);
    }
  }
}
