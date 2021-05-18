let COMMAND = "setday";
const DB_UTILS = require('../utils/dbUtils');
const DISCORD_UTILS = require('../utils/discordUtils');
const SCORE = 1.5;
const forown = require('lodash.forown');
let processCommand = async (msg, params, tiers, streaks) => {
  try {
    await commandValidator(msg, params, tiers);
    let oldScoreObj = await DB_UTILS.getScoreObj(msg.author.id);
    params[0] = parseInt(params[0]);
    await DB_UTILS.setday(msg.author.id, params[0]);
    let updatedScoreObj = await calculateScore(msg.author.id, params[0], oldScoreObj);
    // BEGIN role assignment
    if (updatedScoreObj && updatedScoreObj.total_score) {
      // await updateRoleGivenScore(msg, updatedScoreObj.total_score, tiers);
      await updateStreak(msg, params[0], streaks);
    }
    // END role assignment
    msg.reply("day set successfully!");
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

  await DB_UTILS.addScore(discord_id, difference*SCORE);
  return DB_UTILS.setField(discord_id, "last_streak", new Date());
};

let commandValidator = async (msg, params, tiers) => {
  // validation for duplicate setting in same day
  try {
    let day = parseInt(params[0]);
    if (isNaN(day)) {
      throw new Error("The day should be a valid number");
    }
    return true;
    // TODO:
    // calculate if days being set are valid according to his last set date
    let last_streak = await DB_UTILS.getField(msg.author.id, "last_streak");
    let streak = await DB_UTILS.getField(msg.author.id, "streak");
    if (last_streak) {
      let last_streak_timestamp = last_streak.getTime();
      let current_timestamp = new Date().getTime();
      console.log("timestamps", current_timestamp, last_streak_timestamp);
      let difference = current_timestamp - last_streak_timestamp;
      console.log("streak",streak);
      console.log("difference",difference);
      let differenceDays = Math.floor(difference / (1000 * 60 * 60 * 24));
      let validStreak = streak + differenceDays;
      console.log("valid streak = ",validStreak);
      console.log("diff = ",Math.abs(validStreak - streak));

      if (Math.abs(validStreak - day) >= 2) {
        throw new Error("Your streak must be around " + validStreak + ". You need to !relapse or contact a moderator");
      }
      // if (UTC_DATE === UTC_DATE_CUR) {
      //   // command invalid because two commands in same day not allowed
      //   throw new Error("You have already set the day today. Wait for next day(in UTC)");
      // }
    } else {
      // this is the first time user is setting the streak. so do nothing.
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
    console.log("thetier=", theTier);
    return DISCORD_UTILS.addTierRole(Object.keys(theTier)[0], msg, tiers);
  } else {
    // return empty promise
    return Promise.resolve();
  }
};

let updateStreak = (msg, streak, streaks) => {
  let theStreakRoleName = null;
  forown(streaks, function (value, key) {
    if (streak >= value) {
      if (!theStreakRoleName) {
        theStreakRoleName = key;
      }
    }
  });

  return DISCORD_UTILS.addStreakRole(theStreakRoleName, msg, streaks);
};
module.exports = {
  processCommand: processCommand
}