# CI Code Quality GitHub Action

[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub Action for running tests and enforcing code coverage thresholds in
TypeScript projects. This action is designed to be used in CI pipelines to
ensure code quality and maintain high test coverage.

## Features

- Runs your project's test suite
- Collects and reports code coverage
- Fails the workflow if coverage falls below a configurable threshold
- Outputs a Markdown summary of the coverage report
- Integrates with GitHub Actions logging and outputs

## Usage

Add the following step to your workflow:

```yaml
- name: Run CI Code Quality
  uses: <owner>/<repo>@<version>
  with:
    minCoverage: '80' # Minimum required coverage percentage
```

### Inputs

| Name        | Description                        | Required | Default |
| ----------- | ---------------------------------- | -------- | ------- |
| minCoverage | Minimum coverage percentage needed | true     |         |

### Outputs

| Name     | Description                        |
| -------- | ---------------------------------- |
| coverage | The actual coverage percentage     |
| report   | Markdown-formatted coverage report |

## Development

### Install dependencies

```bash
npm install
```

### Run tests

```bash
npm run test
```

### Bundle for distribution

```bash
npm run bundle
```

### Project Structure

- `src/` — TypeScript source code
- `dist/` — Generated JavaScript (do not edit directly)
- `__tests__/` — Unit tests (Jest)
- `__fixtures__/` — Test fixtures

## Tests

Unit tests for `generateMarkDown` are located in `__tests__/markDown.test.ts`.

Example test cases:

- Returns Markdown with coverage and report
- Returns Markdown with a default message if the report is empty
- Handles zero coverage

To run the tests:

```bash
npm run test
```

## Contributing

- Follow standard TypeScript/JavaScript best practices
- Keep changes focused and minimal
- Ensure all tests pass and coverage requirements are met
- Update documentation as needed

## License

See [LICENSE](./LICENSE).
