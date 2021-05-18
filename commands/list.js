let COMMAND = "list";
let COMMAND_LIST = [
  "DAILY_TASKS: ",
  "cold_shower",
  "ice_shower",
  "meditation",
  "exercise",
  "gratefulness",
  "journaling",
  "social",
  "growth",
  "setday DAY_NUMBER",
  "\nOTHER_COMMANDS",
  "getday",
  "getscore",
  "relapse",
  "emergency <<religious>>",
  "leaderboard",
  "\nADMIN_ONLY COMMANDS",
  "admin_modifyscore USERNAME SCORE_TO_ADD",
  "admin_viewscore USERNAME",
  "admin_viewstreak USERNAME",
  "admin_purgelist <days inactive>",
  "admin_purgewarn <days inactive>",
  "admin_purgeremove <days inactive>",
];
let processCommand = async (msg, params, tiers) => {
  try {
    msg.reply("Stuff within <<>> are optional\nStuff in capitals are params.\nAvailable commands are:\n" + COMMAND_LIST.join("\n"));
  } catch (e) {
    msg.reply("couldn't run " + COMMAND + " due to " + e.message);
  }
};

module.exports = {
  processCommand
}