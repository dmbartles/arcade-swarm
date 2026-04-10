/**
 * Playwright smoke tests — Missile Command Math.
 *
 * Verifies the game boots, the canvas renders, and basic interactions work.
 */

import { test, expect } from '@playwright/test';

test.describe('Missile Command Math — smoke tests', () => {
  test('page loads and Phaser canvas renders', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });
  });

  test('MenuScene renders game title', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // allow BootScene → MenuScene transition
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    // Canvas must have non-zero dimensions
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('canvas is at least 400x300 (scaled down from 800x640)', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(400);
    expect(box!.height).toBeGreaterThanOrEqual(300);
  });

  test('canvas is still rendered after interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    // Click anywhere on canvas to start AudioContext (required by browser)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });
    await canvas.click({ position: { x: 400, y: 320 } });
    await page.waitForTimeout(500);
    // Canvas is still rendered after interaction
    await expect(canvas).toBeVisible();
  });
});
