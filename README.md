# Student Information System (SIS) - CI/CD Pipeline

A sample Node.js web application implementing an automated Continuous Integration and Continuous Delivery / Deployment (CI/CD) pipeline using **GitHub Actions**, **Docker**, and **GitHub Container Registry (GHCR)**.

Developed for **Laboratory Module: CI/CD Pipeline with GitHub Actions (LAB ACT 3)**.

---

## 📋 Table of Contents
1. [Overview & Architecture](#-overview--architecture)
2. [Technology Stack](#-technology-stack)
3. [Prerequisites](#-prerequisites)
4. [Project Structure](#-project-structure)
5. [Local Development & Testing](#-local-development--testing)
6. [Docker Implementation](#-docker-implementation)
7. [GitHub Actions CI/CD Pipeline](#-github-actions-cicd-pipeline)
8. [GitHub Secrets Configuration](#-github-secrets-configuration)
9. [Publishing & Verifying GHCR Packages](#-publishing--verifying-ghcr-packages)
10. [Laboratory Challenges 1–4 Guide](#-laboratory-challenges-14-guide)
11. [Guide Questions & Answers](#-guide-questions--answers)

---

## 🚀 Overview & Architecture

This project demonstrates a production-grade CI/CD pipeline:
1. **Developer Push / PR**: Developer pushes commits or opens a Pull Request to the `main` branch.
2. **GitHub Actions Trigger**: Automated workflow runs on `ubuntu-latest`.
3. **CI Job (`ci`)**:
   - Checks out the repository (`actions/checkout@v6`).
   - Sets up Node.js 22 (`actions/setup-node@v6`).
   - Verifies configuration of repository secrets (`DEMO_API_KEY`).
   - Installs dependencies (`npm install`).
   - Executes static syntax checking/linting (`npm run lint`).
   - Runs automated unit tests (`npm test`).
   - Compiles/builds the distribution bundle (`npm run build`).
4. **Docker Job (`docker`)**:
   - Dependent on `ci` passing (`needs: ci`).
   - Skipped on pull requests (`if: github.event_name != 'pull_request'`).
   - Authenticates to GitHub Container Registry using `GITHUB_TOKEN` (`packages: write`).
   - Generates OCI metadata and tags (`docker/metadata-action@v6`).
   - Builds container image and pushes to `ghcr.io/<username>/student-information-system` (`docker/build-push-action@v6`).

---

## 🛠 Technology Stack

- **Runtime**: Node.js 22 LTS (Native HTTP server & `node:test` runner)
- **Containerization**: Docker (Multi-platform Alpine Linux base: `node:22-alpine`)
- **CI/CD Platform**: GitHub Actions
- **Container Registry**: GitHub Container Registry (GHCR)
- **Version Control**: Git & GitHub

---

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) (v20 or v22 recommended)
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local container builds)
- A GitHub account

---

## 📂 Project Structure

```text
student-information-system/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions workflow definition
│
├── src/
│   └── index.js              # Application entry point and HTTP server
│
├── test/
│   └── app.test.js           # Automated unit tests using node:test
│
├── screenshots/              # Evidence captures for laboratory report
├── Dockerfile                # Container definition (node:22-alpine)
├── package.json              # Project scripts and metadata
├── .gitignore                # Files excluded from git tracking
└── README.md                 # Complete documentation and lab manual
```

---

## 💻 Local Development & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Linting (Syntax & Code Validation)
```bash
npm run lint
```
*Executes `node --check src/index.js` to ensure zero syntax errors.*

### 3. Run Automated Tests
```bash
npm test
```
*Uses Node's built-in test runner (`node --test`) to test server responses.*

### 4. Build Application
```bash
npm run build
```
*Creates the `dist/` directory and copies `src/index.js` to `dist/index.js`.*

> **Windows Note**: If running Windows Command Prompt (`cmd.exe`), run under Git Bash or configure npm to use bash:
> ```bash
> npm config set script-shell "C:\Program Files\Git\bin\bash.exe"
> ```

### 5. Start the Server Locally
```bash
npm start
```
Open your browser or run:
```bash
curl http://localhost:3000
```
Expected output:
```text
Student Information System is running!
```

---

## 🐳 Docker Implementation

The application is containerized using a lightweight Alpine base image:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY src ./src
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### Build & Run Container Locally:
1. Ensure the distribution directory is built:
   ```bash
   npm run build
   ```
2. Build the Docker image:
   ```bash
   docker build -t sis-app:latest .
   ```
3. Run the container:
   ```bash
   docker run -d --name sis-container -p 3000:3000 sis-app:latest
   ```
4. Verify in browser:
   Navigate to [http://localhost:3000](http://localhost:3000).
5. Stop and clean up:
   ```bash
   docker stop sis-container
   docker rm sis-container
   ```

---

## ⚙️ GitHub Actions CI/CD Pipeline

The workflow file is located at `.github/workflows/ci-cd.yml`.

### Key Pipeline Directives:
- **`on.push.branches: [main]`**: Triggers automatically whenever code is pushed to `main`.
- **`on.push.tags: ['v*']`**: Triggers whenever a release tag (e.g. `v1.0.0`) is pushed.
- **`on.pull_request.branches: [main]`**: Triggers CI checks for pull requests.
- **`on.workflow_dispatch`**: Allows manual trigger directly from the GitHub UI.
- **`needs: ci`**: Ensures the Docker image is **only** built and pushed if linting, testing, and building succeed.
- **`if: github.event_name != 'pull_request'`**: Prevents publishing images from unmerged PR branches.
- **`permissions: packages: write`**: Grants the workflow permission to publish images to GHCR using the default `${{ secrets.GITHUB_TOKEN }}`.

---

## 🔐 GitHub Secrets Configuration

Activity 5 requires demonstrating secure secret handling without committing credentials to source code.

### Step-by-Step Setup:
1. Open your repository on GitHub: `https://github.com/ejrdeleon/student-information-system`.
2. Click **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret**.
4. Configure:
   - **Name**: `DEMO_API_KEY`
   - **Secret**: `classroom-demo-12345`
5. Click **Add secret**.

The workflow securely checks for this secret during the `ci` job:
```yaml
- name: Verify Secret Configuration
  env:
    DEMO_API_KEY: ${{ secrets.DEMO_API_KEY }}
  run: |
    if [ -n "$DEMO_API_KEY" ]; then
      echo "Secret successfully configured."
    else
      echo "Secret is missing."
      exit 1
    fi
```

---

## 📦 Publishing & Verifying GHCR Packages

Once the pipeline runs on the `main` branch:
1. Navigate to your repository's main page.
2. In the right-hand sidebar under **Packages**, locate `student-information-system`.
3. Pull the published Docker image:
   ```bash
   docker pull ghcr.io/ejrdeleon/student-information-system:main
   ```
4. Run the published image on port 3001:
   ```bash
   docker run -d --name sis-published -p 3001:3000 ghcr.io/ejrdeleon/student-information-system:main
   ```
5. Test in browser:
   Visit [http://localhost:3001](http://localhost:3001) to verify:
   ```text
   Student Information System is running!
   ```

---

## 🧪 Laboratory Challenges 1–4 Guide

### Challenge 1: Test Failure Detection
1. Open `test/app.test.js` and change the expected string:
   ```javascript
   assert.strictEqual(getMessage(), "Incorrect Message Expected");
   ```
2. Commit and push:
   ```bash
   git add test/app.test.js
   git commit -m "Introduce intentional test failure"
   git push origin main
   ```
3. Go to GitHub Actions tab:
   - The `ci` job will **FAIL** at the `Run Automated Tests` step.
   - The `docker` job will be **SKIPPED** (due to `needs: ci`).
   - Take a screenshot of the failed pipeline.
4. Restore `test/app.test.js` to:
   ```javascript
   assert.strictEqual(getMessage(), "Student Information System is running!");
   ```
5. Commit and push the fix:
   ```bash
   git add test/app.test.js
   git commit -m "Fix unit test assertion"
   git push origin main
   ```
6. Verify the workflow turns green.

### Challenge 2: Pull Request Automation
1. Create and switch to a feature branch:
   ```bash
   git checkout -b feature/student-profile
   ```
2. Update `src/index.js` and `test/app.test.js` to return:
   `"Student Information System - Profile Feature Active"`
3. Commit and push the feature branch:
   ```bash
   git add .
   git commit -m "Update student profile feature"
   git push origin feature/student-profile
   ```
4. On GitHub, create a **Pull Request** from `feature/student-profile` into `main`.
5. Observe the workflow:
   - The `ci` job runs and passes.
   - The `docker` job is skipped because `github.event_name == 'pull_request'`.
   - Take a screenshot of the PR checks.
6. Merge the PR into `main`. Once merged into `main`, the `push` workflow triggers and publishes the Docker image.

### Challenge 3: Version Tagging
1. Checkout the latest `main` branch:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create and push Git tag `v1.0.0`:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. Observe GitHub Actions:
   - The pipeline triggers on tag `v1.0.0`.
   - `docker/metadata-action` extracts the tag name and creates `ghcr.io/ejrdeleon/student-information-system:v1.0.0`.
   - Inspect the package in GitHub Packages and capture a screenshot.

### Challenge 4: Docker Image Modification (Version 2.0)
1. Modify `src/index.js` `getMessage()` function:
   ```javascript
   function getMessage() {
       return "Welcome to the Student Information System - Version 2.0!";
   }
   ```
2. Update `test/app.test.js` assertion:
   ```javascript
   assert.strictEqual(getMessage(), "Welcome to the Student Information System - Version 2.0!");
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update application to Version 2.0"
   git push origin main
   ```
4. Verify the pipeline succeeds and pull the updated image:
   ```bash
   docker pull ghcr.io/ejrdeleon/student-information-system:main
   docker run -d --name sis-v2 -p 3002:3000 ghcr.io/ejrdeleon/student-information-system:main
   ```
5. Confirm output at [http://localhost:3002](http://localhost:3002).

---

## ❓ Guide Questions & Answers

#### 1. What is CI/CD, and why is it important in modern software development?
CI/CD stands for Continuous Integration and Continuous Delivery / Deployment. It automates building, linting, testing, and packaging code changes. It reduces human error, shortens release cycles, and ensures production-ready code at all times.

#### 2. Differentiate Continuous Integration, Continuous Delivery, and Continuous Deployment.
- **Continuous Integration (CI)**: Automatically builds and tests code whenever developers commit changes to prevent integration issues.
- **Continuous Delivery (CD)**: Automatically prepares tested code into deployable artifacts (e.g., Docker images in GHCR), requiring manual approval before pushing to production.
- **Continuous Deployment (CD)**: Automatically deploys passing changes directly to production environments without human intervention.

#### 3. What is the purpose of linting in a CI/CD pipeline?
Linting performs static analysis to detect syntax errors, structural mistakes, undeclared variables, or code style deviations early, before executing tests or compiling.

#### 4. Why should automated tests execute before an application is deployed?
Automated tests verify that core business logic operates as expected and that new changes do not introduce regressions. Running tests before deployment prevents broken code from reaching users.

#### 5. What is the difference between a GitHub Actions workflow, job, and step?
- **Workflow**: The top-level automated process defined in a `.github/workflows/*.yml` file.
- **Job**: A set of steps executed on the same virtual runner (e.g. `ci` or `docker`). Jobs can run sequentially or in parallel.
- **Step**: An individual task inside a job, such as running a shell command (`run`) or executing a reusable action (`uses`).

#### 6. What is the purpose of the `on` keyword in a GitHub Actions YAML file?
The `on` keyword defines the events that trigger the workflow, such as `push`, `pull_request`, scheduled crons, or manual execution (`workflow_dispatch`).

#### 7. Why is `needs: ci` used in the Docker publishing job?
`needs: ci` establishes job dependency. It guarantees that the Docker image will only be built and published if all code quality, tests, and secret checks in the `ci` job pass.

#### 8. What is the purpose of a Dockerfile?
A Dockerfile contains instructions to assemble an application and its environment into a standalone, reproducible container image.

#### 9. Differentiate a Docker image and a Docker container.
- **Docker Image**: An immutable, read-only template or blueprint containing code, libraries, and runtime dependencies.
- **Docker Container**: A runnable, live instance of a Docker image executing in an isolated process.

#### 10. What is the purpose of GitHub Container Registry (GHCR)?
GHCR is a cloud-based registry integrated into GitHub for hosting, versioning, and distributing Docker container images alongside the repository.

#### 11. Why should API keys and passwords be stored in GitHub Secrets?
GitHub Secrets encrypts sensitive values so they are never hardcoded in repositories, committed to version control, or exposed in public workflow logs.

#### 12. What happens when an automated test fails during pipeline execution?
The step exits with a non-zero exit code, causing the job to fail immediately. Dependent downstream jobs (`needs: ci`) are skipped, preventing flawed code from being built or published.

#### 13. How does GitHub Actions improve collaboration among developers?
It provides immediate feedback on pull requests, ensuring all team members adhere to code quality and testing standards before merging.

#### 14. What are the possible risks of automatically deploying code without human approval?
Unforeseen edge cases, performance bottlenecks, or subtle logical errors could be released directly to production if test coverage is incomplete.

#### 15. How would you improve the CI/CD pipeline implemented in this laboratory?
- Add multi-stage Docker builds to reduce image size.
- Integrate automated security vulnerability scans using Trivy or Snyk.
- Add end-to-end integration tests.
- Implement automated semantic release and deployment to a cloud host (e.g., Kubernetes or AWS ECS).
