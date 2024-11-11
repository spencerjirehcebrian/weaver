import { TextData } from "../types/types";
import CopyButton from "./CopyButton";
import { MessageContent } from "./MessageContent";
import { MessageHeader } from "./MessageHeader";

export const Message = ({
  text,
  darkMode,
  isExpanded,
  isSelected,
  onClick,
}: {
  text: TextData;
  darkMode: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  onClick: (e: React.MouseEvent, id: number) => void;
}) => (
  <div
    className={`${
      darkMode
        ? "bg-gray-800/90 border-gray-700 hover:bg-gray-750"
        : "bg-white/80 border-indigo-100 hover:bg-white/90 hover:border-indigo-200"
    } backdrop-blur-sm rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${
      isSelected ? "ring-2 ring-indigo-500" : ""
    }`}
    onClick={(e) => onClick(e, text.id)}
  >
    <div
      className={`p-4 flex items-center justify-between cursor-pointer ${
        isExpanded ? "pb-2" : ""
      }`}
    >
      <MessageHeader text={text} darkMode={darkMode} />
      <div className="flex items-center space-x-2 flex-shrink-0">
        <CopyButton text={text.content} darkMode={darkMode} />
      </div>
    </div>
    {isExpanded && <MessageContent text={text} darkMode={darkMode} />}
  </div>
);
