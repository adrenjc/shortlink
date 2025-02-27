import { addDomain, deleteDomain, fetchDomains, verifyDomain } from '@/services/domain/domain';
import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Tag, Typography, message } from 'antd';
import { useRef, useState } from 'react';

const { Paragraph } = Typography;

type DomainItem = {
  _id: string;
  domain: string;
  verified: boolean;
  verificationCode: string;
  createdAt: string;
};

export default () => {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [currentDomain, setCurrentDomain] = useState<DomainItem | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { domain: string }) => {
    setLoading(true);
    try {
      const res = await addDomain(values.domain);
      if (res.success) {
        message.success('域名添加成功');
        setCurrentDomain(res.data);
        setModalVisible(false);
        setVerifyModalVisible(true);
        actionRef.current?.reload();
      }
    } catch (error) {
      message.error('域名添加失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (domain: string) => {
    setLoading(true);
    try {
      const res = await verifyDomain(domain);
      if (res.success) {
        message.success('域名验证成功');
        setVerifyModalVisible(false);
        actionRef.current?.reload();
      } else {
        message.error(res.message || '域名验证失败');
      }
    } catch (error) {
      message.error('验证过程出错');
    } finally {
      setLoading(false);
    }
  };

  const columns: ProColumns<DomainItem>[] = [
    {
      title: '域名',
      dataIndex: 'domain',
      ellipsis: true,
    },
    {
      title: '验证状态',
      dataIndex: 'verified',
      search: false,
      render: (_, record) => (
        <Tag color={record.verified ? 'success' : 'warning'}>
          {record.verified ? '已验证' : '未验证'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        !record.verified && (
          <a
            key="verify"
            onClick={() => {
              setCurrentDomain(record);
              setVerifyModalVisible(true);
            }}
          >
            验证
          </a>
        ),
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '删除域名将同时删除使用该域名的所有短链接，是否继续？',
              onOk: async () => {
                try {
                  await deleteDomain(record.domain);
                  message.success('删除成功');
                  actionRef.current?.reload();
                } catch (error) {
                  message.error('删除失败');
                }
              },
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <>
      <ProTable<DomainItem>
        columns={columns}
        actionRef={actionRef}
        search={false}
        rowKey="_id"
        request={async (params = {}) => {
          const response = await fetchDomains(params);
          return {
            data: response.data,
            success: response.success,
            total: response.total,
          };
        }}
        pagination={{
          showQuickJumper: true,
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setModalVisible(true);
            }}
          >
            添加域名
          </Button>,
        ]}
      />

      {/* 添加域名弹窗 */}
      <Modal
        title="添加域名"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="域名"
            name="domain"
            rules={[
              { required: true, message: '请输入域名' },
              {
                pattern: /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
                message: '请输入有效的域名格式',
              },
            ]}
            extra="例如：example.com"
          >
            <Input placeholder="请输入域名" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 域名验证弹窗 */}
      <Modal
        title="域名验证"
        open={verifyModalVisible}
        onCancel={() => setVerifyModalVisible(false)}
        onOk={() => currentDomain && handleVerify(currentDomain.domain)}
        confirmLoading={loading}
        okText="验证"
        width={600}
      >
        <Typography>
          <Paragraph>
            <strong>第一步：添加 A 记录（必需）</strong>
          </Paragraph>
          <Paragraph>请在您的域名解析服务商处添加以下 A 记录：</Paragraph>
          <Paragraph>
            <ul>
              <li>
                <strong>主机记录：</strong> @
              </li>
              <li>
                <strong>记录类型：</strong> A
              </li>
              <li>
                <strong>记录值：</strong>
                <Paragraph copyable>47.83.207.5</Paragraph>
              </li>
              <li>
                <strong>TTL：</strong> 600
              </li>
            </ul>
          </Paragraph>

          <Paragraph>
            <strong>第二步：添加 TXT 记录（验证所有权）</strong>
          </Paragraph>
          <Paragraph>在相同的域名解析页面添加以下 TXT 记录：</Paragraph>
          <Paragraph>
            <ul>
              <li>
                <strong>主机记录：</strong> @
              </li>
              <li>
                <strong>记录类型：</strong> TXT
              </li>
              <li>
                <strong>记录值：</strong>
                <Paragraph copyable>{currentDomain?.verificationCode}</Paragraph>
              </li>
              <li>
                <strong>TTL：</strong> 600
              </li>
            </ul>
          </Paragraph>

          <Paragraph type="secondary">
            注意事项：
            <ul>
              <li>两条记录都必须添加才能完成验证</li>
              <li>A 记录用于将域名指向我们的服务器</li>
              <li>TXT 记录用于验证域名所有权</li>
              <li>DNS 解析生效可能需要几分钟到几小时不等</li>
              <li>如果验证失败，请确保两条记录都已正确添加并等待解析生效</li>
            </ul>
          </Paragraph>

          <Paragraph type="secondary">
            常见问题：
            <ul>
              <li>验证失败：请检查记录是否正确添加，等待 DNS 生效后重试</li>
              <li>无法访问：请确保 A 记录已正确设置并生效</li>
              <li>{`配置后仍显示未验证：请点击"验证"按钮进行验证`}</li>
            </ul>
          </Paragraph>
        </Typography>
      </Modal>
    </>
  );
};
