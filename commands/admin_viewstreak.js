let COMMAND = "admin_viewstreak";
const DB_UTILS = require('../utils/dbUtils');
const DISCORD_UTILS = require('../utils/discordUtils');
const forown = require('lodash.forown');
const AUTH_RULES = require('../config/authRules.json');
let processCommand = async (msg, params, tiers) => {
  try {
    await commandValidator(msg, params, tiers);
    let user = DISCORD_UTILS.findUserByName(msg, params[0]);
    let scoreObj = await DB_UTILS.getScoreObj(user.id, parseInt(params[1]));
    msg.reply("Streak for " + params[0] + " is " + scoreObj.streak);
  } catch (e) {
    msg.reply("couldn't run " + COMMAND + " due to " + e.message);
  }
};

let commandValidator = async (msg, params, tiers) => {
  try {
    if (AUTH_RULES[COMMAND]) {
      if (DISCORD_UTILS.hasRoleGreaterThanEqualTo(msg, AUTH_RULES[COMMAND])) {
        return true;
      } else {
        throw new Error("You are not authorized to run this command");
      }
    }
    return true;
  } catch (e) {
    throw e;
  }
};

module.exports = {
  processCommand: processCommand
}