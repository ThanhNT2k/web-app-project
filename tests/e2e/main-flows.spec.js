const { expect, test } = require('@playwright/test');

const story = {
  id: 1,
  slug: 'demo-story',
  title: 'Demo Story',
  description: 'A mocked story used by Playwright.',
  author_username: 'tester',
  chapter_count: 2,
  follow_count: 3,
  tags: [{ id: 1, name: 'Fantasy', slug: 'fantasy' }],
};

const chapter = {
  id: 10,
  story_id: 1,
  story_slug: 'demo-story',
  story_title: 'Demo Story',
  chapter_number: 1,
  title: 'Chapter 1',
  content: 'This is the first mocked chapter content.',
};

async function mockApi(page) {
  await page.route('**/api/auth/login', async (route) => {
    const credentials = route.request().postDataJSON();
    if (credentials.email === 'offline@example.com') {
      await route.abort('failed');
      return;
    }
    if (credentials.password !== 'Password1!') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Invalid credentials' }),
      });
      return;
    }
    const role = credentials.email === 'admin@example.com'
      ? 'Admin'
      : credentials.email === 'moderator@example.com' ? 'Moderator' : 'User';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        token: 'mock-token',
        user: {
          id: 1,
          email: 'reader@example.com',
          username: 'reader',
          role,
        },
      }),
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          id: 1,
          email: 'reader@example.com',
          username: 'reader',
          role: 'User',
        },
      }),
    });
  });

  await page.route('**/api/tags', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, tags: story.tags }),
    });
  });

  await page.route('**/api/stories/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        stories: [story],
        pagination: { page: 1, totalPages: 1 },
      }),
    });
  });

  await page.route('**/api/stories?page=**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        stories: [story],
        pagination: { page: 1, totalPages: 1 },
      }),
    });
  });

  await page.route('**/api/stories/by-slug/1-demo-story/chapters/1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, chapter }),
    });
  });

  await page.route('**/api/stories/1/chapters**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        chapters: [chapter],
        pagination: { page: 1, totalPages: 1 },
      }),
    });
  });

  await page.route('**/api/comments/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, comments: [] }),
    });
  });

  await page.route('**/api/chapters/10/summary**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, summary: null }),
    });
  });

  await page.route('**/api/reading-history**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, progress: null }),
    });
  });

  await page.route('**/api/preferences', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, preferences: null }),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('login flow redirects a reader to the home page', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('reader@example.com');
  await page.getByPlaceholder(/kh/i).fill('Password1!');
  await page.locator('main form button[type="submit"]').click();

  await expect(page).toHaveURL('/');
});

test('login shows an API error and stays on the page for wrong credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('reader@example.com');
  await page.getByPlaceholder(/kh/i).fill('WrongPassword1!');
  await page.locator('main form button[type="submit"]').click();

  await expect(page).toHaveURL('/login');
  await expect(page.getByText('Email hoặc mật khẩu không chính xác.')).toBeVisible();
  await expect(page.locator('main form button[type="submit"]')).toBeEnabled();
});

test('login displays a safe fallback when the network is unavailable', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('offline@example.com');
  await page.getByPlaceholder(/kh/i).fill('Password1!');
  await page.locator('main form button[type="submit"]').click();

  await expect(page).toHaveURL('/login');
  await expect(page.locator('.alert-danger')).toBeVisible();
});

test('admin login routes to the admin dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('admin@example.com');
  await page.getByPlaceholder(/kh/i).fill('Password1!');
  await page.locator('main form button[type="submit"]').click();

  await expect(page).toHaveURL('/admin');
});

test('search flow shows matching stories', async ({ page }) => {
  await page.goto('/browse');
  await page.getByPlaceholder(/truy/i).fill('Demo');
  await page.locator('main form button[type="submit"]').click();

  await expect(page.getByRole('link', { name: 'Demo Story' }).first()).toBeVisible();
});

test('reader flow opens a chapter and renders content', async ({ page }) => {
  await page.goto('/1-demo-story/1');

  await expect(page.getByRole('heading', { name: /Demo Story/ })).toBeVisible();
  await expect(page.getByText('This is the first mocked chapter content.')).toBeVisible();
});
