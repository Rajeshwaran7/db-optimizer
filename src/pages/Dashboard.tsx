import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Typography, Divider, List, Badge, Progress, Space } from "antd";
import { 
  DatabaseOutlined, 
  WarningOutlined, 
  CheckCircleOutlined, 
  LineChartOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { fetchIssues, fetchPredictions } from "../api";
import PredictionChart from "../components/PredictionChart";

const { Title, Text } = Typography;

interface Issue {
  table: string;
  column: string;
  issue: string;
  suggested_fix: string;
}

const Dashboard: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [issuesData, predictionsData] = await Promise.all([
          fetchIssues(),
          fetchPredictions()
        ]);
        
        setIssues(issuesData.issues);
        setPrediction(predictionsData.predicted_max_id_in_30_days);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate database health score based on issues
  const healthScore = issues.length > 0 
    ? Math.max(0, 100 - (issues.length * 10)) 
    : 100;

  const getHealthStatus = () => {
    if (healthScore >= 80) return { color: "#52c41a", text: "Good" };
    if (healthScore >= 50) return { color: "#faad14", text: "Average" };
    return { color: "#f5222d", text: "Poor" };
  };

  const healthStatus = getHealthStatus();

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>Database Overview</Title>
        
        {/* Statistics Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={loading}>
              <Statistic
                title="Database Issues"
                value={issues.length}
                valueStyle={{ color: issues.length > 0 ? "#ff4d4f" : "#52c41a" }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={loading}>
              <Statistic
                title="Database Health"
                value={healthStatus.text}
                valueStyle={{ color: healthStatus.color }}
                prefix={<DatabaseOutlined />}
              />
              <Progress percent={healthScore} status={healthScore < 60 ? "exception" : "normal"} strokeColor={healthStatus.color} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={loading}>
              <Statistic
                title="Max ID Growth"
                value={prediction ? (prediction - 2000000000).toLocaleString() : "N/A"}
                valueStyle={{ color: "#1677ff" }}
                prefix={<LineChartOutlined />}
                suffix="in 30 days"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={loading}>
              <Statistic
                title="Estimated Overflow Time"
                value={prediction && prediction > 2000000000 ? "~30 days" : "Safe"}
                valueStyle={{ 
                  color: prediction && prediction > 2000000000 ? "#faad14" : "#52c41a" 
                }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Prediction Chart */}
        <Card title="Integer Overflow Prediction" loading={loading}>
          <PredictionChart />
        </Card>

        {/* Recent Issues */}
        <Card title="Recent Database Issues" loading={loading}>
          {issues.length > 0 ? (
            <List
              dataSource={issues.slice(0, 5)}
              renderItem={(issue) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge color="red" />}
                    title={`${issue.table}.${issue.column}`}
                    description={issue.issue}
                  />
                  <Text type="secondary">{issue.suggested_fix}</Text>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a" }} />
              <p>No database issues detected</p>
            </div>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default Dashboard; 