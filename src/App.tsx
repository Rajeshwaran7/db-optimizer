import React, { useState } from "react";
import { Layout, Menu, Breadcrumb, Typography, theme as antdTheme, ConfigProvider } from "antd";
import {
  DashboardOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Pages
import Dashboard from "./pages/Dashboard";
import IssuesPage from "./pages/IssuesPage";
import PredictionsPage from "./pages/PredictionsPage";
import SettingsPage from "./pages/SettingsPage";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = antdTheme.useToken();
  const { theme: themeMode } = useTheme();

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
          theme="dark"
        >
          <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
            <Title level={4} style={{ color: token.colorPrimary, margin: 0 }}>
              {!collapsed ? 'DB Optimizer' : 'DB'}
            </Title>
          </div>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1" icon={<DashboardOutlined />}>
              <Link to="/dashboard">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<DatabaseOutlined />}>
              <Link to="/issues">Database Issues</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<LineChartOutlined />}>
              <Link to="/predictions">Predictions</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<SettingOutlined />}>
              <Link to="/settings">Settings</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
          <Header style={{ 
            padding: 0, 
            background: token.colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)'
          }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: '18px', padding: '0 24px', cursor: 'pointer' }
            })}
            <Title level={4} style={{ margin: 0 }}>DB Optimizer Dashboard</Title>
          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: token.colorBgContainer, borderRadius: 4 }}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/issues" element={<IssuesPage />} />
              <Route path="/predictions" element={<PredictionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  const { theme } = useTheme();
  const { defaultAlgorithm, darkAlgorithm } = antdTheme;
  
  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <AppContent />
    </ConfigProvider>
  );
};

const AppWithTheme: React.FC = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWithTheme;
