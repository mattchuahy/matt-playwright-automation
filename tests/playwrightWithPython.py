import importlib

try:
  sync_playwright = importlib.import_module("playwright.sync_api").sync_playwright
except ImportError as exc:
  raise RuntimeError(
      "The Playwright Python package is not installed. Run: pip install playwright"
  ) from exc

with sync_playwright() as playwright:
  #Launch the browser
  browser = playwright.chromium.launch(headless=False, slow_mo=2000)
  #Create a new page
  page = browser.new_page()
  #Visit the playwright website
  page.goto("https://playwright.dev/python")
  # Locate a link element with Docs test
  docs_button = page.get_by_role("link", name="Docs")
  docs_button.click()
  #Get the url
  print("Docs:", page.url)
  browser.close()