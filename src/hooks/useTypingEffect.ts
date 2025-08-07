import { useState, useEffect } from 'react';

interface UseTypingEffectOptions {
  text: string;
  speed?: number;
  delay?: number;
}

export const useTypingEffect = ({ text, speed = 100, delay = 0 }: UseTypingEffectOptions) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    const startTyping = () => {
      let i = 0;
      const typeTimer = setInterval(() => {
        if (i <= text.length) {
          setDisplayedText(text.slice(0, i));
          i++;
        } else {
          clearInterval(typeTimer);
          setIsComplete(true);
        }
      }, speed);

      return () => clearInterval(typeTimer);
    };

    const delayTimer = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimer);
    };
  }, [text, speed, delay]);

  return { displayedText, isComplete };
};