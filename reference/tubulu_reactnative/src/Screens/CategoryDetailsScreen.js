// import React, { useEffect, useState } from 'react';
// import {
//     Image,
//     ScrollView,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import IonIcon from 'react-native-vector-icons/Ionicons';
// import IntegrationListItem from '../Components/IntegrationListItem';
// import { getIntegrationByCategory } from '../Utils/ApiActions';
// import { colors } from '../Utils/Colors';
// import Explore_Ad from '../assets/explore_screen_ad.png';

// function CategoryItem({ categoryItem, navigation }) {
//     const [integrations, setIntegrations] = useState([]);

//     useEffect(() => {
//         fetchIntegrationsByCategory();
//     }, []);

//     async function fetchIntegrationsByCategory() {
//         try {
//             const { data } = await getIntegrationByCategory(categoryItem.name);
//             setIntegrations(data);
//         } catch (error) { }
//     }

//     return (
//         <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
//             <Text
//                 style={{
//                     color: '#282828',
//                     fontWeight: '500',
//                     fontSize: 22,
//                 }}>
//                 {categoryItem.name}
//             </Text>
//             <View>
//                 <ScrollView style={{ marginTop: 16 }} horizontal>
//                     {categoryItem.advertisements.map((adItem, index) => {
//                         return (
//                             <View style={{ borderRadius: 20 }}>
                             
//                                 <Image
//                                     style={{
//                                         height: 180,
//                                         width: 280,
//                                         marginTop: 16,
//                                         marginBottom: 16,
//                                         borderRadius: 20,
//                                     }}
//                                     resizeMode="stretch"
//                                     source={Explore_Ad}
//                                 />
//                             </View>
//                         );
//                     })}
//                 </ScrollView>
//             </View>
//             <View
//                 style={{
//                     marginTop: 16,
//                     borderColor: '#D1D1D6',
//                     borderWidth: 0.5,
//                     borderRadius: 8,
//                 }}>
//                 {!!integrations?.length &&
//                     integrations.map(item => {
//                         return (
//                             <IntegrationListItem navigation={navigation} item={{ item }} />
//                         );
//                     })}
//             </View>
//         </View>
//     );
// }

// export function CategoryDetailsScreen(props) {
//     const {
//         route: {
//             params: { selectedCategories },
//         },
//     } = props;
//     return (
//         <View style={{ flex: 1, backgroundColor: colors.backgroundWhite }}>
//             <SafeAreaView style={{ flex: 1 }} edges={['top']}>
//                 <View
//                 style={{
//                     height: 60,
//                     flexDirection: 'row',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     paddingLeft: 16,
//                 }}>
//                 <View style={{ flex: 1, justifyContent: 'center' }}>
//                     <TouchableOpacity
//                         onPress={() => {
//                             props.navigation.goBack();
//                         }}>
//                         <IonIcon
//                             name={'arrow-back'}
//                             style={{ color: '#2355C4', fontSize: 24 }}
//                         />
//                     </TouchableOpacity>
//                 </View>
//                 <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                     <Text
//                         style={{
//                             fontWeight: '600',
//                             fontSize: 16,
//                             width: '100%',
//                             textAlign: 'center',
//                             color: 'black',
//                         }}>
//                         Business
//                     </Text>
//                 </View>
//                 <View style={{ flex: 1 }} />
//             </View>
//             <View style={{ marginTop: -16, paddingBottom: 64 }}>
//                 <ScrollView>
//                     {selectedCategories.map(categoryItem => {
//                         return (
//                             <CategoryItem
//                                 navigation={props.navigation}
//                                 categoryItem={categoryItem}
//                             />
//                         );
//                     })}
//                 </ScrollView>
//             </View>
//             </SafeAreaView>
//         </View>
//     );
// }


import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IonIcon from 'react-native-vector-icons/Ionicons';

import IntegrationListItem from '../Components/IntegrationListItem';
import { getIntegrationByCategory } from '../Utils/ApiActions';
import { colors } from '../Utils/Colors';
import Explore_Ad from '../assets/explore_screen_ad.png';

/* ----------------------------- Category Item ----------------------------- */

// function CategoryItem({ categoryItem, navigation }) {
//   const [integrations, setIntegrations] = useState([]);

//   useEffect(() => {
//     fetchIntegrationsByCategory();
//   }, []);

//   async function fetchIntegrationsByCategory() {
//     try {
//       const { data } = await getIntegrationByCategory(categoryItem.name);
//       console.log("Fetched integrations for category:", categoryItem.name, data);
//       setIntegrations(data);
//     } catch (e) {}
//   }

//   return (
//     <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
//       {/* Category Title */}
//       <Text
//         style={{
//           fontSize: 22,
//           fontWeight: '700',
//           color: '#1C1C1E',
//         }}
//       >
//         {categoryItem.name}
//       </Text>

//       {/* Ads */}
//       {/* <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         style={{ marginTop: 16 }}
//       >
//         {categoryItem.advertisements.map((_, index) => (
//           <View
//             key={index}
//             style={{
//               marginRight: 16,
//               borderRadius: 24,
//               overflow: 'hidden',
//               shadowColor: '#000',
//               shadowOpacity: 0.12,
//               shadowRadius: 8,
//               shadowOffset: { width: 0, height: 4 },
//               elevation: 4,
//             }}
//           >
//             <Image
//               source={Explore_Ad}
//               resizeMode="stretch"
//               style={{
//                 width: 280,
//                 height: 180,
    
//               }}
//             />
//           </View>
//         ))}
//       </ScrollView> */}

// <ScrollView
//   horizontal
//   showsHorizontalScrollIndicator={false}
//   style={{ marginTop: 16 }}
// >
//   {categoryItem.advertisements.map((_, index) => (
//     <View
//       key={index}
//       style={{
//         marginRight: 16,

