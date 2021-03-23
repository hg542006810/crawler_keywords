import React, { useState } from 'react';
import { message, Modal, Empty } from 'antd';
import { useRequest } from 'ahooks';

import { ViewRecord } from './data';
import styles from './style/style.less';

// 查看日志
const ViewLogs: React.FC<ViewRecord> = (props: ViewRecord) => {
  const { onCancel, visible, id, status } = props;
  const [data, setData] = useState<
    {
      content: string;
      taskId: string;
      _id: string;
      time: string;
      level: string;
    }[]
  >([]);

  const { loading, run, cancel } = useRequest(`/api/task/logs/${id}`, {
    manual: true,
    pollingInterval: status === 'enabled' ? 1000 : 0,
    pollingWhenHidden: false,
    onSuccess: result => {
      if (!result.success) {
        message.error(result.message);
        return;
      }
      setData(result.data);
    },
  });

  React.useEffect(() => {
    if (visible) {
      run();
    } else {
      setData([]);
      // 停止轮询
      cancel();
    }
  }, [visible]);

  return (
    <Modal
      title={'爬取日志'}
      onCancel={onCancel}
      visible={visible}
      destroyOnClose
      footer={null}
      width={1100}
      className={styles.viewRecord}
    >
      {!loading && data.length === 0 && <Empty />}
      {(loading || (!loading && data.length !== 0)) && (
        <div className={styles.container}>
          <h2>爬取日志</h2>
          <div className={styles.main}>
            {data.map(item => (
              <div
                key={item._id}
                style={{ color: item.level === 'error' ? 'red' : '' }}
                className={styles.content}
              >
                [{item.time}]&nbsp;&nbsp;&nbsp;
                <span
                  className={styles.level}
                  style={{ color: item.level === 'error' ? 'red' : '' }}
                >
                  {item.level}
                </span>
                &nbsp;&nbsp;&nbsp;
                {item.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ViewLogs;
