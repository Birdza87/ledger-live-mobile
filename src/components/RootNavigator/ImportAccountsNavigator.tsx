// @flow
import React, { useMemo } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { Text } from "@ledgerhq/native-ui";
import { useTheme } from "styled-components/native";
import { ScreenName } from "../../const";
import ScanAccounts from "../../screens/ImportAccounts/Scan";
import DisplayResult, {
  BackButton,
} from "../../screens/ImportAccounts/DisplayResult";
import FallBackCameraScreen from "../../screens/ImportAccounts/FallBackCameraScreen";
import { getStackNavigatorConfig } from "../../navigation/navigatorConfig";
import TransparentHeaderNavigationOptions from "../../navigation/TransparentHeaderNavigationOptions";
import HeaderRightClose from "../HeaderRightClose";

export default function ImportAccountsNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const stackNavigationConfig = useMemo(
    () => getStackNavigatorConfig(colors, true),
    [colors],
  );
  return (
    <Stack.Navigator screenOptions={{ ...stackNavigationConfig }}>
      <Stack.Screen
        name={ScreenName.ScanAccounts}
        component={ScanAccounts}
        options={{
          ...TransparentHeaderNavigationOptions,
          headerShown: true,
          headerTitle: () => (
            <Text variant="h3" color="constant.white" uppercase>
              {t("v3.account.import.scan.title")}
            </Text>
          ),
          headerRight: props => <HeaderRightClose {...props} color={"#fff"} />,
          headerLeft: null,
        }}
      />
      <Stack.Screen
        name={ScreenName.DisplayResult}
        component={DisplayResult}
        options={{
          headerTitle: (
            <Text variant="h3" color="constant.white" uppercase>
              {t("v3.account.import.result.title")}
            </Text>
          ),
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name={ScreenName.FallBackCameraScreen}
        component={FallBackCameraScreen}
        options={{
          headerTitle: (
            <Text variant="h3" color="constant.white" uppercase>
              {t("v3.account.import.fallback.header")}
            </Text>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

const Stack = createStackNavigator();
