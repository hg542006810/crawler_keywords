import React, { useState } from 'react';
import { message, Modal, Spin, Empty, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer'
import { List as VList } from 'react-virtualized/dist/commonjs/List'

import { ViewRecord } from './data';
import styles from './style/style.less';

// 查看关键字
const ViewKeywords: React.FC<ViewRecord> = (props: ViewRecord) => {
  const { onCancel, visible, id } = props;
  const [data, setData] = useState<{ keyword: string, taskId: string, _id: string; }[]>([]);

  const { loading, run } = useRequest( `/api/task/keywords/${id}`, {
    manual: true,
    onSuccess: (result) => {
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
    }
  }, [visible])

  return (
    <Modal
      title={'爬取记录'}
      onCancel={onCancel}
      visible={visible}
      destroyOnClose
      footer={null}
      width={1100}
      className={styles.viewRecord}
    >
      {
        !loading && data.length === 0 && (
          <Empty />
        )
      }
      {
        (loading || (!loading && data.length !== 0)) && (
          <div className={styles.container}>
            <h2>关键字</h2>
            <div className={styles.search}>
              <Button
                type='primary'
                shape='circle'
                size='small'
                icon={<ReloadOutlined/>}
                loading={loading}
                onClick={run}
              />
            </div>
            {
              loading ? (
                <div className={styles.emptyMain}>
                  <Spin tip='加载中' />
                </div>
                ) : (
                <div className={styles.main}>
                  <AutoSizer>
                    {({ width, height }) => (
                      <VList
                        width={width}
                        height={height}
                        overscanRowCount={10}
                        rowCount={data.length}
                        rowHeight={25}
                        rowRenderer={({ index, key, style }) => (
                          <div key={key} style={style} className={styles.content}>
                            { data[index].keyword }
                          </div>
                        )}
                      />
                    )}
                  </AutoSizer>
                </div>
              )
            }
          </div>
        )
      }
    </Modal>
  )
}

export default ViewKeywords;
