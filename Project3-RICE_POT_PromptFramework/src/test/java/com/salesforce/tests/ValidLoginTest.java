package com.salesforce.tests;

import com.salesforce.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ValidLoginTest extends BaseTest {

    @Test
    public void testValidLogin() throws Exception {
        try {
            LoginPage loginPage = new LoginPage(driver);
            loginPage.enterUsername("testuser@salesforce.com");
            loginPage.enterPassword("ValidPassword123!");
            loginPage.toggleRememberMe();
            loginPage.clickLogin();
            Assert.assertNotNull(driver.getCurrentUrl(), "URL should not be null post login attempt.");
        } catch (Exception e) {
            Assert.fail("Valid login test failed due to exception: " + e.getMessage(), e);
        }
    }
}
