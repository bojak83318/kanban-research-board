# Kanban Board Test Scenarios PRD

**Component under test**: `KanbanBoard.jsx`
**Date**: 2026-02-09
**Version**: 1.0

## 1. Overview
This document defines the test strategy for the React Kanban Board component. It covers critical user flows including drag-and-drop, priority logic, data persistence (in-memory), and import/export fidelity.

**Test Data Strategy**:
Tests utilize the `INITIAL_CSV` constant embedded in the component for baseline state, unless otherwise specified.

---

## 2. Test Cases

### Section A: Data Persistence (In-Session) & Drag-Drop
*Focus: Verifying React state updates correctly reflect UI actions.*

#### TC-001: Move Item Todo → In Progress
**Preconditions**: App loaded with default data. Item "awesome-claude-skills" is in 'To Explore' column.
**Steps**:
1. Locate card `text=awesome-claude-skills`.
2. Drag card to column `id=inProgress` (`div:has-text("In Progress")`).
3. Drop card.
**Expected Outcome**:
- Card is no longer visible in 'To Explore'.
- Card is visible in 'In Progress'.
- Column counts update (Todo -1, In Progress +1).
**JSON Metadata**:
```json
{
  "id": "TC-001",
  "priority": "P0",
  "selector": ".bg-slate-800:has-text('awesome-claude-skills')",
  "dropTarget": "div[id='inProgress']"
}
```

#### TC-002: Move Item In Progress → Done
**Preconditions**: TC-001 completed.
**Steps**:
1. Locate card `text=awesome-claude-skills` in 'In Progress'.
2. Drag to `id=done`.
**Expected Outcome**:
- Card moves to 'Done'.
- 'Done' count increments.
**JSON Metadata**:
```json
{
  "id": "TC-002",
  "priority": "P0"
}
```

#### TC-003: Move Item Done → Todo (Round Trip)
**Preconditions**: Item in 'Done'.
**Steps**:
1. Drag item back to `id=todo`.
**Expected Outcome**:
- Item reappears in 'To Explore'.
- Item retains original metadata (Stars, Language pill, Priority status).
**JSON Metadata**:
```json
{
  "id": "TC-003",
  "priority": "P1",
  "assertion": "checkMetadataPreserved"
}
```

#### TC-004: Drag to Invalid Zone
**Preconditions**: Item grabbed.
**Steps**:
1. Drag item outside of any column (e.g., Header).
2. Release mouse.
**Expected Outcome**:
- Item returns to original position.
- No state change.
**JSON Metadata**:
```json
{
  "id": "TC-004",
  "priority": "P2",
  "type": "negative"
}
```

---

### Section B: Priority Sorting Logic
*Focus: Validating the "Red Dot" logic and automatic sorting.*

#### TC-005: Initial Load Priority Sorting
**Preconditions**: App loaded.
**Steps**:
1. Inspect first child of 'To Explore' column list.
2. Inspect last child of 'To Explore' column list.
**Expected Outcome**:
- First child must have `isPriority: true` (Red Dot icon visible).
- Last child should be non-priority (assuming mixed data).
- Items with keywords (proxy, manager) must be higher index than pure skill collections.
**JSON Metadata**:
```json
{
  "id": "TC-005",
  "priority": "P1",
  "selector": "[data-testid='repo-card']",
  "logic": "index(priority) < index(non-priority)"
}
```

#### TC-006: Red Dot Indicator Visibility
**Preconditions**: "Antigravity-Manager" item exists.
**Steps**:
1. Locate item "Antigravity-Manager".
2. Check for `.text-red-400` icon (AlertCircle).
**Expected Outcome**:
- Element exists.
- Tooltip contains "High Priority".
**JSON Metadata**:
```json
{
  "id": "TC-006",
  "priority": "P1",
  "selector": "svg.text-red-400"
}
```

#### TC-007: Drop Priority Item into Todo
**Preconditions**: One priority item moved to 'In Progress'.
**Steps**:
1. Drag priority item from 'In Progress' to 'To Explore'.
**Expected Outcome**:
- Item snaps to the **TOP** of the list (Index 0).
**JSON Metadata**:
```json
{
  "id": "TC-007",
  "priority": "P1",
  "condition": "targetColId === 'todo' && item.isPriority"
}
```

#### TC-008: Drop Non-Priority Item into Todo
**Preconditions**: One non-priority item moved to 'In Progress'.
**Steps**:
1. Drag non-priority item from 'In Progress' to 'To Explore'.
**Expected Outcome**:
- Item appends to the **BOTTOM** of the list.
**JSON Metadata**:
```json
{
  "id": "TC-008",
  "priority": "P2"
}
```

---

### Section C: Import / Export
*Focus: Data fidelity during serialization.*

