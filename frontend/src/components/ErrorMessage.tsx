import { AlertCircle } from "lucide-react";

export const ErrorMessage = ({
  error,
  darkMode,
}: {
  error: string;
  darkMode: boolean;
}) => (
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
        className={`text-sm ${darkMode ? "text-red-300" : "text-red-700"} mt-1`}
      >
        {error}
      </p>
    </div>
  </div>
);
