import * as bridge from "../../bridge/server";
import * as testHelpers from "../../helpers";

export default class OnboardingSteps {
  static async getStarted() {
    await testHelpers.tap("Proceed");
  }

  static async acceptTerms() {
    await testHelpers.tap("TermsAcceptSwitch");
    await testHelpers.tap("Proceed");
  }

  static async selectDevice(device) {
    await testHelpers.tap(`Onboarding Device - Selection|${device}`);
  }

  static async connectYourNano(device) {
    await testHelpers.scrollToElementById(
      `Onboarding - Connect|${device}`,
      "UseCaseSelectScrollView",
      200,
      "down",
      NaN,
      0.5,
    );

    await testHelpers.tap(`Onboarding - Connect|${device}`);
  }

  static async acceptSeedWarning() {
    await testHelpers.delay(1000);
    await testHelpers.tap("Onboarding - Seed warning");
    await testHelpers.delay(1000);
  }

  static async startPairing() {
    await testHelpers.tap("OnboardingStemPairNewContinue");
  }

  static async addNewNano() {
    await testHelpers.tap("Proceed");
  }

  static async addDeviceViaBluetooth() {
    const [david] = bridge.addDevices();
    await testHelpers.waitAndTap(`DeviceItemEnter ${david}`);

    // set globally installed apps on device?
    bridge.setInstalledApps();

    // open ledger manager
    bridge.open();

    // Continue to welcome screen
    // await waitFor(
    // element(by.text("Device authentication check")),
    // ).not.toBeVisible();
    // issue here: the 'Pairing Successful' text is 'visible' before it actually is, so it's failing at the continue step as continue isn't actually visible
    // await waitFor(element(by.text("Pairing Successful"))).toBeVisible();

    // wait for flaky 'device authentication check screen'
    await testHelpers.delay(2500);
    await testHelpers.tap("Proceed");
  }

  static async openLedgerLive() {
    await testHelpers.tapByText("Open Ledger Live");
  }
}
