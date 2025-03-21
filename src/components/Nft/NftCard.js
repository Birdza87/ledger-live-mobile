// @flow

import React, { memo } from "react";
import { RectButton } from "react-native-gesture-handler";
import { View, StyleSheet, Platform } from "react-native";
import { useNftMetadata } from "@ledgerhq/live-common/lib/nft";
import { useTheme, useNavigation } from "@react-navigation/native";
import type { CollectionWithNFT, NFT } from "@ledgerhq/live-common/lib/nft";
import { NavigatorName, ScreenName } from "../../const";
import Skeleton from "../Skeleton";
import NftImage from "./NftImage";
import LText from "../LText";

type Props = {
  nft: NFT | $Diff<NFT, { collection: * }>,
  collection: CollectionWithNFT,
  style?: Object,
};

const NftCardView = ({
  nft,
  collection,
  style,
  status,
  metadata,
}: {
  nft: NFT | $Diff<NFT, { collection: * }>,
  collection: CollectionWithNFT,
  style?: Object,
  status: "queued" | "loading" | "loaded" | "error" | "nodata",
  metadata?: Object,
}) => {
  const amount = nft.amount.toFixed();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const loading = status === "loading";

  return (
    <View style={style}>
      <RectButton
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
          },
        ]}
        onPress={() => {
          navigation.navigate(NavigatorName.NftNavigator, {
            screen: ScreenName.NftViewer,
            params: {
              nft,
              collection,
            },
          });
        }}
      >
        <NftImage style={styles.image} src={metadata?.media} status={status} />
        <View style={styles.nftNameContainer}>
          <Skeleton style={styles.tokenNameSkeleton} loading={loading}>
            <LText
              semiBold
              color={colors.text}
              ellipsizeMode="tail"
              numberOfLines={2}
              style={styles.tokenName}
            >
              {metadata?.nftName?.toUpperCase() ?? "-"}
            </LText>
          </Skeleton>
        </View>
        <View style={styles.footer}>
          <LText
            style={[styles.tokenId, { color: colors.grey }]}
            ellipsizeMode="middle"
            numberOfLines={1}
          >
            ID {nft.tokenId}
          </LText>
          {amount > 1 ? (
            <LText
              semiBold
              style={[styles.amount, { color: colors.grey }]}
              ellipsizeMode="middle"
              numberOfLines={1}
            >
              x{amount}
            </LText>
          ) : null}
        </View>
      </RectButton>
    </View>
  );
};

const NftCardMemo = memo(NftCardView);
// this technique of splitting the usage of context and memoing the presentational component is used to prevent
// the rerender of all NftCards whenever the NFT cache changes (whenever a new NFT is loaded)
const NftCard = ({ nft, collection, style }: Props) => {
  const { status, metadata } = useNftMetadata(collection.contract, nft.tokenId);

  return (
    <NftCardMemo
      nft={nft}
      collection={collection}
      style={style}
      status={status}
      metadata={metadata}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: {
          height: 4,
        },
      },
    }),
  },

  image: {
    position: "absolute",
    borderRadius: 4,
    marginBottom: 12,
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
  },
  nftNameContainer: {
    height: 36,
    marginBottom: 4,
  },
  tokenNameSkeleton: {
    height: 10,
    width: "90%",
    borderRadius: 4,
  },
  tokenName: {
    lineHeight: 18,
    fontSize: 15,
  },
  footer: {
    flexWrap: "nowrap",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  tokenId: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 13,
  },
  amount: {
    flexGrow: 1,
    flexShrink: 0,
    fontSize: 14,
    textAlign: "right",
    paddingLeft: 8,
  },
});

export default memo<Props>(NftCard);
