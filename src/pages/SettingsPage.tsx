import React, { useState } from "react";
import { 
  Typography, 
  Card, 
  Space, 
  Breadcrumb, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Divider, 
  Tabs, 
  notification, 
  InputNumber,
  Col,
  Row
} from "antd";
import { 
  SettingOutlined, 
  DatabaseOutlined, 
  BellOutlined, 
  SaveOutlined,
  UserOutlined,
  MailOutlined,
  SunOutlined,
  MoonOutlined
} from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const SettingsPage: React.FC = () => {
  const [databaseForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [savingDb, setSavingDb] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSaveDbSettings = (values: any) => {
    setSavingDb(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Database settings saved:", values);
      setSavingDb(false);
      notification.success({
        message: "Settings Saved",
        description: "Database connection settings have been updated successfully.",
      });
    }, 1000);
  };

  const handleSaveNotificationSettings = (values: any) => {
    setSavingNotifications(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Notification settings saved:", values);
      setSavingNotifications(false);
      notification.success({
        message: "Settings Saved",
        description: "Notification settings have been updated successfully.",
      });
    }, 1000);
  };

  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = path;
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Breadcrumb items={[
          { title: <a href="/dashboard" onClick={handleNavigate("/dashboard")}>Dashboard</a> },
          { title: "Settings" }
        ]} />
        
        <Title level={2}>
          <SettingOutlined /> Settings
        </Title>
        
        <Tabs defaultActiveKey="database" type="card">
          <TabPane 
            tab={<span><DatabaseOutlined /> Database Connection</span>} 
            key="database"
          >
            <Card>
              <Form
                form={databaseForm}
                layout="vertical"
                onFinish={handleSaveDbSettings}
                initialValues={{
                  host: "localhost",
                  port: 5432,
                  database: "mydatabase",
                  username: "dbuser",
                  password: "********",
                  ssl: true,
                  connection_timeout: 30,
                  max_connections: 10
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="host"
                      label="Database Host"
                      rules={[{ required: true, message: "Please enter the database host" }]}
                    >
                      <Input prefix={<DatabaseOutlined />} placeholder="Host address" />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      name="port"
                      label="Port"
                      rules={[{ required: true, message: "Please enter the database port" }]}
                    >
                      <InputNumber min={1} max={65535} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  name="database"
                  label="Database Name"
                  rules={[{ required: true, message: "Please enter the database name" }]}
                >
                  <Input placeholder="Database name" />
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="username"
                      label="Username"
                      rules={[{ required: true, message: "Please enter the username" }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[{ required: true, message: "Please enter the password" }]}
                    >
                      <Input.Password placeholder="Password" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider orientation="left">Advanced Settings</Divider>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="ssl" label="SSL Connection" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  
                  <Col span={8}>
                    <Form.Item name="connection_timeout" label="Connection Timeout (seconds)">
                      <InputNumber min={1} max={120} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  
                  <Col span={8}>
                    <Form.Item name="max_connections" label="Max Connections">
                      <InputNumber min={1} max={100} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={savingDb}
                  >
                    Save Database Settings
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={<span><BellOutlined /> Notifications</span>} 
            key="notifications"
          >
            <Card>
              <Form
                form={notificationForm}
                layout="vertical"
                onFinish={handleSaveNotificationSettings}
                initialValues={{
                  email_notifications: true,
                  email: "admin@example.com",
                  notification_frequency: "daily",
                  critical_alerts: true,
                  warning_alerts: true,
                  info_alerts: false
                }}
              >
                <Form.Item
                  name="email_notifications"
                  label="Email Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Please enter email address" },
                    { type: "email", message: "Please enter a valid email" }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email address" />
                </Form.Item>
                
                <Form.Item name="notification_frequency" label="Notification Frequency">
                  <Select>
                    <Option value="realtime">Real-time</Option>
                    <Option value="hourly">Hourly</Option>
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                  </Select>
                </Form.Item>
                
                <Divider orientation="left">Alert Levels</Divider>
                
                <Form.Item name="critical_alerts" label="Critical Alerts" valuePropName="checked">
                  <Switch />
                </Form.Item>
                
                <Form.Item name="warning_alerts" label="Warning Alerts" valuePropName="checked">
                  <Switch />
                </Form.Item>
                
                <Form.Item name="info_alerts" label="Information Alerts" valuePropName="checked">
                  <Switch />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={savingNotifications}
                  >
                    Save Notification Settings
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
          
          <TabPane
            tab={<span><SettingOutlined /> Display</span>}
            key="display"
          >
            <Card>
              <Form layout="vertical">
                <Form.Item
                  label={
                    <Space>
                      <span>Theme</span>
                      {theme === "light" ? <SunOutlined /> : <MoonOutlined />}
                    </Space>
                  }
                >
                  <Space direction="vertical">
                    <Switch
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                      checkedChildren="Dark"
                      unCheckedChildren="Light"
                    />
                    <Text type="secondary">
                      Switch between light and dark theme for the application
                    </Text>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

export default SettingsPage; 