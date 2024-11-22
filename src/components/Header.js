// src/components/Header.js

import React from 'react';
import { Layout, Tabs, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Header } = Layout;

const ProtocolTabs = ({ protocols, currentProtocol, setCurrentProtocol, setShowNewProtocolDrawer }) => (
  <Tabs
    type="card"
    activeKey={currentProtocol?.name}
    onChange={(key) => {
      const selectedProtocol = protocols.find((protocol) => protocol.name === key);
      setCurrentProtocol(selectedProtocol);
    }}
    tabBarExtraContent={
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setShowNewProtocolDrawer(true)}
        style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
      >
        New Protocol
      </Button>
    }
  >
    {protocols.map((protocol) => (
      <Tabs.TabPane tab={protocol.name} key={protocol.name} />
    ))}
  </Tabs>
);

const AppHeader = (props) => {
  return (
    <Header className="header">
      <div className="logo">DoseScope</div>
      <div className="tabs-container">
        <ProtocolTabs {...props} />
      </div>
    </Header>
  );
};

export default AppHeader;
