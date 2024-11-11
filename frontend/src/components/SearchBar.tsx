import { Search, X } from "lucide-react";

export const SearchBar = ({
  darkMode,
  searchTerm,
  handleSearch,
  isSearchFocused,
  setIsSearchFocused
}: {
  darkMode: boolean;
  searchTerm: string;
  handleSearch: (value: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (value: boolean) => void;
}) => (
  <div className={`relative flex-1 transition-all duration-200 ${isSearchFocused ? "flex-grow" : ""}`}>
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className={`w-5 h-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
    </div>
    <input
      type="text"
      placeholder="Search messages..."
      value={searchTerm}
      onChange={(e) => handleSearch(e.target.value)}
      onFocus={() => setIsSearchFocused(true)}
      onBlur={() => setIsSearchFocused(false)}
      className={`w-full pl-10 pr-4 py-2 ${
        darkMode
          ? "bg-gray-700 text-gray-200 border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20"
          : "bg-white text-gray-900 border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
      } rounded-xl border focus:ring-2 focus:outline-none transition-all duration-200`}
    />
    {searchTerm && (
      <button
        onClick={() => handleSearch("")}
        className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
          darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);
