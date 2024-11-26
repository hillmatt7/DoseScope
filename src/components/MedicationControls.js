// src/components/MedicationControls.js

import React, { useState, useEffect } from 'react';
import { Button, Tag, Space, message } from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './MedicationControls.css'; // Ensure you have appropriate styling

const MedicationControls = ({
  protocol,
  setProtocol,
  setNotifications,
  setShowAddCompoundDrawer, // Receive as prop
}) => {
  const [medications, setMedications] = useState(protocol ? protocol.compounds : []);

  const addMedication = () => {
    if (protocol) {
      setShowAddCompoundDrawer(true); // Open the AddCompoundDrawer directly
    } else {
      message.error('No protocol selected.');
    }
  };

  const removeMedication = (medication) => {
    const updatedCompounds = medications.filter((med) => med !== medication);
    setMedications(updatedCompounds);
    setProtocol({ ...protocol, compounds: updatedCompounds });

    setNotifications((prevNotifications) => [
      {
        message: `Removed medication: ${medication.name}`,
        time: new Date(),
      },
      ...prevNotifications,
    ]);
  };

  useEffect(() => {
    if (protocol) {
      setMedications(protocol.compounds);
    }
  }, [protocol]);

  return (
    <div className="medication-controls">
      <Button
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        onClick={addMedication}
        className="add-medication-btn"
        style={{
          backgroundColor: '#ff4d4f',
          borderColor: '#ff4d4f',
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
        }}
      />
      <Space direction="vertical" className="medication-tags">
        {medications.map((med, index) => (
          <Tag
            key={index}
            closable
            onClose={() => removeMedication(med)}
            closeIcon={<CloseCircleOutlined />}
            color="volcano"
          >
            {med.name}
          </Tag>
        ))}
      </Space>
    </div>
  );
};

export default MedicationControls;
