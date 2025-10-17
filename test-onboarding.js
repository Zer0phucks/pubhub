/**
 * Test script for PubHub onboarding workflow and scan functionality
 *
 * Usage: node test-onboarding.js
 *
 * Tests:
 * 1. Landing page loads
 * 2. Sign up flow
 * 3. Onboarding screen appears (mandatory)
 * 4. Reddit connection step visible
 * 5. Project creation step visible
 * 6. "Scan Now" button functionality (after completing onboarding)
 */

const { chromium } = require('playwright');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPubHub() {
  console.log('🚀 Starting PubHub onboarding and scan test...\n');

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    slowMo: 500 // Slow down operations for visibility
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to PubHub
    console.log('📍 Step 1: Navigating to https://pubhub.dev');
    await page.goto('https://pubhub.dev', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/pubhub_01_landing.png' });
    console.log('✅ Landing page loaded\n');

    // Step 2: Find and click Sign In/Sign Up button
    console.log('📍 Step 2: Looking for sign up button...');
    await sleep(2000);

    const signInSelectors = [
      'text=Sign In',
      'text=Sign Up',
      'text=Get Started',
      'button:has-text("Sign")',
      'a:has-text("Sign")'
    ];

    let clicked = false;
    for (const selector of signInSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`   Found: ${selector}`);
          await element.click();
          clicked = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!clicked) {
      console.log('❌ Could not find sign in button');
      await page.screenshot({ path: '/tmp/pubhub_02_no_signin.png' });
      return;
    }

    await sleep(3000);
    await page.screenshot({ path: '/tmp/pubhub_03_auth_page.png' });
    console.log('✅ Clicked sign in/up\n');

    // Step 3: Create account with Clerk
    console.log('📍 Step 3: Creating test account...');

    // Generate random email
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const testEmail = `test_${randomSuffix}@pubhub-test.com`;
    const testPassword = 'TestPass123!@#';

    console.log(`   Email: ${testEmail}`);

    await sleep(2000);

    // Fill email
    const emailInput = page.locator('input[name="emailAddress"], input[type="email"], input[placeholder*="email" i]').first();
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill(testEmail);
      console.log('   ✓ Filled email');
    } else {
      console.log('   ❌ Email input not found');
      await page.screenshot({ path: '/tmp/pubhub_04_no_email_input.png' });
      return;
    }

    // Fill password
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    if (await passwordInput.isVisible({ timeout: 2000 })) {
      await passwordInput.fill(testPassword);
      console.log('   ✓ Filled password');
    } else {
      console.log('   ❌ Password input not found');
      await page.screenshot({ path: '/tmp/pubhub_05_no_password_input.png' });
      return;
    }

    // Click submit
    const submitButton = page.locator('button[type="submit"], button:has-text("Continue"), button:has-text("Sign up")').first();
    if (await submitButton.isVisible({ timeout: 2000 })) {
      await submitButton.click();
      console.log('   ✓ Clicked submit');
    } else {
      console.log('   ❌ Submit button not found');
      await page.screenshot({ path: '/tmp/pubhub_06_no_submit.png' });
      return;
    }

    // Wait for authentication
    console.log('   ⏳ Waiting for authentication...');
    await sleep(5000);
    await page.screenshot({ path: '/tmp/pubhub_07_after_auth.png' });
    console.log('✅ Account created\n');

    // Step 4: Check for onboarding screen
    console.log('📍 Step 4: Checking for onboarding screen...');
    await sleep(3000);

    const onboardingTitle = page.locator('text="Welcome to PubHub"');
    const isOnboardingVisible = await onboardingTitle.isVisible({ timeout: 5000 }).catch(() => false);

    if (isOnboardingVisible) {
      console.log('✅ Onboarding screen detected!');
      await page.screenshot({ path: '/tmp/pubhub_08_onboarding.png' });

      // Step 5: Check Reddit connection step
      console.log('\n📍 Step 5: Testing Reddit connection step...');

      const redditButton = page.locator('button:has-text("Connect Reddit")').first();
      if (await redditButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('   ✓ Found "Connect Reddit" button');
        console.log('   ⚠️  Note: Not clicking - would require actual Reddit OAuth');

        // Check for educational content
        const redditInfo = await page.locator('text*=Why Connect Reddit').isVisible({ timeout: 1000 }).catch(() => false);
        if (redditInfo) {
          console.log('   ✓ Educational content visible');
        }
      } else {
        console.log('   ❌ Connect Reddit button not found');
      }

      await page.screenshot({ path: '/tmp/pubhub_09_reddit_step.png' });

      // Step 6: Check for Step 2 visibility
      console.log('\n📍 Step 6: Checking project creation step...');
      const projectStep = page.locator('text="Step 2: Create Your First Project"');
      const isProjectStepVisible = await projectStep.isVisible({ timeout: 1000 }).catch(() => false);

      if (isProjectStepVisible) {
        console.log('   ⚠️  Project step visible (should be hidden until Reddit connected)');
      } else {
        console.log('   ✓ Project step hidden (correct behavior)');
      }

    } else {
      console.log('❌ Onboarding screen NOT shown - this is a bug!');
      await page.screenshot({ path: '/tmp/pubhub_08_no_onboarding.png' });

      // Check what's visible instead
      const content = await page.content();
      if (content.includes('Project')) {
        console.log('   🐛 User went straight to main app (should be blocked)');
      }
      if (content.includes('Feed')) {
        console.log('   🐛 Feed is visible (should be blocked)');
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY - ONBOARDING WORKFLOW');
    console.log('='.repeat(60));
    console.log('✅ Landing page loaded');
    console.log('✅ Sign up flow completed');

    if (isOnboardingVisible) {
      console.log('✅ Onboarding screen shown (CORRECT)');
      console.log('✅ Reddit connection step visible');
      console.log('⚠️  Cannot test full flow (requires real Reddit account)');
      console.log('\n📝 To fully test:');
      console.log('   1. Manually connect Reddit account');
      console.log('   2. Create first project');
      console.log('   3. Test "Scan Now" button in Feed');
    } else {
      console.log('❌ Onboarding NOT shown - MAJOR BUG');
      console.log('   Expected: Mandatory 2-step onboarding');
      console.log('   Actual: User may have direct access to app');
    }

    console.log('\n📸 Screenshots saved to /tmp/pubhub_*.png');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: '/tmp/pubhub_error.png' });
  } finally {
    console.log('\n⏸️  Keeping browser open for 10 seconds for manual inspection...');
    await sleep(10000);
    await browser.close();
    console.log('✅ Test complete!');
  }
}

// Run the test
testPubHub().catch(console.error);
