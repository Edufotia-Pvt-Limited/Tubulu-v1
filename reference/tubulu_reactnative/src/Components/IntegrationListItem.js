
import { useRef, useState } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../Utils/Colors';
import { GetChatRoom } from '../Utils/ApiActions';
import ChatService from '../Services/Chat.service';

function IntegrationListItem(props) {
  const { item } = props.item;


  console.log("item heck", item)
  

  const [isModalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  async function onIntegrationClicked() {
    try {
      const existingChatRoomId = ChatService.getChatRoomIdFromIntegrationId(item?._id);

      if (!existingChatRoomId) {
        const { data } = await GetChatRoom(item._id);
        props.navigation.push('ChatScreen', {
          integrationItem: { ...item, ...props.integrationsList, chatRoomId: data._id },
        });
        return;
      }

      props.navigation.push('ChatScreen', {
        integrationItem: { ...item, ...props.integrationsList, chatRoomId: existingChatRoomId },
      });
    } catch (error) {
      console.log('Navigation error', error);
    }
  }

  if (!item?.integrationName) return null;

  const hasDeal = !!item?.dealName;

  function openImageModal() {
    setModalVisible(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeImageModal() {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  }

  function onModalCall() {
    console.log('Call:', item.integrationName);
    closeImageModal();
  }

  function onModalMessage() {
    closeImageModal();
    onIntegrationClicked();
  }

  function onModalInfo() {
    closeImageModal();
     props.navigation.navigate("IntegrationProfileDetails", {
                            integrationItem: item,
                               fromScreen: "IntegrationList",
                        })


  }

  return (
    <>
      {/* MAIN ROW */}
      <TouchableOpacity style={styles.rowTouchable} activeOpacity={0.85} onPress={onIntegrationClicked} >
        <View style={styles.rowContainer}>
          {/* Logo */}
          <TouchableOpacity onPress={openImageModal} style={styles.logoWrapper} activeOpacity={0.85}>
            <Image
              source={{ uri: item?.logo ?? '' }}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Text Section */}
          <View style={styles.textSection}>
            <Text style={styles.titleText}>{item.integrationName}</Text>
            <Text style={styles.descText} numberOfLines={1}>
              {item.description || 'No description available'}
            </Text>

            {hasDeal && (
              <View style={styles.dealRow}>
                <Ionicons name="ribbon-outline" size={12} color="#C9A227" style={{ marginRight: 6 }} />
                <Text numberOfLines={1} style={styles.dealText}>{item.dealName}</Text>
              </View>
            )}
          </View>

          {/* Cart badge */}
          {item?.isCartExist && item?.cartItemQuantity > 0 && (
            <View style={styles.cartWrapper}>
              <Ionicons name="cart-outline" size={26} color={colors.primaryTextColor} />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{item.cartItemQuantity}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={isModalVisible} transparent animationType="none">
        <Pressable style={styles.modalBackdrop} onPress={closeImageModal}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>

              {/* Close */}
              <TouchableOpacity onPress={closeImageModal} style={styles.modalClose}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>

              {/* IMAGE (full width + full height inside header area) */}
              <View style={styles.modalImageWrapper}>
                <Image
                  source={{ uri: item?.logo ?? '' }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              </View>

              {/* Title */}
              <Text style={styles.modalTitle} numberOfLines={1}>
                {item.integrationName}
              </Text>

              {/* ACTION BUTTONS */}
              <View style={styles.modalActionsRow}>
                <TouchableOpacity style={styles.circleBtn} onPress={onModalCall}>
                  <Ionicons name="call-outline" size={22} color="#444" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.circleBtn} onPress={onModalMessage}>
                  <Ionicons name="chatbox-ellipses-outline" size={22} color="#444" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.circleBtn} onPress={onModalInfo}>
                  <Ionicons name="information-circle-outline" size={22} color="#444" />
                </TouchableOpacity>
              </View>

              {/* Labels */}
              <View style={styles.modalLabelRow}>
                <Text style={styles.labelText}>Call</Text>
                <Text style={styles.labelText}>Chat</Text>
                <Text style={styles.labelText}>Info</Text>
              </View>

            </Animated.View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  rowTouchable: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrapper: {
    height: 52,
    width: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    height: '100%',
    width: '100%',
  },
  textSection: {
    flex: 1,
    paddingLeft: 14,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryTextColor,
  },
  descText: {
    fontSize: 12,
    color: colors.textGrey,
    marginTop: 2,
  },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dealText: {
    fontSize: 12,
    color: '#C9A227',
    fontWeight: Platform.OS === 'android' ? '700' : '600',
  },

  cartWrapper: { position: 'relative', marginLeft: 8 },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 5,
    height: 18,
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },

  /* MODAL */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    width: '78%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    paddingBottom: 20,

    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 9,
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageWrapper: {
    width: '100%',
    height: 220,
    backgroundColor: '#F2F2F2',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.primaryTextColor,
  },

  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 18,
    paddingHorizontal: 30,
  },
  circleBtn: {
    height: 54,
    width: 54,
    borderRadius: 27,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  modalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 8,
    paddingHorizontal: 30,
  },
  labelText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
});

export default IntegrationListItem;






// import { Image, Text, TouchableOpacity, View } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { colors } from '../Utils/Colors';
// import { GetChatRoom } from '../Utils/ApiActions';
// import ChatService from '../Services/Chat.service';

// function IntegrationListItem(props) {
//   const { item } = props.item;

//   async function onIntegrationClicked() {
//     try {
//       const existingChatRoomId = ChatService.getChatRoomIdFromIntegrationId(item?._id);
//       if (!existingChatRoomId) {
//         const { data } = await GetChatRoom(item._id);
//         props.navigation.push('ChatScreen', { 
//           integrationItem: { ...item, ...props.integrationsList, chatRoomId: data._id } 
//         });
//         return;
//       }
//       props.navigation.push('ChatScreen', { 
//         integrationItem: { ...item, ...props.integrationsList, chatRoomId: existingChatRoomId } 
//       });
//     } catch (error) {
//       console.log('Unable to navigate', error);
//     }
//   }

//   if (!item?.integrationName) return null;

//   const hasDeal = !!item?.dealName;

//   return (
//     <TouchableOpacity onPress={onIntegrationClicked} style={{ padding: 16 }}>
      
//       {/* OUTER WRAPPER IF HAS DEAL */}
//       <View
//         style={{
//           flexDirection: 'column',
//           position: 'relative',
//           backgroundColor: hasDeal ? '#F8FAFF' : 'transparent',
//           borderRadius: hasDeal ? 12 : 0,
//           padding: hasDeal ? 0 : 0,
//           // borderWidth: hasDeal ? 1 : 0,
//           borderColor: hasDeal ? '#2355C420' : 'transparent',
//           // shadowColor: hasDeal ? '#2355C4' : 'transparent',
//           // shadowOpacity: hasDeal ? 0.12 : 0,
//           // shadowOffset: { width: 0, height: 2 },
//           // shadowRadius: hasDeal ? 8 : 0,
//           // elevation: hasDeal ? 3 : 0,
//         }}
//       >

//         {/* DEAL HEADER (ENHANCED) */}
//         {hasDeal && (
//           <View
//             style={{
//               width: '100%',
//               // backgroundColor: '#2355C4',
//               paddingHorizontal: 14,
//               paddingVertical: 6,
//               borderTopLeftRadius: 12,
//               borderTopRightRadius: 12,
//               flexDirection: 'row',
//               alignItems: 'center',
//             }}
//           >
//             {/* <Ionicons name="pricetag" size={14} color="white" /> */}

//              <Ionicons name="pricetag" size={14} color="#2355C4" />

//             <Text
//               numberOfLines={1}
//               ellipsizeMode="tail"
//               style={{
//                 // color: 'white',
//                 color:"#2355C4",
//                 fontSize: 12,
//                 fontWeight: '700',
//                 marginLeft: 6,
//                 flex: 1,
//               }}
//             >
//               {item.dealName}
//             </Text>
//           </View>
//         )}

//         {/* MAIN CONTENT ROW */}
//         <View
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             //  paddingVertical: hasDeal ? 10 : 0,
//             // padding: hasDeal ? 8 : 0,
//             // paddingLeft: hasDeal ? 10 : 0,
//           }}
//         >
//           {/* LOGO */}
//           <View
//             style={{
//               height: 50,
//               width: 50,
//               borderRadius: 25,
//               backgroundColor: colors.backgroundWhite,
//               borderWidth: 1,
//               borderColor: '#E0E0E0',
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}
//           >
//             <Image
//               resizeMode="contain"
//               source={{ uri: item?.logo ?? '' }}
//               style={{ height: 40, width: 40, borderRadius: 20 }}
//             />
//           </View>

