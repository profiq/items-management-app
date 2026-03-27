---
name: code-review-filter
description:
  Intelligent duplicate detection skill that uses semantic analysis and context-aware reasoning
  to filter code review findings. Goes beyond simple title matching to understand issue similarity
  through location analysis, technical term extraction, and root cause identification.
---

# Code Review Filter

This skill provides intelligent duplicate detection for code review findings by analyzing existing GitLab MR discussions and filtering out issues that have already been posted. It uses multi-level matching strategies including exact matching, semantic similarity, and context-aware AI reasoning to accurately identify duplicates even when worded differently.

## Purpose

When code review jobs run multiple times (e.g., after new commits or pipeline retries), this skill prevents posting duplicate comments by:

1. Retrieving existing discussions from the GitLab MR
2. Extracting full context from posted issues (title, location, description, technical terms)
3. Performing intelligent multi-level duplicate detection:
   - **Exact matching**: Same title and location
   - **Semantic matching**: Same issue, different wording (60%+ term overlap)
   - **Context-aware matching**: Same root cause or overlapping scope
4. Filtering out true duplicates while preserving distinct issues
5. Returning only new, unique issues to post with detailed match reasoning

## Inputs

- **MR Number**: The merge request IID to check
- **Project ID**: The GitLab project ID
- **Review Findings**: List of issues from the `code-review` skill

Each review finding should include:

- Issue title (used for duplicate detection)
- Severity level
- Category
- File path and line number (if applicable)
- Description and recommended fix

## Workflow

### 1. Retrieve Existing Discussions

Use the GitLab MCP server to get all discussions on the MR.

First, get the MR details to obtain the project ID:

```
Use glab_mr_view_glab tool with:
- args: [<MR_NUMBER>]
- flags: { output: "json" }
```

Extract the `project_id` from the response.

Then retrieve all notes/discussions on the MR:

```
Use glab_mr_view_glab tool with the limit set to 500000 and parameters:
- args: [<MR_NUMBER>]
- flags:
    comments: true
    unresolved: true
    resolved: true
```

This returns all discussion threads on the merge request in JSON under key Discussions.

### 2. Identify Automated Review Comments

Parse the JSON response from the API call. The response structure is:

```json
[
  {
    "id": "discussion_id",
    "notes": [
      {
        "id": "note_id",
        "body": "**Issue Title**\n\n**Severity: High - Bug**\n\n...\n\n- Automated Code Review",
        "author": {...},
        ...
      }
    ]
  }
]
```

**Note on Large MRs**: When pagination is enabled, the API will return ALL discussions across all pages as a single array. You don't need to handle pagination manually - the `glab_api_glab` tool with `paginate: true` automatically fetches all pages and concatenates the results. This means you can have 100+ discussions and they'll all be included in the response.

For each discussion:

1. Iterate through the `notes` array in each discussion
2. Check if the note `body` contains the signature: `- Automated Code Review`
3. If found, this is a comment from a previous automated review run
4. Extract the issue title from the comment body (first line after `**`)

Example comment structure:

```markdown
**Issue Title Here**

**Severity: High - Bug**

Description...

- Automated Code Review
```

The issue title is the text between the first `**` markers.

### 3. Extract Full Context from Posted Issues

For each automated review comment, extract comprehensive information:

- **Issue title** (text between first `**` markers)
- **Severity and category** (from `**Severity: {Level} - {Category}**` line)
- **File path and line number** (if mentioned in the comment)
- **Description** (the main body of the comment)
- **Key concepts and terms** (extract technical terms, variable names, function names, patterns)

Store this information in a structured format for intelligent comparison:

```json
{
  "title": "Issue title",
  "severity": "High",
  "category": "Bug",
  "file_path": "path/to/file.ts",
  "line_number": 42,
  "description": "Full description text",
  "key_terms": ["variable_name", "function_name", "pattern_name"]
}
```

### 4. Intelligent Duplicate Detection

For each new issue, perform multi-level comparison against posted issues:

#### Level 1: Exact Match (Definite Duplicate)

- Exact title match (case-insensitive, whitespace normalized)
- Same file path and line number
- **Action**: Skip as duplicate

#### Level 2: Semantic Match (Likely Duplicate)

