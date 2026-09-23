# Playwright Login Automation

This project demonstrates a secure automation pattern for login tests using Playwright.

## Security model

Credentials are never committed to the repository.

- A local `.env` file is used for development.
- The `.env` file is included in `.gitignore` and is not uploaded to GitHub.
- CI secrets are loaded from the environment, such as GitHub Actions secrets.
- The example placeholders are stored in `.env.example` and are safe to commit.

## Local setup

1. Copy the example file:
   ```bash
   copy .env.example .env
   ```
2. Fill in real credentials in `.env`.
3. Run the tests:
   ```bash
   npm install
   npx playwright test
   ```

Example `.env`:
```env
TEST_USERNAME=your_username_here
TEST_PASSWORD=your_password_here
```

## CI setup

In GitHub Actions or another CI system, set the following secrets:

- `TEST_USERNAME`
- `TEST_PASSWORD`

The Playwright config automatically loads `.env` for local runs, and the environment variables are read in the test when the CI pipeline injects them.

## Notes

- Do not print or log credentials in tests.
- Do not commit `.env`.
- Keep personal or company credentials in a secure secret store or CI secret manager.