//           {/* TEXT */}
//           <View style={{ flex: 1, paddingLeft: 14 }}>
//             <Text
//               style={{
//                 fontFamily: 'NotoSans',
//                 fontSize: 16,
//                 fontWeight: '600',
//                 color: colors.primaryTextColor,
//               }}
//             >
//               {item.integrationName}
//             </Text>

//             <Text
//               style={{
//                 fontFamily: 'NotoSans',
//                 fontSize: 12,
//                 color: colors.textGrey,
//                 marginTop: 2,
//               }}
//               numberOfLines={1}
//               ellipsizeMode="tail"
//             >
//               {item.description || 'No description available'}
//             </Text>
//           </View>

//           {/* CART BADGE */}
//           {item?.isCartExist && item?.cartItemQuantity > 0 && (
//             <View style={{ position: 'relative', marginLeft: 8 }}>
//               <Ionicons name="cart-outline" size={26} color={colors.primaryTextColor} />
//               <View
//                 style={{
//                   position: 'absolute',
//                   top: -6,
//                   right: -8,
//                   backgroundColor: '#FF3B30',
//                   borderRadius: 10,
//                   height: 18,
//                   minWidth: 18,
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   paddingHorizontal: 4,
//                 }}
//               >
//                 <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
//                   {item.cartItemQuantity}
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// export default IntegrationListItem;




