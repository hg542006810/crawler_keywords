import React from 'react';
import { Form, Row, Col, Input, Select, Button, message, InputNumber, Switch, Modal } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import CustomDrawer from '@/components/CustomDrawer';
import { AddAndEditTask } from './data';
import { useRequest } from 'ahooks';

// 编辑任务
const EditTask: React.FC<AddAndEditTask> = (props: AddAndEditTask) => {
  const { visible, onClose, refresh, taskInfo } = props;
  const [form] = Form.useForm();
  // 发起添加请求
  const { loading, run } = useRequest( (params: Task) => ({
    url: '/api/task',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params),
  }), {
    manual: true,
    onSuccess: (result, params) => {
      if (!result.success) {
        message.error(result.message);
        return;
      }
      // 刷新列表页
      refresh();
      message.success('编辑成功!');
      onClose();
    },
  });

  React.useEffect(() => {
    // 每次打开清空表单
    if (visible) {
      form.resetFields();
    }
  }, [visible]);

  // 提交
  const submit = async () => {
    const fieldsValue = await form.validateFields();
    if (fieldsValue) {
      Modal.confirm({
        title: '提示',
        content: '编辑任务会停止当前任务，并且会清空数据，确定要编辑该任务吗？',
        onOk: () => {
          run({
            id: taskInfo ?._id,
            keyword: fieldsValue.keyword ?.split(/[(\r\n)\r\n]+/) ?.join(',') || '',
            type: fieldsValue.type,
            maxRequest: fieldsValue.maxRequest,
            deep: fieldsValue.deep,
            forceWhitelist: fieldsValue.forceWhitelist,
            whitelist: fieldsValue.whitelist ?.split(/[(\r\n)\r\n]+/) ?.join(',') || '',
            blacklist: fieldsValue.blacklist ?.split(/[(\r\n)\r\n]+/) ?.join(',') || '',
            proxy: fieldsValue.proxy,
            oneProcess: fieldsValue.oneProcess,
            proxyPool: fieldsValue.proxyPool,
            ipProxy: fieldsValue.ipProxy || ''
          });
        }
      })
    }
  };

  return (
    <CustomDrawer
      title="编辑任务"
      width={1200}
      visible={visible}
      onClose={onClose}
    >
      <>
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            deep: taskInfo ?.deep,
            forceWhitelist: taskInfo ?.forceWhitelist,
            proxyPool: taskInfo ?.proxyPool,
            proxy: taskInfo ?.proxy,
            keyword: taskInfo ?.keyword.replace(/,/g, '\n'),
            blacklist: taskInfo ?.blacklist.replace(/,/g, '\n'),
            whitelist: taskInfo ?.whitelist.replace(/,/g, '\n'),
            type: taskInfo ?.type,
            oneProcess: taskInfo ?.oneProcess || false,
            maxRequest: taskInfo ?.maxRequest
          }}
        >
          <h2>基础信息</h2>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="爬取的搜索引擎"
                rules={[
                  { required: true, message: '请选择爬取的搜索引擎！' },
                ]}
              >
                <Select placeholder='请选择爬取的搜索引擎'>
                  <Select.Option value={0}>百度</Select.Option>
                  <Select.Option value={1}>搜狗</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxRequest"
                label="最大请求数"
                rules={[
                  { required: true, message: '请输入最大请求数!' },
                ]}
              >
                <InputNumber placeholder='请输入最大请求数' min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deep"
                label="爬取深度"
                rules={[
                  { required: true, message: '请输入爬取深度!' },
                ]}
              >
                <InputNumber placeholder='请输入爬取深度' min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="forceWhitelist"
                label="强行白名单"
                valuePropName="checked"
                rules={[
                  { required: true, message: '请选择是否强行白名单!' },
                ]}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="oneProcess"
                label="一个关键字一个进程"
                valuePropName="checked"
                rules={[
                  { required: true, message: '请选择是否一个关键字一个进程!' },
                ]}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.proxyPool !== currentValues.proxyPool}
              >
                {
                  ({ getFieldValue }) => (
                    <Form.Item
                      name="proxy"
                      label="使用单独代理"
                      valuePropName="checked"
                      rules={[
                        { required: true, message: '请选择是否使用单独代理!' },
                      ]}
                    >
                      <Switch disabled={getFieldValue('proxyPool')} />
                    </Form.Item>
                  )
                }
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.proxy !== currentValues.proxy}
              >
                {({ getFieldValue }) => (
                  <Form.Item
                    name="proxyPool"
                    label="使用代理池"
                    shouldUpdate={(prevValues, currentValues) => prevValues.proxy !== currentValues.proxy}
                    valuePropName="checked"
                    rules={[
                      { required: true, message: '请选择是否使用代理池!' },
                    ]}
                  >
                    <Switch disabled={getFieldValue('proxy')} />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, curValues) => prevValues.proxy !== curValues.proxy}
          >
            {({ getFieldValue }) => (
              getFieldValue('proxy') && (
                <>
                  <h2>代理信息</h2>
                  <Form.List
                    name="ipProxy"
                    initialValue={taskInfo ?.ipProxy && typeof taskInfo.ipProxy === 'string' ? JSON.parse(taskInfo.ipProxy) : [{}]}
                  >
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(field => (
                          <Row key={field.key} gutter={20} align='middle'>
                              <Col span={8}>
                                <Form.Item
                                  {...field}
                                  label='代理IP'
                                  name={[field.name, 'ip']}
                                  fieldKey={[field.fieldKey, 'ip']}
                                  rules={[
                                    { required: true, message: '请输入代理IP！' }
                                  ]}
                                >
                                  <Input placeholder="格式(85.255.129.2-62)，前面为ip，后面为连号个数" />
                                </Form.Item>
                              </Col>
                              <Col span={3}>
                                <Form.Item
                                  {...field}
                                  label='代理端口'
                                  name={[field.name, 'port']}
                                  fieldKey={[field.fieldKey, 'port']}
                                  rules={[
                                    { required: true, message: '请输入代理端口！' }
                                  ]}
                                >
                                  <InputNumber placeholder="请输入代理端口" />
                                </Form.Item>
                              </Col>
                              <Col span={4}>
                                <Form.Item
                                  {...field}
                                  label='代理账号'
                                  name={[field.name, 'username']}
                                  fieldKey={[field.fieldKey, 'username']}
                                >
                                  <Input placeholder="请输入代理账号" />
                                </Form.Item>
                              </Col>
                              <Col span={4}>
                                <Form.Item
                                  {...field}
                                  label='代理密码'
                                  name={[field.name, 'password']}
                                  fieldKey={[field.fieldKey, 'password']}
                                >
                                  <Input placeholder="请输入代理密码" />
                                </Form.Item>
                              </Col>
                              <Col span={3}>
                                <Form.Item
                                  {...field}
                                  label='最大连接数'
                                  name={[field.name, 'maxConnection']}
                                  fieldKey={[field.fieldKey, 'maxConnection']}
                                  rules={[
                                    { required: true, message: '请输入最大连接数！' }
                                  ]}
                                >
                                  <InputNumber placeholder="请输入最大连接数" />
                                </Form.Item>
                              </Col>
                            <Col span={1}>
                              <MinusCircleOutlined onClick={() => remove(field.name)} />
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            添加代理
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </>
              )
            )}
          </Form.Item>
          <h2>详细信息</h2>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item
                name="keyword"
                label="爬取的关键字"
                rules={[
                  { required: true, message: '请输入爬取的关键字！' },
                ]}
              >
                <Input.TextArea
                  rows={8}
                  style={{ resize: 'none' }}
                  placeholder="爬取的关键字, 多个关键字换行分割"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="whitelist"
                label="白名单"
              >
                <Input.TextArea
                  rows={8}
                  style={{ resize: 'none' }}
                  placeholder="白名单, 多个关键字换行分割"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="blacklist"
                label="黑名单"
              >
                <Input.TextArea
                  rows={8}
                  style={{ resize: 'none' }}
                  placeholder="黑名单, 多个关键字换行分割"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div className="form-drawer-button">
          <Button onClick={onClose}>取消</Button>
          <Button onClick={submit} type="primary" loading={loading}>
            确定
          </Button>
        </div>
      </>
    </CustomDrawer>
  );
};

export default EditTask;
