import { Page } from "@playwright/test";

export const testValues = {
    firstName: 'Alex',
    lastName: 'Sefu',
    email: 'alex@email.com',
    address: 'Some street 1',
    city: 'New York',
    zipCode: '12345',
    country: 'United States',
    payment: {
        nameOnCard: 'Sefu',
        cardNumber: '1234 4567 1234 5678',
        expiry: '01/30',
        cvc: '123'
    }
}

export async function addContactInfo(page: Page) {
    await page.locator('[data-test-id="checkout-firstname-input"]').fill(testValues.firstName);
    await page.locator('[data-test-id="checkout-lastname-input"]').fill(testValues.lastName);
    await page.locator('[data-test-id="checkout-email-input"]').fill(testValues.email);
}

export async function addShippingAddress(page: Page) {
    await page.locator('[data-test-id="checkout-address-input"]').fill(testValues.address)
    await page.locator('[data-test-id="checkout-city-input"]').fill(testValues.city)
    await page.locator('[data-test-id="checkout-zipcode-input"]').fill(testValues.zipCode)
    await page.locator('[data-test-id="checkout-country-input"]').fill(testValues.country)
}

export async function addPaymentInfo(page: Page) {
    await page.locator('[data-test-id="checkout-cardname-input"]').fill(testValues.payment.nameOnCard)
    await page.locator('[data-test-id="checkout-cardnumber-input"]').fill(testValues.payment.cardNumber)
    await page.locator('[data-test-id="checkout-cardexpiry-input"]').fill(testValues.payment.expiry)
    await page.locator('[data-test-id="checkout-cardcvc-input"]').fill(testValues.payment.cvc)
}

export async function placeOrder(page: Page){
    await page.locator('[data-test-id="place-order-button"]').click();
}