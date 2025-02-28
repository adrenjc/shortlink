import { createUser, getAllUsers, updateUser } from '@/services/ant-design-pro/api';
import { getRoles } from '@/services/role';
import type { Role } from '@/services/role/typings';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Select } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';

interface UserType {
  _id: string;
  username: string;
  roles: Role[];
  createdAt: string;
}

const UserList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Role[]>([]);

  const { initialState } = useModel('@@initialState');
  const { currentUser: globalCurrentUser } = initialState || {};

  const hasPermission = (permission: string) => {
    // 从用户的角色和权限中检查
    const userPermissions = new Set();

    // 添加角色包含的权限
    globalCurrentUser?.roles?.forEach((role: any) => {
      role.permissions?.forEach((permission: any) => {
        userPermissions.add(permission.code);
      });
    });

    // 添加直接分配给用户的权限
    globalCurrentUser?.permissions?.forEach((permission: any) => {
      userPermissions.add(permission.code);
    });

    return userPermissions.has(permission) || globalCurrentUser?.name === 'admin';
  };

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      setRoles(response.data || []);
    } catch (error) {
      message.error('获取角色列表失败');
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  if (!hasPermission('user:view')) {
    return <div>无权限访问此页面</div>;
  }

  const handleEdit = (user: UserType) => {
    if (!hasPermission('user:update')) {
      message.error('没有编辑权限');
      return;
    }
    setCurrentUser(user);
    setIsModalVisible(true);
    setIsEditing(true);
    form.setFieldsValue({
      username: user.username,
      password: '',
      roles: user.roles?.map((role: any) => role._id) || [],
    });
  };

  const handleOk = async (values: any) => {
    try {
      if (isEditing) {
        if (!currentUser) {
          message.error('当前用户信息无效');
          return;
        }
        await updateUser(
          {
            username: values.username,
            password: values.password,
            roles: values.roles,
          },
          currentUser._id,
        );
        message.success('用户信息更新成功');
      } else {
        await createUser({
          username: values.username,
          password: values.password,
          roles: values.roles,
        });
        message.success('用户新增成功');
      }
      setIsModalVisible(false);
      setCurrentUser(null);
      if (actionRef.current) {
        actionRef.current.reload();
      }
    } catch (error: any) {
      message.error(error.message || (isEditing ? '更新用户信息失败' : '新增用户失败'));
    }
  };

  const columns: ProColumns<UserType>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      search: true,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (_, record) => record.roles?.map((role) => role.name).join(', ') || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_, record) => new Date(record.createdAt).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleEdit(record)} disabled={!hasPermission('user:update')}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <ProTable<UserType>
        columns={columns}
        request={async (params) => {
          try {
            const { current, pageSize, ...searchParams } = params;
            const response = await getAllUsers({
              page: current,
              pageSize,
              ...searchParams,
            });

            return {
              data: response.data,
              success: response.success,
              total: response.total,
            };
          } catch (error) {
            message.error('获取用户列表失败');
            return { data: [], success: false };
          }
        }}
        rowKey="_id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        actionRef={actionRef}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              if (!hasPermission('user:create')) {
                message.error('没有创建权限');
                return;
              }
              setIsModalVisible(true);
              setIsEditing(false);
              setCurrentUser(null);
              form.resetFields();
            }}
          >
            新增用户
          </Button>,
        ]}
      />
      <Modal
        title={isEditing ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleOk}>
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
            rules={[{ required: !isEditing, message: '请输入密码' }]}
          >
            <Input.Password placeholder={isEditing ? '不修改请留空' : '请输入密码'} />
          </Form.Item>
          <Form.Item name="roles" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              mode="multiple"
              placeholder="请选择角色"
              options={roles.map((role) => ({
                label: role.name,
                value: role._id,
                disabled: role.isSystem && !globalCurrentUser?.name === 'admin',
              }))}
              optionFilterProp="label"
            />
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
