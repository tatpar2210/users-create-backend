const { profileConstants } = require("../utils/constants")
module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define("users", {
    id: {
      allowNull: false,
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull:false,
    },
    email: {
      type: Sequelize.STRING(150),
      allowNull:false,
    },
    phone: {
      type: Sequelize.STRING(15),
      allowNull:false,
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull:false,
    },
    status: {
      type: Sequelize.STRING(255),
      allowNull:false,
      defaultValue: profileConstants.UserProfileStatus.Pending
    },
    date: {
      type: Sequelize.DATE,
      allowNull:true,
    },
    profile_pic: {
      type: Sequelize.STRING(255),
      allowNull:true,
    },
    gender: {
      type: Sequelize.STRING(15),
      allowNull:true,
      defaultValue: undefined
    }
  });

  return Users;
};