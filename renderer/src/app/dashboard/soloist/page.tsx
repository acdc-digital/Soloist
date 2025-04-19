// SOLOIST
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/soloist/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Info, ChevronLeft, ChevronRight, ArrowRight, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Mock data for the emotional forecast
const mockForecast = [
  {
    day: "Today",
    date: "Apr 19",
    shortDay: "Mon",
    emotionScore: 75,
    description: "Balanced & Productive",
    trend: "stable"
  },
  {
    day: "Tomorrow",
    date: "Apr 20",
    shortDay: "Tue",
    emotionScore: 48,
    description: "Anticipating Pressure",
    trend: "down"
  },
  {
    day: "Wednesday",
    date: "Apr 21",
    shortDay: "Wed",
    emotionScore: 82,
    description: "Creative Peak",
    trend: "up"
  },
  {
    day: "Thursday",
    date: "Apr 22",
    shortDay: "Thu",
    emotionScore: 45,
    description: "Challenging Day",
    trend: "down"
  },
  {
    day: "Friday",
    date: "Apr 23",
    shortDay: "Fri",
    emotionScore: 88,
    description: "Weekend Energy",
    trend: "up"
  },
  {
    day: "Saturday",
    date: "Apr 24",
    shortDay: "Sat",
    emotionScore: 84,
    description: "Relaxed Day",
    trend: "stable"
  },
  {
    day: "Sunday",
    date: "Apr 25",
    shortDay: "Sun",
    emotionScore: 70,
    description: "Gentle Activities",
    trend: "down"
  }
];

// Function to get the color class based on emotion score - using the same function as the heatmap
function getColorClass(score: number | null | undefined): string {
  if (score == null) return "bg-zinc-800/20 border border-zinc-700/30";
  if (score >= 90) return "bg-indigo-400/80 hover:bg-indigo-400";
  if (score >= 80) return "bg-blue-400/80 hover:bg-blue-400";
  if (score >= 70) return "bg-sky-400/80 hover:bg-sky-400";
  if (score >= 60) return "bg-teal-400/80 hover:bg-teal-400";
  if (score >= 50) return "bg-green-400/80 hover:bg-green-400";
  if (score >= 40) return "bg-lime-400/80 hover:bg-lime-400";
  if (score >= 30) return "bg-yellow-400/80 hover:bg-yellow-400";
  if (score >= 20) return "bg-amber-500/80 hover:bg-amber-500";
  if (score >= 10) return "bg-orange-500/80 hover:bg-orange-500";
  return "bg-rose-600/80 hover:bg-rose-600";
}

// Function for border color that's slightly darker than background
function getBorderColorClass(score: number | null | undefined): string {
  if (score == null) return "border-zinc-700/50";
  if (score >= 90) return "border-indigo-500";
  if (score >= 80) return "border-blue-500";
  if (score >= 70) return "border-sky-500";
  if (score >= 60) return "border-teal-500";
  if (score >= 50) return "border-green-500";
  if (score >= 40) return "border-lime-500";
  if (score >= 30) return "border-yellow-500";
  if (score >= 20) return "border-amber-600";
  if (score >= 10) return "border-orange-600";
  return "border-rose-700";
}

// Calculates text color based on score to ensure readability
function getTextColorClass(score: number | null | undefined): string {
  if (score == null) return "text-zinc-400";
  if (score >= 60) return "text-zinc-900";
  return "text-zinc-100";
}

// Trend icon component
const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-rose-500" />;
  return <Sparkles className="h-4 w-4 text-blue-400" />;
};

