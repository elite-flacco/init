"use client";

import { MessageSquare } from "lucide-react";

const FeedbackButton = () => {
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
      className="fixed bottom-2 right-2 sm:bottom-6 sm:right-6 btn-3d-primary z-50 p-2"
      aria-label="Submit feedback"
    >
      <MessageSquare className={`w-4 h-4`} />
    </button>
  );
};

export default FeedbackButton;
