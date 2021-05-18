const axios = require("axios");
const cheerio = require("cheerio");

let postValid = (url, username) => {
  return axios.get(url)
    .then(resp => {
      if (resp.status == 200) {
        const $ = cheerio.load(resp.data);
        // validate username
        try {
          let postUser = $("a[href^='/user/']")[0].attribs.href.replace("/user/", "");
          if (!(username.toLowerCase() === postUser.toLowerCase())) {
            throw new Error("Username not matching");
          }
        } catch (e) {
          throw e
        }

        let timeMsg = $("a[data-click-id=timestamp]").text();
        // example time msg "23 hours ago" or "2 minutes ago"
        let tokens = timeMsg.split(" ");
        let tok2 = tokens[1];
        if (tok2 === "now" || tok2.startsWith("minute") || tok2.startsWith("hour")) {
          return true;
        }

        throw new Error("Post was posted over 24hrs ago");
      }

      throw new Error("Post was not found");
    });
};

module.exports = {
  postValid: postValid
}