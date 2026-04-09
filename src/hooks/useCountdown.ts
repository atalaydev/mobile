import { useEffect, useState } from "react";

type TFn = (key: string, opts?: Record<string, unknown>) => string;

export function useCountdown(targetDate: Date, t: TFn) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = targetDate.getTime() - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return { label: null, long: null, remainingMs: remaining };

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  if (days > 0) {
    const long = hours > 0
      ? t("agenda.countdownDaysHours", { days, hours })
      : t("agenda.countdownDays", { days });
    return { label: t("agenda.countdownShortDH", { days, hours }), long, remainingMs: remaining };
  }
  if (hours > 0) {
    const long = minutes > 0
      ? t("agenda.countdownHoursMinutes", { hours, minutes })
      : t("agenda.countdownHours", { hours });
    return { label: t("agenda.countdownShortHM", { hours, minutes }), long, remainingMs: remaining };
  }
  const long = t("agenda.countdownMinutesSeconds", { minutes, seconds });
  return { label: t("agenda.countdownShortMS", { minutes, seconds }), long, remainingMs: remaining };
}
