let parseCommand = (text) => {
  let commandObj = {};
  if (!text.startsWith("!")) {
    return {
      command: undefined,
      params: []
    }
  }
  let array = text.split(" ");
  array[0] = array[0].replace("!", "");
  commandObj["command"] = array[0];
  commandObj["params"] = array.splice(1)
  return commandObj;
};

module.exports = {
  parseCommand: parseCommand
}