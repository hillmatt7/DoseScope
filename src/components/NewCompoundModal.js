// src/components/NewCompoundModal.js

import React from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
} from 'antd';

const { Option } = Select;

const NewCompoundModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();

  const handleSaveCompound = async (values) => {
    try {
      await window.electronAPI.invoke('add-compound', values);
      // Handle success (e.g., show notification)
      onClose();
    } catch (error) {
      console.error('Error saving compound:', error);
      // Handle error appropriately
    }
  };

  return (
    <Modal
      title="New Compound"
      visible={visible}
      onCancel={onClose}
      footer={null}
      bodyStyle={{ backgroundColor: '#2b2b2b', color: '#fff' }}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" onFinish={handleSaveCompound}>
        <Form.Item
          name="name"
          label="Compound Name"
          rules={[{ required: true, message: 'Please enter the compound name' }]}
        >
          <Input placeholder="Enter compound name" />
        </Form.Item>
        <Form.Item name="type" label="Type">
          <Input placeholder="Enter type" />
        </Form.Item>
        <Form.Item name="category" label="Category">
          <Input placeholder="Enter category" />
        </Form.Item>
        <Form.Item name="molecularWeight" label="Molecular Weight (g/mol)">
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item
          name="halfLife"
          label="Half-Life"
          rules={[{ required: true, message: 'Please enter the half-life' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item
          name="halfLifeUnit"
          label="Half-Life Unit"
          initialValue="hours"
        >
          <Select>
            <Option value="seconds">Seconds</Option>
            <Option value="minutes">Minutes</Option>
            <Option value="hours">Hours</Option>
            <Option value="days">Days</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="Cmax"
          label="Cmax (ng/ml)"
          rules={[{ required: true, message: 'Please enter Cmax' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item name="Tmax" label="Tmax">
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item name="TmaxUnit" label="Tmax Unit" initialValue="hours">
          <Select>
            <Option value="seconds">Seconds</Option>
            <Option value="minutes">Minutes</Option>
            <Option value="hours">Hours</Option>
            <Option value="days">Days</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="bioavailability"
          label="Bioavailability (0-1)"
          rules={[{ required: true, message: 'Please enter bioavailability' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={1}
            step={0.01}
          />
        </Form.Item>
        <Form.Item name="model" label="Model">
          <Input placeholder="Enter model" />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea placeholder="Enter any notes" rows={4} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              marginRight: 8,
              backgroundColor: '#ff4d4f',
              borderColor: '#ff4d4f',
            }}
          >
            Save Compound
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewCompoundModal;
