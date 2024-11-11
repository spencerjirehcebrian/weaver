import { RefreshCw } from "lucide-react";

export const EmptyState = ({
  darkMode,
  searchTerm,
}: {
  darkMode: boolean;
  searchTerm: string;
}) => (
  <div
    className={`${
      darkMode
        ? "bg-gray-800/90 border-gray-700"
        : "bg-white/80 border-indigo-100"
    } backdrop-blur-sm p-12 rounded-xl border text-center shadow-sm`}
  >
    <RefreshCw
      className={`w-12 h-12 ${
        darkMode ? "text-indigo-400" : "text-indigo-400"
      } mx-auto mb-4`}
    />
    <p
      className={`${
        darkMode ? "text-gray-200" : "text-indigo-900"
      } font-medium text-lg`}
    >
      {searchTerm ? "No matching messages found" : "No messages available"}
    </p>
    <p
      className={`${
        darkMode ? "text-indigo-400/70" : "text-indigo-600/70"
      } mt-2`}
    >
      {searchTerm
        ? "Try adjusting your search terms"
        : "New messages will appear here in real-time"}
    </p>
  </div>
);
