---
description: Perform comprehensive code review using established pillars
argument-hint: [file-path or 'staged' or 'all' or 'mr:<MR-number>']
---

Perform a comprehensive code review using the `code-review` skill.

**Input Options:**

- Provide a specific file path to review that file
- Use 'staged' to review staged changes
- Use 'all' to review all uncommitted changes
- Use 'mr:123' to review GitLab merge request #123
- If no argument provided, review staged changes by default

**Process:**

Use the `code-review` skill to perform comprehensive code analysis. The skill will:

1. **Identify Changes**
   - For local changes: Read the appropriate diff based on the input
   - For MR review: Retrieve the merge request diff
   - Understand the context of the changes

2. **Analyze Against Review Pillars**
   - Correctness: Bugs, logical errors
   - Maintainability: Code structure, clarity, modularity
   - Readability: Comments, formatting, style
   - Efficiency: Performance bottlenecks
   - Security: Vulnerabilities, insecure practices
   - Edge Cases: Error handling
   - Testability: Test coverage

3. **Categorize Issues**
   - Critical: Must fix (bugs, security, breaking changes)
   - High: Should fix before merge
   - Medium: Quality improvements
   - Low: Minor suggestions

4. **Provide Structured Findings**
   - Issue title
   - Severity level
   - Category
   - File path and line number
   - Description and impact
   - Recommended fix
   - Code snippets where helpful

5. **Save Results to File**
   - Save the review findings to `.augment/review-findings.json`
   - Include all issues with their metadata
   - This file will be used by /filter-review command

**Output File Format:**

```json
{
  "mr_number": 123,
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "mr:123" or "staged" or "all" or "file-path",
  "issues": [
    {
      "title": "Issue title",
      "severity": "Critical|High|Medium|Low",
      "category": "Bug|Security|Performance|etc",
      "file_path": "path/to/file.ts",
      "line_number": 42,
      "description": "What's wrong",
      "impact": "Why it matters",
      "recommended_fix": "How to fix it",
      "code_snippet": "relevant code"
    }
  ],
  "summary": {
    "total": 10,
    "critical": 2,
    "high": 3,
    "medium": 4,
    "low": 1
  }
}
```

**Important:**

- This command performs ONLY analysis
- It does NOT post comments to GitLab
- Results are automatically saved to `.augment/review-findings.json`
- Use /filter-review to deduplicate findings (reads from the saved file)
- Use /post-review to post findings to GitLab MR

**Skill Reference:**
See `.augment/skills/code-review/SKILL.md` for detailed implementation.
