// convex/generator.ts
// /convex/generator.ts
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Define the expected structure from OpenAI response choices
interface OpenAIChatCompletion {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// Define types for our forecast
interface PastLog {
  date: string;
  score: number;
  activities?: string[];
  notes?: string;
}

interface GeneratedForecast {
  date: string;
  emotionScore: number;
  description: string;
  trend: "up" | "down" | "stable";
  details: string;
  recommendation: string;
  confidence: number;
}

// Helper function (optional, can be kept here or moved)
const getISODateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// --- Internal Action to Generate Forecast using AI ---
export const generateForecastWithAI = internalAction({
  args: {
    userId: v.string(),
    pastLogs: v.array(v.object({
      date: v.string(),
      score: v.number(),
      activities: v.optional(v.array(v.string())),
      notes: v.optional(v.string())
    })),
    targetDates: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const { userId, pastLogs, targetDates } = args;
    
    console.log(`[Action generateForecastWithAI] Generating forecasts for user ${userId} for dates:`, targetDates);
    console.log(`[Action generateForecastWithAI] Using ${pastLogs.length} past logs as training data`);

    // In a real implementation, this would call OpenAI or another AI service
    // For now, we'll generate mock forecasts as a placeholder
    
    try {
      // Simulate AI processing time (only in development)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a forecast for each target date
      const forecasts: GeneratedForecast[] = targetDates.map((date, index) => {
        // Get the last log's score as reference
        const sortedLogs = [...pastLogs].sort((a, b) => a.date.localeCompare(b.date));
        const lastLog = sortedLogs[sortedLogs.length - 1];
        const lastScore = lastLog?.score || 50;
        
        // Generate a score with some variation
        // First day slight change, second day more change, third day even more
        const variation = (Math.random() * 20 - 10) * (index + 1) * 0.5;
        let predictedScore = Math.round(Math.max(0, Math.min(100, lastScore + variation)));
        
        // Determine trend
        let trend: "up" | "down" | "stable"; 
        if (predictedScore > lastScore + 5) trend = "up";
        else if (predictedScore < lastScore - 5) trend = "down";
        else trend = "stable";
        
        // Calculate confidence (decreases with distance)
        const confidence = Math.round(90 - (index * 15));
        
        return {
          date,
          emotionScore: predictedScore,
          description: getDescriptionFromScore(predictedScore),
          trend,
          details: generateDetails(predictedScore, trend, index),
          recommendation: generateRecommendation(predictedScore),
          confidence
        };
      });
      
      console.log(`[Action generateForecastWithAI] Successfully generated ${forecasts.length} forecasts`);
      return forecasts;
      
    } catch (error: any) {
      console.error("[Action generateForecastWithAI] Error generating forecasts:", error);
      throw new Error(`AI forecast generation failed: ${error.message}`);
    }
  }
});

// --- Helper Functions ---
function getDescriptionFromScore(score: number): string {
  if (score >= 90) return "Exceptional Day";
  if (score >= 80) return "Excellent Day";
  if (score >= 70) return "Very Good Day";
  if (score >= 60) return "Good Day";
  if (score >= 50) return "Balanced Day";
  if (score >= 40) return "Mild Challenges";
  if (score >= 30) return "Challenging Day";
  if (score >= 20) return "Difficult Day";
  if (score >= 10) return "Very Challenging";
  return "Extremely Difficult";
}

function generateDetails(score: number, trend: string, dayIndex: number): string {
  const dayTerms = ["tomorrow", "the day after tomorrow", "in two days"];
  const dayTerm = dayTerms[dayIndex] || "in the coming days";
  
  if (score >= 80) {
    return `Based on your patterns, you're likely to have an excellent day ${dayTerm}. Your recent positive momentum suggests high emotional wellbeing will continue.`;
  } else if (score >= 60) {
    return `Your forecast shows a good day ${dayTerm}. You tend to maintain positive emotions in similar circumstances, which should continue.`;
  } else if (score >= 40) {
    return `Expecting a balanced day ${dayTerm}. Your emotional patterns suggest you'll experience both challenges and rewards in moderate amounts.`;
  } else if (score >= 20) {
    return `You may face some challenges ${dayTerm}. Your patterns suggest this could be a somewhat difficult period, but temporary.`;
  } else {
    return `Your forecast indicates significant challenges ${dayTerm}. Based on your patterns, this may be a difficult day emotionally, but remember that these periods are temporary.`;
  }
}

function generateRecommendation(score: number): string {
  if (score >= 80) {
    return "Continue your current activities and consider ways to share your positive energy with others.";
  } else if (score >= 60) {
    return "Maintain your healthy routines and consider planning something enjoyable to further boost your wellbeing.";
  } else if (score >= 40) {
    return "Focus on balanced self-care and set reasonable expectations for your tasks and interactions.";
  } else if (score >= 20) {
    return "Prioritize rest and self-compassion. Consider reducing commitments if possible and focus on activities that have improved your mood in the past.";
  } else {
    return "This is a time to be especially gentle with yourself. Reach out to supportive people, minimize stressors, and focus on basic self-care like rest and nourishment.";
  }
}