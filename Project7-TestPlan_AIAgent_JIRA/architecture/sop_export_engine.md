# 📖 SOP: Export Engine (Excel, CSV, Markdown, JSON)

## 1. Objective
Provide instant, multi-format exports for QA engineers, test management platforms, and leadership reporting.

## 2. Format Specifications
### A. Excel (.xlsx) via ExcelJS
- **Tab 1: Test Plan:**
  - Header row filled with Dark Slate `#1E293B`, bold white text.
  - Rows for Scope, Objectives, Strategy, Environments, Entry/Exit criteria, Risks, and Warnings.
- **Tab 2: Test Cases:**
  - Header row filled with Royal Blue `#2563EB`, bold white text.
  - Columns: Test ID, Title, Type, Priority, Preconditions, Step #, Action, Test Data, Expected Result, Postconditions.
  - Wrapped text cells, auto-adjusted column widths.

### B. CSV (.csv)
- Standard comma-separated format conforming to RFC 4180 with quoted fields.
- Directly importable into JIRA Zephyr, Xray, TestRail, and Azure DevOps.

### C. Markdown (.md)
- GitHub-flavored markdown with summary badges, test plan sections, and GFM markdown tables.

