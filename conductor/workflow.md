# Development Workflow

## 1. Task Management
- **Work Unit:** "Track" (Feature/Bug fix) -> "Phase" -> "Task".
- **Tracking:** All work is tracked in `conductor/tracks/<track_id>/plan.md`.

## 2. Development Cycle (TDD)
For each task:
1.  **Write Tests:** Create a failing test case that defines the expected behavior.
2.  **Implement:** Write the minimal code necessary to pass the test.
3.  **Refactor:** Improve code quality without changing behavior.
4.  **Verify:** Ensure all tests pass.

## 3. Commit Strategy
- **Frequency:** Commit after each **PHASE**.
- **Message Format:** `type(scope): description` (e.g., `feat(auth): implement login`).
- **Task Summary:**
  - Use `git notes add -m "Task Summary"` to attach detailed notes to the commit.

## 4. Quality Standards
- **Test Coverage:** Maintain >80% code coverage.
- **Linting:** Ensure code passes all linting rules defined in `conductor/code_styleguides/`.
- **Review:** Self-review code against `conductor/product-guidelines.md` before marking a task complete.

## 5. Phase Completion
- Run the "Phase Completion Verification" task at the end of each phase.
