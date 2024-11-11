import { TextData } from "../types/types";
import { formatContent } from "../utils/formatters";

export const MessageContent = ({
  text,
  darkMode,
}: {
  text: TextData;
  darkMode: boolean;
}) => (
  <div
    className={`border-t ${
      darkMode ? "border-gray-700" : "border-indigo-100"
    } animate-fade-in message-content`}
  >
    <div
      className={`max-h-screen overflow-y-auto p-6 ${
        darkMode ? "text-gray-300" : "text-gray-800"
      } font-medium leading-relaxed`}
      onClick={(e) => e.stopPropagation()}
    >
      {formatContent(text.content)}
    </div>
  </div>
);
