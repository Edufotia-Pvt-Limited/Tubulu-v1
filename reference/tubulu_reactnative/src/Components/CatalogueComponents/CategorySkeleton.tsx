import {
    View,
} from 'react-native';
const CategorySkeleton = ({ isListView }: {isListView: boolean}) => {
  return (
    <View style={{ marginBottom: 25 }}>
      {/* Category title */}
      <View
        style={{
          height: 22,
          width: 180,
          backgroundColor: "#eee",
          borderRadius: 6,
          marginBottom: 15,
          marginLeft: 15,
        }}
      />

      {/* Products */}
      <View
        style={[
          { paddingBottom: 6 },
          !isListView && {
            flexDirection: "row",
            gap: 12,
            flexWrap: "wrap",
            paddingHorizontal: 15,
          },
        ]}
      >
        {isListView
          ? /* ================= LIST VIEW SKELETON ================= */
            [1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  paddingVertical: 18,
                  paddingHorizontal: 15,
                  backgroundColor: "#fff",
                  borderBottomWidth: 1,
                  borderBottomColor: "#cac4c4ff",
                  borderStyle: "dashed",
                }}
              >
                {/* LEFT */}
                <View style={{ flex: 1, paddingRight: 14 }}>
                  <View
                    style={{
                      height: 18,
                      width: "80%",
                      backgroundColor: "#eee",
                      borderRadius: 4,
                      marginBottom: 8,
                    }}
                  />
                  <View
                    style={{
                      height: 14,
                      width: "90%",
                      backgroundColor: "#eee",
                      borderRadius: 4,
                      marginBottom: 12,
                    }}
                  />
                  <View
                    style={{
                      height: 16,
                      width: 70,
                      backgroundColor: "#eee",
                      borderRadius: 4,
                    }}
                  />
                </View>

                {/* RIGHT */}
                <View style={{ width: 138, alignItems: "center" }}>
                  {/* Image */}
                  <View
                    style={{
                      width: 132,
                      height: 120,
                      backgroundColor: "#eee",
                      borderRadius: 16,
                    }}
                  />

                  {/* ADD button */}
                  <View
                    style={{
                      marginTop: -14,
                      height: 36,
                      minWidth: 90,
                      borderRadius: 10,
                      backgroundColor: "#eee",
                    }}
                  />
                </View>
              </View>
            ))
          : /* ================= GRID VIEW SKELETON ================= */
            [1, 2].map((i) => (
              <View
                key={i}
                style={{
                  width: "48%",
                  height: 180,
                  backgroundColor: "#eee",
                  borderRadius: 10,
                }}
              />
            ))}
      </View>
    </View>
  );
};

export default CategorySkeleton;
