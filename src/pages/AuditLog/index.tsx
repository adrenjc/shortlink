import type { AuditLog } from '@/services/auditLog';
import { getAuditLogs } from '@/services/auditLog';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Tag, Tooltip } from 'antd';
import React, { useRef } from 'react';

const AuditLogList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  // 操作类型映射
  const actionMap = {
    CREATE_LINK: { text: '创建短链接', color: 'blue' },
    DELETE_LINK: { text: '删除短链接', color: 'red' },
    UPDATE_PASSWORD: { text: '更新密码', color: 'orange' },
    CREATE_DOMAIN: { text: '添加域名', color: 'green' },
    DELETE_DOMAIN: { text: '删除域名', color: 'red' },
    REGISTER: { text: '用户注册', color: 'purple' },
    LOGIN: { text: '用户登录', color: 'cyan' },
  };

  // 资源类型映射
  const resourceTypeMap = {
    LINK: { text: '短链接', color: 'blue' },
    USER: { text: '用户', color: 'green' },
    DOMAIN: { text: '域名', color: 'orange' },
  };

  const columns: ProColumns<AuditLog>[] = [
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          return {
            startDate: value?.[0],
            endDate: value?.[1],
          };
        },
      },
      render: (_, record) => (record.createdAt ? new Date(record.createdAt).toLocaleString() : '-'),
      width: 180,
    },
    {
      title: '用户',
      dataIndex: 'userId',
      fieldProps: {
        placeholder: '输入用户名搜索',
      },
      render: (_, record) => (
        <span>
          {record.userId.nickname || record.userId.username}
          {record.userId.nickname && (
            <span style={{ color: '#999', marginLeft: 8 }}>({record.userId.username})</span>
          )}
        </span>
      ),
    },
    {
      title: (
        <>
          操作类型
          <Tooltip title="用户在系统中执行的具体操作">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'action',
      valueEnum: Object.fromEntries(
        Object.entries(actionMap).map(([key, value]) => [key, { text: value.text }]),
      ),
      render: (_, record) => {
        const action = actionMap[record.action as keyof typeof actionMap];
        return action ? <Tag color={action.color}>{action.text}</Tag> : record.action;
      },
    },
    {
      title: '资源类型',
      dataIndex: 'resourceType',
      valueEnum: Object.fromEntries(
        Object.entries(resourceTypeMap).map(([key, value]) => [key, { text: value.text }]),
      ),
      render: (_, record) => {
        const type = resourceTypeMap[record.resourceType as keyof typeof resourceTypeMap];
        return type ? <Tag color={type.color}>{type.text}</Tag> : record.resourceType;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      width: 130,
    },
    {
      title: '浏览器信息',
      dataIndex: 'userAgent',
      ellipsis: true,
      width: 200,
      search: false,
    },
  ];

  return (
    <PageContainer>
      <ProTable<AuditLog>
        headerTitle="审计日志"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
        }}
        request={async (params) => {
          // 处理查询参数
          const { current, pageSize, createdAt, userId, action, resourceType, ipAddress, ...rest } =
            params;

          // 构建查询参数
          const queryParams = {
            current,
            pageSize,
            // 如果有时间范围，则添加开始和结束时间
            ...(createdAt && {
              startDate: createdAt[0],
              endDate: createdAt[1],
            }),
            // 其他查询条件
            ...(userId && { userId: userId }),
            ...(action && { action }),
            ...(resourceType && { resourceType }),
            ...(ipAddress && { ipAddress }),
            ...rest,
          };

          const response = await getAuditLogs(queryParams);

          return {
            data: response.data,
            success: response.success,
            total: response.total,
          };
        }}
        columns={columns}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};

export default AuditLogList;
