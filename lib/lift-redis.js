import redisClientMethods from 'redis/lib/commands';

function execSingle(client, command) {
  return new Promise(
    (resolve, reject) =>
      client[command.name](
          ...command.args,
        (error, result) =>
          error
          ? reject(error)
          : resolve(result)));
}

function execMultiple(client, commands) {
  return new Promise(
    (resolve, reject) =>
      commands.reduce(
        (multi, command) => multi[command.name](...command.args),
        client.multi())
      .exec(
        (error, descriptors) =>
          error
          ? reject(error)
          : resolve(descriptors)));
}
 
export function liftRedis(client) {
  return (...commands) =>
    commands.length === 1
    ? execSingle(client, commands[0])
    : execMultiple(client, commands);
}

export const redisCommands = redisClientMethods
  .filter(name => name.indexOf(' ') < 0)
  .reduce(
    (commands, name) => {
      commands[name] = (...args) => ({name, args});
      return commands;
    }, {});
