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
  Tabs,
} from 'antd';

const { Option } = Select;
const { TabPane } = Tabs;

const AddCompoundDrawer = ({ visible, onClose, protocol, setProtocol }) => {
  const [compounds, setCompounds] = useState([]);
  const [selectedCompound, setSelectedCompound] = useState(null);
  const [form] = Form.useForm();
  const [addNewForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('existing');

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

  const handleAddNewCompound = async (values) => {
    if (!values.name || !values.halfLife || !values.Cmax || !values.bioavailability) {
      message.error('Please fill out all required fields.');
      return;
    }

    try {
      await window.electronAPI.invoke('add-compound', values);
      message.success('Compound saved successfully!');
      // Refresh compounds list
      const response = await window.electronAPI.invoke('get-compounds');
      setCompounds(response);
      addNewForm.resetFields();
      // Switch back to 'Add Existing Compound' tab
      setActiveTab('existing');
      // Set the newly added compound as selected
      setSelectedCompound(values);
      form.setFieldsValue({ compoundName: values.name });
    } catch (error) {
      console.error('Error saving compound:', error);
      message.error('Failed to save compound.');
    }
  };

  return (
    <Drawer
      title="Add Compound"
      placement="right"
      width={480}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ backgroundColor: '#2b2b2b', color: '#fff' }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Add Existing Compound" key="existing">
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
        </TabPane>
        <TabPane tab="Add New Compound" key="new">
          <Form form={addNewForm} layout="vertical" onFinish={handleAddNewCompound}>
            <Form.Item
              name="name"
              label="Compound Name"
              rules={[{ required: true, message: 'Please enter the compound name' }]}
            >
              <Input placeholder="Compound Name (required)" />
            </Form.Item>
            <Form.Item name="type" label="Type">
              <Input placeholder="Type (optional)" />
            </Form.Item>
            <Form.Item name="category" label="Category">
              <Input placeholder="Category (optional)" />
            </Form.Item>
            <Form.Item name="molecularWeight" label="Molecular Weight (g/mol)">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Molecular Weight (optional)" />
            </Form.Item>
            <Form.Item
              name="halfLife"
              label="Half-Life (required)"
              rules={[{ required: true, message: 'Please enter the half-life' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Half-Life (hours)" />
            </Form.Item>
            <Form.Item
              name="halfLifeUnit"
              label="Half-Life Unit"
              initialValue="hours"
            >
              <Select>
                <Option value="hours">Hours</Option>
                <Option value="days">Days</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="Cmax"
              label="Cmax (ng/ml, required)"
              rules={[{ required: true, message: 'Please enter Cmax' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Cmax (ng/ml)" />
            </Form.Item>
            <Form.Item name="Tmax" label="Tmax (hours, optional)">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Tmax (hours)" />
            </Form.Item>
            <Form.Item
              name="bioavailability"
              label="Bioavailability (0-1, required)"
              rules={[{ required: true, message: 'Please enter bioavailability' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={1}
                step={0.01}
                placeholder="Bioavailability (0-1)"
              />
            </Form.Item>
            <Form.Item name="model" label="Model">
              <Input placeholder="Model (optional)" />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea placeholder="Notes (optional)" rows={4} />
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
              <Button onClick={() => addNewForm.resetFields()}>Reset</Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Drawer>
  );
};

export default AddCompoundDrawer;
