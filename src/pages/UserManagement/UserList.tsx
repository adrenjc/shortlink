import { createUser, getAllUsers, updateUser } from '@/services/ant-design-pro/api'; // 引入封装的 API 方法
import { ProTable } from '@ant-design/pro-components'; // 引入 ProTable
import { Button, Form, Input, message, Modal } from 'antd';
import React, { useRef, useState } from 'react'; // 引入 useRef
import { useModel } from 'umi';

const UserList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null); // 保留 currentUser 状态
  const [isEditing, setIsEditing] = useState<boolean>(false); // 新增状态以区分编辑和新增
  const actionRef = useRef<any>(); // 创建 ref
  const [form] = Form.useForm(); // 创建 Form 实例

  const { initialState } = useModel('@@initialState');
  const { currentUser: globalCurrentUser }: any = initialState || {};

  if (!globalCurrentUser || globalCurrentUser.name !== 'admin') {
    return <div>无权限访问此页面</div>;
  }

  const fetchUsers = async (params: { current: number; pageSize: number }) => {
    setLoading(true);
    try {
      const response = await getAllUsers({ page: params.current, pageSize: params.pageSize }); // 传递分页参数
      return {
        data: response.data, // 用户数据
        total: response.total, // 总数
      };
    } catch (error) {
      message.error('获取用户列表失败');
      return { data: [] }; // 返回空数据
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setCurrentUser(user); // 设置当前用户
    setIsModalVisible(true);
    setIsEditing(true); // 设置为编辑状态
    form.setFieldsValue({ username: user.username, password: '' }); // 使用 setFieldsValue 设置表单值
  };

  const handleOk = async (values: any) => {
    if (isEditing) {
      if (!currentUser) {
        message.error('当前用户信息无效');
        return;
      }
      try {
        await updateUser({ username: values.username, password: values.password }, currentUser._id); // 更新用户
        message.success('用户信息更新成功');
      } catch (error) {
        message.error('更新用户信息失败');
      }
    } else {
      // 新增用户逻辑
      try {
        await createUser({ username: values.username, password: values.password }); // 新增用户
        message.success('用户新增成功');
      } catch (error) {
        message.error('新增用户失败');
      }
    }
    setIsModalVisible(false);
    setCurrentUser(null); // 清空当前用户
    if (actionRef.current) {
      actionRef.current.reload(); // 刷新 ProTable
    }
  };

  const columns: any = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => <Button onClick={() => handleEdit(record)}>编辑</Button>,
    },
  ];

  return (
    <div>
      <ProTable
        columns={columns}
        request={fetchUsers} // 使用 request 属性来获取数据
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }} // 分页设置
        search={false} // 关闭搜索框
        actionRef={actionRef} // 传递 ref
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              setIsModalVisible(true);
              setIsEditing(false);
              setCurrentUser(null); // 清空当前用户以便新增
              form.resetFields(); // 重置表单
            }}
          >
            新增用户
          </Button>,
        ]}
      />
      <Modal
        title={isEditing ? '编辑用户' : '新增用户'} // 根据状态显示不同标题
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form} // 绑定 Form 实例
          onFinish={handleOk}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