// import { Image, Text, TouchableOpacity, View } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { colors } from '../Utils/Colors';
// import { GetChatRoom } from '../Utils/ApiActions';
// import ChatService from '../Services/Chat.service';

// function IntegrationListItem(props) {
//   const { item } = props.item;

//   async function onIntegrationClicked() {
//     try {
//       const existingChatRoomId = ChatService.getChatRoomIdFromIntegrationId(item?._id);
//       if (!existingChatRoomId) {
//         const { data } = await GetChatRoom(item._id);
//         props.navigation.push('ChatScreen', {
//           integrationItem: { ...item, ...props.integrationsList, chatRoomId: data._id },
//         });
//         return;
//       }
//       props.navigation.push('ChatScreen', {
//         integrationItem: { ...item, ...props.integrationsList, chatRoomId: existingChatRoomId },
//       });
//     } catch (error) {
//       console.log('Unable to navigate');
//       console.log(error);
//     }
//   }

//   if (!item?.integrationName) return null;

//   return (
//     <TouchableOpacity onPress={onIntegrationClicked} style={{ padding: 16 }}>
//       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//         {/* LOGO SECTION */}
//         <View style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
//           <View
//             style={{
//               height: 55,
//               width: 55,
//               borderRadius: 28,
//               backgroundColor: colors.backgroundWhite,
//               borderWidth: 1,
//               borderColor: '#E0E0E0',
//               justifyContent: 'center',
//               alignItems: 'center',
//               shadowColor: '#000',
//               shadowOpacity: 0.08,
//               shadowRadius: 4,
//               elevation: 2,
//             }}>
//             <Image
//               resizeMode="contain"
//               source={{ uri: item?.logo ?? '' }}
//               style={{ height: 45, width: 45, borderRadius: 22 }}
//             />
//           </View>

//           {/* FLOATING CART BADGE (Half Overlapping) */}
//           {item?.isCartExist && item?.cartItemQuantity > 0 && (
//             <View
//               style={{
//                 position: 'absolute',
//                 bottom: -8, 
//                 right: -5, 
//                 backgroundColor: '#FFFFFF',
//                 borderRadius: 14,
//                 padding: 2,
//                 shadowColor: '#000',
//                 shadowOpacity: 0.15,
//                 shadowRadius: 4,
//                 elevation: 3,
//               }}>
//               <View style={{ position: 'relative' }}>
//                 <Ionicons name="cart" size={22} color={colors.primaryTextColor} />
//                 <View
//                   style={{
//                     position: 'absolute',
//                     top: -4,
//                     right: -6,
//                     backgroundColor: '#FF3B30',
//                     borderRadius: 10,
//                     height: 16,
//                     minWidth: 16,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     paddingHorizontal: 3,
//                   }}>
//                   <Text
//                     style={{
//                       color: 'white',
//                       fontSize: 9,
//                       fontWeight: '700',
//                     }}>
//                     {item.cartItemQuantity}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           )}
//         </View>

//         {/* TEXT SECTION */}
//         <View style={{ flex: 1, paddingLeft: 14 }}>
//           <Text
//             style={{
//               fontFamily: 'NotoSans',
//               fontSize: 16,
//               fontWeight: '600',
//               color: colors.primaryTextColor,
//             }}>
//             {item.integrationName}
//           </Text>
//           <Text
//             style={{
//               fontFamily: 'NotoSans',
//               fontSize: 12,
//               color: colors.textGrey,
//               marginTop: 2,
//             }}
//             numberOfLines={1}
//             ellipsizeMode="tail">
//             {item.description || 'No description available'}
//           </Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// export default IntegrationListItem;
