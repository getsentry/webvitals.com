import { artifact } from "@ai-sdk-tools/artifacts";
import { z } from "zod";

export const followUpActionsArtifact = artifact(
  "follow-up-actions",
  z.object({
    status: z
      .enum(["loading", "generating", "complete"])
      .default("loading")
      .describe("Current generation status"),
    progress: z
      .number()
      .min(0)
      .max(1)
      .default(0)
      .describe("Generation progress (0-1)"),
    url: z.string().optional().describe("The analyzed URL"),
    actions: z
      .array(
        z.object({
          id: z.string().describe("Unique identifier for the action"),
          title: z
            .string()
            .describe("Simple question or action title for follow-up"),
        }),
      )
      .default([])
      .describe("Generated follow-up questions or actions"),
    context: z
      .object({
        generatedAt: z.string().describe("ISO timestamp of generation"),
        basedOnTools: z
          .array(z.string())
          .describe(
            "List of tools used to gather the data for these suggestions",
          ),
        conversationLength: z
          .number()
          .describe("Number of messages in the conversation"),
      })
      .optional()
      .describe("Metadata about the generation context"),
  }),
);
