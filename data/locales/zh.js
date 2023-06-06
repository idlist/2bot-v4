module.exports = {
  'commands': {
    'echo': {
      'description': '复述',
    },
    'help': {
      'messages': {
        'command-aliases': '别名：{0}',
        'command-authority': '最低权限：{0} 级',
      },
    },
    'recall': {
      'description': '撤回消息',
    },
    'schedule': {
      'description': '定时命令',
    },
  },
  'internal': {
    'command-max-usage': '已调用次数：{0}/{1}',
    'command-min-interval': '距离下次调用还需 {0}/{1} 秒',
  },
}