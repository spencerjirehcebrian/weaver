import { MessageCircle, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { ConnectionStatus } from "./ConnectionStatus";
import { SearchBar } from "./SearchBar";
import { SortButton } from "./SortButton";

export const Header = ({
  darkMode,
  isConnected,
  toggleDarkMode,
  searchTerm,
  handleSearch,
  sortOrder,
  toggleSortOrder,
}: {
  darkMode: boolean;
  isConnected: boolean;
  toggleDarkMode: () => void;
  searchTerm: string;
  handleSearch: (value: string) => void;
  sortOrder: "newest" | "oldest";
  toggleSortOrder: () => void;
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header
      className={`${darkMode ? "bg-gray-800/90" : "bg-white/80"} 
      backdrop-blur-sm border-b ${
        darkMode ? "border-gray-700" : "border-indigo-100"
      } 
      sticky top-0 z-10 transition-all duration-300`}
    >
      <div className="max-w-6xl mx-auto py-4 px-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-md transform hover:scale-105 transition-transform duration-200">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Weavyr
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-800"
                } transition-colors`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <ConnectionStatus isConnected={isConnected} darkMode={darkMode} />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <SearchBar
              darkMode={darkMode}
              searchTerm={searchTerm}
              handleSearch={handleSearch}
              isSearchFocused={isSearchFocused}
              setIsSearchFocused={setIsSearchFocused}
            />
            <SortButton
              darkMode={darkMode}
              sortOrder={sortOrder}
              toggleSortOrder={toggleSortOrder}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
