# CI Prepare Docker Build GitHub Action

A GitHub Action for preparing Docker image tags and versioning in CI pipelines. This action reads your project's version file, increments the patch version, generates Docker-compatible tags, and updates version metadata. It is designed for TypeScript projects and integrates with GitHub Actions workflows.

## Features

- Reads and validates your version file
- Increments patch version automatically
- Generates Docker-compatible image tags from branch names
- Updates version.json with version, tag, and commit SHA
- Optionally commits version changes to your repository
- Outputs tags and version info for downstream steps

## Usage

Add the following step to your workflow:

```yaml
- name: Prepare Docker Build
  uses: <owner>/<repo>@<version>
  with:
    versionFile: './version.json' # Path to your version file
    commitVersion: 'true'         # Commit version.json changes (default: false)
```

### Inputs

| Name          | Description                                      | Required | Default        |
| ------------- | ------------------------------------------------ | -------- | --------------|
| versionFile   | Path to the version file (e.g., version.json)    | true     |                |
| commitVersion | Commit version.json changes (true/false)         | false    | false          |

### Outputs

| Name      | Description                                 |
| --------- | ------------------------------------------- |
| version   | The new version string                      |
| tag       | Docker-compatible image tag                 |
| commit    | First 8 chars of the current commit SHA     |
| tags      | Array of generated Docker image tags        |

## Example Workflow

```yaml
name: CI Docker Build
on:
  push:
    branches:
      - main
      - 'release/*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Prepare Docker Build
        uses: <owner>/<repo>@<version>
        with:
          versionFile: './version.json'
          commitVersion: 'true'
      - name: Build Docker Image
        run: docker build -t ${{ steps.prepare.outputs.tag }} .
```

## Development

### Install dependencies

```bash
npm install
```

### Run tests

```bash
npm run test
```

### Bundle TypeScript

```bash
npm run bundle
```

## Contributing

- Fork the repository and create your branch
- Make changes following TypeScript and project conventions
- Add or update tests in `__tests__` and fixtures in `__fixtures__`
- Run `npm run test` and ensure all tests pass
- Run `npm run bundle` to update the `dist` folder
- Open a pull request with a clear description of your changes

## License

This project is licensed under the MIT License.
