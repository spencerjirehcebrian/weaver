import { ExpandedState, TextData } from "../types/types";
import { EmptyState } from "./EmptyState";
import { ErrorMessage } from "./ErrorMessage";
import { Message } from "./Message";

export const MessageList = ({
  darkMode,
  error,
  filteredTexts,
  expandedStates,
  selectedMessage,
  handleMessageClick,
  searchTerm
}: {
  darkMode: boolean;
  error: string;
  filteredTexts: TextData[];
  expandedStates: ExpandedState;
  selectedMessage: number | null;
  handleMessageClick: (e: React.MouseEvent, id: number) => void;
  searchTerm: string;
}) => (
  <main className="max-w-6xl mx-auto py-6 px-4">
    {error && <ErrorMessage error={error} darkMode={darkMode} />}
    <div className="space-y-4">
      {filteredTexts.length > 0 ? (
        filteredTexts.map((text) => (
          <Message
            key={text.id}
            text={text}
            darkMode={darkMode}
            isExpanded={expandedStates[text.id]}
            isSelected={selectedMessage === text.id}
            onClick={handleMessageClick}
          />
        ))
      ) : (
        <EmptyState darkMode={darkMode} searchTerm={searchTerm} />
      )}
    </div>
  </main>
);