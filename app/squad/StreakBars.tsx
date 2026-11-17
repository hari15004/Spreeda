"use client";

type BarRow = {
  id: string;
  name: string;
  streak: number;
  xp: number;
  day: number;
  lastDay: string | null;
  restoreNeed: number;
  restoreDone: number;
};

const palette = ["#ff5a36", "#36b5ff", "#7dff6b", "#ffd23f", "#c77dff", "#ff6bb5"];

function istDate(offset: number) {
  const d = new Date(Date.now() + 5.5 * 3600 * 1000 + offset * 86400000);
  return d.toISOString().slice(0, 10);
}

function badge(streak: number) {
  if (streak >= 100) return "🏆";
  if (streak >= 30) return "🥇";
  if (streak >= 7) return "🏅";
  return "";
}

export default function StreakBars({ rows, meId }: { rows: BarRow[]; meId: string | null }) {
  const max = Math.max(1, ...rows.map((r) => r.streak));
  const today = istDate(0);
  const yesterday = istDate(-1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, margin: "6px 0 18px" }}>
      {rows.map((r, i) => {
        const h = 14 + Math.round((r.streak / max) * 100);
        const atRisk = r.streak > 0 && r.lastDay === yesterday && r.lastDay !== today;
        const restoring = r.restoreNeed > 0 && r.restoreDone < r.restoreNeed;
        const isMe = r.id === meId;
        return (
          <div key={r.id} style={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: 12 }}>
            <div style={{ height: 18 }}>
              {restoring ? `🔄 ${r.restoreDone}/${r.restoreNeed}` : atRisk ? "⏳" : badge(r.streak)}
            </div>
            <div>🔥 {r.streak}</div>
            <div
              style={{
                height: h,
                marginTop: 4,
                borderRadius: 8,
                background: palette[i % palette.length],
                opacity: r.streak === 0 ? 0.35 : 1,
                outline: isMe ? "2px solid #fff" : "none",
              }}
            />
            <div style={{ marginTop: 4, fontWeight: isMe ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {isMe ? "You" : r.name}
            </div>
            <div style={{ opacity: 0.6, fontSize: 11 }}>{r.xp} XP · D{r.day}</div>
          </div>
        );
      })}
    </div>
  );
}