//         // very subtle shadow
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOpacity: 0.08,
//         shadowRadius: 4,
//         shadowOffset: { width: 0, height: 2 },
//       }}
//     >
//       {/* Banner container */}
//       <View
//         style={{
//           borderRadius: 14,       // 👈 STANDARD banner radius
//           overflow: 'hidden',
//           backgroundColor: '#FFF',
//         }}
//       >
//         <Image
//           source={Explore_Ad}
//           resizeMode="cover"
//           style={{
//             width: 280,
//             height: 180,
//             borderRadius: 14,     // 👈 must match exactly
//           }}
//         />
//       </View>
//     </View>
//   ))}
// </ScrollView>




//       {/* Integrations */}
//       <View style={{ marginTop: 20}}>
        
//         {integrations?.length > 0 ? (
//           integrations.map((item, index) => (
//             <View
//               key={index}
//               style={{
//                 marginBottom: 12,
//                 // borderRadius: 14,
//                 // backgroundColor: '#FFFFFF',
//                 // shadowColor: '#000',
//                 // shadowOpacity: 0.06,
//                 // shadowRadius: 6,
//                 // shadowOffset: { width: 0, height: 3 },
//                 // elevation: 2,
//               }}
//             >
//               <IntegrationListItem
//                 navigation={navigation}
//                 item={{item}}
//               />
//             </View>
//           ))
//         ) : (
//           <Text
//             style={{
//               textAlign: 'center',
//               marginTop: 16,
//               color: '#8E8E93',
//               fontSize: 14,
//             }}
//           >
//             No integrations available
//           </Text>
//         )}
//       </View>
//     </View>
//   );
// }


/* ================= CONSTANTS ================= */

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAGE_HORIZONTAL_PADDING = 16;
const BANNER_RADIUS = 14;

// Google Play–like ratio (safe for text)
const BANNER_ASPECT_RATIO = 1.75;

const BANNER_GAP = 16;

const BANNER_WIDTH = SCREEN_WIDTH - PAGE_HORIZONTAL_PADDING * 2;
const BANNER_HEIGHT = BANNER_WIDTH / BANNER_ASPECT_RATIO;

// REAL scroll width (very important)
const BANNER_ITEM_WIDTH = BANNER_WIDTH + BANNER_GAP;

/* ================= CATEGORY ITEM ================= */

function CategoryItem({ categoryItem, navigation }) {
  const [integrations, setIntegrations] = useState([]);

  const bannerScrollRef = useRef(null);
  const currentBannerIndex = useRef(0);

  useEffect(() => {
    fetchIntegrationsByCategory();
  }, []);

  useEffect(() => {
    if (!categoryItem?.advertisements?.length) return;

    const interval = setInterval(() => {
      currentBannerIndex.current =
        (currentBannerIndex.current + 1) %
        categoryItem.advertisements.length;

      bannerScrollRef.current?.scrollTo({
        x: currentBannerIndex.current * BANNER_ITEM_WIDTH,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [categoryItem.advertisements]);

  async function fetchIntegrationsByCategory() {
    try {
      const { data } = await getIntegrationByCategory(categoryItem.name);
      setIntegrations(data);
    } catch (e) {}
  }

  return (
    <View style={{ marginTop: 28 }}>
      {/* ================= TITLE ================= */}
      <Text
        style={{
          marginHorizontal: PAGE_HORIZONTAL_PADDING,
          fontSize: 22,
          fontWeight: '700',
          color: '#1C1C1E',
        }}
      >
        {categoryItem.name}
      </Text>

      {/* ================= AD BANNERS ================= */}
      {categoryItem?.advertisements?.length > 0 && (
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={BANNER_ITEM_WIDTH}
          snapToAlignment="start"
          disableIntervalMomentum
          contentContainerStyle={{
            paddingHorizontal: PAGE_HORIZONTAL_PADDING,
            marginTop: 16,
          }}
        >
          {categoryItem.advertisements.map((_, index) => (
            <View
              key={index}
              style={{
                width: BANNER_ITEM_WIDTH,
              }}
            >
              <View
                style={{
                  width: BANNER_WIDTH,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    borderRadius: BANNER_RADIUS,
                    overflow: 'hidden',
                    backgroundColor: '#FFF',
                  }}
                >
                  <Image
                    source={Explore_Ad}
                    resizeMode="cover"
                    style={{
                      width: '100%',
                      height: BANNER_HEIGHT,
                    }}
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ================= INTEGRATIONS ================= */}
      <View
        style={{
          marginTop: 20,
          paddingHorizontal: PAGE_HORIZONTAL_PADDING,
        }}
      >
        {integrations?.length > 0 ? (
          integrations.map((item, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <IntegrationListItem
                navigation={navigation}
                item={{ item }}
              />
            </View>
          ))
        ) : (
          <Text
            style={{
              textAlign: 'center',
              marginTop: 16,
              color: '#8E8E93',
              fontSize: 14,
            }}
          >
            No integrations available
          </Text>
        )}
      </View>
    </View>
  );
}

export default CategoryItem;



/* -------------------------- Category Details Screen -------------------------- */

export function CategoryDetailsScreen(props) {
  const {
    route: {
      params: { selectedCategories },
    },
    navigation,
  } = props;

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundWhite }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View
          style={{
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <IonIcon name="arrow-back" size={24} color="#2355C4" />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                color: '#1C1C1E',
              }}
            >
              Business
            </Text>
          </View>

          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
          {selectedCategories.map((categoryItem, index) => (
            <CategoryItem
              key={index}
              categoryItem={categoryItem}
              navigation={navigation}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
