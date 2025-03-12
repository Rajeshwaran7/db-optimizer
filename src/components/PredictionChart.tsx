import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Area, ComposedChart } from "recharts";
import { fetchPredictions } from "../api";
import { Spin, Alert } from "antd";

interface ChartData {
  name: string;
  maxId: number;
  projected: boolean;
  daysFromNow: number;
}

const PredictionChart: React.FC = () => {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPredictions();
        setPrediction(data.predicted_max_id_in_30_days);
        
        // Generate chart data with more points for a smooth curve
        const currentMaxId = 2000000000;
        const dailyGrowth = (data.predicted_max_id_in_30_days - currentMaxId) / 30;
        
        // Create data points for the past 30 days (estimated based on growth rate)
        const pastData = Array.from({ length: 6 }, (_, i) => ({
          name: `Day ${-30 + (i * 6)}`,
          maxId: Math.max(1000000000, currentMaxId - dailyGrowth * (30 - (i * 6))),
          projected: false,
          daysFromNow: -30 + (i * 6)
        }));
        
        // Create data point for today
        const today = {
          name: "Today",
          maxId: currentMaxId,
          projected: false,
          daysFromNow: 0
        };
        
        // Create data points for future projections (every 5 days)
        const futureData = Array.from({ length: 7 }, (_, i) => ({
          name: `Day ${(i + 1) * 5}`,
          maxId: currentMaxId + dailyGrowth * ((i + 1) * 5),
          projected: true,
          daysFromNow: (i + 1) * 5
        }));
        
        // Combine all data points
        setChartData([...pastData, today, ...futureData]);
      } catch (err) {
        console.error("Error fetching prediction data:", err);
        setError("Failed to load prediction data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const formatYAxis = (value: number): string => {
    // Format large numbers with abbreviations
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p>{data.name} {data.daysFromNow !== 0 ? 
            `(${data.daysFromNow > 0 ? '+' : ''}${data.daysFromNow} days)` : 
            ''}
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ color: '#8884d8', fontWeight: 'bold' }}>
              Max ID: {data.maxId.toLocaleString()}
            </span>
          </p>
          <p style={{ margin: 0, fontSize: '0.8em', color: '#666' }}>
            {data.projected ? 'Projected' : 'Historical'} data
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <Spin tip="Loading prediction data..." />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  // Calculate warning threshold as 90% of INT_MAX
  const warningThreshold = 0.9 * 2147483647;
  
  // Calculate danger threshold as INT_MAX
  const dangerThreshold = 2147483647;

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Add reference lines for warning and danger thresholds */}
          <ReferenceLine 
            y={warningThreshold} 
            label={{ value: "Warning (90% of INT MAX)", position: "top", fill: "#faad14" }} 
            stroke="#faad14" 
            strokeDasharray="3 3" 
          />
          <ReferenceLine 
            y={dangerThreshold} 
            label={{ value: "INT MAX", position: "top", fill: "#ff4d4f" }} 
            stroke="#ff4d4f" 
            strokeDasharray="3 3" 
          />
          
          {/* Area for past data */}
          <Area 
            type="monotone" 
            dataKey="maxId" 
            fill="#8884d8" 
            fillOpacity={0.1} 
            stroke="none"
          />
          
          {/* Line for all data */}
          <Line 
            type="monotone" 
            dataKey="maxId" 
            name="Max ID Value" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionChart; 