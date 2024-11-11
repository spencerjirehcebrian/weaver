import { Loader } from "lucide-react";

export const LoadingScreen = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <div className={`min-h-screen ${
      darkMode ? "bg-gray-900" : "bg-gradient-to-br from-indigo-50 to-purple-50"
    } flex items-center justify-center`}>
      <div className={`flex flex-col items-center space-y-4 ${
        darkMode ? "bg-gray-800" : "bg-white/80"
      } backdrop-blur-sm p-8 rounded-2xl shadow-lg`}>
        <div className="relative">
          <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
          <div className="absolute inset-0 animate-pulse-ring rounded-full border-4 border-indigo-600/30" />
        </div>
        <p className={`${darkMode ? "text-gray-200" : "text-indigo-900"} font-medium text-lg`}>
          Loading messages...
        </p>
      </div>
    </div>
  );
};