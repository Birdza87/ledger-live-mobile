// @flow
/* eslint-disable no-console */

import { v4 as uuid } from "uuid";
import * as Sentry from "@sentry/react-native";
import Config from "react-native-config";
import { Platform } from "react-native";
import analytics from "@segment/analytics-react-native";
import VersionNumber from "react-native-version-number";
import Locale from "react-native-locale";
import { ReplaySubject } from "rxjs";
import {
  getAndroidArchitecture,
  getAndroidVersionCode,
} from "../logic/cleanBuildVersion";
import getOrCreateUser from "../user";
import {
  analyticsEnabledSelector,
  languageSelector,
  localeSelector,
  lastSeenDeviceSelector,
} from "../reducers/settings";
import { knownDevicesSelector } from "../reducers/ble";
import type { State } from "../reducers";

const sessionId = uuid();

const appVersion = `${VersionNumber.appVersion ||
  ""} (${VersionNumber.buildVersion || ""})`;

const { ANALYTICS_LOGS, ANALYTICS_TOKEN } = Config;

const extraProperties = store => {
  const state: State = store.getState();
  const { localeIdentifier, preferredLanguages } = Locale.constants();
  const language = languageSelector(state);
  const region = localeSelector(state);
  const devices = knownDevicesSelector(state);

  const lastDevice =
    lastSeenDeviceSelector(state) || devices[devices.length - 1];
  const deviceInfo = lastDevice
    ? {
        deviceVersion: lastDevice.deviceInfo?.version,
        appLength: lastDevice?.appsInstalled,
        modelId: lastDevice.modelId,
      }
    : {};

  return {
    appVersion,
    androidVersionCode: getAndroidVersionCode(VersionNumber.buildVersion),
    androidArchitecture: getAndroidArchitecture(VersionNumber.buildVersion),
    environment: ANALYTICS_LOGS ? "development" : "production",
    localeIdentifier,
    preferredLanguage: preferredLanguages ? preferredLanguages[0] : null,
    language,
    region: region?.split("-")[1] || region,
    platformOS: Platform.OS,
    platformVersion: Platform.Version,
    sessionId,
    devicesCount: devices.length,
    ...deviceInfo,
  };
};

const context = {
  ip: "0.0.0.0",
};

let storeInstance; // is the redux store. it's also used as a flag to know if analytics is on or off.

const token = __DEV__ ? null : ANALYTICS_TOKEN;

export const start = async (store: *) => {
  if (token) {
    await analytics.setup(token, {
      android: {
        collectDeviceId: false,
      },
      ios: {
        trackAdvertising: false,
        trackDeepLinks: false,
      },
    });
  }

  const { user, created } = await getOrCreateUser();
  storeInstance = store;
  if (created) {
    if (ANALYTICS_LOGS) console.log("analytics:identify", user.id);
    if (token) {
      await analytics.reset();
      await analytics.identify(user.id, extraProperties(store), { context });
    }
  }
  track("Start", extraProperties(store), true);
};

export const stop = () => {
  if (ANALYTICS_LOGS) console.log("analytics:stop");
  storeInstance = null;
};

export const trackSubject: any = new ReplaySubject<{
  event: string,
  properties: ?Object,
}>(10);

export const track = (
  event: string,
  properties: ?Object,
  mandatory: ?boolean,
) => {
  Sentry.addBreadcrumb({
    message: event,
    category: "track",
    data: properties,
    level: "debug",
  });

  if (
    !storeInstance ||
    (!mandatory && !analyticsEnabledSelector(storeInstance.getState()))
  ) {
    return;
  }

  const allProperties = {
    ...extraProperties(storeInstance),
    ...properties,
  };

  if (ANALYTICS_LOGS) console.log("analytics:track", event, allProperties);
  trackSubject.next({ event, properties: allProperties });

  if (!token) return;
  analytics.track(event, allProperties, { context });
};

export const screen = (
  category: string,
  name: ?string,
  properties: ?Object,
) => {
  const title = `Page ${category + (name ? ` ${name}` : "")}`;
  Sentry.addBreadcrumb({
    message: title,
    category: "screen",
    data: properties,
    level: "info",
  });
  if (!storeInstance || !analyticsEnabledSelector(storeInstance.getState())) {
    return;
  }

  const allProperties = {
    ...extraProperties(storeInstance),
    ...properties,
  };

  if (ANALYTICS_LOGS)
    console.log("analytics:screen", category, name, allProperties);
  trackSubject.next({ event: title, properties: allProperties });

  if (!token) return;
  analytics.track(title, allProperties, { context });
};