Check if the issue describes the same problem using different wording:

- **Same location**: File path and line number match (±5 lines tolerance)
- **Same category and severity**: Both are the same type of issue
- **Semantic similarity**: Descriptions discuss the same concept
  - Compare key technical terms (variable names, function names, class names)
  - Check for overlapping concerns (e.g., both mention "null check", "error handling", "type safety")
  - Look for similar recommended fixes

**Semantic similarity indicators:**

- 60%+ overlap in technical terms (variable/function/class names)
- Both mention the same code pattern or anti-pattern
- Both reference the same language feature or API
- Recommended fixes target the same code construct

**Action**: Skip as likely duplicate, log the match reasoning

#### Level 3: Related Issue (Potential Duplicate)

Check if issues are closely related but potentially distinct:

- **Same file, different lines**: Within 15 lines of each other
- **Same category**: Both are the same type of issue (e.g., both "Security")
- **Related concepts**: Share some technical terms but not enough for semantic match

**Action**:

- If issues are within 8 lines and share 45%+ technical terms: Skip as duplicate (regardless of severity)
- Otherwise: Continue to Level 4 for context-aware analysis

#### Level 4: Context-Aware Analysis

Use AI reasoning to detect duplicates that simple matching would miss:

**Consider:**

- **Root cause analysis**: Do both issues stem from the same underlying problem?
  - Example: "Missing null check" and "Potential null pointer" on same variable
  - Example: "Unhandled promise rejection" and "Missing error handling" in same async function

- **Scope overlap**: Does one issue encompass the other?
  - Example: "Function lacks error handling" vs "Missing try-catch for API call" in same function
  - Action: Keep only the broader issue, skip the narrower one

- **Different manifestations**: Same problem, different symptoms
  - Example: "Race condition in state update" and "Inconsistent state rendering" in same component
  - Example: "SQL injection vulnerability" and "Unsanitized user input" in same query

- **Refactoring impact**: Has code been refactored since the original comment?
  - Check if line numbers have shifted significantly (>30 lines)
  - Check if function/class names have changed
  - If refactored: Treat as new issue (code has changed, needs re-review)

**Action**: Use reasoning to determine if issues are duplicates despite different wording/location. If determined to be a duplicate, ALWAYS skip regardless of severity level.

### 5. Return Filtered Results

Output two lists:

**New Issues to Post:**

- ONLY issues that haven't been posted yet and are NOT duplicates
- Issues must be genuinely distinct from existing comments
- Maintain original structure (severity, category, file, line, description, fix)
- **NEVER include duplicates, even if they are Critical severity**

**Skipped Issues (Duplicates):**

- ALL issues filtered out as exact, semantic, related, or context-aware duplicates
- Include:
  - Original issue title
  - Severity level (to show that even Critical issues can be duplicates)
  - Match type (exact, semantic, related, context-aware)
  - Match reasoning (why it was considered a duplicate)
  - Reference to the existing comment it duplicates

## Output Format

```markdown
## Filtering Results

### New Issues to Post (X)

[List of ONLY genuinely new issues - NO duplicates regardless of severity]

### Skipped Issues - Duplicates (Y)

#### Exact Matches (A)

1. **[Issue Title]** (Severity: [Level])
   - Matched: [Existing issue title]
   - Reason: Exact title and location match

#### Semantic Matches (B)

1. **[Issue Title]** (Severity: [Level])
   - Matched: [Existing issue title]
   - Reason: Same location (file:line), same category, 85% term overlap
   - Shared terms: [variable_name, function_name, ...]

#### Context-Aware Matches (C)

1. **[Issue Title]** (Severity: [Level])
   - Matched: [Existing issue title]
   - Reason: Same root cause - both address [underlying problem]
   - Analysis: [Explanation of why these are duplicates]

### Summary

- Total findings analyzed: Z
- New issues to post: X
- Duplicate issues skipped: Y (Exact: A, Semantic: B, Context-aware: C)
- Note: Duplicates are ALWAYS filtered regardless of severity level
```

## Best Practices

### Matching Strategy

