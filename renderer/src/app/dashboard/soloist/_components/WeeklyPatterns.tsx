// WEEKLY PATTERNS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/soloist/_components/WeeklyPatterns.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeeklyPatternsProps {
  data: {
    date: string;
    day: string;
    emotionScore: number | null;
    isFuture: boolean;
  }[];
}

export default function WeeklyPatterns({ data }: WeeklyPatternsProps) {
  // Prepare data for chart
  const chartData = data.map(d => ({
    name: d.day, // or d.date for more granularity
    Actual: !d.isFuture ? d.emotionScore : null,
    Forecast: d.isFuture ? d.emotionScore : null,
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
        <Line type="monotone" dataKey="Forecast" stroke="#f59e42" dot={{ r: 4 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

