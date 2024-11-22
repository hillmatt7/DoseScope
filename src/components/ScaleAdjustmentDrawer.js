// src/components/ScaleAdjustmentDrawer.js

import React from 'react';
import { Drawer, Form, Select, Button } from 'antd';

const { Option } = Select;

const ScaleAdjustmentDrawer = ({ visible, onClose, onSave }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    onSave(values);
    form.resetFields();
  };

  return (
    <Drawer
      title="Adjust Graph Scales"
      width={360}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="timeUnit"
          label="Time Unit"
          rules={[{ required: true, message: 'Please select the time unit' }]}
        >
          <Select placeholder="Select time unit">
            <Option value="days">Days</Option>
            <Option value="weeks">Weeks</Option>
          </Select>
        </Form.Item>
        {/* Add other scale adjustments as needed */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={onClose}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default ScaleAdjustmentDrawer;
