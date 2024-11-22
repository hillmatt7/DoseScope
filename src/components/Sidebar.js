// src/components/Sidebar.js

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  PlusCircleOutlined,
  SettingOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const AppSidebar = ({
  currentProtocol,
  setShowPropertiesDrawer,
  setShowNewCompoundModal,
}) => {
  const handleAddCompound = () => {
    if (currentProtocol) {
      window.electronAPI.send('open-add-compound');
    } else {
      // Handle no protocol selected
    }
  };

  const handleOpenProperties = () => {
    if (currentProtocol) {
      setShowPropertiesDrawer(true);
    } else {
      // Handle no protocol selected
    }
  };

  const handleNewCompound = () => {
    setShowNewCompoundModal(true);
  };

  return (
    <Sider width={80} theme="dark" style={{ backgroundColor: '#1f1f1f' }}>
      <Menu
        mode="inline"
        theme="dark"
        style={{ height: '100%', backgroundColor: '#1f1f1f' }}
      >
        <Menu.Item
          key="newCompound"
          icon={<PlusOutlined style={{ fontSize: '24px', color: '#fff' }} />}
          onClick={handleNewCompound}
        />
        <Menu.Item
          key="addCompound"
          icon={
            <PlusCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />
          }
          onClick={handleAddCompound}
        />
        <Menu.Item
          key="properties"
          icon={
            <SettingOutlined style={{ fontSize: '24px', color: '#fff' }} />
          }
          onClick={handleOpenProperties}
        />
        {/* Additional menu items */}
      </Menu>
    </Sider>
  );
};

export default AppSidebar;
