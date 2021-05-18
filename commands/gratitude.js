let COMMAND = "gratefulness";
const DB_UTILS = require('../utils/dbUtils');
const DISCORD_UTILS = require('../utils/discordUtils');
const SCORE = 0.1;
const forown = require('lodash.forown');
let processCommand = async (msg, params, tiers) => {
  try {
    await commandValidator(msg, params, tiers);
    let newScore = await calculateScore(msg.author.id);
    await DB_UTILS.setField(msg.author.id, "last_gratefulness", new Date());
    let score = await DB_UTILS.getField(msg.author.id, "total_score");
    msg.reply(SCORE + " point added successfully for today's gratefulness!\nYour score is now "+score);
  } catch (e) {
    msg.reply("couldn't run " + COMMAND + " due to " + e.message);
  }
};

let calculateScore = (discord_id) => {
  return DB_UTILS.addScore(discord_id, SCORE);
};

let commandValidator = async (msg, params, tiers) => {
  // validation for ensuring this user has set day already
  let scoreObj = await DB_UTILS.getScoreObj(msg.author.id);
  if (!scoreObj) {
    throw new Error("You must set your day first");
  }

  // validation for duplicate setting in same day
  try {
    let last_gratefulness = await DB_UTILS.getField(msg.author.id, "last_gratefulness");
    if (last_gratefulness) {
      let UTC_DATE = last_gratefulness.getUTCDate();
      let UTC_DATE_CUR = new Date().getUTCDate();
      if (UTC_DATE === UTC_DATE_CUR) {
        // command invalid because two commands in same day not allowed
        throw new Error("You have already gained gratefulness points for today. Wait for next day(in UTC)");
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