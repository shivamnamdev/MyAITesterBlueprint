package com.salesforce.tests;

import com.salesforce.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class InvalidLoginTest extends BaseTest {

    @Test
    public void testInvalidLogin() throws Exception {
        try {
            LoginPage loginPage = new LoginPage(driver);
            loginPage.enterUsername("invaliduser@salesforce.com");
            loginPage.enterPassword("InvalidPassword123");
            loginPage.clickLogin();
            Assert.assertTrue(loginPage.isErrorMessageDisplayed(), "Error message banner should be displayed.");
            String actualError = loginPage.getErrorMessage();
            Assert.assertTrue(actualError.length() > 0, "Error message text content should not be empty.");
        } catch (Exception e) {
            Assert.fail("Invalid login test failed due to exception: " + e.getMessage(), e);
        }
    }
}
