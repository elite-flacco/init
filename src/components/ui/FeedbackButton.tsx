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
      className="fixed bottom-6 right-6 btn-primary z-50"
      aria-label="Submit feedback"
    >
      <span
        className={`transition-all duration-200 ${isHovered ? "opacity-100 w-auto ml-2" : "opacity-0 w-0 overflow-hidden"}`}
      >
        Feedback
      </span>
      <MessageSquare className={`w-5 h-5 ${isHovered ? "ml-2" : "m-0"}`} />
    </button>
  );
};

export default FeedbackButton;
