import { z } from "zod";

export const AnalysisPointSchema = z.object({
  title: z.string().describe("Main point title (5-8 words)"),
  summary: z.string().describe("Brief summary (1-2 sentences)"),
  details: z.string().describe("Supporting details (2-3 sentences)"),
  severity: z
    .enum(["critical", "warning", "info"])
    .describe("Importance level"),
});

export const AnalysisBreakdownSchema = z.object({
  overview: z.string().describe("Brief overall assessment (1-2 sentences)"),
  points: z
    .array(AnalysisPointSchema)
    .min(2)
    .max(5)
    .describe("Main analysis points"),
  nextStep: z.string().describe("Key next step or recommendation (1 sentence)"),
});

export type AnalysisPoint = z.infer<typeof AnalysisPointSchema>;
export type AnalysisBreakdown = z.infer<typeof AnalysisBreakdownSchema>;
