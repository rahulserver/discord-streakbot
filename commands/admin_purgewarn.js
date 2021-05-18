let COMMAND = "admin_purgewarn";
const DB_UTILS = require('../utils/dbUtils');
const DISCORD_UTILS = require('../utils/discordUtils');
const SCORE = 0.5;
const forown = require('lodash.forown');
const AUTH_RULES = require('../config/authRules.json');
let processCommand = async (msg, params, tiers) => {
  try {
    await commandValidator(msg, params, tiers);
    let days = parseInt(params[0]);
    if (isNaN(days)) {
      // 30 days default duration
      days = 30;
    }
    let inactives = await DB_UTILS.getInactives(days);
    let output = "";
    let count = 0;
    let inactiveArray = [];
    inactives.map((item, index) => {
      let user = DISCORD_UTILS.findUserById(msg, item.discord_id);
      let name, days;
      if (!!user) {
        inactiveArray.push(user);
      }
    })
    let success = 0;
    let failure = 0;
    await msg.channel.send("Starting to send messages to inactive people who have atleast used the bot once...");
    for (var ind = 0; ind < inactiveArray.length; ind++) {
      let message = "Greetings! You haven't updated your progress or reported accomplishment of daily disciplines at the Heir Academy for over 30 days.  Be sure to report to the <#543115614953406474> channel and check in with me within 24 hours to get your ID off the prune list!";
      try {
        await inactiveArray[ind].send(message);
        success++;
      } catch {
        failure++;
      }
    }
    await msg.channel.send("Messages sent to inactive people. Successes=" + success + ". Failures=" + failure + ". Now starting to send messages to non bot users");
    // find the users who haven't used the bot yet for streak or daily activities(hence don't exist in our db)
    let entries = await DB_UTILS.getAll();
    let notUsedBotYet = [];
    if (entries && entries.length > 0) {
      let members = msg.guild.members;
      members.array().forEach(member => {
        let memberId = member.id;
        if (entries.filter(item => {
          return item.discord_id == memberId
        }).length <= 0) {
          let joinedAtTs = member.joinedAt.getTime();
          let cur = new Date();
          if (joinedAtTs < cur.setDate(cur.getDate() - days)) {
            notUsedBotYet.push(member);
          }
        }
      })
    }
    success = 0, failure = 0;
    for (var ind = 0; ind < notUsedBotYet.length; ind++) {
      let message = "Greetings! Since joining the Heir Academy over 30 days ago, you haven't started tracking your daily disciplines yet.  Be sure to report to the <#543115614953406474> channel and check in with me within 24 hours to get your ID off the prune list!";
      try {
        await notUsedBotYet[ind].send(message);
        success++;
      } catch {
        failure++;
      }
    }
    await msg.channel.send("Messages sent to non bot users. Successes=" + success + ". Failures=" + failure);

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
      return DISCORD_UTILS.hasRoleGreaterThanEqualTo(msg, AUTH_RULES[COMMAND]);
    }
    throw new Error("You are not authorized to run this command!");
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
module.exports = {
  processCommand: processCommand
}