const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");

const NO_OPTIONS = [/^blank.?$/, /^empty.?$/, /^no.?$/, /^none.?$/, /^nothing.?$/, /^n\/a.?$/];

async function run() {
  const changelog = core.getInput("changelog");

  try {
    const { number, body } = github.context.payload.pull_request;

    // From https://github.com/electron/clerk/blob/d1b31d84a2e15a47c1766359cd2ac493415a7cc1/src/note-utils.ts#L8
    const notes = /(?:(?:\r?\n)|^)notes:(.+?)(?:(?:\r?\n)|$)/gi.exec(body);

    if (!notes || !notes[1] || NO_OPTIONS.includes(notes[1])) {
      console.log("No `Notes:` found for PR, skipping.");
      return;
    }

    console.log(`Notes: ${notes[1].trim()}`);

    const data = fs.readFileSync(changelog).toString();

    const { index } = /\n##/.exec(data);

    fs.writeFileSync(
      changelog,
      `${data.slice(
        0,
        index,
      )}* ${notes[1].trim()} [#${number}](https://github.com/DestinyItemManager/DIM/pull/${number})\n${data.slice(
        index,
      )}`,
    );
  } catch (error) {
    core.setFailed(`${error.message}`);
  }
}

run();
