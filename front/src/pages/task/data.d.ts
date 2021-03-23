export interface State {
  addTask: {
    showComponents: boolean;
    visible: boolean;
  };
  proxyPool: {
    showComponents: boolean;
    visible: boolean;
  };
  editTask: {
    showComponents: boolean;
    visible: boolean;
    taskInfo: Task | null;
  };
  viewKeywords: {
    showComponents: boolean;
    visible: boolean;
    id: string;
  };
  viewLogs: {
    showComponents: boolean;
    visible: boolean;
    id: string;
    status: string;
  };
}
