let COMMAND = "getday";
const DB_UTILS = require('../utils/dbUtils');
let processCommand = async (msg, params, tiers) => {
  try {
    let day = await DB_UTILS.getField(msg.author.id, "streak");
    msg.reply("day: " + day);
  } catch (e) {
    msg.reply("couldn't get day due to " + e);
  }
};

module.exports = {
  processCommand: processCommand
}