import { device } from "detox";
import OnboardingSteps from "../models/onboarding/onboardingSteps";
import PortfolioPage from "../models/portfolioPage";
import { expectBitmapsToBeEqual } from "../helpers";

describe("Onboarding", () => {
  beforeAll(async () => {
    await device.launchApp({
      delete: true,
      launchArgs: {},
    });
  });

  it("should be able to connect a Nano X", async () => {
    await OnboardingSteps.getStarted();
    await OnboardingSteps.acceptTerms();
    await OnboardingSteps.selectDevice("nanoX");
    await OnboardingSteps.connectYourNano("nanoX");
    await OnboardingSteps.acceptSeedWarning();
    await OnboardingSteps.startPairing();
    await OnboardingSteps.addNewNano();
    await OnboardingSteps.addDeviceViaBluetooth();
    await OnboardingSteps.openLedgerLive();

    await PortfolioPage.emptyPortfolioIsVisible();

    const image = await device.takeScreenshot("nanoX-onboarding-snapshot");
    const snapshottedImagePath = `e2e/specs/snapshots/${device.getPlatform()}-nanoX-onboarding-snapshot.png`;
    expectBitmapsToBeEqual(image, snapshottedImagePath);
  });
});
