
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../Utils/Colors";

interface IntegrationItem {
  logo?: string;
  integrationName?: string;
  category?: string;
  description?: string; // NEW FIELD
  email?: string;
  phoneNumber?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
}

type RootStackParamList = {
  IntegrationProfileDetails: {
    integrationItem: IntegrationItem;
    fromScreen: string;
  };
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  "IntegrationProfileDetails"
>;


export default function IntegrationProfileDetails({ route, navigation }: Props) {
  const item = route?.params?.integrationItem;
  const { fromScreen } = route.params ?? {};

  const [showImagePreview, setShowImagePreview] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <>
      {/* ---------- IMAGE PREVIEW MODAL ---------- */}
      <Modal visible={showImagePreview} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
          onPress={() => setShowImagePreview(false)}
        >
          <Image
            source={{ uri: item?.logo }}
            style={{
              width: "100%",
              height: "55%",
              resizeMode: "contain",
              borderRadius: 16,
            }}
          />
        </Pressable>
      </Modal>

      {/* ---------- SAFE AREA ---------- */}
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FB" }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ---------- HEADER ---------- */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 4,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity onPress={handleBack}>
              <Ionicons
                name="arrow-back"
                size={28}
                color={colors.backgroundColorHeader}
              />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: "center", marginRight: 28 }}>
              <TouchableOpacity onPress={() => setShowImagePreview(true)}>
                <Image
                  source={{ uri: item?.logo }}
                  style={{
                    width: 130,
                    height: 130,
                    borderRadius: 100,
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "rgba(35, 85, 196, 0.25)",
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ---------- MAIN PROFILE ---------- */}
          <View style={{ alignItems: "center", marginTop: 18 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                color: "#000",
                marginTop: 14,
              }}
            >
              {item?.integrationName || "No data available"}
            </Text>

            {/* CATEGORY */}
            {item?.category ? (
              <Text style={{ fontSize: 16, color: "#777", marginTop: 4 }}>
                {item?.category}
              </Text>
            ) : (
              <Text style={{ fontSize: 16, color: "#999", marginTop: 4 }}>
                No data available
              </Text>
            )}

            {/* ---------- DESCRIPTION BELOW BUSINESS NAME ---------- */}
            {item?.description ? (
              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                  marginTop: 10,
                  paddingHorizontal: 30,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {item?.description}
              </Text>
            ) : null}
          </View>

          {/* ---------- INFO CARD ---------- */}
          <View
            style={{
              marginTop: 22,
              backgroundColor: "#fff",
              marginHorizontal: 18,
              padding: 22,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <InfoItem label="Business Name" value={item?.integrationName} />
            <Divider />

            <InfoItem label="Email" value={item?.email} />
            <Divider />

            <InfoItem label="Phone Number" value={item?.phoneNumber} />
            <Divider />

            {/* Address Handling */}
            <InfoItem
              label="Address"
              value={
                item?.addressLine ||
                item?.city ||
                item?.state ||
                item?.pincode
                  ? `${item?.addressLine || ""} ${item?.city || ""} ${
                      item?.state || ""
                    } ${item?.pincode || ""}`
                      .replace(/\s+/g, " ")
                      .trim()
                  : null
              }
            />
            <Divider />

            <InfoItem label="Website" value={item?.website} />
            <Divider />

       
            <InfoItem label="Description" value={item?.description} />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}


const Divider = () => (
  <View
    style={{
      backgroundColor: "#EDEDED",
      height: 1,
      marginVertical: 10,
    }}
  />
);

interface InfoProps {
  label: string;
  value?: string | null;
}

const InfoItem: React.FC<InfoProps> = ({ label, value }) => {
  const displayValue =
    value && value.trim() !== "" ? value : "No data available";

  return (
    <View>
      <Text style={{ fontSize: 14, color: "#888", marginBottom: 4 }}>
        {label}
      </Text>

      <Text
        style={{
          fontSize: 17,
          color: displayValue === "No data available" ? "#999" : "#111",
          fontWeight: displayValue === "No data available" ? "400" : "500",
          fontStyle: displayValue === "No data available" ? "italic" : "normal",
        }}
      >
        {displayValue}
      </Text>
    </View>
  );
};
