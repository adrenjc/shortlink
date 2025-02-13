import { fetchLinks } from '@/services/shortUrl/shorturl';
import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, message } from 'antd';
import { useRef, useState } from 'react';
import { useModel } from 'umi';

type LinkItem = {
  _id: string;
  longUrl: string;
  shortKey: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
};

export default () => {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const { addLink, deleteLink } = useModel('shortLinks');
  const [currentItem, setCurrentItem] = useState<LinkItem | null>(null);

  const handleSubmit = async (values: any) => {
    console.log(values);
    await addLink(values.longUrl); // 使用 createShortLink 创建短链接

    setModalVisible(false);
    actionRef.current?.reload();
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
    { title: '原始链接', dataIndex: 'longUrl', ellipsis: true, search: false },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="delete"
          onClick={async () => {
            // 添加确认弹窗
            Modal.confirm({
              title: '确认删除',
              content: '您确定要删除这个短链吗？',
              onOk: async () => {
                await deleteLink(record._id); // 使用 deleteLink 删除短链接
                actionRef.current?.reload();
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
        // dataSource={links}
        rowKey="id"
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
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="原始链接" name="longUrl" rules={[{ required: true, type: 'url' }]}>
            <Input placeholder="请输入原始链接" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
