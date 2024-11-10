import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import {
  MessageCircle,
  Loader,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  X,
  Moon,
  Sun,
  Heart,
} from "lucide-react";
import CopyButton from "./components/CopyButton";

interface TextData {
  id: number;
  content: string;
  created_at: string;
}

interface ExpandedState {
  [key: number]: boolean;
}

const formatContent = (content: string) => {
  return content.split("\\n").map((text, index, array) => (
    <span key={index} className="whitespace-pre-wrap">
      {text}
      {index < array.length - 1 && <br />}
    </span>
  ));
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return "Just now";
  }
};

export default function App() {
  const [texts, setTexts] = useState<TextData[]>([]);
  const [filteredTexts, setFilteredTexts] = useState<TextData[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [expandedStates, setExpandedStates] = useState<ExpandedState>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);

  const handleMessageClick = (e: React.MouseEvent, id: number) => {
    if (!(e.target as HTMLElement).closest(".message-content")) {
      toggleExpand(id);
      setSelectedMessage(id);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getPreview = (content: string) => {
    const firstLine = content.split("\\n")[0];
    return firstLine.length > 100
      ? firstLine.substring(0, 100) + "..."
      : firstLine;
  };

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      const filtered = texts.filter(
        (text) =>
          text.content.toLowerCase().includes(value.toLowerCase()) ||
          text.id.toString().includes(value)
      );
      setFilteredTexts(filtered);
    },
    [texts]
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const sortTexts = (textsToSort: TextData[]) => {
    return [...textsToSort].sort((a, b) => {
      const comparison =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "newest" ? comparison : -comparison;
    });
  };

  useEffect(() => {
    setIsLoading(true);

    fetch("http://localhost:4000/api/texts")
      .then((response) => response.json())
      .then((data) => {
        const textsData = Array.isArray(data) ? data : data.texts;
        if (Array.isArray(textsData)) {
          setTexts(textsData);
          setFilteredTexts(textsData);
        } else {
          throw new Error("Invalid data format received from API");
        }
      })
      .catch((error) => {
        console.error("Error fetching texts:", error);
        setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      setIsConnected(true);
      setError("");
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setError("Failed to connect to real-time updates");
    });

    socket.on("newText", (newText: TextData) => {
      setTexts((prevTexts) => {
        const updatedTexts = Array.isArray(prevTexts)
          ? [newText, ...prevTexts]
          : [newText];
        return updatedTexts;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setFilteredTexts(sortTexts(searchTerm ? filteredTexts : texts));
  }, [sortOrder, texts, searchTerm]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-br from-indigo-50 to-purple-50"
        } flex items-center justify-center`}
      >
        <div
          className={`flex flex-col items-center space-y-4 ${
            darkMode ? "bg-gray-800" : "bg-white/80"
          } backdrop-blur-sm p-8 rounded-2xl shadow-lg`}
        >
          <div className="relative">
            <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
            <div className="absolute inset-0 animate-pulse-ring rounded-full border-4 border-indigo-600/30" />
          </div>
          <p
            className={`${
              darkMode ? "text-gray-200" : "text-indigo-900"
            } font-medium text-lg`}
          >
            Loading messages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-indigo-50 to-purple-50"
      }`}
    >
      <header
        className={`${
          darkMode ? "bg-gray-800/90" : "bg-white/80"
        } backdrop-blur-sm border-b ${
          darkMode ? "border-gray-700" : "border-indigo-100"
        } sticky top-0 z-10 transition-all duration-300`}
      >
        <div className="max-w-6xl mx-auto py-4 px-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-md transform hover:scale-105 transition-transform duration-200">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Weaver
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
                <div
                  className={`flex items-center space-x-2 ${
                    darkMode ? "bg-gray-700" : "bg-white"
                  } px-4 py-2 rounded-full shadow-sm`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isConnected ? "text-green-400" : "text-red-400"
                    } font-medium`}
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div
                className={`relative flex-1 transition-all duration-200 ${
                  isSearchFocused ? "flex-grow" : ""
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    className={`w-5 h-5 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
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
                      darkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-6 px-4">
        {error && (
          <div
            className={`mb-6 ${
              darkMode ? "bg-red-900/50" : "bg-red-50"
            } backdrop-blur-sm border ${
              darkMode ? "border-red-800" : "border-red-200"
            } rounded-xl p-4 flex items-start space-x-3 animate-fade-in`}
          >
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3
                className={`text-sm font-medium ${
                  darkMode ? "text-red-400" : "text-red-800"
                }`}
              >
                Error
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-red-300" : "text-red-700"
                } mt-1`}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredTexts.length > 0 ? (
            filteredTexts.map((text) => (
              <div
                key={text.id}
                className={`${
                  darkMode
                    ? "bg-gray-800/90 border-gray-700 hover:bg-gray-750"
                    : "bg-white/80 border-indigo-100 hover:bg-white/90 hover:border-indigo-200"
                } backdrop-blur-sm rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${
                  selectedMessage === text.id ? "ring-2 ring-indigo-500" : ""
                }`}
                onClick={(e) => handleMessageClick(e, text.id)}
              >
                <div
                  className={`p-4 flex items-center justify-between cursor-pointer ${
                    expandedStates[text.id] ? "pb-2" : ""
                  }`}
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="flex flex-col items-start space-y-1">
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
                    <p
                      className={`${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } truncate font-medium flex-1`}
                    >
                      {getPreview(text.content)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <CopyButton text={text.content} darkMode={darkMode} />
                  </div>
                </div>
                {expandedStates[text.id] && (
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
                )}
              </div>
            ))
          ) : (
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
                {searchTerm
                  ? "No matching messages found"
                  : "No messages available"}
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
          )}
        </div>
      </main>

      <footer
        className={`${
          darkMode
            ? "bg-gray-800/90 border-t border-gray-700"
            : "bg-white/80 border-t border-indigo-100"
        } backdrop-blur-sm py-4 mt-8 fixed bottom-0 w-full`}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart
              className={`w-4 h-4 ${
                darkMode ? "text-pink-400" : "text-pink-500"
              }`}
            />
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Created by Spencer Jireh Cebrian
            </span>
          </div>
          <div
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {new Date().getFullYear()} © All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
