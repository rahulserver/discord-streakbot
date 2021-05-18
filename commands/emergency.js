let scraper = require("../utils/nofapScraper");
let COMMAND = "emergency";
let processCommand = async (msg, params, tiers, streaks) => {
  try {
    let data = await scraper.scrapeNofap("emergency", params[0]);
    msg.reply(data);
  } catch (e) {
    msg.reply("couldn't run " + COMMAND + " due to " + e.message);
  }
};

let commandValidator = async (msg, params, tiers) => {
  return true;
};

module.exports = {
  processCommand: processCommand
};