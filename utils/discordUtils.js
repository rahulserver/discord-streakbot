let findRoleByName = (roleName, msg) => {
  return msg.guild.roles.find(role => role.name === roleName);
};

let findMaxRoleOfPerson = (msg) => {
  const maxRole = msg.member.roles.reduce((prev, current) => {
    return (prev.position > current.position) ? prev : current;
  });
  return maxRole;
}
let addTierRole = (roleName, msg, tiers) => {
  let theRole = findRoleByName(roleName, msg);
  let memberRoles = [];
  msg.member.roles.forEach((role) => {
    memberRoles.push(role);
  })

  // remove all tier roles from list
  memberRoles = memberRoles.filter(item => !tiers[item.name]);

  // add the required tier role
  memberRoles.push(theRole);
  return msg.member.setRoles(memberRoles);
};

let addStreakRole = (roleName, msg, streaks) => {
  let theRole = findRoleByName(roleName, msg);
  let memberRoles = [];
  msg.member.roles.forEach((role) => {
    memberRoles.push(role);
  })

  // remove all streak roles from list
  memberRoles = memberRoles.filter(item => !streaks[item.name] && !(streaks[item.name] == 0));

  // add the required tier role
  memberRoles.push(theRole);
  return msg.member.setRoles(memberRoles);
};

let addStreakRoleTo = (roleName, userId, msg, streaks) => {
  let user = findUserById(msg, userId);
  let theRole = findRoleByName(roleName, msg);
  let memberRoles = [];
  user.roles.forEach((role) => {
    memberRoles.push(role);
  })

  // remove all streak roles from list
  memberRoles = memberRoles.filter(item => !streaks[item.name] && !(streaks[item.name] == 0));

  // add the required tier role
  memberRoles.push(theRole);
  return user.setRoles(memberRoles);
};

let hasRoleGreaterThanEqualTo = (msg, roleName) => {
  let role = findRoleByName(roleName, msg);
  if (role) {
    let maxRole = findMaxRoleOfPerson(msg);
    if (maxRole.position >= role.position) {
      return true;
    }
  }

  return false;
}

let addTierRoleTo = (roleName, msg, toUsername, tiers) => {
  let theRole = findRoleByName(roleName, msg);
  let memberRoles = [];
  let member = findUserByName(msg, toUsername);
  member.roles.forEach((role) => {
    memberRoles.push(role);
  })

  // remove all tier roles from list
  memberRoles = memberRoles.filter(item => !tiers[item.name]);

  // add the required tier role
  memberRoles.push(theRole);
  return member.setRoles(memberRoles);
};

let findUserByName = (msg, username) => {
  username = username.toUpperCase();
  return msg.guild.members.find(member => ((member.nickname ? member.nickname.toUpperCase() : "NULL") == username || member.user.username.toUpperCase() == username || member.id == username))
};

let findUserById = (msg, id) =>{
  return msg.guild.members.get(id);
}
module.exports = {
  findUserByName: findUserByName,
  findUserById: findUserById,
  addTierRole: addTierRole,
  addTierRoleTo: addTierRoleTo,
  addStreakRole: addStreakRole,
  addStreakRoleTo: addStreakRoleTo,
  hasRoleGreaterThanEqualTo: hasRoleGreaterThanEqualTo
}