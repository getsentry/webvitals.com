// store.ts
import { createAIStore } from "@ai-sdk-tools/store";

export const store = createAIStore({
  initialMessages: [],
  onFinish: (message) => {
    console.log("Message finished:", message);
  },
});
