/**
 * Reusable formatting utilities for Sheggar Wheels
 * Handles currency (ETB), dates, relative time, and CSV generation
 */

export function formatETB(amount) {
  if (amount == null || isNaN(amount)) return "0 ETB";
  const num = Math.round(Number(amount));
  return `${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ETB`;
}

export function formatUSD(amountInETB, exchangeRate = 125) {
  if (amountInETB == null || isNaN(amountInETB)) return "$0";
  const usd = Math.round(Number(amountInETB) / exchangeRate);
  return `$${usd}`;
}

export function formatDate(isoDateString) {
  if (!isoDateString) return "N/A";
  try {
    const [year, month, day] = isoDateString.split("T")[0].split("-");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
  } catch {
    return isoDateString;
  }
}

export function formatRelativeTime(isoDateString) {
  if (!isoDateString) return "";
  try {
    const date = new Date(isoDateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(isoDateString);
  } catch {
    return isoDateString;
  }
}

/**
 * Escapes fields and generates properly quoted CSV content
 * Compliant with RFC 4180
 */
export function generateCSV(headers, rows) {
  const escapeCell = (val) => {
    if (val == null) return '""';
    const stringVal = String(val);
    if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const headerLine = headers.map((h) => escapeCell(h.label || h)).join(",");
  const dataLines = rows.map((row) => {
    return headers
      .map((h) => {
        const key = typeof h === "object" ? h.key : h;
        return escapeCell(row[key]);
      })
      .join(",");
  });

  return [headerLine, ...dataLines].join("\r\n");
}

export function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
