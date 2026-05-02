export async function saveToSheets(type, pid, group, rowData) {
  const url = process.env.NEXT_PUBLIC_SHEETS_URL;
  if (!url) {
    console.warn("No SHEETS_URL configured, logging to console only");
    console.log("DATA:", type, pid, rowData);
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: type,
        row: rowData,
      }),
      mode: "no-cors",
    });
    console.log("Saved to sheets:", type);
  } catch (error) {
    console.error("Failed to save to sheets:", error);
    // Fallback: save to localStorage as backup
    try {
      const backup = JSON.parse(localStorage.getItem("study_backup") || "[]");
      backup.push({ type, pid, group, rowData, timestamp: new Date().toISOString() });
      localStorage.setItem("study_backup", JSON.stringify(backup));
      console.log("Saved to localStorage backup");
    } catch (e) {
      console.error("localStorage backup also failed:", e);
    }
  }
}
