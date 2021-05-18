let COMMAND = "admin_purgeremove";
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
    let vanishedArray = [];
    inactives.map((item, index) => {
      let user = DISCORD_UTILS.findUserById(msg, item.discord_id);
      let name, days;
      if (!!user) {
        inactiveArray.push(user);
      } else {
        vanishedArray.push(item.discord_id);
      }
    })

    // remove the vanishedArray members
    let staleCount = 0;
    for (let k = 0; k < vanishedArray.length; k++) {
      let current = vanishedArray[k];
      await DB_UTILS.removeUser(current);
      staleCount++;
    }
    if (staleCount > 0) {
      msg.channel.send("Stale entries removed from db: " + staleCount);
    }

    let success = 0;
    let failure = 0;
    let invite = (await msg.guild.channels.find('name', 'new-comers').createInvite({
      maxAge: 0
    })).url;
    await msg.channel.send("Starting to prune inactive people who have atleast used the bot once...");
    for (var ind = 0; ind < inactiveArray.length; ind++) {
      let message = "Greetings! you are being pruned due to non performing of daily tasks for " + days + " days. But we would love to see you join soon. Please join back using " + invite;
      try {
        let user = inactiveArray[ind];
        await user.send(message);
        await user.kick("inactivity. Join back link " + invite);
        success++;
      } catch {
        failure++;
      }
    }
    await msg.channel.send("Pruning inactive members rsults: Successes=" + success + ". Failures=" + failure + ". Now starting to send messages to non bot users");
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
      let message = "Since joining the Heir Academy over " + days + " days ago, you haven't started tracking your daily disciplines yet.  So you are being pruned for now. We would love to see you back on this server using this link: " + invite;
      try {
        let user = notUsedBotYet[ind];
        await user.send(message);
        await user.kick(message);
        success++;
      } catch {
        failure++;
      }
    }
    await msg.channel.send("Pruned non bot users: Successes=" + success + ". Failures=" + failure);

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