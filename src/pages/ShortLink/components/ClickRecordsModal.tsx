import { DatePicker, Modal, Table, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { ClickRecord } from '../types';

interface ClickRecordsModalProps {
  visible: boolean;
  onCancel: () => void;
  clickRecords: ClickRecord[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number, pageSize?: number) => void;
  onDateFilterChange: (dates: any, dateStrings: [string, string]) => void;
}

const ClickRecordsModal: React.FC<ClickRecordsModalProps> = ({
  visible,
  onCancel,
  clickRecords,
  pagination,
  onPageChange,
  onDateFilterChange,
}) => {
  return (
    <Modal title="点击记录详情" open={visible} onCancel={onCancel} footer={null} width={900}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>按日期筛选：</div>
        <DatePicker.RangePicker onChange={onDateFilterChange} style={{ width: '100%' }} />
      </div>

      <Table
        dataSource={clickRecords}
        rowKey={(record) => `${record.ipAddress}-${record.time}`}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: onPageChange,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        columns={[
          {
            title: '访问时间',
            dataIndex: 'time',
            key: 'time',
            render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
          },
          {
            title: 'IP地址',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            width: 150,
          },
          {
            title: '来源',
            dataIndex: 'referrerDisplay',
            key: 'referrerDisplay',
            ellipsis: true,
            render: (text, record) => {
              return record.referrer && record.referrer !== 'direct' ? (
                <Tooltip title={record.referrer}>
                  <span>{text}</span>
                </Tooltip>
              ) : (
                <span>{text}</span>
              );
            },
          },
          {
            title: '设备/浏览器',
            dataIndex: 'userAgent',
            key: 'userAgent',
            ellipsis: true,
          },
        ]}
      />
    </Modal>
  );
};

export default ClickRecordsModal;
