import {Image, TouchableOpacity, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {colors} from "../Utils/Colors";
import IonIcon from "react-native-vector-icons/Ionicons";

export function ViewBookMarks(props) {
    const {route: {params: {integrationItem}}, navigation: {goBack}} = props;

    function renderHeader() {
        return (
            <View style={{
                backgroundColor: colors.backgroundWhite,
                height: 64
            }}>
                <SafeAreaView>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingLeft: 8,
                        paddingRight: 8
                    }}>
                        <TouchableOpacity onPress={goBack}>
                            <IonIcon name='arrow-back' style={{color: '#2355C4', fontSize: 24}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{justifyContent: 'center'}}>
                        <Image
                            source={{uri: integrationItem.logo}}
                            style={{height: 40, width: 40, borderRadius: 50}}
                        />
                    </View>
                    <View style = {{
                        flex: 1,
                        paddingLeft: 12,
                        alignItems: 'flex-start',
                        alignContent: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text style={{
                            fontFamily: 'NotoSans',
                            fontSize: 16,
                        }}></Text>
                    </View>
                </View>
                </SafeAreaView>
            </View>
        )
    }

    return (
        <View style={{
            flex: 1,
            backgroundColor: '#EBF0FD'
        }}>

        </View>
    )
}
