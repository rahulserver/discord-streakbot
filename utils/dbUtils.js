const Sequelize = require('sequelize');
var pg = require('pg');
pg.defaults.ssl = true;

let CONNECTION_STRING = null;
if (process.env.DATABASE_URL) {
  CONNECTION_STRING = process.env.DATABASE_URL;
} else {
  CONNECTION_STRING = require("../local.json").CONNECTION_STRING;
}

const sequelize = new Sequelize(CONNECTION_STRING);

// define the models
const Scores = sequelize.define("scores", {
  discord_id: {
    type: Sequelize.BIGINT,
    allowNull: false,
    unique: true
  },
  streak: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  total_score: {
    type: Sequelize.FLOAT,
    defaultValue: 0
  },
  last_reddit: {
    type: Sequelize.DATE,
    allowNull: true
  },
  last_streak: {
    type: Sequelize.DATE,
    allowNull: true
  },
  last_workout: {
    type: Sequelize.DATE,
    allowNull: true
  },
  last_meditation: {
    type: Sequelize.DATE,
    allowNull: true
  },
  last_social: {
    type: Sequelize.DATE,
    allowNull: true
  },
  last_growth: {
    type: Sequelize.DATE,
    allowNull: true
  },
  last_cold_shower: {
    type: Sequelize.DATE,
    allowNull: true
  },
  last_ice_shower: {
    type: Sequelize.DATE,
    allowNull: true
  },
  last_gratefulness: {
    type: Sequelize.DATE,
    allowNull: true
  }
});

let init = () => {
  return sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
      // force: true will drop the table if it already exists
      Scores.sync().then(() => {
        // Table created
        console.log("Table created!");
      });
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
      return err;
    });
};

let setday = (discord_id, day) => {
  return Scores.upsert({
    discord_id: discord_id,
    streak: day,
    last_streak: new Date()
  });
};

let getField = (discord_id, fieldName) => {
  return Scores.findOne({
    where: {
      discord_id: discord_id
    }
  }).then((data) => {
    if (!data || !data.dataValues) {
      return null;
    }

    return data.dataValues[fieldName];
  });
};

let getScoreObj = (discord_id) => {
  return Scores.findOne({
    where: {
      discord_id: discord_id
    }
  }).then((data) => {
    if (!data || !data.dataValues) {
      return null;
    }

    return data.dataValues;
  });
};

let addScore = async (discord_id, number) => {
  try {
    let score = await Scores.findOne({
      where: {
        discord_id: discord_id
      }
    }).then((data) => {
      if (!data || !data.dataValues) {
        return null;
      }

      // return data.increment('total_score', {by: number});
      return data.update({
        total_score: Math.round((data.dataValues.total_score + number) * 100) / 100
      });
    }).then((data) => {
      return data.dataValues.total_score;
    });
    return score;
  } catch (e) {
    throw new Error("Couldn't add score");
  }
};

// sets the total score with given number
let setScore = async (discord_id, number) => {
  try {
    let score = await Scores.findOne({
      where: {
        discord_id: discord_id
      }
    }).then((data) => {
      if (!data || !data.dataValues) {
        return null;
      }

      return data.update({
        total_score: number
      });
    }).then((data) => {
      return data.dataValues.total_score;
    });
    return score;
  } catch (e) {
    throw new Error("Couldn't add score");
  }
};

// sets given field with given value
let setField = async (discord_id, field_name, value) => {
  try {
    let score = await Scores.findOne({
      where: {
        discord_id: discord_id
      }
    }).then((data) => {
      if (!data || !data.dataValues) {
        return null;
      }
      let updateObj = {};
      updateObj[field_name] = value;
      return data.update(updateObj);
    }).then((data) => {
      return data.dataValues;
    });
    return score;
  } catch (e) {
    throw new Error("Couldn't set " + field_name);
  }
};

let leadersboard = async () => {
  try {
    let scores = await Scores.findAll({
      order: [
        ['total_score', 'DESC']
      ]
    }).then(data => {
      if (!data || !data.length) {
        return null;
      }
      return data.map(it => it.dataValues);
    })

    return scores;
  } catch (e) {
    throw new Error("Couldn't get leadersboard " + e);
  }
};

let getInactives = async (days) => {
  try {
    let scores = await Scores.findAll().then(data => {
      if (!data || !data.length) {
        return null;
      }

      return data.map(it => it.dataValues);
    });
    let output = [];
    scores = scores.filter(it => {
      // find the most recent daily activity performed
      let fields = ["last_reddit", "last_streak", "last_workout", "last_meditation", "last_affirmation", "last_gratefulness", "last_cold_shower", "last_make_bed"];
      let max = 0;
      fields.forEach(field => {
        if (it[field]) {
          it[field] = it[field].getTime();
        } else {
          it[field] = 0;
        }
        // has the most recent activity          
        max = (it[field] > max ? it[field] : max);
      })
      let curDate = new Date();
      let pastDate = curDate.setDate(curDate.getDate() - days);
      if (max < pastDate) {
        output.push({
          discord_id: it.discord_id,
          last_activity_days: Math.ceil((new Date().getTime() - max) / (1000 * 60 * 60 * 24))
        })
        return true;
      }

      return false;
    })
    return output;
  } catch (e) {
    throw new Error("Couldn't get inactive " + e);
  }
};

let getAll = async () => {
  let scores = await Scores.findAll().then(data => {
    if (!data || !data.length) {
      return null;
    }
    return data.map(it => it.dataValues);
  });
  return scores;
}

let removeUser = async (discord_id) => {
  let numDeleted = await Scores.destroy({
    where: {
      discord_id: discord_id
    }
  });

  return numDeleted
}
module.exports = {
  setday: setday,
  init: init,
  getField: getField,
  setField: setField,
  addScore: addScore,
  setScore: setScore,
  getScoreObj: getScoreObj,
  leadersboard: leadersboard,
  getInactives: getInactives,
  getAll: getAll,
  removeUser: removeUser
};