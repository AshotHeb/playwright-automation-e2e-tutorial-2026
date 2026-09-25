import { Page } from '@playwright/test';

export async function fillOrderIdAndEmail(page: Page, orderId: string, email: string) {
    await page.locator('[data-test-id="contact-order-id-input"]').fill(orderId);
    await page.locator('[data-test-id="contact-email-input"]').fill(email);    
}

export async function clickTrackOrder(page: Page) {
    await page.locator('[data-test-id="contact-track-order-button"]').click();  
}

