export const PRIORITY_KEYWORDS = ['proxy', 'manager', 'account', 'rotation', 'switch', 'auth'];

export const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const items = [];

  // Simple CSV parser that handles quoted strings
  for (let i = 1; i < lines.length; i++) {
    let line = lines[i];
    const row = [];
    let inQuotes = false;
    let currentVal = '';

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal);
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    row.push(currentVal);

    if (row.length < 5) continue;

    // Check for priority keywords
    const desc = row[6] ? row[6].toLowerCase() : '';
    const title = row[0].toLowerCase();
    const isPriority = PRIORITY_KEYWORDS.some(k => desc.includes(k) || title.includes(k));

    items.push({
      id: `repo-${i}`,
      name: row[0],
      url: row[1],
      stars: parseInt(row[2]) || 0,
      updated: parseInt(row[3]) || 0,
      language: row[4],
      category: row[5],
      description: row[6].replace(/^"|"$/g, ''), // Remove wrapping quotes
      isPriority: isPriority
    });
  }

  // Sort: Priority items first, then by stars
  return items.sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return b.stars - a.stars;
  });
};
