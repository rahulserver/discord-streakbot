let COMMAND = "getscore";
const DB_UTILS = require('../utils/dbUtils');
let processCommand = async (msg, params, tiers) => {
  try {
    let score = await DB_UTILS.getField(msg.author.id, "total_score");
    msg.reply("your total score is: " + score);
  } catch (e) {
    msg.reply("couldn't get total score due to " + e);
  }
};

module.exports = {
  processCommand: processCommand
}