"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

exports.liftRedis = liftRedis;

var redisClientMethods = _interopRequire(require("redis/lib/commands"));

function execSingle(client, command) {
  return new Promise(function (resolve, reject) {
    return client[command.name].apply(client, _toConsumableArray(command.args).concat([function (error, result) {
      return error ? reject(error) : resolve(result);
    }]));
  });
}

function execMultiple(client, commands) {
  return new Promise(function (resolve, reject) {
    return commands.reduce(function (multi, command) {
      return multi[command.name].apply(multi, _toConsumableArray(command.args));
    }, client.multi()).exec(function (error, descriptors) {
      return error ? reject(error) : resolve(descriptors);
    });
  });
}

function liftRedis(client) {
  return function () {
    for (var _len = arguments.length, commands = Array(_len), _key = 0; _key < _len; _key++) {
      commands[_key] = arguments[_key];
    }

    return commands.length === 1 ? execSingle(client, commands[0]) : execMultiple(client, commands);
  };
}

var redisCommands = exports.redisCommands = redisClientMethods.filter(function (name) {
  return name.indexOf(" ") < 0;
}).reduce(function (commands, name) {
  commands[name] = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return { name: name, args: args };
  };
  return commands;
}, {});
Object.defineProperty(exports, "__esModule", {
  value: true
});