#### TC-009: CSV Import - Happy Path
**Preconditions**: Prepare `test_import.md` with known Obsidian format.
**Steps**:
1. Click "Import Obsidian" input.
2. Upload `test_import.md`.
3. Accept confirmation dialog.
**Expected Outcome**:
- Board clears old data.
- New columns match `.md` headers (To Explore, etc.).
- Items parsed correctly (Name, URL).
**JSON Metadata**:
```json
{
  "id": "TC-009",
  "priority": "P0",
  "file": "fixtures/obsidian_valid.md"
}
```

#### TC-010: Import Malformed File
**Preconditions**: `bad_format.txt` (random text).
**Steps**:
1. Upload file.
**Expected Outcome**:
- App should not crash.
- Potentially empty board or safe error handling (current code allows empty sections).
**JSON Metadata**:
```json
{
  "id": "TC-010",
  "priority": "P2",
  "type": "edge-case"
}
```

#### TC-011: Priority Metadata Recovery
**Preconditions**: Import MD file containing `#priority/high` tag.
**Steps**:
1. Upload file.
2. Check imported item.
**Expected Outcome**:
- Item has Red Dot indicator.
- Item `isPriority` state is true.
**JSON Metadata**:
```json
{
  "id": "TC-011",
  "priority": "P1",
  "tag": "#priority/high"
}
```

#### TC-012: Export File Generation
**Preconditions**: Default board state.
**Steps**:
1. Click "Export to Obsidian".
**Expected Outcome**:
- Browser initiates download of `antigravity-board.md`.
- File content starts with `# Antigravity Tool Research`.
**JSON Metadata**:
```json
{
  "id": "TC-012",
  "priority": "P1"
}
```

---

### Section D: Obsidian Markdown Fidelity
*Focus: String verification of generated markdown.*

#### TC-013: Checkbox and Link Formatting
**Preconditions**: Item "Foo" with URL "http://bar.com".
**Steps**:
1. Trigger `generateMarkdown()`.
**Expected Outcome**:
- Line contains `- [ ] [Foo](http://bar.com)`.
**JSON Metadata**:
```json
{
  "id": "TC-013",
  "priority": "P1",
  "regex": "^- \\[ \\] \\[.*\\]\\(http.*\\)"
}
```

#### TC-014: Star Count Formatting
**Preconditions**: Item with 2500 stars.
**Steps**:
1. Verify exported string.
**Expected Outcome**:
- String contains `(⭐2.5k)`.
**JSON Metadata**:
```json
{
  "id": "TC-014",
  "priority": "P2",
  "format": "k-notation"
}
```

#### TC-015: Language Tag Normalization
**Preconditions**: Language "C++".
**Steps**:
1. Verify exported string.
**Expected Outcome**:
- Tag formatted as `#lang/c`. (Regex `/[^a-z0-9]/g` strips symbols).
**JSON Metadata**:
```json
{
  "id": "TC-015",
  "priority": "P2"
}
```

#### TC-016: Date Header
**Steps**:
1. Verify first line of export.
**Expected Outcome**:
- Matches `# Antigravity Tool Research - YYYY-MM-DD`.
**JSON Metadata**:
```json
{
  "id": "TC-016",
  "priority": "P3"
}
```

---

### Section E: Mobile & Responsive
*Focus: Viewport constraints.*

#### TC-017: Horizontal Scroll
**Preconditions**: Viewport set to 375x812 (iPhone X).
**Steps**:
1. Load page.
**Expected Outcome**:
- `main` container has `overflow-x-auto`.
- Columns do not shrink below `min-w-[300px]`.
- User can scroll right to see "Done" column.
**JSON Metadata**:
```json
{
  "id": "TC-017",
  "priority": "P1",
  "viewport": { "width": 375, "height": 812 }
}
```

#### TC-018: Column Stacking (Negative Test)
**Preconditions**: Narrow viewport.
**Steps**:
1. Check CSS flex properties.
**Expected Outcome**:
- Columns should **component NOT** stack vertically (Flex direction remains row, enabled by scroll).
**JSON Metadata**:
```json
{
  "id": "TC-018",
  "priority": "P2"
}
```

#### TC-019: Touch Target Size
**Preconditions**: Mobile viewport.
**Steps**:
1. Verify Import/Export buttons.
**Expected Outcome**:
- Header adapts to flex-col on mobile (`flex-col md:flex-row`).
- Buttons remain accessible.
**JSON Metadata**:
```json
{
  "id": "TC-019",
  "priority": "P2"
}
```

#### TC-020: Empty State Height
**Preconditions**: Clear all items from a column.
**Steps**:
1. Observe empty column.
**Expected Outcome**:
- "Drop items here" placeholder is visible.
- Min-height ensures drop zone remains accessible.
**JSON Metadata**:
```json
{
  "id": "TC-020",
  "priority": "P3"
}
```
