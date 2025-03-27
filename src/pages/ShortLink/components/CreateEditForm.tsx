import { Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { DomainItem, LinkItem } from '../types';

const { TextArea } = Input;

interface CreateEditFormProps {
  form: any;
  currentItem: LinkItem | null;
  domains: DomainItem[];
  onFinish?: (values: any) => Promise<void>;
}

const CreateEditForm: React.FC<CreateEditFormProps> = ({
  form,
  currentItem,
  domains,
  onFinish,
}) => {
  // 当currentItem变化时重置表单
  useEffect(() => {
    if (currentItem) {
      form.setFieldsValue({
        longUrl: currentItem.longUrl,
        customDomain: currentItem.customDomain,
        customShortKey: currentItem.shortKey,
        remark: currentItem.remark,
      });
    } else {
      form.resetFields();
    }
  }, [form, currentItem]);

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="原始链接"
        name="longUrl"
        rules={[{ required: true, type: 'url', message: '请输入有效的URL' }]}
      >
        <Input placeholder="请输入原始链接" />
      </Form.Item>

      <Form.Item
        label="自定义短链key"
        name="customShortKey"
        extra="可选，长度4-6位，不填则自动生成"
        rules={[
          {
            min: 4,
            max: 6,
            message: '长度必须在4-6位之间',
          },
          {
            pattern: /^[a-zA-Z0-9-_]+$/,
            message: '只能包含字母、数字、下划线和横线',
          },
        ]}
      >
        <Input placeholder="请输入自定义短链key" />
      </Form.Item>

      <Form.Item
        label="备注"
        name="remark"
        extra="选填，最多256个字符"
        rules={[
          {
            max: 256,
            message: '备注最多256个字符',
          },
        ]}
      >
        <TextArea
          placeholder="请输入备注信息"
          autoSize={{ minRows: 2, maxRows: 6 }}
          maxLength={256}
          showCount
        />
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
  );
};

export default CreateEditForm;
