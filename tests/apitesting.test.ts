import { createServer } from "node:http";
import { expect, test } from "@playwright/test";

const apiUrl = "https://jsonplaceholder.typicode.com";

// Use a local server for statuses that the public JSONPlaceholder API does not reliably return.
async function withMockStatusResponse<T>(
  statusCode: number,
  run: (url: string) => Promise<T>,
): Promise<T> {
  const server = createServer((_request, response) => {
    response.writeHead(statusCode, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: `Mocked HTTP ${statusCode}` }));
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Mock server did not provide a TCP address");
    }

    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

// Verify a successful GET returns the expected post fields.
test("GET returns a post", async ({ request }) => {
  const response = await request.get(`${apiUrl}/posts/1`);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const post = await response.json();
  expect(post).toMatchObject({
    userId: 1,
    id: 1,
    title: expect.any(String),
    body: expect.any(String),
  });
});

// JSONPlaceholder returns 404 when the requested post does not exist.
test("GET returns 404 for a post that does not exist", async ({ request }) => {
  const response = await request.get(`${apiUrl}/posts/999999`);

  expect(response.status()).toBe(404);
  expect(response.ok()).toBeFalsy();
});

// Mock server errors so these cases are deterministic and do not depend on the public API.
for (const statusCode of [500, 505]) {
  test(`handles a mocked HTTP ${statusCode} response`, async ({ request }) => {
    await withMockStatusResponse(statusCode, async (url) => {
      const response = await request.get(url);

      expect(response.status()).toBe(statusCode);
      expect(response.ok()).toBeFalsy();
      await expect(response.json()).resolves.toEqual({
        error: `Mocked HTTP ${statusCode}`,
      });
    });
  });
}

// Verify a successful POST echoes the submitted post and assigns it an ID.
test("POST creates a post", async ({ request }) => {
  const newPost = {
    title: "Playwright API test",
    body: "This is a sample post created by an API test.",
    userId: 1,
  };
  const response = await request.post(`${apiUrl}/posts`, {
    data: newPost,
  });

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(201);

  const createdPost = await response.json();
  expect(createdPost).toMatchObject({
    ...newPost,
    id: expect.any(Number),
  });
});