import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface PromotionTimerProps {
    targetDate: string;
}

const PromotionTimer = ({ targetDate }: PromotionTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft(null);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse border border-red-100 shadow-sm">
            <Timer className="w-3 h-3" />
            <div className="flex gap-1 items-center">
                {timeLeft.days > 0 && <span>{timeLeft.days}j</span>}
                <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
        </div>
    );
};

export default PromotionTimer;
