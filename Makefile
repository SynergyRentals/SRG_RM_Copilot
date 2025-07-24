.PHONY: check format lint test

check: format lint test

format:
	black .

lint:
	ruff .
	mypy .

test:
	pytest -q
