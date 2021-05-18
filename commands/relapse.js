let COMMAND = "relapse";
const DB_UTILS = require('../utils/dbUtils');
const DISCORD_UTILS = require('../utils/discordUtils');
const forown = require('lodash.forown');
let scraper = require("../utils/nofapScraper");
let processCommand = async (msg, params, tiers, streaks) => {
  try {
    await commandValidator(msg, params, tiers);
    await DB_UTILS.setField(msg.author.id, "streak", 0);
    await DB_UTILS.setField(msg.author.id, "last_streak", null);
    let newScore = await DB_UTILS.setScore(msg.author.id, 0);
    await updateStreak(msg, 0, streaks);
    let data = await scraper.scrapeNofap("relapse");
    msg.reply("You relapsed and fell below ranks to a score of " + newScore+"\nJust don't be dejected "+data);
  } catch (e) {
    msg.reply("couldn't run " + COMMAND + " due to " + e.message);
  }
};

let calculateScore = (discord_id, params, tiers, roles) => {
  // get member's role
  let theTier = null;
  let roleName;

  roles.every((role, index) => {
    if (tiers[role.name]) {
      theTier = tiers[role.name];
      roleName = role.name;
      return false;
    }

    return true;
  });

  if (theTier) {
    // find the mid point of the tier
    let mid = Math.ceil((theTier.tier + 20) / 2);
    let roleName = null;
    // find the tier role corresponding to this tier level
    forown(tiers, (value, key) => {
      if (value.tier == mid) {
        roleName = key;
        return false;
      }
    });
    if (roleName) {
      return DB_UTILS.setScore(discord_id, tiers[roleName].pts);
    }
  }

  return Promise.resolve();
};

let commandValidator = async (msg, params, tiers, streaks) => {
  let scoreObj = await DB_UTILS.getScoreObj(msg.author.id);
  if (!scoreObj) {
    throw new Error("You must set your day first");
  }

  return true;
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
    return Promise.resolve(0);
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
}

module.exports = {
  processCommand: processCommand
}