import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Form, Modal, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import ClickRecordsModal from './components/ClickRecordsModal';
import CreateEditForm from './components/CreateEditForm';
import LinkDetailDrawer from './components/LinkDetailDrawer';
import useShortLinkColumns from './components/ShortLinkTable';
import useShortLinkAPI from './hooks/useShortLinkAPI';
import { DomainItem, LinkItem } from './types';

export default () => {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { initialState } = useModel('@@initialState');
  const currentUserId = initialState?.currentUser?.id;

  // 短链相关状态
  const {
    addLink,
    deleteLink: deleteShortLink,
    updateLink: updateShortLink,
  } = useModel('shortLinks');
  const [currentItem, setCurrentItem] = useState<LinkItem | null>(null);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [showUserLinks, setShowUserLinks] = useState(false);

  // 点击记录相关状态
  const [clickRecordModalVisible, setClickRecordModalVisible] = useState<boolean>(false);
  const [clickRecords, setClickRecords] = useState<any[]>([]);
  const [clickRecordsPagination, setClickRecordsPagination] = useState<{
    current: number;
    pageSize: number;
    total: number;
  }>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [currentLinkId, setCurrentLinkId] = useState<string>('');
  const [clickRecordFilter, setClickRecordFilter] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  // 添加详情相关状态
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [linkDetail, setLinkDetail] = useState<any>(null);

  const access = useAccess();
  const { loadDomains, getLinkHistory, getClickRecords, getLinks } = useShortLinkAPI();

  // 获取域名列表
  useEffect(() => {
    const fetchDomains = async () => {
      const domainsList = await loadDomains();
      setDomains(domainsList);
    };
    fetchDomains();
  }, []);

  // 当有查看所有用户短链接权限时，显示切换按钮
  useEffect(() => {
    if (access.canViewAllLinks?.()) {
      setShowUserLinks(true); // 默认显示所有用户链接
    }
  }, [access]);

  // 查询点击记录
  const fetchLinkClickRecords = async (
    linkId: string,
    pagination?: { current?: number; pageSize?: number },
    filter?: { startDate?: string; endDate?: string },
  ) => {
    try {
      setCurrentLinkId(linkId);
      const result = await getClickRecords(linkId, pagination, filter);

      if (result.success) {
        setClickRecords(result.records);
        setClickRecordsPagination(result.pagination);
      } else {
        message.error(result.message || '获取点击记录失败');
        if (result.message?.includes('没有权限')) {
          setTimeout(() => {
            setClickRecordModalVisible(false);
          }, 2000);
        }
      }

      return result;
    } catch (error: any) {
      console.error('获取点击记录错误:', error);
      message.error(error.message || '获取点击记录失败');
      setTimeout(() => {
        setClickRecordModalVisible(false);
      }, 2000);
      throw error;
    }
  };

  // 处理显示点击记录对话框
  const handleShowClickRecords = async (linkId: string) => {
    setClickRecordsPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    setClickRecordFilter({});

    try {
      setClickRecordModalVisible(true);
      await fetchLinkClickRecords(linkId);
    } catch (error) {
      console.error('获取点击记录错误:', error);
    }
  };

  // 点击记录对话框的页面变更处理
  const handleClickRecordPageChange = async (page: number, pageSize?: number) => {
    const newPagination = {
      current: page,
      pageSize: pageSize || clickRecordsPagination.pageSize,
    };

    try {
      await fetchLinkClickRecords(currentLinkId, newPagination, clickRecordFilter);
    } catch (error: any) {
      message.error(error.message || '获取点击记录失败');
    }
  };

  // 处理日期过滤条件变更
  const handleDateFilterChange = async (dates: any, dateStrings: [string, string]) => {
    const newFilter = {
      startDate: dateStrings[0] || undefined,
      endDate: dateStrings[1] || undefined,
    };
    setClickRecordFilter(newFilter);

    try {
      await fetchLinkClickRecords(currentLinkId, clickRecordsPagination, newFilter);
    } catch (error: any) {
      message.error(error.message || '应用日期过滤失败');
    }
  };

  // 表单提交处理
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (currentItem) {
        // 编辑模式
        await updateShortLink({
          id: currentItem._id,
          data: {
            longUrl: values.longUrl,
            customShortKey: values.customShortKey,
            remark: values.remark,
            customDomain: values.customDomain || null,
          },
        });
        message.success('更新成功');
      } else {
        // 新建模式
        await addLink(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换查看模式
  const toggleViewMode = () => {
    setShowUserLinks(!showUserLinks);
    setTimeout(() => {
      actionRef.current?.reload();
    }, 0);
  };

  // 处理显示详情
  const handleViewDetail = async (linkId: string) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const result = await getLinkHistory(linkId);
      if (result) {
        setLinkDetail(result);
      }
    } catch (error: any) {
      message.error(error.message || '获取短链接详情失败');
      console.error('获取短链接详情错误:', error);
      setTimeout(() => {
        setDetailVisible(false);
      }, 2000);
    } finally {
      setDetailLoading(false);
    }
  };

  // 关闭详情抽屉
  const handleCloseDetail = () => {
    setDetailVisible(false);
    setTimeout(() => {
      setLinkDetail(null);
    }, 300);
  };

  const { baseColumns, allLinksColumns } = useShortLinkColumns({
    currentUserId,
    access,
    onEdit: (record) => {
      setCurrentItem(record);
      form.setFieldsValue({
        longUrl: record.longUrl,
        customDomain: record.customDomain,
        customShortKey: record.shortKey,
        remark: record.remark,
      });
      setModalVisible(true);
    },
    onDelete: async (id) => {
      await deleteShortLink(id);
      actionRef.current?.reload();
      message.success('删除成功');
    },
    onShowClickRecords: handleShowClickRecords,
    onViewDetail: handleViewDetail,
  });

  const canViewAll = access.canViewAllLinks?.();
  const columns = canViewAll && showUserLinks ? allLinksColumns : baseColumns;

  return (
    <PageContainer>
      <ProTable<LinkItem>
        columns={columns}
        actionRef={actionRef}
        search={{
          labelWidth: 120,
        }}
        rowKey="_id"
        request={async (params = {}) => {
          const response = await getLinks(params, showUserLinks);
          return response;
        }}
        pagination={{
          showQuickJumper: true,
        }}
        toolBarRender={() =>
          [
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
            canViewAll && (
              <Button
                key="toggle"
                type={showUserLinks ? 'default' : 'primary'}
                onClick={toggleViewMode}
              >
                {showUserLinks ? '查看我的短链' : '查看所有用户短链'}
              </Button>
            ),
          ].filter(Boolean)
        }
      />

      {/* 创建/编辑短链表单 */}
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
        <CreateEditForm
          form={form}
          currentItem={currentItem}
          domains={domains}
          onFinish={handleSubmit}
        />
      </Modal>

      {/* 点击记录弹窗 */}
      <ClickRecordsModal
        visible={clickRecordModalVisible}
        onCancel={() => setClickRecordModalVisible(false)}
        clickRecords={clickRecords}
        pagination={clickRecordsPagination}
        onPageChange={handleClickRecordPageChange}
        onDateFilterChange={handleDateFilterChange}
      />

      {/* 短链接详情抽屉 */}
      <LinkDetailDrawer
        visible={detailVisible}
        onClose={handleCloseDetail}
        loading={detailLoading}
        linkDetail={linkDetail}
      />
    </PageContainer>
  );
};
