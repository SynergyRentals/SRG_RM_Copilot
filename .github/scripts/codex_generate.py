#!/usr/bin/env python3
"""
Script to generate Python code from a GitHub issue description using OpenAI Codex.
Reads the issue description from the ISSUE_BODY environment variable and prints
out generated code to stdout. Requires the OPENAI_API_KEY environment variable
for authentication. Avoids committing any API keys to the repository.
"""
import os
import sys
import openai


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
    openai.api_key = api_key

    prompt = (
        "You are a helpful AI developer. "
        "Generate well-structured, clean Python 3.12 code that addresses the following GitHub issue. "
        "Return only the code without explanation.\n\n"
        f"Issue:\n{issue_body.strip()}\n\nCode:\n"
    )

    try:
        response = openai.Completion.create(
            engine="code-davinci-002",
            prompt=prompt,
            max_tokens=800,
            temperature=0.0,
            n=1,
            stop=None,
        )
    except Exception as exc:
        print(f"Error contacting OpenAI API: {exc}", file=sys.stderr)
        sys.exit(1)

    choices = response.get("choices")
    if not choices:
        print("Error: No code returned by Codex", file=sys.stderr)
        sys.exit(1)

    code = choices[0].get("text", "").strip()
    print(code)


if __name__ == "__main__":
    main()
