let COMMAND = "admin_viewscore";
const DB_UTILS = require('../utils/dbUtils');
const DISCORD_UTILS = require('../utils/discordUtils');
const SCORE = 0.5;
const forown = require('lodash.forown');
const AUTH_RULES = require('../config/authRules.json');
let processCommand = async (msg, params, tiers) => {
  try {
    await commandValidator(msg, params, tiers);
    let user = DISCORD_UTILS.findUserByName(msg, params[0]);
    let scoreObj = await DB_UTILS.getScoreObj(user.id, parseInt(params[1]));
    msg.reply("Score for " + params[0] + " is " + scoreObj.total_score);
  } catch (e) {
    msg.reply("couldn't run " + COMMAND + " due to " + e.message);
  }
};

let calculateScore = (discord_id) => {
  return DB_UTILS.addScore(discord_id, SCORE);
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

let updateRoleGivenScore = (msg, updatedScore, tiers) => {
  // find proper role name from tiers
  let theTier = null;
  forown(tiers, function (value, key) {
    if (updatedScore >= value.pts) {
      if (!theTier) {
        theTier = {};
        theTier[key] = value;
      }
    }
  });


  if (theTier) {
    return DISCORD_UTILS.addTierRole(Object.keys(theTier)[0], msg, tiers);
  } else {
    // return empty promise
    return Promise.resolve();
  }
};
module.exports = {
  processCommand: processCommand
}