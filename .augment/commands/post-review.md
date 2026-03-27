---
description: Post filtered code review findings to GitLab merge request as discussion threads
argument-hint: [MR-number or 'auto']
---

Post code review findings to a GitLab merge request as resolvable discussion threads.

**Prerequisites:**

- Filtered review findings from /filter-review command (saved in `.augment/filtered-findings.json`)
- GitLab merge request number (IID), or use 'auto' to read from saved findings
- GitLab authentication (via `glab auth login`)

**Input Options:**

- Provide MR number: `/post-review 123`
- Use 'auto': `/post-review auto` - reads MR number from `.augment/filtered-findings.json`
- If no argument and MR number exists in findings file, uses that automatically

**Process:**

Use the `code-review-poster` skill to post findings to GitLab. The skill will:

1. **Load Filtered Findings**
   - Read `.augment/filtered-findings.json` file
   - Extract MR number from file if not provided as argument
   - Validate that filtered findings exist

2. **Verify GitLab Authentication**
   - Confirm authentication is working

3. **Retrieve MR Details**
   - Get merge request information needed for posting

4. **Post Individual Issue Threads**
   - Post each issue as a resolvable discussion thread
   - Format with severity, category, description, and recommended fix
   - Include code snippets where applicable
   - Sign with `- Automated Code Review` for duplicate detection
   - Post in severity order: Critical → High → Medium → Low

5. **Post Summary Comment**
   - Create overview with issue counts by severity
   - Provide overall recommendation (✅ Approved / ❌ Request Changes / ⚠️ Approved with Comments)
   - Highlight key findings and required actions

6. **Save Posting Results**
   - Save results to `.augment/posting-results.json`
   - Include success/failure counts
   - List successfully posted and failed issues

7. **Report Results**

   ```
   ## Posting Results

   ✅ Successfully posted: X issues
   ❌ Failed to post: Y issues

   ### Posted Issues by Severity
   - Critical: A
   - High: B
   - Medium: C
   - Low: D

   Results saved to: .augment/posting-results.json
   ```

**Output File Format:**

```json
{
  "mr_number": 123,
  "timestamp": "2024-01-15T10:40:00Z",
  "source_file": ".augment/filtered-findings.json",
  "posting_summary": {
    "total_attempted": 7,
    "successfully_posted": 6,
    "failed": 1,
    "skipped_duplicates": 3
  },
  "posted_issues": [
    {
      "title": "Issue title",
      "severity": "High",
      "discussion_id": "abc123",
      "posted_at": "2024-01-15T10:40:15Z"
    }
  ],
  "failed_issues": [
    {
      "title": "Failed issue",
      "error": "Invalid line number",
      "attempted_at": "2024-01-15T10:40:20Z"
    }
  ]
}
```

**Error Handling:**

- If `.augment/filtered-findings.json` doesn't exist, report error and exit
- Continue with remaining issues if one fails
- Save results even if some postings fail
- Provide final summary with success/failure counts

**Important:**

- The signature `- Automated Code Review` is REQUIRED for duplicate detection
- Results are saved to `.augment/posting-results.json` for audit trail

**Skill Reference:**
See `.augment/skills/code-review-poster/SKILL.md` for detailed implementation.
