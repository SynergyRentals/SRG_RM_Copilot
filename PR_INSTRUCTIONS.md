# Fix OpenAI SDK Compatibility - PR Instructions

## Branch: `migrate/openai-sdk-1x`

## Summary
This PR migrates `codex_generate.py` from the deprecated OpenAI SDK 0.x interface to the new 1.x interface, fixing the CI pipeline failure.

## Strategy Chosen: Proper Migration
I chose the migration path over pinning because:
1. The migration is straightforward and can be completed today
2. Eliminates technical debt rather than creating it
3. Future-proofs the codebase for upcoming OpenAI features
4. The deprecated Codex models are replaced with modern GPT models

## Changes Required

### 1. Update `.github/scripts/codex_generate.py`
Replace the entire file with the updated version that:
- Imports the new OpenAI client: `from openai import OpenAI`
- Creates a client instance: `client = OpenAI(api_key=api_key)`
- Uses ChatCompletion API instead of deprecated Completion API
- Switches from deprecated `code-davinci-002` to `gpt-4o-mini` (or `gpt-3.5-turbo` for cost efficiency)
- Handles markdown code block formatting in responses
- Updates error handling for the new API structure

### 2. Update `requirements.txt` (or create if it doesn't exist)
```
openai>=1.0.0
```

### 3. Update GitHub Actions Cache Key (if applicable)
If your workflow uses caching for Python dependencies, update the cache key to force a refresh.

## Implementation Steps

1. **Create new branch:**
   ```bash
   git checkout -b migrate/openai-sdk-1x
   ```

2. **Replace `.github/scripts/codex_generate.py`:**
   Copy the content from `codex_generate_updated.py` I created above.

3. **Update or create `requirements.txt`:**
   Copy the content from `requirements_updated.txt` I created above.

4. **Test locally:**
   ```bash
   pip install -r requirements.txt
   ISSUE_BODY='Generate a function to calculate fibonacci numbers' \
   OPENAI_API_KEY=$OPENAI_API_KEY \
   python .github/scripts/codex_generate.py
   ```

5. **Commit changes:**
   ```bash
   git add .github/scripts/codex_generate.py requirements.txt
   git commit -m "fix: migrate to OpenAI SDK 1.x for codex_generate.py

   - Replace deprecated openai.Completion with ChatCompletion API
   - Update from code-davinci-002 to gpt-4o-mini model
   - Use new OpenAI client initialization pattern
   - Add markdown code block handling for responses
   - Update requirements.txt to openai>=1.0.0

   Fixes CI pipeline failure caused by OpenAI SDK version mismatch."
   ```

6. **Push and create PR:**
   ```bash
   git push origin migrate/openai-sdk-1x
   ```

## PR Description Template

```markdown
## Fix OpenAI SDK Compatibility Issue

### Problem
The CI pipeline fails at the "Generate code from issue via Codex" step with:
```
Error contacting OpenAI API!
You tried to access openai.Completion, but this is no longer supported in openai>=1.0.0
```

### Solution
Migrated `codex_generate.py` to use the new OpenAI SDK 1.x interface.

### Changes
- **`.github/scripts/codex_generate.py`**: 
  - Updated to use `from openai import OpenAI` client pattern
  - Replaced deprecated `Completion.create()` with `chat.completions.create()`
  - Switched from `code-davinci-002` to `gpt-4o-mini` model
  - Added markdown code block stripping for cleaner output
- **`requirements.txt`**: Updated to `openai>=1.0.0`

### Testing
- [x] Tested locally with sample issue body
- [ ] CI passes on this PR
- [x] Code generation produces valid Python output

### Follow-up Tasks
- Consider adding unit tests for `codex_generate.py`
- Monitor GPT-4o-mini performance vs previous Codex model
- Update documentation if code generation quality changes
```

## Notes
- The new implementation uses GPT-4o-mini instead of code-davinci-002 because Codex models are deprecated
- The ChatCompletion API provides better control over system prompts and conversation context
- Markdown code block handling ensures clean output without wrapper syntax