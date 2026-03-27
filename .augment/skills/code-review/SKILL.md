---
name: code-review
description:
  Core code analysis skill that performs in-depth code review based on established pillars.
  Identifies and categorizes issues by severity. Works with any input - local changes, MR diffs, or code snippets.
  Does NOT post comments to GitLab.
---

# Code Review

This skill provides comprehensive code analysis capabilities for reviewing code changes. It identifies issues, categorizes them by severity, and outputs structured findings that can be used for feedback or further processing.

## Inputs

This skill can analyze:

- **Local Changes**: Git diffs from `git diff` or `git diff --staged`
- **MR Diffs**: Diffs retrieved from GitLab merge requests
- **Code Snippets**: Any provided code for review

## Review Pillars

Analyze code changes based on these core pillars:

- **Correctness**: Does the code achieve its stated purpose without bugs or logical errors?
- **Maintainability**: Is the code clean, well-structured, and easy to understand and modify in the future? Consider factors like code clarity, modularity, and adherence to established design patterns.
- **Readability**: Is the code well-commented (where necessary) and consistently formatted according to project coding style guidelines?
- **Efficiency**: Are there any obvious performance bottlenecks or resource inefficiencies introduced by the changes?
- **Security**: Are there any potential security vulnerabilities or insecure coding practices?
- **Edge Cases and Error Handling**: Does the code appropriately handle edge cases and potential errors?
- **Testability**: Is the new or modified code adequately covered by tests? Suggest additional test cases that would improve coverage or robustness.

## Workflow

### 1. Identify Changes

Depending on the input type:

#### For Local Changes:

1. Check status: `git status`
2. Read diffs: `git diff` (working tree) and/or `git diff --staged` (staged)

#### For MR Diffs:

1. Use GitLab MCP to retrieve the MR diff
2. Optionally read MR description and comments for context

#### For Code Snippets:

1. Analyze the provided code directly

### 2. Perform Analysis

For each changed file:

1. Review the changes line by line
2. Apply the review pillars to identify issues
3. Track the exact file path and line number for each issue
4. Note the context and impact of each issue

### 3. Categorize Issues

Organize findings into severity levels:

- **Critical**: Bugs, security issues, or breaking changes that must be fixed
- **High**: Significant issues that should be fixed before merge
- **Medium**: Improvements that would enhance code quality
- **Low**: Minor suggestions, nitpicks, or optional improvements

For each issue, document:

- **Title**: Brief, descriptive title
- **Severity**: Critical, High, Medium, or Low
- **Category**: Bug, Security, Performance, Maintainability, Readability, Testing, etc.
- **File Path**: Exact path to the file (if applicable)
- **Line Number**: Specific line number (if applicable)
- **Description**: Clear explanation of the issue
- **Impact**: Why this matters and what could go wrong
- **Recommended Fix**: Specific suggestion for how to address the issue
- **Code Snippet**: Relevant code excerpt (if helpful)

## Output Format

Provide structured findings in this format:

````markdown
## Code Review Findings

### Critical Issues

1. **[Title]**
   - **File**: `path/to/file.ext:line_number`
   - **Category**: [Bug/Security/etc.]
   - **Description**: [What's wrong]
   - **Impact**: [Why it matters]
   - **Recommended Fix**: [How to fix it]
   - **Code Snippet** (if applicable):
     ```language
     [relevant code]
     ```

### High Priority Issues

[Same format as Critical]

### Medium Priority Issues

[Same format as Critical]

### Low Priority Issues

[Same format as Critical]

### Summary

- Total Issues: X (Critical: A, High: B, Medium: C, Low: D)
- Overall Assessment: [Brief summary]
- Recommendation: ✅ Approved / ❌ Request Changes / ⚠️ Approved with Comments
````

## Best Practices

- Be constructive, professional, and friendly
- Explain _why_ a change is requested, not just what
- Provide specific, actionable recommendations
- Include code examples when helpful
- Focus on significant issues; don't nitpick excessively
- Acknowledge good practices and improvements
- Consider the broader context and project conventions
- Validate that line numbers are accurate
- Use consistent issue titles for easier tracking

## Notes

- This skill performs ONLY analysis and categorization
- It does NOT interact with GitLab to post comments (except to retrieve MR diffs)
- It does NOT check for duplicate issues
- It does NOT post feedback to merge requests
- Use `code-review-filter` to deduplicate issues
- Use `code-review-poster` to post findings to GitLab
