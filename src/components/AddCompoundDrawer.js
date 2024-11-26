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
  const [selectedRoute, setSelectedRoute] = useState('oral'); // Default route

  useEffect(() => {
    // Fetch compounds from local_library
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

  const handleAddCompound = async (values) => {
    if (!protocol) {
      message.error('No protocol selected.');
      return;
    }

    if (!selectedCompound) {
      message.error('Please select a compound.');
      return;
    }

    // Send data to Python backend for calculations
    try {
      const calculationResult = await calculatePharmacokinetics({
        compound: selectedCompound,
        dosingInfo: values,
      });
      if (calculationResult.success) {
        const updatedProtocol = {
          ...protocol,
          compounds: [
            ...protocol.compounds,
            {
              ...selectedCompound,
              ...values,
              startDay: values.durationFrom,
              endDay: values.durationTo,
              calculationResult: calculationResult.data, // Store the calculation result
            },
          ],
        };
        setProtocol(updatedProtocol);
        message.success('Compound added to protocol.');
        form.resetFields();
        onClose();
      } else {
        message.error(`Failed to calculate pharmacokinetics: ${calculationResult.message}`);
      }
    } catch (error) {
      console.error('Error calculating pharmacokinetics:', error);
      message.error('Failed to calculate pharmacokinetics.');
    }
  };

  const calculatePharmacokinetics = async ({ compound, dosingInfo }) => {
    // Make an API request to the Python backend for calculations
    const requestData = {
      compound,
      dosingInfo,
    };
    try {
      const response = await fetch('http://localhost:8000/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error communicating with Python backend:', error);
      return { success: false };
    }
  };

  const handleAddNewCompound = async (values) => {
    if (
      !values.name ||
      values.halfLife === undefined ||
      values.Cmax === undefined ||
      values.volume_of_distribution === undefined ||
      values.ka === undefined
    ) {
      message.error('Please fill out all required fields.');
      return;
    }

    // Prepare compound data with keys matching the file format
    const compoundData = {
      name: values.name,
      therapeutic_use: values.therapeutic_use || '',
      chemical_structure: values.chemical_structure || '',
      mechanism_of_action: values.mechanism_of_action || '',
      halfLife: values.halfLife === '' ? NaN : parseFloat(values.halfLife),
      halfLifeUnit: values.halfLifeUnit,
      Cmax: values.Cmax === '' ? NaN : parseFloat(values.Cmax),
      Tmax: values.Tmax === '' ? NaN : parseFloat(values.Tmax),
      TmaxUnit: values.TmaxUnit || '',
      bioavailability_oral: values.bioavailability_oral === '' ? NaN : parseFloat(values.bioavailability_oral),
      bioavailability_iv: values.bioavailability_iv === '' ? NaN : parseFloat(values.bioavailability_iv),
      bioavailability_im: values.bioavailability_im === '' ? NaN : parseFloat(values.bioavailability_im),
      bioavailability_subcutaneous: values.bioavailability_subcutaneous === '' ? NaN : parseFloat(values.bioavailability_subcutaneous),
      bioavailability_inhalation: values.bioavailability_inhalation === '' ? NaN : parseFloat(values.bioavailability_inhalation),
      bioavailability_cream: values.bioavailability_cream === '' ? NaN : parseFloat(values.bioavailability_cream),
      volume_of_distribution: values.volume_of_distribution === '' ? NaN : parseFloat(values.volume_of_distribution),
      ka: values.ka === '' ? NaN : parseFloat(values.ka),
      topical_base: values.topical_base || '',
      model: values.model || '',
      notes: values.notes || '',
    };

    try {
      const result = await window.electronAPI.invoke('add-compound', compoundData);
      if (result) {
        message.success('Compound saved successfully!');
        // Refresh compounds list
        const response = await window.electronAPI.invoke('get-compounds');
        setCompounds(response);
        addNewForm.resetFields();
        // Switch back to 'Add Existing Compound' tab
        setActiveTab('existing');
        // Set the newly added compound as selected
        setSelectedCompound(compoundData);
        form.setFieldsValue({ compoundName: compoundData.name });
      } else {
        message.error('Failed to save compound.');
      }
    } catch (error) {
      console.error('Error saving compound:', error);
      message.error('Failed to save compound.');
    }
  };

  // Route-specific visibility logic
  const renderBioavailabilityFields = () => {
    const routes = ['oral', 'iv', 'im', 'subcutaneous', 'inhalation', 'cream'];
    return routes.map((route) => (
      <Form.Item
        key={`bioavailability_${route}`}
        name={`bioavailability_${route}`}
        label={`Bioavailability (${route})`}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          max={1}
          step={0.01}
          placeholder={`Bioavailability (${route})`}
        />
      </Form.Item>
    ));
  };

  const renderTopicalBaseField = () => (
    <Form.Item name="topical_base" label="Topical Base (used in cream)">
      <Input placeholder="Topical Base (used in cream)" />
    </Form.Item>
  );

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
                  name="route"
                  label="Administration Route"
                  rules={[{ required: true, message: 'Please select a route' }]}
                  initialValue="oral"
                >
                  <Select onChange={(value) => setSelectedRoute(value)}>
                    <Option value="oral">Oral</Option>
                    <Option value="iv">IV</Option>
                    <Option value="im">IM (Intramuscular)</Option>
                    <Option value="subcutaneous">Subcutaneous</Option>
                    <Option value="inhalation">Inhalation</Option>
                    <Option value="cream">Cream</Option>
                  </Select>
                </Form.Item>
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
                  label="Dosing Interval (hours)"
                  initialValue={24}
                  rules={[{ required: true, message: 'Please enter dosing interval' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="Dosing interval in hours"
                  />
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
            <Form.Item
              name="therapeutic_use"
              label="Therapeutic Use (Primary Level)"
              rules={[{ required: true, message: 'Please enter the therapeutic use' }]}
            >
              <Input placeholder="Therapeutic Use (required)" />
            </Form.Item>
            <Form.Item
              name="chemical_structure"
              label="Chemical Structure (Secondary Level)"
              rules={[{ required: true, message: 'Please enter the chemical structure' }]}
            >
              <Input placeholder="Chemical Structure (required)" />
            </Form.Item>
            <Form.Item
              name="mechanism_of_action"
              label="Mechanism of Action (Tertiary Level)"
              rules={[{ required: true, message: 'Please enter the mechanism of action' }]}
            >
              <Input placeholder="Mechanism of Action (required)" />
            </Form.Item>
            <Form.Item
              name="volume_of_distribution"
              label="Volume of Distribution (L)"
              rules={[{ required: true, message: 'Please enter Vd' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Vd (L)" />
            </Form.Item>
            <Form.Item
              name="ka"
              label="Absorption Rate Constant (ka)"
              rules={[{ required: true, message: 'Please enter ka' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="ka (1/h)" />
            </Form.Item>
            <Form.Item
              name="halfLife"
              label="Half-Life (required)"
              rules={[{ required: true, message: 'Please enter the half-life' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Half-Life" />
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
              label="Cmax (ng/ml, required)"
              rules={[{ required: true, message: 'Please enter Cmax' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="Cmax (ng/ml)"
              />
            </Form.Item>
            <Form.Item name="Tmax" label="Tmax (optional)">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Tmax" />
            </Form.Item>
            <Form.Item name="TmaxUnit" label="Tmax Unit" initialValue="hours">
              <Select>
                <Option value="seconds">Seconds</Option>
                <Option value="minutes">Minutes</Option>
                <Option value="hours">Hours</Option>
                <Option value="days">Days</Option>
              </Select>
            </Form.Item>
            {/* Render bioavailability fields */}
            {renderBioavailabilityFields()}
            {/* Only show topical_base field if cream bioavailability is provided */}
            {addNewForm.getFieldValue('bioavailability_cream') && renderTopicalBaseField()}
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
