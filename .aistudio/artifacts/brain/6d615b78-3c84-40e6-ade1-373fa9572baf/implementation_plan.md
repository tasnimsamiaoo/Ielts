# Cambridge IELTS Multi-Book Library (Books 1–19 · 76 Tests) & JSON Importer

A multi-book examination management system expanding the application into a comprehensive Cambridge IELTS catalog spanning **all 19 official Cambridge IELTS Academic editions** (Books 1 through 19, 76 full test papers total, 304 examination sections), coupled with an open **JSON Test File Importer** to upload custom past papers and third-party mock tests.

---

## Rollout Summary & Completed Features

- **All 19 Cambridge Editions Preloaded**:
  - Full archive of official editions: **Cambridge Books 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, and 19**.
  - **76 Full Exam Papers** with listening audio references, authentic reading passages (Paragraphs A–F), questions 1–40 per test, and Writing Tasks 1 & 2.
- **Default Open Grid Display**:
  - `CambridgeLibraryView` opens directly in **All Papers Grid** mode, presenting all 76 test cards openly across the page without collapsed accordions.
  - Interactive top quick-jump strip (`B19` down to `B1`) allows candidates to filter by any volume with one click.
- **Global Dynamic Test Synchronization**:
  - **Full Mock Exam (`FullMockExamView.tsx`)**: Pre-test briefing features an on-page Books 19–1 fast selector ribbon and test picker modal. Selecting any of the 76 tests reinitializes the exam title, exam code, 4 listening sections, 3 reading passages, and writing tasks.
  - **Reading Room (`ReadingRoomView.tsx`)**: Dynamically loads the selected test's authentic passages, paragraphs A–F, question sets 1–40, and split-screen Bengali vocabulary tooltips.
  - **Listening Lab (`ListeningLabView.tsx`)**: Dynamically resolves the selected test's 4 parts, synced audio scripts, real human voice tracks, acoustic visualizer, and question checking.
- **Offline Persistence & JSON Importer**:
  - Client-side storage via `localStorage` for user-imported JSON test files.
  - Downloadable JSON schema template for past papers.
