import React, { useEffect, useState } from "react";
import { 
  Typography, 
  Card, 
  Space, 
  Breadcrumb, 
  Alert, 
  Progress, 
  Row, 
  Col, 
  Statistic, 
  Divider, 
  Table, 
  Button, 
  Tooltip 
} from "antd";
import { 
  LineChartOutlined, 
  AlertOutlined, 
  ReloadOutlined, 
  ClockCircleOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { fetchPredictions } from "../api";
import PredictionChart from "../components/PredictionChart";

const { Title, Text, Paragraph } = Typography;

interface PredictionData {
  predicted_max_id_in_30_days: number;
  current_max_id: number;
  growth_rate_per_day: number;
  days_until_overflow: number;
}

const PredictionsPage: React.FC = () => {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const data = await fetchPredictions();
      
      // Transform data to include additional calculated fields
      const currentMaxId = 2000000000; // This should come from the API in a real app
      const enhancedData = {
        ...data,
        current_max_id: currentMaxId,
        growth_rate_per_day: (data.predicted_max_id_in_30_days - currentMaxId) / 30,
        days_until_overflow: data.predicted_max_id_in_30_days > 2147483647 
          ? Math.floor(30 * (2147483647 - currentMaxId) / (data.predicted_max_id_in_30_days - currentMaxId))
          : 9999 // If not projected to overflow, use a large number
      };
      
      setPredictionData(enhancedData);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  // Calculate the percentage to overflow
  const calculateOverflowPercentage = () => {
    if (!predictionData) return 0;
    
    const maxPossibleId = 2147483647; // INT MAX
    const currentPercentage = (predictionData.current_max_id / maxPossibleId) * 100;
    return Math.min(Math.round(currentPercentage), 100);
  };

  const renderSeverityAlert = () => {
    if (!predictionData) return null;
    
    const daysUntil = predictionData.days_until_overflow;
    
    if (daysUntil <= 7) {
      return (
        <Alert
          message="Critical Overflow Risk"
          description="Integer overflow is imminent. Immediate action required to prevent data corruption."
          type="error"
          showIcon
          icon={<AlertOutlined />}
          action={
            <Button size="small" danger>
              Mitigate Now
            </Button>
          }
        />
      );
    } else if (daysUntil <= 30) {
      return (
        <Alert
          message="High Overflow Risk"
          description="Integer overflow projected within 30 days. Plan mitigation steps soon."
          type="warning"
          showIcon
        />
      );
    } else if (daysUntil <= 90) {
      return (
        <Alert
          message="Moderate Overflow Risk"
          description="Integer overflow projected within 3 months. Add this to your planned work."
          type="info"
          showIcon
        />
      );
    } else {
      return (
        <Alert
          message="Low Overflow Risk"
          description="No imminent risk of integer overflow. Continue monitoring."
          type="success"
          showIcon
        />
      );
    }
  };

  const mitigationSteps = [
    { key: "1", step: "Change ID column to BIGINT", difficulty: "Medium", impact: "None" },
    { key: "2", step: "Implement ID reset with offset", difficulty: "Hard", impact: "Medium" },
    { key: "3", step: "Partition the table", difficulty: "Hard", impact: "Low" },
    { key: "4", step: "Implement UUID instead of sequential IDs", difficulty: "Hard", impact: "High" },
  ];

  const mitColumns = [
    { title: "Mitigation Step", dataIndex: "step", key: "step" },
    { 
      title: "Difficulty", 
      dataIndex: "difficulty", 
      key: "difficulty",
      render: (text: string) => {
        const color = text === "Easy" ? "green" : text === "Medium" ? "orange" : "red";
        return <Text style={{ color }}>{text}</Text>;
      }
    },
    { 
      title: "Application Impact", 
      dataIndex: "impact", 
      key: "impact",
      render: (text: string) => {
        const color = text === "None" ? "green" : text === "Low" ? "blue" : text === "Medium" ? "orange" : "red";
        return <Text style={{ color }}>{text}</Text>;
      }
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
          { title: "Integer Overflow Predictions" }
        ]} />
        
        <Space direction="horizontal" style={{ width: "100%", justifyContent: "space-between" }}>
          <Title level={2}>
            <LineChartOutlined /> Integer Overflow Predictions
          </Title>
          <Tooltip title="Refresh predictions">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadPredictions} 
              loading={loading}
            />
          </Tooltip>
        </Space>
        
        {renderSeverityAlert()}
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Current Status" loading={loading}>
              <Paragraph>
                <InfoCircleOutlined /> Integer columns in databases have a maximum value of 2,147,483,647. 
                Exceeding this limit causes overflow and potential data corruption.
              </Paragraph>
              
              <div style={{ marginBottom: 12 }}>
                <Text>ID usage progress:</Text>
                <Progress 
                  percent={calculateOverflowPercentage()} 
                  status={
                    calculateOverflowPercentage() > 90 ? "exception" : 
                    calculateOverflowPercentage() > 70 ? "normal" : "success"
                  }
                />
              </div>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic 
                    title="Current Max ID"
                    value={predictionData?.current_max_id.toLocaleString() || "Loading"}
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Remaining Capacity"
                    value={predictionData ? (2147483647 - predictionData.current_max_id).toLocaleString() : "Loading"}
                    valueStyle={{ color: "#1677ff" }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="Forecast" loading={loading}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="ID Growth Rate"
                    value={predictionData?.growth_rate_per_day.toFixed(0) || "Loading"}
                    valueStyle={{ color: "#cf1322" }}
                    suffix="per day"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Days Until Overflow"
                    value={predictionData?.days_until_overflow === 9999 
                      ? "Safe" 
                      : predictionData?.days_until_overflow?.toString() || "Loading"}
                    valueStyle={{ 
                      color: predictionData?.days_until_overflow && predictionData.days_until_overflow <= 30 
                        ? "#cf1322" 
                        : predictionData?.days_until_overflow && predictionData.days_until_overflow <= 90 
                          ? "#faad14" 
                          : "#3f8600" 
                    }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
              </Row>
              
              <Divider />
              
              <Statistic
                title="Predicted Max ID in 30 Days"
                value={predictionData?.predicted_max_id_in_30_days?.toLocaleString() || "Loading"}
                valueStyle={{ 
                  color: predictionData?.predicted_max_id_in_30_days && predictionData.predicted_max_id_in_30_days > 2147483647 
                    ? "#cf1322" 
                    : "#3f8600" 
                }}
              />
            </Card>
          </Col>
        </Row>
        
        <Card title="ID Growth Projection" loading={loading}>
          <PredictionChart />
        </Card>
        
        <Card title="Recommended Mitigation Steps" loading={loading}>
          <Table 
            dataSource={mitigationSteps} 
            columns={mitColumns} 
            pagination={false}
          />
        </Card>
      </Space>
    </div>
  );
};

export default PredictionsPage; 