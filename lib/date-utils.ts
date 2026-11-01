export function getWIBDate(val?: Date | string | number | null): string {
  const d = val ? new Date(val) : new Date();
  const valid = isNaN(d.getTime()) ? new Date() : d;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(valid);
}

export function getWIBTime(val?: Date | string | number | null, withSeconds: boolean = false): string {
  const d = val ? new Date(val) : new Date();
  const valid = isNaN(d.getTime()) ? new Date() : d;
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    hour12: false
  };
  if (withSeconds) opts.second = "2-digit";
  return new Intl.DateTimeFormat("id-ID", opts).format(valid).replace(/\./g, ":");
}

export function formatWIBDate(
  val?: Date | string | number | null,
  format: "full" | "long" | "short" = "long"
): string {
  const d = val ? new Date(val) : new Date();
  const valid = isNaN(d.getTime()) ? new Date() : d;
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta"
  };
  if (format === "full") {
    opts.weekday = "long";
    opts.day = "numeric";
    opts.month = "long";
    opts.year = "numeric";
  } else if (format === "short") {
    opts.day = "numeric";
    opts.month = "short";
    opts.year = "numeric";
  } else {
    opts.day = "numeric";
    opts.month = "long";
    opts.year = "numeric";
  }
  return new Intl.DateTimeFormat("id-ID", opts).format(valid);
}

export function formatWIBDateTime(
  val?: Date | string | number | null,
  withSeconds: boolean = false
): string {
  const d = val ? new Date(val) : new Date();
  const valid = isNaN(d.getTime()) ? new Date() : d;
  const datePart = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta"
  }).format(valid);
  const timePart = getWIBTime(valid, withSeconds);
  return `${datePart} • ${timePart} WIB`;
}
