import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

const CopyButton = ({
  text,
  darkMode,
}: {
  text: string;
  darkMode: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (copied) {
      setShowCopied(true);
      timeout = setTimeout(() => {
        setShowCopied(false);
        // Wait for fade out animation before changing state
        setTimeout(() => {
          setCopied(false);
        }, 200); // Match this with CSS transition duration
      }, 1800); // Show copied state for 1.8s
    }
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className={`p-2 rounded-lg ${
          darkMode
            ? "text-gray-400 hover:text-indigo-400 hover:bg-gray-700"
            : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
        } transition-all duration-200`}
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
      <div
        className={`absolute -top-8 left-1/2 transform -translate-x-1/2 
          ${darkMode ? "bg-gray-700" : "bg-gray-900"} 
          text-white px-2 py-1 rounded text-xs whitespace-nowrap 
          transition-opacity duration-200
          ${showCopied ? "opacity-100" : "opacity-0"} 
          ${!copied && "group-hover:opacity-100"}
          pointer-events-none z-50`}
      >
        {copied ? "Copied!" : "Copy to clipboard"}
      </div>
    </div>
  );
};

export default CopyButton;
