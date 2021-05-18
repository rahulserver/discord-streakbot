const COMMAND = "leadersboard";
const DB_UTILS = require('../utils/dbUtils');
const DISCORD_UTILS = require('../utils/discordUtils');
let processCommand = async (msg, params, tiers, streaks) => {
  try {
    await commandValidator(msg, params, tiers);
    let leadersboard = await DB_UTILS.leadersboard();
    let leadersboardMap = leadersboard.map(item => {
      let user = DISCORD_UTILS.findUserById(msg, item.discord_id);
      if(!!user) {
        return {
          name: user ? (user.nickname || user.user.username): null,
          score: item.total_score,
          id: user? user.user.id:null
        }
      }
    });
    leadersboardMap = leadersboardMap.filter(it=>!!it);
    let leadersboardString = "";
    leadersboardMap.forEach((item,index)=>{
      if(msg.author.id==item.id) {
        leadersboardString += `\n**${index + 1}) ${item.name}    <=>    ${item.score}**`
      } else {
        leadersboardString += `\n${index + 1}) ${item.name}    <=>    ${item.score}`
      }
    });
    msg.reply(leadersboardString);
  } catch (e) {
    msg.reply("couldn't run " + COMMAND + " due to " + e.message);
  }
};

let commandValidator = async (msg, params, tiers, streaks) => {
  return true;
};

module.exports = {
  processCommand: processCommand
}
