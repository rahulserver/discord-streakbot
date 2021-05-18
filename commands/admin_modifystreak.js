let COMMAND = "admin_modifyscore";
const DB_UTILS = require('../utils/dbUtils');
const DISCORD_UTILS = require('../utils/discordUtils');
const SCORE = 0.5;
const forown = require('lodash.forown');
const AUTH_RULES = require('../config/authRules.json');
let processCommand = async (msg, params, tiers, streaks) => {
  try {
    await commandValidator(msg, params, tiers);
    let user = DISCORD_UTILS.findUserByName(msg, params[0]);
    let oldScoreObj = await DB_UTILS.getScoreObj(user.id);
    params[1] = parseInt(params[1]);
    await DB_UTILS.setday(user.id, params[1]);
    let updatedScoreObj = await calculateScore(user.id, params[1], oldScoreObj);
    if (updatedScoreObj && updatedScoreObj.total_score) {
      await updateRoleOfUserGivenScore(msg, updatedScoreObj.total_score, params[0], tiers);
      await updateStreakRoleOfUser(msg, user.id, params[1], streaks);
    }

    // let total = await DB_UTILS.addScore(user.id, parseFloat(params[1]));
    // updateRoleOfUserGivenScore(msg, total, params[0], tiers);
    msg.reply("Streak for " + params[0] + " updated successfully to "+params[1]+" amounting to a total score of: " + updatedScoreObj.total_score);
  } catch (e) {
    msg.reply("couldn't run " + COMMAND + " due to " + e.message);
  }
};

let calculateScore = async (discord_id, days, oldScoreObj) => {
  let oldStreak;
  if (!oldScoreObj) {
    oldStreak = 0;
  } else {
    oldStreak = oldScoreObj.streak;
  }
  let difference = days - oldStreak;
  if (difference < 0) {
    // TODO: warn moderators
  }

  await DB_UTILS.addScore(discord_id, difference);
  return DB_UTILS.setField(discord_id, "last_streak", new Date());
};

let commandValidator = async (msg, params, tiers) => {
  try {
    let streak = parseInt(params[1]);
    if (isNaN(streak)) {
      throw new Error("Day must be a valid number");
    }
    if (AUTH_RULES[COMMAND]) {
      if (!DISCORD_UTILS.hasRoleGreaterThanEqualTo(msg, AUTH_RULES[COMMAND])) {
        throw new Error("You are not authorized to run this command!");
      }
    }

    return true;
  } catch (e) {
    throw e;
  }
};

let updateRoleOfUserGivenScore = (msg, updatedScore, username, tiers) => {
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
    return DISCORD_UTILS.addTierRoleTo(Object.keys(theTier)[0], msg, username, tiers);
  } else {
    // return empty promise
    return Promise.resolve();
  }
};

let updateStreakRoleOfUser = (msg, userId, streak, streaks) => {
  let theStreakRoleName = null;
  forown(streaks, function (value, key) {
    if (streak >= value) {
      if (!theStreakRoleName) {
        theStreakRoleName = key;
      }
    }
  });

  return DISCORD_UTILS.addStreakRoleTo(theStreakRoleName, userId, msg, streaks);
};

module.exports = {
  processCommand: processCommand
}