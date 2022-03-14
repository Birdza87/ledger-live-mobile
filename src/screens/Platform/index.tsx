// @flow

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { usePlatformApp } from "@ledgerhq/live-common/lib/platform/PlatformAppProvider";
import { filterPlatformApps } from "@ledgerhq/live-common/lib/platform/PlatformAppProvider/helpers";
import { AccountLike, Account } from "@ledgerhq/live-common/lib/types";
import { AppManifest } from "@ledgerhq/live-common/lib/platform/types";
import useEnv from "@ledgerhq/live-common/lib/hooks/useEnv";

import { Flex, Text, ScrollContainerHeader } from "@ledgerhq/native-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { useBanner } from "../../components/banners/hooks";
import TrackScreen from "../../analytics/TrackScreen";
import { ScreenName } from "../../const";

import CatalogTwitterBanner from "./CatalogTwitterBanner";
import DAppDisclaimer, { Props as DisclaimerProps } from "./DAppDisclaimer";
import CatalogBanner from "./CatalogBanner";
import AppCard from "./AppCard";

type RouteParams = {
  defaultAccount: AccountLike | undefined;
  defaultParentAccount?: Account | undefined;
  platform?: string;
};

type DisclaimerOpts = (DisclaimerProps & { isOpened: boolean }) | null;

const DAPP_DISCLAIMER_ID = "PlatformAppDisclaimer";

const PlatformCatalog = ({ route }: { route: { params: RouteParams } }) => {
  const { platform, ...routeParams } = route.params ?? {};
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const { manifests } = usePlatformApp();
  const experimental = useEnv("PLATFORM_EXPERIMENTAL_APPS");

  const filteredManifests = useMemo(() => {
    const branches = [
      "stable",
      "soon",
      ...(experimental ? ["experimental"] : []),
    ];

    return filterPlatformApps(Array.from(manifests.values()), {
      version: "0.0.1",
      platform: "mobile",
      branches,
    });
  }, [manifests, experimental]);

  // Disclaimer State
  const [disclaimerOpts, setDisclaimerOpts] = useState<DisclaimerOpts>(null);
  const [disclaimerOpened, setDisclaimerOpened] = useState<boolean>(false);
  const [disclaimerDisabled, setDisclaimerDisabled] = useBanner(
    DAPP_DISCLAIMER_ID,
  );

  const handlePressCard = useCallback(
    (manifest: AppManifest) => {
      const openDApp = () =>
        navigation.navigate(ScreenName.PlatformApp, {
          ...routeParams,
          platform: manifest.id,
          name: manifest.name,
        });

      if (!disclaimerDisabled) {
        setDisclaimerOpts({
          disableDisclaimer: () => setDisclaimerDisabled(),
          closeDisclaimer: () => setDisclaimerOpened(false),
          icon: manifest.icon,
          name: manifest.name,
          onContinue: openDApp,
        });
        setDisclaimerOpened(true);
      } else {
        openDApp();
      }
    },
    [navigation, routeParams, setDisclaimerDisabled, disclaimerDisabled],
  );

  useEffect(() => {
    // platform can be predefined when coming from a deeplink
    if (platform && filteredManifests) {
      const manifest = filteredManifests.find(m => m.id === platform);

      if (manifest) {
        navigation.navigate(ScreenName.PlatformApp, {
          ...routeParams,
          platform: manifest.id,
          name: manifest.name,
        });
      }
    }
  }, [platform, filteredManifests, navigation, routeParams]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.main }}>
      <TrackScreen category="Platform" name="Catalog" />
      <ScrollContainerHeader
        MiddleSection={
          <Flex
            height={48}
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Text variant="h1">{t("platform.catalog.title")}</Text>
          </Flex>
        }
        containerProps={{ bg: "background.main" }}
      >
        <Flex flex={1} px={6}>
          {disclaimerOpts && (
            <DAppDisclaimer
              disableDisclaimer={disclaimerOpts.disableDisclaimer}
              closeDisclaimer={disclaimerOpts.closeDisclaimer}
              onContinue={disclaimerOpts.onContinue}
              isOpened={disclaimerOpened}
              icon={disclaimerOpts.icon}
              name={disclaimerOpts.name}
            />
          )}

          <CatalogBanner />
          <CatalogTwitterBanner />
          {filteredManifests.map((manifest, i) => (
            <AppCard
              key={manifest.id + i}
              manifest={manifest}
              onPress={handlePressCard}
            />
          ))}
        </Flex>
      </ScrollContainerHeader>
    </SafeAreaView>
  );
};

export default PlatformCatalog;
