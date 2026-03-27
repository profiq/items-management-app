# Code Review Custom Commands

This directory contains custom commands for automated code review workflow using GitLab integration.

## Commands Overview

### 1. `/review-code` - Perform Code Review

Analyzes code changes and generates structured review findings.

**Usage:**

```bash
/review-code                    # Review staged changes (default)
/review-code staged             # Review staged changes
/review-code all                # Review all uncommitted changes
/review-code path/to/file.ts    # Review specific file
/review-code mr:123             # Review GitLab MR #123
```

See [review-code.md](./review-code.md) for detailed usage and options.

---

### 2. `/filter-review` - Filter Duplicates

Removes duplicate findings that have already been posted to the GitLab MR.

**Usage:**

```bash
/filter-review                  # Auto-detect MR from review-findings.json
/filter-review auto             # Same as above
/filter-review 123              # Filter for MR #123
```

See [filter-review.md](./filter-review.md) for detailed usage and options.

---

### 3. `/post-review` - Post to GitLab

Posts filtered review findings as discussion threads on the GitLab MR.

**Usage:**

```bash
/post-review                    # Auto-detect MR from filtered-findings.json
/post-review auto               # Same as above
/post-review 123                # Post to MR #123
```

See [post-review.md](./post-review.md) for detailed usage and options.

---

## Example Workflow

```bash
# 1. Review your staged changes
/review-code staged

# 2. Filter duplicates (if posting to an MR)
/filter-review 123

# 3. Post to GitLab MR
/post-review 123
```

---

## Prerequisites

### GitLab Authentication

```bash
glab auth login
```
