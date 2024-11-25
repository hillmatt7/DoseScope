// src/components/AddCompoundDrawer.js

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
  Button,
  message,
} from 'antd';

const { Option } = Select;

const AddCompoundDrawer = ({ visible, onClose, protocol, setProtocol }) => {
  const [compounds, setCompounds] = useState([]);
  const [selectedCompound, setSelectedCompound] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // Fetch compounds from local library
    const fetchCompounds = async () => {
      try {
        const response = await window.electronAPI.invoke('get-compounds');
        setCompounds(response);
      } catch (error) {
        console.error('Error fetching compounds:', error);
        message.error('Failed to load compounds.');
      }
    };

    fetchCompounds();
  }, []);

  const handleCompoundSelect = (value) => {
    const compound = compounds.find((c) => c.name === value);
    setSelectedCompound(compound);
  };

  const handleAddCompound = (values) => {
    if (!protocol) {
      message.error('No protocol selected.');
      return;
    }

    if (!selectedCompound) {
      message.error('Please select a compound.');
      return;
    }

    const updatedProtocol = {
      ...protocol,
      compounds: [
        ...protocol.compounds,
        {
          ...selectedCompound,
          ...values,
          startDay: values.durationFrom,
          endDay: values.durationTo,
        },
      ],
    };
    setProtocol(updatedProtocol);
    message.success('Compound added to protocol.');
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title="Add Compound to Protocol"
      placement="right"
      width={480}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ backgroundColor: '#2b2b2b', color: '#fff' }}
    >
      <Form form={form} layout="vertical" onFinish={handleAddCompound}>
        <Form.Item
          name="compoundName"
          label="Select Compound"
          rules={[{ required: true, message: 'Please select a compound' }]}
        >
          <Select
            placeholder="Select Compound"
            onChange={handleCompoundSelect}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {compounds.map((compound) => (
              <Option key={compound.name} value={compound.name}>
                {compound.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedCompound && (
          <>
            <Form.Item
              name="dose"
              label="Dosage"
              rules={[{ required: true, message: 'Please enter the dosage' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter dosage"
                min={0}
              />
            </Form.Item>
            <Form.Item name="doseUnit" label="Dosage Unit" initialValue="mg">
              <Select>
                <Option value="mcg">mcg</Option>
                <Option value="mg">mg</Option>
                <Option value="g">g</Option>
              </Select>
            </Form.Item>
            <Form.Item name="offsetDays" label="Offset (days)" initialValue={0}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="dosingSchedule"
              label="Dosing Schedule"
              initialValue="Once a day"
            >
              <Select>
                <Option value="4 times a day">4 times a day</Option>
                <Option value="3 times a day">3 times a day</Option>
                <Option value="2 times a day">2 times a day</Option>
                <Option value="Once a day">Once a day</Option>
                <Option value="Every other day">Every other day</Option>
                <Option value="3 times a week">3 times a week</Option>
                <Option value="Once every 3 days">Once every 3 days</Option>
                <Option value="Once every 3.5 days">Once every 3.5 days</Option>
                <Option value="Once every 4 days">Once every 4 days</Option>
                <Option value="Once every 5 days">Once every 5 days</Option>
                <Option value="Once every 6 days">Once every 6 days</Option>
                <Option value="Once every 7 days">Once every 7 days</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Duration">
              <Input.Group compact>
                <Form.Item
                  name="durationFrom"
                  noStyle
                  rules={[{ required: true, message: 'Start week required' }]}
                >
                  <InputNumber
                    min={1}
                    max={protocol.length}
                    placeholder="From Week"
                    style={{ width: '50%' }}
                  />
                </Form.Item>
                <Form.Item
                  name="durationTo"
                  noStyle
                  rules={[{ required: true, message: 'End week required' }]}
                >
                  <InputNumber
                    min={1}
                    max={protocol.length}
                    placeholder="Through Week"
                    style={{ width: '50%' }}
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
            <Form.Item
              name="adjustLevels"
              label="Adjust Levels (%)"
              initialValue={0}
            >
              <InputNumber style={{ width: '100%' }} min={-100} max={100} />
            </Form.Item>
            <Form.Item
              name="accumulate"
              valuePropName="checked"
              initialValue={true}
            >
              <Checkbox style={{ color: '#fff' }}>Accumulate</Checkbox>
            </Form.Item>
            <Form.Item name="compare" valuePropName="checked">
              <Checkbox style={{ color: '#fff' }}>Compare</Checkbox>
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
                Add Compound
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </Form.Item>
          </>
        )}
      </Form>
    </Drawer>
  );
};

export default AddCompoundDrawer;
