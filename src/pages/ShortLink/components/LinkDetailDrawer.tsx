import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  List,
  Skeleton,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { LinkDetail } from '../types';

const { Text, Paragraph } = Typography;

interface LinkDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  linkDetail: LinkDetail | null;
}

const LinkDetailDrawer: React.FC<LinkDetailDrawerProps> = ({
  visible,
  onClose,
  loading,
  linkDetail,
}) => {
  return (
    <Drawer
      title="短链接详情"
      width={window.innerWidth > 1600 ? 1200 : window.innerWidth > 1200 ? 900 : 800}
      placement="right"
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button onClick={onClose}>关闭</Button>
        </Space>
      }
      bodyStyle={{ paddingBottom: 80 }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : linkDetail ? (
        <>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <Descriptions
              title="基本信息"
              column={1}
              bordered
              items={[
                {
                  key: 'shortUrl',
                  label: <span style={{ whiteSpace: 'nowrap' }}>短链接</span>,
                  children: (
                    <a
                      href={linkDetail.linkInfo.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {linkDetail.linkInfo.shortUrl}
                    </a>
                  ),
                },
                {
                  key: 'longUrl',
                  label: <span style={{ whiteSpace: 'nowrap' }}>原始链接</span>,
                  children: (
                    <Paragraph
                      ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
                      style={{ margin: 0 }}
                    >
                      <a
                        href={linkDetail.linkInfo.longUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {linkDetail.linkInfo.longUrl}
                      </a>
                    </Paragraph>
                  ),
                },
                {
                  key: 'shortKey',
                  label: <span style={{ whiteSpace: 'nowrap' }}>短链KEY</span>,
                  children: linkDetail.linkInfo.shortKey,
                },
                ...(linkDetail.linkInfo.customDomain
                  ? [
                      {
                        key: 'customDomain',
                        label: <span style={{ whiteSpace: 'nowrap' }}>自定义域名</span>,
                        children: linkDetail.linkInfo.customDomain,
                      },
                    ]
                  : []),
                {
                  key: 'remark',
                  label: <span style={{ whiteSpace: 'nowrap' }}>备注</span>,
                  children: linkDetail.linkInfo.remark || '无',
                },
                {
                  key: 'createdAt',
                  label: <span style={{ whiteSpace: 'nowrap' }}>创建时间</span>,
                  children: dayjs(linkDetail.linkInfo.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                },
                {
                  key: 'updatedAt',
                  label: <span style={{ whiteSpace: 'nowrap' }}>最后更新</span>,
                  children: dayjs(linkDetail.linkInfo.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
                },
                {
                  key: 'creator',
                  label: <span style={{ whiteSpace: 'nowrap' }}>创建者</span>,
                  children: (
                    <Space>
                      <Avatar size="small" style={{ backgroundColor: '#87d068' }}>
                        {linkDetail.linkInfo.creator.username.substring(0, 1).toUpperCase()}
                      </Avatar>
                      <span>{linkDetail.linkInfo.creator.username}</span>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {linkDetail.linkInfo.creator.email}
                      </Text>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>

          <Divider orientation="left">修改历史</Divider>

          {linkDetail.history.length > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Timeline
                style={{ maxWidth: 800, width: '100%' }}
                mode="alternate"
                items={linkDetail.history.map((record) => ({
                  color: record.action === '创建' ? 'green' : 'blue',
                  label: dayjs(record.time).format('YYYY-MM-DD HH:mm:ss'),
                  children: (
                    <Card
                      size="small"
                      title={
                        <Space>
                          <Tag color={record.action === '创建' ? 'success' : 'processing'}>
                            {record.action}
                          </Tag>
                          <span>由 {record.username} 操作</span>
                        </Space>
                      }
                      style={{ width: '100%', maxWidth: 600 }}
                    >
                      {record.action === '更新' && record.changes ? (
                        <List
                          size="small"
                          itemLayout="horizontal"
                          dataSource={Object.entries(record.changes).filter(([, value]) => value)}
                          renderItem={([key, value]) => {
                            let fieldName;
                            switch (key) {
                              case 'longUrl':
                                fieldName = '原始链接';
                                break;
                              case 'remark':
                                fieldName = '备注';
                                break;
                              case 'customShortKey':
                                fieldName = '短链KEY';
                                break;
                              case 'customDomain':
                                fieldName = '自定义域名';
                                break;
                              default:
                                fieldName = key;
                            }

                            return (
                              <List.Item>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                  <Text strong>{fieldName}</Text>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '8px',
                                    }}
                                  >
                                    <div>
                                      <Tag color="red">修改前</Tag>
                                      <Text
                                        style={{
                                          maxWidth: '100%',
                                          display: 'inline-block',
                                          verticalAlign: 'middle',
                                        }}
                                        ellipsis={{ tooltip: value.from }}
                                      >
                                        {value.from || '(空)'}
                                      </Text>
                                    </div>
                                    <div>
                                      <Tag color="green">修改后</Tag>
                                      <Text
                                        style={{
                                          maxWidth: '100%',
                                          display: 'inline-block',
                                          verticalAlign: 'middle',
                                        }}
                                        ellipsis={{ tooltip: value.to }}
                                      >
                                        {value.to || '(空)'}
                                      </Text>
                                    </div>
                                  </div>
                                </Space>
                              </List.Item>
                            );
                          }}
                        />
                      ) : (
                        <Text>{record.description}</Text>
                      )}
                      <div style={{ marginTop: 8, textAlign: 'right' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          IP: {record.ipAddress}
                        </Text>
                      </div>
                    </Card>
                  ),
                }))}
              />
            </div>
          ) : (
            <Empty description="暂无历史记录" />
          )}
        </>
      ) : (
        <Empty description="获取详情失败" />
      )}
    </Drawer>
  );
};

export default LinkDetailDrawer;
