import { fetchAllDomains } from '@/services/domain';
import { fetchLinks } from '@/services/shortUrl';
import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';

type LinkItem = {
  _id: string;
  longUrl: string;
  shortKey: string;
  shortUrl: string;
  customDomain: string | null;
  clicks: number;
  createdAt: string;
};

type DomainItem = {
  _id: string;
  domain: string;
  verified: boolean;
  createdAt: string;
};

export default () => {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const { addLink, deleteLink, updateLink } = useModel('shortLinks');
  const [currentItem, setCurrentItem] = useState<LinkItem | null>(null);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取域名列表
  const loadDomains = async () => {
    try {
      const res = await fetchAllDomains();
      if (res.success) {
        setDomains(res.data);
      }
    } catch (error: any) {}
  };

  // 组件加载时获取域名列表
  useEffect(() => {
    loadDomains();
  }, []);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (currentItem) {
        // 编辑模式
        await updateLink({
          id: currentItem._id,
          data: { longUrl: values.longUrl },
        });
        message.success('更新成功');
      } else {
        // 新建模式
        await addLink(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } finally {
      setLoading(false);
    }
  };

  const columns: ProColumns<LinkItem>[] = [
    {
      title: '短链',
      dataIndex: 'shortUrl',
      search: false,
      render: (_, record) => (
        <a
          href={record.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            message.info('正在打开链接');
            window.open(record.shortUrl, '_blank');
          }}
        >
          {record.shortUrl}
        </a>
      ),
    },
    {
      title: '原始链接',
      dataIndex: 'longUrl',
      ellipsis: true,
      search: false,
    },
    {
      title: '自定义域名',
      dataIndex: 'customDomain',
      search: false,
      render: (domain) => {
        if (domain === window.location.host) {
          return '-';
        }
        return domain || '-';
      },
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
        <a
          key="edit"
          onClick={() => {
            setCurrentItem(record);
            form.setFieldsValue({
              longUrl: record.longUrl,
              customDomain: record.customDomain,
            });
            setModalVisible(true);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '您确定要删除这个短链吗？',
              onOk: async () => {
                await deleteLink(record._id);
                actionRef.current?.reload();
                message.success('删除成功');
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
      <ProTable<LinkItem>
        columns={columns}
        actionRef={actionRef}
        search={false}
        rowKey="_id"
        request={async (params = {}) => {
          const response = await fetchLinks(params);
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
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentItem(null);
              form.resetFields();
              setModalVisible(true);
            }}
            type="primary"
          >
            新增短链
          </Button>,
        ]}
      />

      <Modal
        title={currentItem ? '编辑短链' : '新建短链'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setCurrentItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="原始链接"
            name="longUrl"
            rules={[{ required: true, type: 'url', message: '请输入有效的URL' }]}
          >
            <Input placeholder="请输入原始链接" />
          </Form.Item>

          <Form.Item label="自定义域名" name="customDomain" extra="如不选择则使用默认域名">
            <Select
              allowClear
              placeholder="选择域名"
              options={domains
                .filter((d) => d.verified)
                .map((d) => ({
                  label: `${d.domain}`,
                  value: d.domain,
                }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
