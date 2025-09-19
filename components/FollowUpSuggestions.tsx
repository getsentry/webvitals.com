"use client";

import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Suggestion,
  Suggestions,
} from "@/components/ui/ai-elements/suggestion";

interface FollowUpAction {
  id: string;
  title: string;
}

interface FollowUpSuggestionsProps {
  actions?: FollowUpAction[];
  isLoading?: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

function SuggestionSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Skeleton className="h-9 w-32 rounded-full" />
    </motion.div>
  );
}

export default function FollowUpSuggestions({
  actions,
  isLoading = false,
  onSuggestionClick,
}: FollowUpSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          Generating follow-up suggestions...
        </h4>
        <Suggestions className="gap-2">
          {[0, 1, 2].map((index) => (
            <SuggestionSkeleton key={index} index={index} />
          ))}
        </Suggestions>
      </div>
    );
  }

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mt-4 space-y-3"
    >
      <h4 className="text-sm font-medium text-muted-foreground">
        Explore these follow-up questions:
      </h4>
      <Suggestions className="gap-2">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <Suggestion suggestion={action.title} onClick={onSuggestionClick} />
          </motion.div>
        ))}
      </Suggestions>
    </motion.div>
  );
}
