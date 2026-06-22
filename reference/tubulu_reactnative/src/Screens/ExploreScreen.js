/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import { ScrollView } from 'native-base';
import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Swiper from 'react-native-swiper';
import { useDispatch, useSelector } from 'react-redux';
import { updateCategory } from '../Store/chat.store/chat.actions';
import { GetChatRoom, getCategories } from '../Utils/ApiActions';
import { colors } from '../Utils/Colors';
import { deviceWidth } from '../Utils/Constants';
import Explore_Screen_AD_1 from '../assets/explore_screen_carousel_1.png';
import Explore_Screen_AD_2 from '../assets/explore_screen_carousel_2.png';

function TopImages(props) {
    return (
        <View style={{ height: 220 }}>
            <Swiper style={{ overflow: 'visible' }}
showsPagination={true} autoplay={true} autoplayTimeout={4}
            >

                <View
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Image
                        style={{
                            height: 150,
                            width: '98%',
                            marginTop: 16,
                            marginBottom: 16,
                            borderRadius: 16,
                        }}
                        resizeMode="stretch"
                        source={{
                            uri: 'https://tubuludata.s3.amazonaws.com/explore_screen/Explore_screen_ad_1.png',
                        }}
                    />
                </View>
                <View
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Image
                        style={{
                            height: 150,
                            width: '98%',
                            marginTop: 16,
                            marginBottom: 16,
                            borderRadius: 16,
                        }}
                        resizeMode="stretch"
                        source={Explore_Screen_AD_2}
                    />
                </View>
                <View
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Image
                        style={{
                            height: 150,
                            width: '98%',
                            marginTop: 16,
                            marginBottom: 16,
                            borderRadius: 16,
                        }}
                        resizeMode="stretch"
                        source={Explore_Screen_AD_1}
                    />
                </View>
            </Swiper>
        </View>
    );
}

function ExploreScreen({ discoverData, navigation, integrationList }) {
    const reduxCatgories = useSelector(state => state.chatState.categories);


    const categories = useMemo(() => {
        if (reduxCatgories && reduxCatgories.length) {
            return reduxCatgories;
        }
        return [];
    }, [reduxCatgories]);

    const dispatch = useDispatch();


    console.log('discover data', discoverData);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const { data } = await getCategories();
            dispatch(updateCategory(data));
        } catch (error) {
            console.log('Unable to get the list of the categories at the moment');
            console.log(error);
        }
    }

    async function onDiscoverClicked(item) {
        try {
            const { data } = await GetChatRoom(item._id);
            navigation.push('ChatScreen', {
                integrationItem: { ...item,...integrationList, chatRoomId: data?._id },
                // integrationItem: { ...item, chatRoomId: data?._id },

            });
        } catch (error) {
            console.log('Unable to navigate');
            console.log(error);
        }
    }

    function getCategoryImage(categoryItem) {
        if (categoryItem === 'Finance') {
            return require('../assets/finance_logo.png');
        } else if (categoryItem === 'Grocery') {
            return require('../assets/grocery_logo.png');
        } else if (categoryItem === 'Mobiles') {
            return require('../assets/mobile_logo.png');
        } else if (categoryItem === 'Fashion') {
            return require('../assets/fashion_logo.png');
        } else {
            return require('../assets/finance_logo.png');
        }
    }

    // function renderCategories() {
    //     return (
    //         <>
    //             <View
    //                 style={{
    //                     width: '100%',
    //                     flexDirection: 'row',
    //                     alignItems: 'center',
    //                     marginTop: 16,
    //                     marginBottom: 10,
    //                 }}>
    //                 <Text
    //                     style={{
    //                         color: colors.textBlueColor,
    //                         fontSize: 16,
    //                         fontWeight: '500',
    //                     }}>
    //                     Business Category
    //                 </Text>
    //                 <View style={{ flex: 1, alignItems: 'flex-end' }}>
    //                     <TouchableOpacity
    //                         onPress={() => {
    //                             navigation.navigate('CategoryDetailsScreen', {
    //                                 selectedCategories: categories,
    //                             });
    //                         }}>
    //                         <Text
    //                             style={{
    //                                 color: colors.textBlueColor,
    //                                 fontSize: 12,
    //                                 fontWeight: 'normal',
    //                             }}>
    //                             See all
    //                         </Text>
    //                     </TouchableOpacity>
    //                 </View>
    //             </View>
    //             <ScrollView
    //                 style={{ maxHeight: 88, marginTop: 16, paddingBottom: 8 }}
    //                 horizontal>
    //                 {categories.map(categoryItem => {
    //                     return (
    //                         <View key={categoryItem._id}>
    //                             <TouchableOpacity
                              
    //                                 style={{
    //                                     flexDirection: 'column',
    //                                     justifyContent: 'center',
    //                                     alignItems: 'center',
    //                                     paddingHorizontal: 8,
    //                                 }}
    //                                 onPress={() => {
    //                                     navigation.navigate('CategoryDetailsScreen', {
    //                                         selectedCategories: [categoryItem],
    //                                     });
    //                                 }}>
    //                                 <Image
    //                                     style={{ height: 64, width: 64 }}
    //                                     source={{ uri: categoryItem.logo }}
    //                                 />
    //                                 <Text
    //                                     style={{
    //                                         width: '100%',
    //                                         textAlign: 'center',
    //                                         color: 'black',
    //                                     }}>
    //                                     {categoryItem.name}
    //                                 </Text>
    //                             </TouchableOpacity>
    //                         </View>
    //                     );
    //                 })}
    //             </ScrollView>
    //         </>
    //     );
    // }

