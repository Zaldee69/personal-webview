import { useEffect, useState } from "react";

const useCountdown = (seconds: number) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
        setTimeLeft((t) => t -1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return { timeLeft };
};

export { useCountdown };