- **Start with exact matching** for quick wins
- **Apply semantic analysis** for same-location issues with different wording
- **Use context-aware reasoning** for complex cases (root cause, scope overlap)
- **Normalize all text** (trim whitespace, case-insensitive, remove special chars)
- **Extract technical terms** using regex patterns:
  - Variable/function names: `[a-zA-Z_][a-zA-Z0-9_]*`
  - Class names: `[A-Z][a-zA-Z0-9]*`
  - File paths and imports
  - API/library references

### Similarity Thresholds

- **Exact match**: 100% title match + same location
- **Semantic match**: 60%+ term overlap + same location (±5 lines) + same category
- **Related issue**: 45%+ term overlap + within 15 lines + same category
- **Context-aware**: Use AI reasoning when above rules don't apply

### Edge Cases

- **MR with no existing discussions**: All issues are new
- **Large MRs with 100+ discussions**: Pagination handles this automatically when `paginate: true` is set
- **Discussions without automated signature**: Ignore (not from bot)
- **Malformed comment bodies**: Log error, skip that comment, continue
- **Refactored code**: If line numbers shifted >30 lines, treat as new
- **Multiple issues on same line**: Compare full descriptions, not just location
- **Generic titles**: Rely more on description and technical terms

### Processing Guidelines

- **Preserve all metadata** from original findings
- **Maintain severity ordering** in filtered results (Critical → High → Medium → Low)
- **Log all matching decisions** with reasoning for transparency
- **Provide confidence scores** for semantic and context-aware matches
- **ALWAYS skip duplicates regardless of severity** - if an issue matches at any level (exact, semantic, or context-aware), it MUST be filtered out, even if it's Critical severity
- **No exceptions for severity**: Critical, High, Medium, and Low severity issues are all subject to the same duplicate detection rules

## Error Handling

- If MCP tool call fails, log error and return all findings (fail-safe: post everything)
- If discussion parsing fails, skip that discussion and continue
- If no automated review signature found, treat as non-duplicate
- Report any errors in the summary

## Examples

### Example 1: Semantic Match

**New Issue:**

- Title: "Potential null pointer exception"
- File: `src/service.ts:42`
- Description: "Variable `user` may be null when accessing `user.name`"

**Existing Comment:**

- Title: "Missing null check"
- File: `src/service.ts:42`
- Description: "The `user` variable should be checked for null before accessing properties"

**Result:** SKIP - Semantic match (same location, same variable, same concern)

### Example 2: Context-Aware Match

**New Issue:**

- Title: "Unhandled promise rejection"
- File: `src/api.ts:156`
- Description: "Async function `fetchData` doesn't handle errors"

**Existing Comment:**

- Title: "Missing try-catch block"
- File: `src/api.ts:155`
- Description: "Function `fetchData` needs error handling for API calls"

**Result:** SKIP - Context-aware match (same function, same root cause: missing error handling)

### Example 3: Related but Distinct

**New Issue:**

- Title: "SQL injection vulnerability in search"
- File: `src/db.ts:89`
- Description: "User input not sanitized in search query"

**Existing Comment:**

- Title: "SQL injection in login"
- File: `src/db.ts:45`
- Description: "User credentials not sanitized in login query"

**Result:** POST - Different locations, different functions, both need fixing

### Example 4: Refactored Code

**New Issue:**

- Title: "Missing error handling"
- File: `src/service.ts:200`
- Description: "Function `processData` needs error handling"

**Existing Comment:**

- Title: "Missing error handling"
- File: `src/service.ts:150`
- Description: "Function `processData` needs error handling"

**Result:** POST - Line shifted >20 lines, code likely refactored, needs re-review

## Notes

- This skill requires GitLab MCP server access via `glab_api_glab` and `glab_mr_view_glab` tools
- It does NOT post any comments itself
- It does NOT perform code analysis
- Use after `code-review` and before `code-review-poster`
- The signature `- Automated Code Review` is critical for identifying bot comments
- **Intelligence over exact matching**: Use semantic understanding and context
- **Transparency**: Always explain why an issue was marked as duplicate
- **Strict filtering**: ALWAYS skip duplicates regardless of severity - no exceptions for Critical issues
- **No "when in doubt" exceptions**: If an issue matches at any level, it is filtered out
- The MCP server must be configured in `.augment/settings.json`
