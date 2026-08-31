// 深度-叙事引擎 · 命令系统
var 命令系统 = {
  注册表: {},
};

命令系统.注册 = function(name, handler) {
  命令系统.注册表[name] = handler;
};

命令系统.执行 = function(input) {
  if (!input || input[0] !== '/') return false;
  var parts = input.slice(1).split(' ');
  var cmd = parts[0];
  var args = parts.slice(1).join(' ');
  var handler = 命令系统.注册表[cmd];
  if (handler) {
    handler(args);
    return true;
  }
  return false;
};

// Built-in commands
命令系统.注册('help', function() {
  var cmds = Object.keys(命令系统.注册表).join(', ');
  toast('可用命令: ' + cmds);
});

命令系统.注册('clear', function() {
  console.clear();
});

window.命令系统 = 命令系统;
window.Commands = {
  registry: 命令系统.注册表,
  register: 命令系统.注册,
  run: 命令系统.执行,
};