export default function SoloistPage() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Default to showing today
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Calculate average emotional score
  const totalScore = mockForecast.reduce((sum, day) => sum + day.emotionScore, 0);
  const averageScore = (totalScore / mockForecast.length).toFixed(1);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle navigation between days
  const navigatePrevDay = () => {
    setSelectedDayIndex(prev => Math.max(0, prev - 1));
  };

  const navigateNextDay = () => {
    setSelectedDayIndex(prev => Math.min(mockForecast.length - 1, prev + 1));
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-900">      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-4 px-2 flex flex-col h-full max-w-5xl">
          <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">7-Day Emotional Forecast</CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400">Predictions based on your past log patterns</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                    7 Days
                  </Badge>
                  <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                    Avg: {averageScore}
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Info className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                        Click on a day to see more details
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* 7-Day Forecast Strip */}
              <div className="grid grid-cols-7 gap-2 pt-1 mb-2">
                {mockForecast.map((forecast, idx) => {
                  const colorClass = getColorClass(forecast.emotionScore);
                  const borderColorClass = getBorderColorClass(forecast.emotionScore);
                  const textColorClass = getTextColorClass(forecast.emotionScore);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`
                        flex flex-col items-center p-1.5 sm:p-2 rounded-md cursor-pointer border 
                        ${colorClass} ${borderColorClass}
                        ${selectedDayIndex === idx ? 'ring-2 ring-zinc-800 dark:ring-zinc-300' : ''}
                        transition-all duration-150
                      `}
                      onClick={() => setSelectedDayIndex(idx)}
                    >
                      <div className="text-xs font-medium mb-1 text-center">
                        <div className={`${textColorClass} text-[10px] sm:text-xs`}>{forecast.shortDay}</div>
                        <div className={`text-[10px] ${textColorClass} opacity-80 hidden sm:block`}>{forecast.date.split(' ')[0]}</div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className={`text-xl sm:text-2xl font-bold ${textColorClass}`}>
                          {forecast.emotionScore}
                        </span>
                        <TrendIcon trend={forecast.trend} />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Separator className="my-2 bg-zinc-200 dark:bg-zinc-800" />
              
              {/* Selected Day Navigation */}
              <div className="flex items-center justify-between mb-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={selectedDayIndex === 0}
                  onClick={navigatePrevDay}
                  className="h-8 px-2 text-zinc-600 dark:text-zinc-300"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                  {mockForecast[selectedDayIndex].day}
                </h3>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={selectedDayIndex === mockForecast.length - 1}
                  onClick={navigateNextDay}
                  className="h-8 px-2 text-zinc-600 dark:text-zinc-300"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {/* Selected Day Details */}
              <div className="flex flex-col sm:flex-row gap-4 p-3 rounded-md border border-zinc-200 dark:border-zinc-700">
                <div className={`
                  flex-shrink-0 w-full sm:w-28 h-28 rounded-md flex flex-col items-center justify-center
                  ${getColorClass(mockForecast[selectedDayIndex].emotionScore)}
                  ${getBorderColorClass(mockForecast[selectedDayIndex].emotionScore)}
                  border
                `}>
                  <span className={`text-4xl font-bold ${getTextColorClass(mockForecast[selectedDayIndex].emotionScore)}`}>
                    {mockForecast[selectedDayIndex].emotionScore}
                  </span>
                  <div className="flex items-center mt-1">
                    <TrendIcon trend={mockForecast[selectedDayIndex].trend} />
                    <span className={`text-xs ml-1 ${getTextColorClass(mockForecast[selectedDayIndex].emotionScore)}`}>
                      {mockForecast[selectedDayIndex].trend === "up" ? "Rising" : 
                       mockForecast[selectedDayIndex].trend === "down" ? "Falling" : "Stable"}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                    {mockForecast[selectedDayIndex].description}
                  </h3>
                  
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                    {selectedDayIndex === 0 && "Today offers a balanced emotional state with good productivity potential. Your logs indicate this is an optimal day for collaborative work or social connections."}
                    {selectedDayIndex === 1 && "Tomorrow may bring some work pressure. Based on your previous patterns, setting realistic expectations and planning buffer time could help maintain your wellbeing."}
                    {selectedDayIndex === 2 && "Wednesday shows strong potential for creative thinking and problem-solving. Consider scheduling your most important or innovative tasks for this day."}
                    {selectedDayIndex === 3 && "Thursday patterns indicate potential challenges. Past logs suggest preparing structured approaches and short breaks to manage stress effectively."}
                    {selectedDayIndex === 4 && "Friday's forecast shows excellent emotional potential. Your logs indicate weekend energy begins early - a good day for celebration or social connection."}
                    {selectedDayIndex === 5 && "Saturday historically offers a relaxed emotional state. Your patterns suggest this is ideal for recreational activities and quality time."}
                    {selectedDayIndex === 6 && "Sunday is typically best for gentler activities. Your logs indicate some preparation for the week ahead helps mitigate evening anxiety."}
                  </div>
                  
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1 flex items-center">
                      <Sparkles className="h-4 w-4 mr-1.5 text-blue-500" />
                      Recommendation:
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {selectedDayIndex === 0 && "Schedule 30 minutes for focused work in the morning, then plan social or collaborative activities for the afternoon when your emotional state is typically highest."}
                      {selectedDayIndex === 1 && "Prepare a structured task list tonight and block 15 minutes for a midday mindfulness break tomorrow to help manage anticipated pressure."}
                      {selectedDayIndex === 2 && "Protect 2-3 hours during the afternoon for your most important creative or strategic work. Your logs indicate this is your optimal thinking time."}
                      {selectedDayIndex === 3 && "Break your day into smaller segments with clear boundaries. Plan a relaxing evening activity to aid recovery."}
                      {selectedDayIndex === 4 && "Use the positive emotional momentum for tasks requiring confidence or social engagement. Consider planning a celebratory end to your week."}
                      {selectedDayIndex === 5 && "Embrace the relaxed state by minimizing structure. Your logs indicate this is ideal for spontaneous activities and hobbies."}
                      {selectedDayIndex === 6 && "Engage in gentle planning for the week ahead in the morning, then transition to restful activities in the evening to prepare for Monday."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-zinc-900 dark:text-zinc-50">Weekly Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 w-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md">
                  Weekly pattern visualization will be displayed here
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-zinc-900 dark:text-zinc-50">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span>Your emotional state tends to peak midweek (Wednesday) and on weekends</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span>Thursday consistently shows lower emotional scores - consider additional self-care</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span>Evening periods generally show higher wellbeing than mornings</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span>Your recovery pattern is strong, with quick rebounds after challenging days</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}