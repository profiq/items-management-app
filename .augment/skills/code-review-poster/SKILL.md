---
name: code-review-poster
description:
  GitLab integration skill that posts code review findings as resolvable discussion threads on merge requests.
  Handles authentication, MR details retrieval, and creates properly formatted comments with severity and code snippets.
---

# Code Review Poster

This skill handles posting code review findings to GitLab merge requests as resolvable discussion threads. It manages authentication, retrieves MR details, and creates properly formatted comments.

## Purpose

Takes filtered review findings from `code-review-filter` and posts them to a GitLab MR as:

- Individual resolvable discussion threads for each issue
- A summary comment with overall assessment
- Properly formatted with severity, category, and code snippets

## Inputs

- **MR Number**: The merge request IID to post to
- **Review Findings**: Filtered list of issues to post (from `code-review-filter`)
- **Summary**: Overall review assessment and recommendation

## Workflow

### 1. Determine Target MR

- If MR number is provided as argument, use that
- If running in CI/CD context, use `$CI_MERGE_REQUEST_IID` environment variable
- Otherwise, ask the user for the MR number

### 2. Authenticate with GitLab

The GitLab MCP server handles authentication automatically:

- **In CI/CD**: Ensure `glab auth login` has been run in the pipeline's `before_script` with `$GLAB_TOKEN` or `$CI_JOB_TOKEN`
- **Locally**: User should already be authenticated via `glab auth login`

Verify authentication using the MCP tool:

```
Use glab_auth_status_glab tool with:
- flags: { show_token: false }
```

This will confirm the authentication status before proceeding.

### 3. Get MR Details

Retrieve MR details to obtain necessary SHAs for posting diff notes:

```
Use glab_mr_view_glab tool with:
- args: [<MR_NUMBER>]
- flags: { output: "json" }
```

Extract from the JSON response:

- **Project ID**: `project_id`
- **base_sha**: `diff_refs.base_sha`
- **head_sha**: `diff_refs.head_sha`
- **start_sha**: `diff_refs.start_sha`

These SHAs are required for posting comments on specific lines in the diff.

### 4. Post Individual Issue Threads

For each issue in the filtered findings:

#### A. Format the Comment Body

```markdown
**{Issue Title}**

**Severity: {Level} - {Category}**

{Issue description}

{Code snippets if any}

**{Fix Required/Recommendation/Alternative}:** {Details}

- Automated Code Review
```

The signature `- Automated Code Review` is critical for duplicate detection.

#### B. Prepare JSON Payload

For **general comments** (no specific file/line), create `comment_N.json`:

```json
{
  "body": "**Issue Title**\n\n**Severity: High - Bug**\n\n...",
  "position": {
    "position_type": "text"
  }
}
```

For **diff notes** (file-specific comments), create `comment_N.json`:

```json
{
  "body": "**Issue Title**\n\n**Severity: High - Bug**\n\n...",
  "position": {
    "position_type": "text",
    "base_sha": "abc123...",
    "head_sha": "def456...",
    "start_sha": "abc123...",
    "old_path": "path/to/file.ts",
    "new_path": "path/to/file.ts",
    "new_line": 42
  }
}
```

**Important Notes:**

- For modified files, `old_path` and `new_path` are typically the same
- For renamed files, `old_path` and `new_path` differ
- `new_line` should be the line number in the new version of the file

#### C. Post the Thread

Create a temporary JSON file with the payload, then use the GitLab MCP tool:

```

1. Save the JSON payload to a temporary file (e.g., comment_N.json)

2. Use glab_api_glab tool with:
   - args: ["/projects/<PROJECT_ID>/merge_requests/<MR_IID>/discussions"]
   - flags: {
     method: "POST",
     header: ["Content-Type: application/json"],
     input: "comment_N.json"
     }

3. Delete the temporary file after posting

```

Replace `<PROJECT_ID>` with the project ID and `<MR_IID>` with the MR number.

#### D. Handle Errors

- If a thread fails to post, log the error and continue with remaining issues
- Track success/failure counts for final summary
- Common errors:
  - Invalid line number (post as general comment instead)
  - Invalid file path (post as general comment instead)
  - API rate limiting (wait and retry)
  - Authentication failure (report and abort)
- Always clean up temporary JSON files, even on error

### 5. Post Summary Comment

After posting all individual issue threads, post a summary comment:

```markdown
## 🤖 Automated Code Review Summary

### Issues Found

- **Critical**: X
- **High**: Y
- **Medium**: Z
- **Low**: W

### Overall Recommendation

{✅ Approved / ❌ Request Changes / ⚠️ Approved with Comments}

### Key Highlights

{Positive aspects of the code}

### Required Actions

{List of critical/high priority items that must be addressed}

---

- Automated Code Review
```

Use the same MCP tool as individual threads, but with `position_type: "text"` (general comment):

```
1. Create JSON payload with position_type: "text"
2. Save to temporary file (e.g., summary.json)
3. Use glab_api_glab tool with:
   - args: ["/projects/<PROJECT_ID>/merge_requests/<MR_IID>/discussions"]
   - flags: {
       method: "POST",
       header: ["Content-Type: application/json"],
       input: "summary.json"
     }
4. Delete the temporary file
```

### 6. Report Results

Provide a summary to the user:

```markdown
## Posting Results

✅ Successfully posted: X issues
⏭️ Skipped (duplicates): Y issues
❌ Failed to post: Z issues

### Posted Issues by Severity

- Critical: A
- High: B
- Medium: C
- Low: D

{List any errors encountered}
```

## API Endpoint

Use GitLab MCP server via `glab_api_glab` tool:

```
glab_api_glab tool with:
- args: ["/projects/<PROJECT_ID>/merge_requests/<MR_IID>/discussions"]
- flags: {
    method: "POST",
    header: ["Content-Type: application/json"],
    input: "<path_to_json_file>"
  }
```

The JSON file should contain the discussion payload with body and position information.

## Best Practices

- Post issues in order of severity (Critical first, then High, Medium, Low)
- Handle both absolute and relative file paths
- Validate line numbers against the actual file in the MR
- If a line number is invalid, fall back to posting as a general comment
- Always delete temporary JSON files after use
- Keep comments concise but informative
- Include specific line references when possible for better context
- Use consistent formatting for easier parsing
- Handle API errors gracefully and continue with remaining issues

## Error Handling

- **Invalid MR number**: Report error and abort
- **Authentication failure**: Provide clear instructions and abort
- **API call failure**: Log error, continue with remaining issues
- **Invalid line number**: Post as general comment instead
- **Rate limiting**: Wait and retry with exponential backoff
- **Network errors**: Retry up to 3 times, then skip and continue

Always provide a final summary with success/failure counts.

## Notes

- This skill requires GitLab MCP server access via `glab_api_glab` and `glab_mr_view_glab` tools
- It does NOT perform code analysis
- It does NOT check for duplicates (use `code-review-filter` first)
- Use after `code-review` and `code-review-filter`
- Temporary JSON files are used because the MCP tool requires file input for complex JSON payloads
- The signature `- Automated Code Review` must be included in every comment
- The MCP server must be configured in `.augment/settings.json`
- Authentication must be set up via `glab auth login` before using this skill
