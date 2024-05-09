#!/usr/bin/env node

const axios = require("axios");
const { Command } = require("commander");
const chalk = require("chalk");
const figlet = require("figlet");
const pkg = require("../package.json");

const log = console.log;
const program = new Command();

const VERSION = pkg.version;
const DESCRIPTION = pkg.description;
const NAME = pkg.name;
const BASE_URL = "https://www.toptal.com/developers/gitignore/api/";
const LIST_URL = `${BASE_URL}list`;
const LOGO = `${chalk.green.bold(figlet.textSync(NAME))}`;

const fetchSupportStacks = () => {
  return axios.get(LIST_URL).then(({ data }) => {
    const supportStacks = data.replace(/\n/g, ",").split(",");
    return supportStacks;
  });
};

const generateStackOptions = () => {
  fetchSupportStacks().then((supportStacks) => {
    log(chalk.green("\nAvailable Stacks\n"));
    log(supportStacks.join(","));
    log("\n");
  });
};

const isStackValid = (stackArray) => {
  return fetchSupportStacks().then((supportStacks) => {
    let notSupportStacks = [];
    let usedStacks = [];
    stackArray.forEach((stack) => {
      if (!supportStacks.includes(stack)) {
        notSupportStacks.push(stack);
      } else {
        usedStacks.push(stack);
      }
    });

    if (notSupportStacks.length > 0) {
      log(chalk.red.bold("The following stack are not supported: "));
      log(`${notSupportStacks.join(",")}\n`);
    }

    return usedStacks;
  });
};

const fetchStack = (stackArray) => {
  const encodedURI = encodeURIComponent(stackArray.join(","));
  const STACK_URL = `${BASE_URL}${encodedURI}`;
  return axios.get(STACK_URL).then(({ data }) => data);
};

const generateStackContent = async (args) => {
  if (args.length < 1) return;
  const stacks = await isStackValid(args);
  const content = await fetchStack(stacks);
  process.stdout.write(content);
};

program
  .name(NAME)
  .version(VERSION)
  .description(`${LOGO}\n\n${DESCRIPTION}`)
  .argument("[stack_name...]", "stack name");
program
  .option("-l, --list", "list all available stacks")
  .option(
    "-s, --search <stack_name>",
    `search stack with specific name (separate different names with commas, such as "node,java")`
  )
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

const args = program.args;
const options = program.opts();

if (options.list) {
  generateStackOptions();
}

if (options.search) {
  isStackValid(options.search.split(","));
}

generateStackContent(args);
