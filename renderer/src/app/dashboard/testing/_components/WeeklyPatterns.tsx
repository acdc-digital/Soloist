// TESTING WEEKLY PATTERNS COMPONENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/testing/_components/WeeklyPatterns.tsx

import React, { useMemo } from 'react'; // Import useMemo AND React
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, DotProps } from 'recharts'; // Import DotProps if needed for strict typing, otherwise `any` is often fine for simple cases

// Define the structure for the main data and the historical forecast data
interface DayData {
  date: string; // YYYY-MM-DD
  day: string;  // Full day name e.g. "Monday"
  emotionScore: number | null;
  isFuture: boolean;
  // Add other potential fields if needed by tooltip later
}

interface HistoricalForecastData {
    date: string; // YYYY-MM-DD
    emotionScore: number | null;
}

interface WeeklyPatternsProps {
  data: DayData[]; // The combined 7-day actual + future forecast data
  historicalForecastData?: HistoricalForecastData[]; // Optional: Forecasts made previously for the historical part of the range
}

export default function TestWeeklyPatterns({ data, historicalForecastData }: WeeklyPatternsProps) {
  
  // Prepare data for the chart using useMemo for optimization
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const historicalForecastMap = new Map(
      historicalForecastData?.map(f => [f.date, f.emotionScore]) ?? []
    );

    return data.map((d, index) => {
      const originalForecast = historicalForecastMap.get(d.date);
      return {
        name: d.day.substring(0, 3),
        date: d.date,
        // Line 1: Actual score for past days
        Actual: !d.isFuture ? d.emotionScore : null,
        // Line 2: Forecast score ONLY for future days.
        // connectNulls={true} on the Line component will handle connecting from the last actual point.
        TestForecast: d.isFuture ? d.emotionScore : null,
        // Line 3: Original forecast for past days
        OriginalForecast: !d.isFuture ? (originalForecast ?? null) : null,
      };
    });
  }, [data, historicalForecastData]);

  // Define colors
  const actualColor = "#4f46e5"; // Indigo (Past/Actual)
  const forecastColor = "#f59e42"; // Orange (Future/Test Forecast)
  const originalForecastColor = "#22c55e"; // Green (Comparison Forecast)

  // Custom Dot Renderer Function
  const renderForecastDot = (props: any): React.ReactElement<SVGElement> => {
    const { cx, cy, payload, index } = props;
    if (payload.TestForecast !== null && payload.TestForecast !== undefined) {
      return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill={forecastColor} />;
    }
    return <g key={`empty-dot-${index}`} />; // Return an empty SVG group
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} dy={5} />
        <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} dx={-5}/>
        <Tooltip
           contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: 'none', borderRadius: '4px', fontSize: '12px', padding: '5px 10px' }}
           labelStyle={{ color: '#cbd5e1' }}
           itemStyle={{ color: '#e2e8f0' }}
        />
        <Legend iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        
        {/* Line 1: Actual Past Data */}
        <Line
          type="monotone"
          dataKey="Actual"
          stroke={actualColor}
          strokeWidth={2}
          dot={{ r: 4, fill: actualColor }}
          activeDot={{ r: 6 }}
          connectNulls
          name="Actual Score"
        />
        
        {/* Line 2: Test Forecast Data */}
        <Line
          type="monotone"
          dataKey="TestForecast"
          stroke={forecastColor}
          strokeWidth={2}
          dot={renderForecastDot}
          activeDot={{ r: 6 }}
          connectNulls
          name="Forecast"
        />

        {/* Line 3: Original Forecast Comparison */}
        {historicalForecastData && historicalForecastData.length > 0 && (
          <Line
            type="monotone"
            dataKey="OriginalForecast"
            stroke={originalForecastColor}
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={{ r: 3, fill: originalForecastColor, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
            name="Historical Forecast"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

