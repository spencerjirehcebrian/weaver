import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { Loader } from "lucide-react";
import { Header } from "./components/Header";
import { MessageList } from "./components/MessageList";
import { Footer } from "./components/Footer";

interface TextData {
  id: number;
  content: string;
  created_at: string;
}

interface ExpandedState {
  [key: number]: boolean;
}

export default function App() {
  const [texts, setTexts] = useState<TextData[]>([]);
  const [filteredTexts, setFilteredTexts] = useState<TextData[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [expandedStates, setExpandedStates] = useState<ExpandedState>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
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
    // eslint-disable-next-line
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
      <Header
        darkMode={darkMode}
        isConnected={isConnected}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        sortOrder={sortOrder}
        toggleSortOrder={toggleSortOrder}
      />
      <MessageList
        darkMode={darkMode}
        error={error}
        filteredTexts={filteredTexts}
        expandedStates={expandedStates}
        selectedMessage={selectedMessage}
        handleMessageClick={handleMessageClick}
        searchTerm={searchTerm}
      />
      <Footer darkMode={darkMode} />
    </div>
  );
}
