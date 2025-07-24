#!/usr/bin/env python3
"""
Script to generate Python code from a GitHub issue description using OpenAI.
Reads the issue description from the ISSUE_BODY environment variable and prints
out generated code to stdout. Requires the OPENAI_API_KEY environment variable
for authentication. Avoids committing any API keys to the repository.
"""
import os
import sys
from openai import OpenAI


def main() -> None:
    """Entry point for code generation."""
    api_key = os.getenv("OPENAI_API_KEY")
    issue_body = os.getenv("ISSUE_BODY")
    if not api_key or not issue_body:
        print(
            "Error: OPENAI_API_KEY and ISSUE_BODY must be set in the environment",
            file=sys.stderr,
        )
        sys.exit(1)

    # Configure OpenAI API client
    client = OpenAI(api_key=api_key)

    prompt = (
        "You are a helpful AI developer. "
        "Generate well-structured, clean Python 3.12 code that addresses the following GitHub issue. "
        "Return only the code without explanation.\n\n"
        f"Issue:\n{issue_body.strip()}\n\nCode:\n"
    )

    try:
        # Using ChatCompletion API as Codex models are deprecated
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # or "gpt-3.5-turbo" for cost efficiency
            messages=[
                {"role": "system", "content": "You are a helpful AI developer that generates clean, well-structured Python code."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.0,
            n=1,
        )
    except Exception as exc:
        print(f"Error contacting OpenAI API: {exc}", file=sys.stderr)
        sys.exit(1)

    if not response.choices:
        print("Error: No code returned by OpenAI", file=sys.stderr)
        sys.exit(1)

    code = response.choices[0].message.content.strip()
    
    # Remove any markdown code blocks if present
    if code.startswith("```python"):
        code = code[len("```python"):].strip()
    if code.startswith("```"):
        code = code[3:].strip()
    if code.endswith("```"):
        code = code[:-3].strip()
    
    print(code)


if __name__ == "__main__":
    main()