function renderCategories() {
  return (
    <>
      {/* Header */}
      {/* <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 24,
          marginBottom: 20,
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.textBlueColor,
          }}>
          Explore
        </Text>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CategoryDetailsScreen', {
                selectedCategories: categories,
              })
            }>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.textBlueColor,
              }}>
              View all
            </Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Header */}
<View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 12,
  }}>
    <View>
  <Text
    style={{
      fontSize: 18,
      fontWeight: '700',
      color: colors.textBlueColor,
    }}>
    Business Category
  </Text>
     <Text style={{ fontSize: 12, color: '#8E8E93', marginTop: 2, marginLeft: 2 }}>Here’s our recommendation</Text>
     </View>

  <View style={{ flex: 1, alignItems: 'flex-end' }}>

    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CategoryDetailsScreen', {
          selectedCategories: categories,
        })
      }
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{
        height: 32,
        width: 32,
        borderRadius: 16,
       backgroundColor: '#ECEFF4',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Ionicons
        name="arrow-forward-outline"
        size={20}
       color="#3A3A3C"
      />
    </TouchableOpacity>
  </View>
</View>


      {/* Dock */}
      <View
        style={{
          backgroundColor: '#F5F7FB',
          borderRadius: 22,
          paddingVertical: 16,
          paddingLeft: 14,
        }}>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}>
          {categories.map(categoryItem => (
            <TouchableOpacity
              key={categoryItem._id}
              activeOpacity={0.9}
              style={{
                alignItems: 'center',
                marginRight: 20,
              }}
              onPress={() =>
                navigation.navigate('CategoryDetailsScreen', {
                  selectedCategories: [categoryItem],
                })
              }>

              {/* Circle */}
              <View
                style={{
                  height: 58,
                  width: 58,
                  borderRadius: 29,
                  overflow: 'hidden', // 👈 important
                  backgroundColor: '#FFFFFF',

                  shadowColor: '#000',
                  shadowOpacity: 0.14,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                }}>
                <Image
                  source={{ uri: categoryItem.logo }}
                  style={{
                    height: '100%',
                    width: '100%',
                    resizeMode: 'cover', // 👈 full bleed
                  }}
                />
              </View>

              {/* Label */}
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#111',
                }}>
                {categoryItem.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
}



    function renderDiscoverSection() {
        return (
            <View
                style={{
                    // marginTop: 8,
                    marginTop: 24,
                    borderWidth: 1,
                    borderColor: '#D1D1D6',
                    minHeight: 200,
                    borderRadius: 16,
                    // padding: 16,
                     paddingVertical: 24,
                     paddingHorizontal: 16,
                }}>
                <View
                    style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,}}>
                        <View>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            fontStyle: 'normal',
                            color: '#282828',
                        }}>
                        Discover with Tubulu
                    </Text>

     <Text style={{ fontSize: 12, color: '#8E8E93', marginTop: 4, marginLeft: 2 }}>Here’s our recommendation</Text>
     </View>


                    {/* <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('CategoryDetailsScreen', {
                                    selectedCategories: categories,
                                });
                            }}>
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: '400',
                                    fontStyle: 'normal',
                                    color: '#8E8E93',
                                }}>
                                View all
                            </Text>
                        </TouchableOpacity>
                    </View> */}


                             <View style={{ flex: 1, alignItems: 'flex-end' }}>
           <TouchableOpacity
             onPress={() =>
               navigation.navigate('CategoryDetailsScreen', {
                 selectedCategories: categories,
               })
             }
             hitSlop={{ top: 10, bottom: 10, left: 10, right: 0 }}
             style={{
               height: 32,
               width: 32,
               borderRadius: 16,
               backgroundColor: '#ECEFF4',
               justifyContent: 'center',
               alignItems: 'center',
             }}>
             <Ionicons
               name="arrow-forward-outline"
               size={20}
               color="#3A3A3C"
             />
           </TouchableOpacity>
      </View>








                    
                    
                </View>
                <View
                    style={{
                        marginTop: 24,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                       
                    }}>
                    {!!discoverData?.length &&
                        discoverData.map(discoverItem => {
                            return (
                                <View
                                    key={discoverItem._id}
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        // paddingHorizontal: 16,
                                          paddingHorizontal: 12,
                                        width: deviceWidth / 4,
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.push('ChatScreen', { integrationItem: discoverItem });
                                            onDiscoverClicked(discoverItem);
                                        }}
                                        style={{ height: 100, alignItems: 'center' }}>
                                        <Image
                                            source={{ uri: discoverItem?.logo ?? '' }}
                                            style={{ height: 52, width: 52, borderRadius: 50 }}
                                        />
                                        <Text
                                            numberOfLines={1}
                                            style={{
                                                marginTop: 6,
                                                fontSize: 12,
                                                fontWeight: '400',
                                                textAlign: 'center',
                                                color: 'black',
                                                
                                            }}>{`${discoverItem.integrationName?.substr(0, 10)}${discoverItem.integrationName?.length > 10 ? '...' : ''
                                                }\n`}</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                </View>
            </View>
        );
    }

