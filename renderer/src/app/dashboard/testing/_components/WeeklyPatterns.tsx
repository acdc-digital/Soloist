// TESTING WEEKLY PATTERNS COMPONENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/testing/_components/WeeklyPatterns.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeeklyPatternsProps {
  data: {
    date: string;
    day: string;
    emotionScore: number | null;
    isFuture: boolean;
  }[];
}

export default function TestWeeklyPatterns({ data }: WeeklyPatternsProps) {
  // Prepare test data for chart
  const chartData = data.map(d => ({
    name: d.day,
    Actual: !d.isFuture ? d.emotionScore : null,
    TestForecast: d.isFuture ? d.emotionScore : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Actual" stroke="#4f46e5" dot={{ r: 4 }} connectNulls />
        <Line type="monotone" dataKey="TestForecast" stroke="#f59e42" dot={{ r: 4 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

