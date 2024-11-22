// src/components/PropertiesDrawer.js

import React from 'react';
import { Drawer, Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const PropertiesDrawer = ({ visible, protocol, onClose, onUpdate }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const updatedProtocol = { ...protocol, ...values };
    onUpdate(updatedProtocol);
    form.resetFields();
  };

  return (
    <Drawer
      title="Protocol Properties"
      width={360}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={protocol}>
        <Form.Item
          name="name"
          label="Protocol Name"
          rules={[{ required: true, message: 'Please enter the protocol name' }]}
        >
          <Input placeholder="Enter protocol name" />
        </Form.Item>
        <Form.Item
          name="length"
          label="Protocol Length"
          rules={[{ required: true, message: 'Please enter the protocol length' }]}
        >
          <Input type="number" placeholder="Enter length" />
        </Form.Item>
        <Form.Item
          name="lengthUnit"
          label="Length Unit"
          rules={[{ required: true, message: 'Please select the length unit' }]}
        >
          <Select placeholder="Select unit">
            <Option value="days">Days</Option>
            <Option value="weeks">Weeks</Option>
          </Select>
        </Form.Item>
        {/* Add other properties as needed */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={onClose}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default PropertiesDrawer;
