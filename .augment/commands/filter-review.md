---
description: Filter code review findings to remove duplicates already posted to GitLab MR
argument-hint: [MR-number or 'auto']
---

Filter code review findings by checking existing GitLab MR discussions and removing duplicates using intelligent semantic analysis.

**Prerequisites:**

- Review findings from /review-code command (saved in `.augment/review-findings.json`)
- GitLab merge request number (IID), or use 'auto' to read from saved findings

**Input Options:**

- Provide MR number: `/filter-review 123`
- Use 'auto': `/filter-review auto` - reads MR number from `.augment/review-findings.json`
- If no argument and MR number exists in findings file, uses that automatically

**Process:**

Use the `code-review-filter` skill to perform intelligent duplicate detection. The skill will:

1. **Load Review Findings**
   - Read `.augment/review-findings.json` file
   - Extract MR number from file if not provided as argument
   - Validate that findings exist

2. **Retrieve Existing Discussions**
   - Get MR details and project ID
   - Fetch all discussions from the GitLab MR
   - Extract full context from automated review comments

3. **Intelligent Duplicate Detection**
   - **Exact matching**: Same title and location
   - **Semantic matching**: Same issue, different wording (65%+ term overlap)
   - **Context-aware matching**: Same root cause or overlapping scope
   - Analyze file paths, line numbers, descriptions, and technical terms
   - Use AI reasoning for complex cases

4. **Save Filtered Results**
   - Save filtered findings to `.augment/filtered-findings.json`
   - Include only new, unique issues to post
   - Preserve all metadata from original findings
   - Add detailed filtering metadata with match reasoning

**Output Format:**

```
## Filtering Results

### New Issues to Post (X)
[List of ONLY genuinely new issues - NO duplicates regardless of severity]

### Skipped Issues - Duplicates (Y)

#### Exact Matches (A)
[Issues with exact title and location match]

#### Semantic Matches (B)
[Issues with same meaning, different wording]

#### Context-Aware Matches (C)
[Issues with same root cause or overlapping scope]

### Summary
- Total findings analyzed: Z
- New issues to post: X
- Duplicate issues skipped: Y (Exact: A, Semantic: B, Context-aware: C)
- Note: Duplicates are ALWAYS filtered regardless of severity level
- Results saved to: .augment/filtered-findings.json
```

**Output File Format:**

```json
{
  "mr_number": 123,
  "timestamp": "2024-01-15T10:35:00Z",
  "source_file": ".augment/review-findings.json",
  "filtering_summary": {
    "total_analyzed": 10,
    "new_to_post": 7,
    "duplicates_skipped": 3,
    "exact_matches": 1,
    "semantic_matches": 1,
    "context_aware_matches": 1
  },
  "issues_to_post": [
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
  "skipped_issues": [
    {
      "title": "Already posted issue",
      "severity": "High",
      "match_type": "semantic",
      "match_reasoning": "Same location, 85% term overlap",
      "matched_existing_issue": "Original issue title"
    }
  ]
}
```

**Error Handling:**

- If `.augment/review-findings.json` doesn't exist, report error and exit
- If API calls fail, return all findings (fail-safe) and save to output file
- Continue processing if individual discussions fail to parse
- Report errors in summary

**Next Step:**
Use /post-review to post the filtered findings to the GitLab MR (reads from `.augment/filtered-findings.json`)

**Skill Reference:**
See `.augment/skills/code-review-filter/SKILL.md` for detailed filtering logic and best practices.
