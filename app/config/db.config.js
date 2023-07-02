const config = {
  HOST: "localhost",
  PORT: 3310,
  USER: "root",
  PASSWORD: "tush2210",
  DB: "users-create-app",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  secret_token: "thisissecerettokenforsmarstabusinessbackend"
};

module.exports = config