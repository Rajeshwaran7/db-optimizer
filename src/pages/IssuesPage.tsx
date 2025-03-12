import React, { useEffect, useState } from "react";
import { 
  Typography, 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  message, 
  Input, 
  Tooltip, 
  Breadcrumb 
} from "antd";
import { 
  DatabaseOutlined, 
  SearchOutlined, 
  SyncOutlined, 
  CheckCircleTwoTone 
} from "@ant-design/icons";
import { fetchIssues, applyFixes } from "../api";

const { Title, Text } = Typography;

interface Issue {
  table: string;
  column: string;
  issue: string;
  suggested_fix: string;
}

const IssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [applyingFixes, setApplyingFixes] = useState(false);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await fetchIssues();
      setIssues(data.issues);
    } catch (error) {
      console.error("Error fetching database issues:", error);
      message.error("Failed to fetch database issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleApplyFixes = async () => {
    setApplyingFixes(true);
    try {
      const res = await applyFixes();
      message.success({
        content: res.status,
        icon: <CheckCircleTwoTone twoToneColor="#52c41a" />
      });
      
      // Reload issues after applying fixes
      setTimeout(() => {
        loadIssues();
      }, 1000);
    } catch (error) {
      console.error("Error applying fixes:", error);
      message.error("Failed to apply fixes");
    } finally {
      setApplyingFixes(false);
    }
  };

  const filteredIssues = issues.filter(
    (issue) =>
      issue.table.toLowerCase().includes(searchText.toLowerCase()) ||
      issue.column.toLowerCase().includes(searchText.toLowerCase()) ||
      issue.issue.toLowerCase().includes(searchText.toLowerCase()) ||
      issue.suggested_fix.toLowerCase().includes(searchText.toLowerCase())
  );

  const getIssueTypeTag = (issueText: string) => {
    if (issueText.includes("overflow")) {
      return <Tag color="red">Overflow Risk</Tag>;
    } else if (issueText.includes("index")) {
      return <Tag color="orange">Index</Tag>;
    } else if (issueText.includes("performance")) {
      return <Tag color="blue">Performance</Tag>;
    } else {
      return <Tag color="default">Other</Tag>;
    }
  };

  const columns = [
    {
      title: "Table",
      dataIndex: "table",
      key: "table",
      sorter: (a: Issue, b: Issue) => a.table.localeCompare(b.table),
    },
    {
      title: "Column",
      dataIndex: "column",
      key: "column",
      sorter: (a: Issue, b: Issue) => a.column.localeCompare(b.column),
    },
    {
      title: "Issue",
      dataIndex: "issue",
      key: "issue",
      render: (text: string) => (
        <Space>
          {getIssueTypeTag(text)}
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Suggested Fix",
      dataIndex: "suggested_fix",
      key: "suggested_fix",
      render: (text: string) => (
        <Text code>{text}</Text>
      ),
    },
  ];

  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = path;
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Breadcrumb items={[
          { title: <a href="/dashboard" onClick={handleNavigate("/dashboard")}>Dashboard</a> },
          { title: "Database Issues" }
        ]} />
        
        <Space direction="horizontal" style={{ width: "100%", justifyContent: "space-between" }}>
          <Title level={2}>
            <DatabaseOutlined /> Database Issues
          </Title>
          <Space>
            <Input
              placeholder="Search issues..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Tooltip title="Refresh">
              <Button 
                icon={<SyncOutlined />} 
                onClick={loadIssues} 
                loading={loading}
              />
            </Tooltip>
          </Space>
        </Space>
        
        <Card>
          <Table
            dataSource={filteredIssues}
            columns={columns}
            rowKey={(record) => `${record.table}-${record.column}`}
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true, 
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} issues`
            }}
          />
          
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button
              type="primary"
              onClick={handleApplyFixes}
              loading={applyingFixes}
              disabled={issues.length === 0}
            >
              Apply All Fixes
            </Button>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default IssuesPage; 