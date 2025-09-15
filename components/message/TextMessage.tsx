import { Message, MessageContent } from "@/components/ui/ai-elements/message";
import { Response } from "@/components/ui/ai-elements/response";

interface TextMessageProps {
  messageId: string;
  index: number;
  role: "system" | "user" | "assistant";
  text?: string;
}

export default function TextMessage({
  messageId,
  index,
  role,
  text,
}: TextMessageProps) {
  if (!text) return null;

  return (
    <Message key={`${messageId}-${index}`} from={role}>
      <MessageContent>
        {role === "user" ? (
          <div className="whitespace-pre-wrap">{text}</div>
        ) : (
          <Response>{text}</Response>
        )}
      </MessageContent>
    </Message>
  );
}