// function renderDiscoverSection() {
//   return (
//     <View style={{ marginTop: 28 }}>
//       {/* Header */}
//       <View
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//         //   paddingHorizontal: 4,
//           marginBottom: 12,
//           minHeight: 36,
//         }}>
//         <Text
//           style={{
//             fontSize: 18,
//             fontWeight: '700',
//             color: '#1C1C1E',
//           }}>
//           Discover with Tubulu
//         </Text>

//         <View style={{ flex: 1, alignItems: 'flex-end' }}>
//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate('CategoryDetailsScreen', {
//                 selectedCategories: categories,
//               })
//             }
//             hitSlop={{ top: 10, bottom: 10, left: 10, right: 0 }}
//             style={{
//               height: 32,
//               width: 32,
//               borderRadius: 16,
//               backgroundColor: '#ECEFF4',
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}>
//             <Ionicons
//               name="arrow-forward-outline"
//               size={20}
//               color="#3A3A3C"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Discover List */}
//       <View>
//         {!!discoverData?.length &&
//           discoverData.map((discoverItem, index) => (
//             <TouchableOpacity
//               key={discoverItem._id}
//               activeOpacity={0.85}
//               onPress={() => {
//                 navigation.push('ChatScreen', {
//                   integrationItem: discoverItem,
//                 });
//                 onDiscoverClicked(discoverItem);
//               }}
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 paddingVertical: 14,
//               }}>

//               {/* Logo */}
//               <View
//                 style={{
//                   height: 44,
//                   width: 44,
//                   borderRadius: 22,
//                   overflow: 'hidden',
//                   backgroundColor: '#F2F2F7',
//                   marginRight: 14,
//                 }}>
//                 <Image
//                   source={{ uri: discoverItem?.logo ?? '' }}
//                   style={{
//                     height: '100%',
//                     width: '100%',
//                     resizeMode: 'cover',
//                   }}
//                 />
//               </View>

//               {/* Text */}
//               <View style={{ flex: 1 }}>
//                 <Text
//                   numberOfLines={1}
//                   style={{
//                     fontSize: 15,
//                     fontWeight: '600',
//                     color: '#111',
//                   }}>
//                   {discoverItem.integrationName}
//                 </Text>

//                 {!!discoverItem.category && (
//                   <Text
//                     numberOfLines={1}
//                     style={{
//                       marginTop: 2,
//                       fontSize: 12,
//                       fontWeight: '400',
//                       color: '#8E8E93',
//                     }}>
//                     {discoverItem.category}
//                   </Text>
//                 )}
//               </View>

//               {/* Row Chevron */}
//               <Ionicons
//                 name="chevron-forward"
//                 size={18}
//                 color="#C7C7CC"
//               />
//             </TouchableOpacity>
//           ))}
//       </View>
//     </View>
//   );
// }




    function renderAdTile() {
        return (
            <View
                style={{
                    backgroundColor: '#EFE0FF',
                    height: 120,
                    width: '100%',
                    borderColor: 'transparent',
                    borderRadius: 8,
                    borderWidth: 1,
                    padding: 20,
                    marginTop: 16,
                        // marginTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                <View style={{ flex: 1.5 }}>
                    <Text
                        style={{
                            color: '#440687',
                            fontWeight: '500',
                            fontSize: 24,
                            fontStyle: 'normal',
                        }}>
                        New on Tubulu
                    </Text>
                    <Text
                        style={{
                            color: '#440687',
                            fontWeight: '400',
                            fontSize: 12,
                            fontStyle: 'normal',
                            marginTop: 4,
                        }}>
                        Discover Businesses, manage bills, chat with support, promo
                        offers...
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end', flex: 1 }}>
                    <Image
                        style={{ height: 64, width: 64 }}
                        source={{
                            uri: 'https://tubuludata.s3.amazonaws.com/explore_screen/discover_with_tubulu/new.png',
                        }}
                    />
                </View>
            </View>
        );
    }

    return (
        <View
            style={{ flex: 1, backgroundColor: colors.backgroundWhite, padding: 0 }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
                 <TopImages />
                {renderCategories()}
               
               
                 {renderAdTile()}
                {renderDiscoverSection()}
            </ScrollView>
        </View>
    );
}

ExploreScreen.propTypes = {
    discoverData: PropTypes.array.isRequired,
};

export default ExploreScreen;
