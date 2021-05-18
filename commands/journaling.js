let COMMAND = "reddit";
const DB_UTILS = require('../utils/dbUtils');
const DISCORD_UTILS = require('../utils/discordUtils');
const REDDIT_SCRAPER = require('../utils/redditScraper');
const SCORE = 0.6;
const forown = require('lodash.forown');
let processCommand = async (msg, params, tiers) => {
  try {
    await commandValidator(msg, params, tiers);
    let newScore = await calculateScore(msg.author.id);
    await DB_UTILS.setField(msg.author.id, "last_reddit", new Date());
    let score = await DB_UTILS.getField(msg.author.id, "total_score");
    msg.reply(SCORE + " point added successfully for today's journal!\nYour score is now "+score);
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

  // validate for URL passed
  // if(!params[0]) {
  //   throw new Error("Pass your reddit post url with this command. Run !list for command syntax");
  // }
  // // validation for reddit post link
  // try {
  //   await REDDIT_SCRAPER.postValid(params[0], msg.author.username);
  // } catch (e) {
  //   throw e;
  // }

  // validation for duplicate setting in same day
  try {
    let last_reddit = await DB_UTILS.getField(msg.author.id, "last_reddit");
    if (last_reddit) {
      let UTC_DATE = last_reddit.getUTCDate();
      let UTC_DATE_CUR = new Date().getUTCDate();
      if (UTC_DATE === UTC_DATE_CUR) {
        // command invalid because two commands in same day not allowed
        throw new Error("You have already gained journaling points for today. Wait for next day(in UTC)");
      }
    }
  } catch (e) {
    throw e;
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
    return Promise.resolve();
  }
};
module.exports = {
  processCommand: processCommand
}