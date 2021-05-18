const Discord = require('discord.js');
const client = new Discord.Client();
const parser = require('./utils/commandsUtils');
const tiers = require('./config/roleTiers.json');
const streaks = require('./config/streaks.json');
const dbUtils = require('./utils/dbUtils');
const bot_secret_token = "SOME_TOKEN";
const BOT_CHANNEL_ID = "623780869282332682";
const INTRO_CHANNEL = "623452905000665118";
const RULES_CHANNEL_ID = "620988930027814912";
const ADMIN_CHANNEL_ID = "618411449685114882";
const INTRO_MESSAGE = "Welcome to the Battle For Valor. Please read the <#" + RULES_CHANNEL_ID + "> channel and familiarize yourself with the performance standards of this server. Once you have read the material, post your introduction here and an Admin will assign you your first rank shortly"
dbUtils.init().then(() => {
  client.login(bot_secret_token);

  client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
  });

  client.on('message', msg => {
    if (msg.member) {
      if (!msg.author.bot && (msg.channel.id === BOT_CHANNEL_ID)) {

        let commandObj = parser.parseCommand(msg.content);
        if (commandObj.command) {
          try {
            let processor = require(`./commands/${commandObj.command}.js`);
            processor.processCommand(msg, commandObj.params, tiers, streaks);
          } catch (e) {
            console.log(e);
            msg.reply("no matching command found");
          }
        }
      }
    }
  });


  client.on('guildMemberAdd', member => {
    member.guild.channels.get(INTRO_CHANNEL).send("<@" + member.id + "> " + INTRO_MESSAGE);
  });

  client.on('guildMemberRemove', member => {
    member.guild.channels.get(ADMIN_CHANNEL_ID).send("" + member.user.username + " quit the server!");
  });

}).catch((err) => {
  console.log("Db init failed", err);
})

