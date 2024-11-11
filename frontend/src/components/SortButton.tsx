import { Filter } from "lucide-react";

export const SortButton = ({
  darkMode,
  sortOrder,
  toggleSortOrder,
}: {
  darkMode: boolean;
  sortOrder: "newest" | "oldest";
  toggleSortOrder: () => void;
}) => (
  <button
    onClick={toggleSortOrder}
    className={`flex items-center space-x-2 px-4 py-2 ${
      darkMode
        ? "bg-gray-700 text-indigo-400 border-gray-600 hover:bg-gray-600"
        : "bg-white text-indigo-600 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50"
    } rounded-xl border transition-all duration-200`}
  >
    <Filter className="w-5 h-5" />
    <span className="text-sm font-medium">
      {sortOrder === "newest" ? "Newest First" : "Oldest First"}
    </span>
  </button>
);
