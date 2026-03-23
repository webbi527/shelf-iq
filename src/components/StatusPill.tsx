type Status = "winning" | "review" | "matched" | "warning" | "in-stock" | "lost" | "not-found" | "info";

const statusMap: Record<Status, string> = {
  "winning": "pill-winning",
  "in-stock": "pill-winning",
  "review": "pill-review",
  "lost": "pill-review",
  "not-found": "pill-review",
  "matched": "pill-matched",
  "info": "pill-matched",
  "warning": "pill-warning",
};

const labelMap: Record<Status, string> = {
  "winning": "Winning",
  "in-stock": "In Stock",
  "review": "Review",
  "lost": "Lost",
  "not-found": "Not Found",
  "matched": "Matched",
  "info": "Info",
  "warning": "Warning",
};

export default function StatusPill({ status }: { status: Status }) {
  return <span className={statusMap[status]}>{labelMap[status]}</span>;
}

export type { Status };
