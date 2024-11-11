export const ConnectionStatus = ({
  isConnected,
  darkMode,
}: {
  isConnected: boolean;
  darkMode: boolean;
}) => (
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
);
