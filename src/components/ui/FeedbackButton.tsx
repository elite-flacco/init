"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

const FeedbackButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleFeedbackClick = () => {
    window.open(
      "https://forms.gle/1WVFyBzvGFzkMB7A8",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <button
      onClick={handleFeedbackClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 btn-primary z-50 p-2"
      aria-label="Submit feedback"
    >
      <MessageSquare className={`w-4 h-4`} />
    </button>
  );
};

export default FeedbackButton;
