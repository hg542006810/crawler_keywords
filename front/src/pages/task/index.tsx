import React, { useState } from 'react';
import {
  Layout,
  Typography,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Divider,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { useRequest, useBoolean } from 'ahooks';
import { fetch } from 'whatwg-fetch';
import moment from 'moment';

import { useImmer } from 'use-immer';

import { TaskType, TaskTypeEnum } from '@/common/constants';
import { State } from './data';
import styles from './style/style.less';
import AddTask from './components/AddTask';
import EditTask from './components/EditTask';
import ViewKeywords from './components/ViewKeywords';
import ViewLogs from './components/ViewLogs';
import ProxyPool from './components/ProxyPool';

const { Title } = Typography;

// 任务列表
const Task = () => {
  const exportLoading = useBoolean(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [state, setState] = useImmer<State>({
    addTask: {
      showComponents: false,
      visible: false,
    },
    proxyPool: {
      showComponents: false,
      visible: false,
    },
    editTask: {
      showComponents: false,
      visible: false,
      taskInfo: null,
    },
    viewKeywords: {
      showComponents: false,
      visible: false,
      id: '',
    },
    viewLogs: {
      showComponents: false,
      visible: false,
      id: '',
      status: '',
    },
  });

  // 获得任务列表
  const { data = { success: false, data: [] }, loading, run } = useRequest({
    url: '/api/task',
    method: 'get',
  });

  // 删除任务请求
  const delTaskRequest = useRequest(
    id => ({
      url: `/api/task/${id}`,
      method: 'DELETE',
    }),
    {
      manual: true,
      onSuccess: result => {
        if (!result.success) {
          message.error(result.message);
          return;
        }
        // 刷新列表页
        run();
        message.success('删除成功!');
      },
    },
  );

  // 开启任务
  const startTaskRequest = useRequest(
    id => ({
      url: `/api/task/start/${id}`,
      method: 'POST',
    }),
    {
      manual: true,
      onSuccess: result => {
        if (!result.success) {
          message.error(result.message);
          return;
        }
        // 刷新列表页
        run();
        message.success('开启成功!');
      },
    },
  );

  // 停止任务
  const stopTaskRequest = useRequest(
    id => ({
      url: `/api/task/stop/${id}`,
      method: 'POST',
    }),
    {
      manual: true,
      onSuccess: result => {
        if (!result.success) {
          message.error(result.message);
          return;
        }
        // 刷新列表页
        run();
        message.success('停止成功!');
      },
    },
  );

  // 添加任务弹窗
  const addTask = () => {
    setState(draft => {
      draft.addTask.showComponents = true;
      draft.addTask.visible = true;
      return draft;
    });
  };

  // 代理池
  const proxyPool = () => {
    setState(draft => {
      draft.proxyPool.showComponents = true;
      draft.proxyPool.visible = true;
      return draft;
    });
  };

  // 编辑任务弹窗
  const editTask = (taskInfo: Task) => {
    setState(draft => {
      draft.editTask.showComponents = true;
      draft.editTask.visible = true;
      draft.editTask.taskInfo = taskInfo;
      return draft;
    });
  };

  // 查看爬取记录
  const viewKeywords = (id: string) => {
    setState(draft => {
      draft.viewKeywords.showComponents = true;
      draft.viewKeywords.visible = true;
      draft.viewKeywords.id = id;
      return draft;
    });
  };

  // 查看日志
  const viewLogs = (id: string, status: string) => {
    setState(draft => {
      draft.viewLogs.showComponents = true;
      draft.viewLogs.visible = true;
      draft.viewLogs.id = id;
      draft.viewLogs.status = status;
      return draft;
    });
  };

  // 导出数据
  const exportData = (id: string) => {
    if (!exportLoading[0]) {
      exportLoading[1].setTrue();
      const hide = message.loading('导出中...', 0);
      fetch(`/api/task/export/${id}`, {
        method: 'POST',
      })
        .then((res: { blob: () => any }) => {
          return res.blob();
        })
        .then((blob: any) => {
          let bl = new Blob([blob], { type: 'text/plain' });
          let fileName = `关键字${moment().unix()}.txt`;
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(bl);
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(link.href);
          exportLoading[1].setFalse();
          hide();
        });
    }
  };

  // 合并导出
  const mergeExport = () => {
    if (!exportLoading[0]) {
      exportLoading[1].setTrue();
      const hide = message.loading('导出中...', 0);
      fetch(`/api/task/mergeExport`, {
        method: 'POST',
        body: JSON.stringify({
          ids: selectedRowKeys,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res: { blob: () => any }) => {
          return res.blob();
        })
        .then((blob: any) => {
          let bl = new Blob([blob], { type: 'text/plain' });
          let fileName = `关键字${moment().unix()}.txt`;
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(bl);
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(link.href);
          exportLoading[1].setFalse();
          hide();
        });
    }
  };

  // 删除任务
  const delTask = (id: string) => {
    delTaskRequest.run(id);
  };

  // 开启任务
  const startTask = (id: string) => {
    startTaskRequest.run(id);
  };

  // 停止任务
  const stopTask = (id: string) => {
    stopTaskRequest.run(id);
  };

  const onSelectChange = (selectedRowKeys: any[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const columns: ColumnsType<Task> = [
    {
      title: '关键字',
      dataIndex: 'keyword',
      render: text => (
        <>
          {text
            .split(',')
            .map(
              (item: string, index: number) =>
                index <= 3 && <p key={`${item}_${index}`}>{item}</p>,
            )}
          {text.split(',').length > 3 && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <i>剩余{text.split(',').length - 3}个关键字</i>
            </>
          )}
        </>
      ),
    },
    {
      title: '爬取的搜索引擎',
      dataIndex: 'type',
      render: (text: TaskTypeEnum) => TaskType[text],
    },
    {
      title: '最大请求数',
      dataIndex: 'maxRequest',
    },
    {
      title: '爬取的数量',
      dataIndex: 'count',
    },
    {
      title: '爬取深度',
      dataIndex: 'deep',
    },
    {
      title: '强行白名单',
      dataIndex: 'forceWhitelist',
      render: (text: number) =>
        text ? (
          <label style={{ color: '#52c41a' }}>是</label>
        ) : (
          <label style={{ color: '#f5222d' }}>否</label>
        ),
    },
    {
      title: '一个关键字一个进程',
      dataIndex: 'oneProcess',
      render: (text: number) =>
        text ? (
          <label style={{ color: '#52c41a' }}>是</label>
        ) : (
          <label style={{ color: '#f5222d' }}>否</label>
        ),
    },
    {
      title: '使用代理',
      dataIndex: 'proxy',
      render: (text, record) => {
        if (record.proxy) {
          return <label style={{ color: '#52c41a' }}>使用单独代理</label>;
        }
        if (record.proxyPool) {
          return <label style={{ color: '#52c41a' }}>使用系统代理</label>;
        }
        return <label style={{ color: '#f5222d' }}>否</label>;
      },
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      render: text =>
        text === 'enabled' ? (
          <label style={{ color: '#52c41a' }}>正在运行</label>
        ) : (
          <label style={{ color: '#1890ff' }}>未运行</label>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 380,
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'enabled' ? (
            <Popconfirm
              title="停止任务后再次开始任务会从头开始，确定吗?"
              okText="确定"
              cancelText="取消"
              okButtonProps={{ loading: stopTaskRequest.loading }}
              onConfirm={() => record._id && stopTask(record._id)}
            >
              <a>停止</a>
            </Popconfirm>
          ) : (
            <a onClick={() => record._id && startTask(record._id)}>开启</a>
          )}
          <a onClick={() => record._id && viewKeywords(record._id)}>爬取记录</a>
          <a
            onClick={() =>
              record._id &&
              viewLogs(record._id, record.status ? record.status : '')
            }
          >
            爬取日志
          </a>
          <a onClick={() => record._id && exportData(record._id)}>导出</a>
          <a onClick={() => record._id && editTask(record)}>编辑</a>
          <Popconfirm
            title="删除后会停止当前的任务并且会清空爬取的记录，确定吗?"
            okText="确定"
            cancelText="取消"
            okButtonProps={{ loading: delTaskRequest.loading }}
            onConfirm={() => record._id && delTask(record._id)}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className={styles.container}>
      <Title level={3}>爬取任务列表</Title>
      <Space className={styles.search}>
        <Button onClick={run} loading={loading}>
          <ReloadOutlined />
          刷新
        </Button>
        {selectedRowKeys.length !== 0 && (
          <Button type="primary" onClick={mergeExport}>
            <ExportOutlined />
            合并导出
          </Button>
        )}
        <Button type="primary" onClick={proxyPool}>
          <PlusOutlined />
          设置代理池
        </Button>
        <Button type="primary" onClick={addTask}>
          <PlusOutlined />
          添加任务
        </Button>
      </Space>
      <Table<Task>
        rowKey="_id"
        className={styles.table}
        loading={loading}
        pagination={false}
        columns={columns}
        dataSource={data.data}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
        }}
      />
      {state.addTask.showComponents && (
        <AddTask
          visible={state.addTask.visible}
          refresh={run}
          onClose={() => {
            setState(draft => {
              draft.addTask.visible = false;
              return draft;
            });
          }}
        />
      )}
      {state.editTask.showComponents && (
        <EditTask
          visible={state.editTask.visible}
          taskInfo={state.editTask.taskInfo}
          refresh={run}
          onClose={() => {
            setState(draft => {
              draft.editTask.visible = false;
              return draft;
            });
          }}
        />
      )}
      {state.viewKeywords.showComponents && (
        <ViewKeywords
          visible={state.viewKeywords.visible}
          id={state.viewKeywords.id}
          onCancel={() => {
            setState(draft => {
              draft.viewKeywords.visible = false;
              return draft;
            });
          }}
        />
      )}
      {state.viewLogs.showComponents && (
        <ViewLogs
          visible={state.viewLogs.visible}
          id={state.viewLogs.id}
          status={state.viewLogs.status}
          onCancel={() => {
            setState(draft => {
              draft.viewLogs.visible = false;
              return draft;
            });
          }}
        />
      )}
      {state.proxyPool.showComponents && (
        <ProxyPool
          visible={state.proxyPool.visible}
          onClose={() => {
            setState(draft => {
              draft.proxyPool.visible = false;
              return draft;
            });
          }}
        />
      )}
    </Layout>
  );
};

export default Task;
