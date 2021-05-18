let COMMAND = "admin_purgelist";
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
    let inactivesMap = inactives.map((item, index) => {
      let user = DISCORD_UTILS.findUserById(msg, item.discord_id);
      let name, days;
      if (!!user) {
        name = user ? (user.nickname || user.user.username) : null;
        days = item.last_activity_days
      } else {
        name = item.discord_id + " (Probably the user quit the server or has deleted his discord account)";
        days = item.last_activity_days;
      }
      output = output + "\n" + (++count) + ") " + name + " : " + days + " days ago";
    })
    output = "Total inactives during specified duration of " + days + " days : " + inactives.length + "\n" + output;
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
          // see if this user has joined before "days" number of days
          if (joinedAtTs < cur.setDate(cur.getDate() - days)) {
            notUsedBotYet.push(member);
          }
        }
      })
    }

    if (notUsedBotYet.length > 0) {
      count = 0;
      output = output + "\n" + "\n\nHere are the users that haven't used the bot yet:\n";
      notUsedBotYet.forEach(item => {
        if (!item.user.bot) {
          let memberName = item.nickname || item.user.nickname || item.user.username;
          let joinedAtTs = item.joinedAt.getTime();
          let daysSince = Math.ceil((new Date().getTime() - joinedAtTs) / (1000 * 60 * 60 * 24));
          output = output + (++count) + ") " + memberName + " : joined " + daysSince + " days ago\n";
        }
      })
    }

    if (output.length > 2000) {
      let outputs = output.match(/(.|[\r\n]){1,1900}/g);
      await msg.reply(outputs[0] + "\n.....");
      for (let i = 1; i < outputs.length; i++) {
        await msg.channel.send(outputs[i]);
      }
    } else {
      await msg.reply(output);
    }
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