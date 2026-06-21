"use client";

interface WeekEvent {
  time: string;
  end: string;
  name: string;
  type: "Yoga" | "Pilates";
  teacher: string;
  taken: number;
  max: number;
}

interface WeekDay {
  wd: string;
  n: number;
  today?: boolean;
}

interface WeekCalendarProps {
  days: WeekDay[];
  data: Record<number, WeekEvent[]>;
}

const TIMES = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "17:00", "18:00", "19:00", "20:00", "21:00",
];

export function WeekCalendar({ days, data }: WeekCalendarProps) {
  return (
    <div className="overflow-x-auto rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white">
      <div className="min-w-[840px]">
        {/* Header row */}
        <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-[rgba(26,25,31,.085)]">
          <div className="border-r border-[rgba(26,25,31,.085)]" />
          {days.map((d) => (
            <div
              key={d.n}
              className="border-r border-[rgba(26,25,31,.085)] px-3 py-2.5 last:border-r-0"
            >
              <span className="text-[11px] uppercase tracking-[0.06em] text-ink-dim">
                {d.wd}
              </span>
              <span
                className={`font-serif text-xl block font-normal ${
                  d.today ? "text-primary" : "text-ink-dim"
                }`}
              >
                {d.n}
              </span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="grid grid-cols-[60px_repeat(6,1fr)]">
          {TIMES.flatMap((time, ti) => {
            const timeCell = (
              <div
                key={`time-${ti}`}
                className="h-[80px] shrink-0 border-r border-[rgba(26,25,31,.085)] pt-2 pl-2.5 text-[11px] text-ink-dim"
              >
                {time}
              </div>
            );

            const dayCells = days.map((_, di) => {
              const events = (data[di] ?? []).filter((e) => e.time === time);
              return (
                <div
                  key={`${ti}-${di}`}
                  className="h-[80px] border-r border-[rgba(26,25,31,.085)] p-[3px] last:border-r-0 relative"
                >
                  {events.map((e, ei) => {
                    const full = e.taken >= e.max;
                    return (
                      <div
                        key={ei}
                        className={`mb-[2px] cursor-pointer rounded-[8px] px-2 py-[5px] text-[11px] transition-[filter] hover:brightness-[.96] ${
                          full ? "outline-[1.5px] outline-destructive -outline-offset-1" : ""
                        } ${
                          e.type === "Pilates"
                            ? "bg-amber-soft text-amber-text"
                            : "bg-bordo-surface text-primary"
                        }`}
                      >
                        <div className="font-semibold truncate">{e.name}</div>
                        <div className="text-[9.5px] opacity-75 truncate">
                          {e.teacher} · {e.taken}/{e.max}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            });

            return [timeCell, ...dayCells];
          })}
        </div>
      </div>
    </div>
  );
}
