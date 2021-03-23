// 任务类型
enum TaskTypeEnum {
  Baidu,
  SoGou
}

const TaskType = {
  [TaskTypeEnum.Baidu]: '百度搜索',
  [TaskTypeEnum.SoGou]: '搜狗搜索'
}

export {
  TaskTypeEnum,
  TaskType
}
