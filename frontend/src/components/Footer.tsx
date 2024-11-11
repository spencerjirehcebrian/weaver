import { Heart } from "lucide-react";

export const Footer = ({ darkMode }: { darkMode: boolean }) => (
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
          className={`w-4 h-4 ${darkMode ? "text-pink-400" : "text-pink-500"}`}
        />
        <span
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Created by Spencer Jireh Cebrian
        </span>
      </div>
      <div
        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        {new Date().getFullYear()} © All rights reserved
      </div>
    </div>
  </footer>
);
