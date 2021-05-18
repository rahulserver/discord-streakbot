let axios = require("axios");
let scrapeNofap = (type, religious) => {
  if (type == "emergency") {
    return axios.get('https://emergency.nofap.com/director.php?cat=em&religious=' + (!!religious))
      .then(response => {
        return response.data
      })
  } else if(type == "relapse"){
    return axios.get('https://emergency.nofap.com/director.php?cat=rel&religious=' + (!!religious))
      .then(response => {
        return response.data
      })
  }else {
    return Promise.resolve();
  }
};

module.exports = {
  scrapeNofap: scrapeNofap
}