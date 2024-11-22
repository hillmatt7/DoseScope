// src/components/Footer.js

import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer className="footer" style={{ backgroundColor: '#1f1f1f', color: '#fff' }}>
      &copy; 2024 HealthChart
    </Footer>
  );
};

export default AppFooter;
