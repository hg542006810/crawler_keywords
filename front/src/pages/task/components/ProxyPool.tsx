import React, { useState } from 'react';
import { Form, Row, Col, Input, Button, message, InputNumber, Modal } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import CustomDrawer from '@/components/CustomDrawer';
import { ProxyPoolProps } from './data';
import { useRequest, useBoolean } from 'ahooks';
import isEmpty from 'lodash/isEmpty';

// 代理池
const ProxyPool: React.FC<ProxyPoolProps> = (props: ProxyPoolProps) => {
  const { visible, onClose } = props;
  const [ batchVisible, { setTrue, setFalse } ] = useBoolean();
  const [ text, setText ]  = useState<string>('');
  const [form] = Form.useForm();

  // 查询代理池数据
  const { run } = useRequest( () => ({
    url: '/api/proxyPool',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  }), {
    manual: true,
    onSuccess: (result) => {
      if (!result.success) {
        message.error(result.message);
        return;
      }
      form.setFieldsValue({ ipProxy: result.data });
    },
  });

  // 发起保存请求
  const saveRequest = useRequest( (params) => ({
    url: '/api/proxyPool',
    method: 'POST',
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
      message.success('保存成功!');
      onClose();
    },
  });

  React.useEffect(() => {
    // 每次打开清空表单
    if (visible) {
      run();
    }
  }, [visible]);

  // 提交
  const submit = async () => {
    const fieldsValue = await form.validateFields();
    if (fieldsValue) {
      Modal.confirm({
        title: '提示',
        content: '确定要保存吗？',
        onOk: () => {
          saveRequest.run({
            ipProxy: fieldsValue.ipProxy
          });
        }
      })
    }
  };

  // 批量添加
  const batchAdd = () => {
    const array = text.split(/[(\r\n)\r\n]+/);
    const values: IpProxy[] = [];
    for (const [index, item] of array.entries()) {
      // ip串
      let ipStr = item;
      let username = '';
      let password = '';
      let ip = '';
      let port = 0;
      let maxConnection = 3;
      if (item.includes('@')) {
        // 如果设置了账号密码
        username = item.substring(0, item.indexOf(':'));
        password = item.substring(item.indexOf(':') + 1, item.indexOf('@'));
        // 截取账号密码后面的数字串
        const afterStr = item.substring(item.indexOf('@') + 1, item.length);
        ipStr = afterStr
      }
      ip = ipStr.substring(0, ipStr.indexOf(':'));
      if (ipStr.includes('-')) {
        // 如果有最大连接数
        port = Number(ipStr.substring(ipStr.indexOf(':') + 1, ipStr.indexOf('-')));
        maxConnection = Number(ipStr.substring(ipStr.indexOf('-') + 1, ipStr.length));
      } else {
        port = Number(ipStr.substring(ipStr.indexOf(':') + 1, ipStr.length));
      }
      if (isEmpty(ip)) {
        message.error(`${index}行：IP填写错误!`);
        return;
      }
      if (port === 0) {
        message.error(`${index}行：端口填写错误!`);
        return;
      }
      values.push({
        username,
        password,
        ip,
        port,
        maxConnection
      })
    }
    form.setFieldsValue({ ipProxy: form.getFieldValue('ipProxy').concat(values) });
    setFalse();
    setText('');
  }

  return (
    <CustomDrawer
      title="设置代理池"
      width={1200}
      visible={visible}
      onClose={onClose}
    >
      <>
        <Button type="primary" onClick={setTrue}>
          批量添加
        </Button>
        <Form
          layout="vertical"
          form={form}
          style={{ marginTop: 20 }}
          initialValues={{
            deep: 10,
            forceWhitelist: false,
            proxy: false,
          }}
        >
          <Form.List
            name="ipProxy"
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
        </Form>
        <div className="form-drawer-button">
          <Button onClick={onClose}>取消</Button>
          <Button onClick={submit} type="primary" loading={saveRequest.loading}>
            确定
          </Button>
        </div>

        {/* 批量添加 */}
        <Modal
          visible={batchVisible}
          onCancel={setFalse}
          onOk={batchAdd}
          width={800}
          title='批量添加'
        >
          <Input.TextArea
            value={text}
            rows={20}
            style={{ resize: 'none' }}
            onChange={(e) => setText(e.target.value)}
          />
        </Modal>
      </>
    </CustomDrawer>
  );
};

export default ProxyPool;
