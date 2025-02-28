import type { AuditLog } from '@/services/auditLog';
import { getAuditLogs } from '@/services/auditLog';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Alert, Space, Tag, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';

const AuditLogList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  // 操作类型映射
  const actionMap = {
    // 短链接相关
    CREATE_LINK: { text: '创建短链接', color: 'blue' },
    DELETE_LINK: { text: '删除短链接', color: 'red' },
    UPDATE_LINK: { text: '更新短链接', color: 'orange' },
    CLICK_LINK: { text: '访问短链接', color: 'green' },

    // 用户相关
    UPDATE_PASSWORD: { text: '更新密码', color: 'orange' },
    USER_UPDATE: { text: '更新用户信息', color: 'cyan' },
    REGISTER: { text: '用户注册', color: 'purple' },
    LOGIN: { text: '用户登录', color: 'cyan' },
    LOGOUT: { text: '用户登出', color: 'grey' },

    // 域名相关
    CREATE_DOMAIN: { text: '添加域名', color: 'green' },
    DELETE_DOMAIN: { text: '删除域名', color: 'red' },
    VERIFY_DOMAIN: { text: '验证域名', color: 'cyan' },
    DOMAIN_VERIFY: { text: '域名验证', color: 'blue' },
  };

  // 资源类型映射
  const resourceTypeMap = {
    LINK: { text: '短链接', color: 'blue' },
    USER: { text: '用户', color: 'green' },
    DOMAIN: { text: '域名', color: 'orange' },
  };

  // 添加状态来存储当前的筛选条件
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // 格式化日期范围
  const formatDateRange = (dates: string[]) => {
    if (!dates?.length) return '';
    return `${new Date(dates[0]).toLocaleDateString()} 至 ${new Date(
      dates[1],
    ).toLocaleDateString()}`;
  };

  // 获取筛选条件的显示文本
  const getFilterText = (key: string, value: any) => {
    switch (key) {
      case 'createdAt':
        return `时间范围: ${formatDateRange(value)}`;
      case 'status':
        return `状态: ${value === 'SUCCESS' ? '成功' : '失败'}`;
      case 'action':
        return `操作类型: ${actionMap[value as keyof typeof actionMap]?.text || value}`;
      case 'resourceType':
        return `资源类型: ${resourceTypeMap[value as keyof typeof resourceTypeMap]?.text || value}`;
      case 'userId':
        return `用户: ${value}`;
      case 'ipAddress':
        return `IP地址: ${value}`;
      default:
        return `${key}: ${value}`;
    }
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
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        SUCCESS: { text: '成功', status: 'Success' },
        FAILURE: { text: '失败', status: 'Error' },
      },
      render: (_, record) => (
        <Tag color={record.status === 'SUCCESS' ? 'success' : 'error'}>
          {record.status === 'SUCCESS' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '设备信息',
      dataIndex: 'deviceInfo',
      width: 200,
      search: false,
      render: (_, record) => {
        if (!record.deviceInfo) return '-';

        // 截取设备信息，超过长度显示省略号
        const maxLength = 20;
        const browser = record.deviceInfo.browser || '';
        const os = record.deviceInfo.os || '';

        const displayText = `${browser} / ${os}`;
        const shortText =
          displayText.length > maxLength ? `${displayText.slice(0, maxLength)}...` : displayText;

        return (
          <Tooltip
            title={`浏览器: ${record.deviceInfo.browser}\n系统: ${record.deviceInfo.os}\n设备: ${record.deviceInfo.device}`}
          >
            <span>{shortText}</span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <PageContainer>
      {/* 添加筛选条件展示区域 */}
      {Object.keys(activeFilters).length > 0 && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={
            <Space direction="vertical">
              <Space wrap>
                <span>当前筛选条件:</span>
                {Object.entries(activeFilters).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <Tag key={key} color="blue" style={{ padding: '4px 8px' }}>
                      {getFilterText(key, value)}
                    </Tag>
                  );
                })}
              </Space>
            </Space>
          }
        />
      )}

      <ProTable<AuditLog>
        headerTitle="审计日志"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
        }}
        request={async (params) => {
          // 更新筛选条件状态
          const {
            createdAt,
            status,
            action,
            resourceType,
            userId,
            ipAddress,
            current,
            pageSize,
            ...rest
          } = params;

          const filters = {
            createdAt,
            status,
            action,
            resourceType,
            userId,
            ipAddress,
          };

          // 过滤掉空值
          const activeFilters = Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== ''),
          );

          setActiveFilters(activeFilters);

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
            ...(userId && { userId }),
            ...(action && { action }),
            ...(resourceType && { resourceType }),
            ...(ipAddress && { ipAddress }),
            ...(status && { status }),
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
