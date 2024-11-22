// src/components/NewProtocolDrawer.js

import React from 'react';
import { Drawer, Form, Input, Select, DatePicker, Button } from 'antd';

const { Option } = Select;

const NewProtocolDrawer = ({ visible, onClose, onCreate }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    onCreate(values);
    form.resetFields();
  };

  return (
    <Drawer
      title="New Protocol"
      width={360}
      onClose={onClose}
      open={visible}
      bodyStyle={{ paddingBottom: 80, backgroundColor: '#2b2b2b', color: '#fff' }}
      headerStyle={{ backgroundColor: '#1f1f1f', color: '#fff' }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select the start date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}>
            Create Protocol
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={onClose}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default NewProtocolDrawer;
