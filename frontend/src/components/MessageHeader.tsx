import { TextData } from "../types/types";
import { formatDate } from "../utils/formatters";

export const MessageHeader = ({
  text,
  darkMode,
}: {
  text: TextData;
  darkMode: boolean;
}) => (
  <div className="flex items-center space-x-4 min-w-0">
    <div className="flex items-center space-x-3">
      <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full shadow-sm">
        #{text.id}
      </span>
      <span
        className={`${
          darkMode ? "text-indigo-400/70" : "text-indigo-600/70"
        } text-sm font-medium`}
      >
        {formatDate(text.created_at)}
      </span>
    </div>
  </div>
);
