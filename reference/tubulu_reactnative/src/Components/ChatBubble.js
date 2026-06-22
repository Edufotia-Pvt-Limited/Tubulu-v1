import moment from 'moment-timezone';
import {useEffect, useRef, useState} from 'react';
import {View, Text, Image, TouchableOpacity, Linking, ScrollView, ActivityIndicator, Dimensions} from 'react-native';
import {colors} from '../Utils/Colors';
import {ISAudioPlayerV2} from './ISAudioPlayerV2';
import ISDocumentDownloader from './ISDocumentDownloader';
import PropTypes from 'prop-types';
import {BarChart, LineChart, PieChart} from 'react-native-chart-kit';
import {CHART_TYPES} from '../Utils/Constants';
import IonIcon from 'react-native-vector-icons/Ionicons'
import ListSheetItem from './ListSheetItem';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import Video from "react-native-video";
import chatService from "../Services/Chat.service";

function LineChartItem(props) {
    const [data, setData] = useState(null);

    useEffect(() => {
        _buildLineData();
    }, [])

    const _buildLineData = () => {
        let _data = Object.assign([], props.chartData);
        let _resultData = {
            labels: [],
            datasets: [{
                data: []
            }]
        }
        if (typeof data === 'object' && _data.length > 0) {
            _data.map(dataItem => {
                _resultData.labels.push(dataItem.name || "");
                _resultData.datasets[0].data.push(dataItem.value || 0)
            })
        }
        // _resultData.labels.push('');
        // _resultData.datasets[0].data.push(0);
        setData(_resultData);
    }

    return (
        <View style={{height: 218, alignItems: 'center', justifyContent: 'center'}}>
            {
                data && typeof data === 'object' &&
                <LineChart
                    bezier
                    withInnerLines={false}
                    withHorizontalLabels={true}
                    yLabelsOffset={20}
                    xLabelsOffset={0}
                    style={{backgroundColor: 'transparent',}}
                    data={data}
                    width={300}
                    height={200}
                    fromZero
                    verticalLabelRotation={10}
                    showValuesOnTopOfBars
                    chartConfig={{
                        backgroundGradientFrom: colors.merchantChatBubble,
                        backgroundGradientTo: colors.merchantChatBubble,
                        backgroundColor: (opacity) => 'white',
                        color: (opacity) => colors.userChatBubble,
                        barPercentage: 0.4
                    }}
                />
            }
        </View>
    )


}


function BarChartItem(props) {
    const [data, setData] = useState(null);

    useEffect(() => {
        _buildBarData();
    }, []);

    const _buildBarData = () => {
        let _data = Object.assign([], props.chartData);
        let _resultData = {
            labels: [],
            datasets: [
                {
                    data: [],
                }
            ],

        }
        if (typeof _data === 'object' && _data.length > 0) {
            _data.map(dataItem => {
                _resultData.labels.push(dataItem.name || "");
                _resultData.datasets[0].data.push(dataItem.value || 0)
            })
        }
        setData(_resultData)
    }

    return (
        <View style={{height: 218, alignItems: 'center', justifyContent: 'center'}}>
            {
                data && typeof data === 'object' &&
                <BarChart
                    withInnerLines={false}
                    withHorizontalLabels={true}
                    yLabelsOffset={20}
                    xLabelsOffset={0}
                    style={{backgroundColor: 'transparent',}}
                    data={data}
                    width={300}
                    fromZero
                    height={200}
                    verticalLabelRotation={10}
                    showValuesOnTopOfBars
                    showBarTops={false}
                    chartConfig={{
                        backgroundGradientFrom: colors.merchantChatBubble,
                        backgroundGradientTo: colors.merchantChatBubble,
                        backgroundColor: (opacity) => 'white',
                        color: () => colors.userChatBubble,
                        barPercentage: 0.4
                    }}
                ></BarChart>
            }
        </View>
    )

}

function PieChartItem(props) {

    const [data, setData] = useState([]);

    useEffect(() => {
        _buildPieData();
    }, []);

    const _buildPieData = () => {
        let _data = Object.assign([], props.chartData);
        let _resultData = [];
        if (typeof data === 'object' && data.length > 0) {
            _data.map(dataItem => {
                _resultData.push({
                    name: dataItem.name || 'Title',
                    value: dataItem.value || 0,
                    color: dataItem.color || 'black'
                })
            })
        }
        setData(_data);
    }


    const _renderLegends = () => {
        if (typeof data === 'object' && data.length > 0) {
            return <View>
                <View style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: -4}}>{
                    data.map((dataItem, index) => {
                        return (
                            <View style={{display: 'flex', flexDirection: 'row', marginLeft: 16, marginTop: 8}}>
                                <View
                                    style={{
                                        height: 16,
                                        width: 16,
                                        marginRight: 2,
                                        borderColor: 'transparent',
                                        borderRadius: 32,
                                        borderWidth: 1,
                                        backgroundColor: dataItem?.color || 'black'
                                    }}
                                >
                                </View>
                                <Text style={{
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    fontSize: 12,
                                    color: colors.orderNumberColor
                                }}>{dataItem.name + " (" + dataItem.value?.toString() + ")"}</Text>
                            </View>
                        )
                    })}</View>
            </View>
        }
    }

    return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
            {typeof data === 'object' && data.length > 0 && <PieChart
                accessor='value'
                width={180}
                height={180}
                hasLegend={false}
                chartConfig={{
                    color: (opacity) => "rgba(1, 267, 234, 1)"
                }}
                paddingLeft={"15"}
                center={[20, 0]}
                data={data}></PieChart>}
            {_renderLegends()}
        </View>
    )
}

PieChartItem.propTypes = {
    chartData: PropTypes.object.isRequired,
    chatMessage: PropTypes.object.isRequired
}

function CarouselItem(props) {
    let _carouselItem = Object.assign({}, props.carouselItem);
    return (
        <View
            style={{
                width: 180,
                height: 180,
                backgroundColor: 'white',
                borderRadius: 24,
                marginTop: 20,
                marginLeft: props.index > 0 ? 16 : 0
            }}
        >
            <TouchableOpacity activeOpacity={1}>
                <Image resizeMode='stretch'
                       style={{
                           height: 140,
                           width: 180,
                           borderTopLeftRadius: 24,
                           borderTopRightRadius: 24
                       }}
                       source={{
                           uri: _carouselItem?.image
                       }}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                if (_carouselItem?.url) {
                    Linking.openURL(_carouselItem.url)
                }
            }}>
                <View
                    style={{
                        height: 50,
                        width: 180,
                        marginTop: -2,
                        borderBottomLeftRadius: 24,
                        borderBottomRightRadius: 24,
                        backgroundColor: colors.backgroundWhite,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text style={{
                        fontWeight: '400',
                        fontSize: 14,
                        color: '#2355C4'
                    }}>{_carouselItem.actionText}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

CarouselItem.propTypes = {
    carouselItem: PropTypes.object.isRequired,
    index: PropTypes.number
}


function ChatBubble(props) {
    let _timeZone = moment.tz.guess();

    const [displayListSheet, setDisplayListSheet] = useState(false);
    let bubbleRef = useRef(null);

    const player = useRef(null);
    const imageLoadingRef = useRef(true);
    const imageErrorRef = useRef(false);
    const videoLoadingRef = useRef(true);
    const videoErrorRef = useRef(false);
    const [, forceUpdate] = useState(0);

    const triggerUpdate = () => {
        forceUpdate(prev => prev + 1);
    };

    useEffect(() => {
        // Reset loading states when message changes
        const _payload = props.chatMessage?.payload;
        const filePath = props.chatMessage?.fileLocalPath;
        const imageUrl = filePath ?? _payload?.documentUrl;
        const videoUrl = _payload?.documentUrl;
        
        // For images: always start with loading state, let onLoadStart/onLoad handle it
        if (props.chatMessage?.type === 'IMAGE') {
            imageLoadingRef.current = true; // Always start loading, will be cleared on load
            imageErrorRef.current = false;
            triggerUpdate(); // Force update to show loading state
            
            // Fallback: if image is cached and onLoad doesn't fire, clear loading after a short delay
            const timeoutId = setTimeout(() => {
                if (imageLoadingRef.current && imageUrl) {
                    imageLoadingRef.current = false;
                    triggerUpdate();
                }
            }, 500);
            
            return () => clearTimeout(timeoutId);
        }
        
        // For videos: always start with loading state
        if (props.chatMessage?.type === 'VIDEO') {
            videoLoadingRef.current = true; // Always start loading, will be cleared on load
            videoErrorRef.current = false;
            triggerUpdate(); // Force update to show loading state
            
            // Fallback: if video is cached and onLoad doesn't fire, clear loading after a short delay
            const timeoutId = setTimeout(() => {
                if (videoLoadingRef.current && videoUrl) {
                    videoLoadingRef.current = false;
                    triggerUpdate();
                }
            }, 1000);
            
            return () => clearTimeout(timeoutId);
        }
    }, [props.chatMessage?._id, props.chatMessage?.fileLocalPath, props.chatMessage?.payload?.documentUrl])

    const _renderTextMessage = () => {
        if (props.chatMessage?.messageByUser) {
            return <><View
                style={{
                    alignSelf: 'flex-end',
                    backgroundColor: colors.userChatBubble,
                    padding: 16,
                    marginVertical: 4,
                    marginHorizontal: 12,
                    minWidth: 220,
                    maxWidth: 300,
                    borderBottomLeftRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                }}
            >
                <Text
                    style={{
                        fontFamily: 'NotoSans',
                        fontSize: 14,
                        fontWeight: '400',
                        color: colors.backgroundWhite,
                    }}>
                    {props.chatMessage.message}
                </Text>
            </View>
            </>
        } else {
            return (
                <>
                    <View style={{
                        alignSelf: 'flex-start',
                        backgroundColor: colors.merchantChatBubble,
                        padding: 16,
                        marginVertical: 4,
                        marginHorizontal: 12,
                        minWidth: 220,
                        maxWidth: 300,
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        borderTopRightRadius: 10,
                    }}>
                        <Text
                            style={{
                                fontFamily: 'NotoSans',
                                fontSize: 14,
                                fontWeight: '400',
                                color: colors.primaryTextColor,
                            }}>
                            {props.chatMessage.message}
                        </Text>
                    </View>
                </>
            )
        }
    }

    const _renderMediaMessage = () => {
        let _payload = props.chatMessage?.payload;
        const filePath = props.chatMessage?.fileLocalPath;
        const imageUrl = filePath ?? _payload?.documentUrl;

        if (_payload?.mimeType?.indexOf('image') >= 0) {
            return (
                <>
                    <TouchableOpacity
                        style={
                            props.chatMessage?.messageByUser ? {
                                alignSelf: 'flex-end',
                                backgroundColor: colors.userChatBubble,
                                padding: 4,
                                marginVertical: 4,
                                marginHorizontal: 12,
                                maxWidth: 300,
                                borderBottomLeftRadius: 10,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                            } : {
                                alignSelf: 'flex-start',
                                backgroundColor: colors.merchantChatBubble,
                                padding: 4,
                                marginVertical: 4,
                                marginHorizontal: 12,
                                maxWidth: 300,
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10,
                                borderTopRightRadius: 10,
                            }
                        }
                        ref={ref => {bubbleRef.current = ref}}
                        onLongPress={(event) => {
                            if (bubbleRef.current) {
                                bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
                                    props?.onLongPress?.(pageX, pageY, height, width, event, event);
                                });
                            }
                        }}
                        onPress={() => {
                            if (imageUrl) {
                                props.navigation.push('ISImageViewer', {
                                    imageUrl: _payload?.documentUrl
                                });
                            }
                        }}
                        activeOpacity={0.8}
                    >
                        <View style={{
                            width: 200,
                            height: 180,
                            borderBottomLeftRadius: 10,
                            borderTopLeftRadius: props.chatMessage?.messageByUser ? 24 : 0,
                            borderTopRightRadius: 10,
                            borderBottomRightRadius: props.chatMessage?.messageByUser ? 0 : 24,
                            backgroundColor: '#E5E5E5',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                        }}>
                            {imageLoadingRef.current && !imageErrorRef.current && (
                                <View style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 1,
                                }}>
                                    <ActivityIndicator size="small" color={colors.primaryTextColor} />
                                </View>
                            )}
                            {imageUrl && !imageErrorRef.current ? (
                                <Image 
                                    key={`image-${props.chatMessage?._id}-${imageUrl}`}
                                    resizeMode='cover' 
                                    style={{
                                        width: 200,
                                        height: 180,
                                        borderBottomLeftRadius: 10,
                                        borderTopLeftRadius: props.chatMessage?.messageByUser ? 24 : 0,
                                        borderTopRightRadius: 10,
                                        borderBottomRightRadius: props.chatMessage?.messageByUser ? 0 : 24,
                                    }} 
                                    source={{uri: imageUrl}}
                                    onLoadStart={() => {
                                        imageLoadingRef.current = true;
                                        imageErrorRef.current = false;
                                        triggerUpdate();
                                    }}
                                    onLoad={() => {
                                        imageLoadingRef.current = false;
                                        imageErrorRef.current = false;
                                        triggerUpdate();
                                    }}
                                    onError={() => {
                                        imageLoadingRef.current = false;
                                        imageErrorRef.current = true;
                                        triggerUpdate();
                                    }}
                                />
                            ) : (
                                <View style={{
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <IonIcon name={'image-outline'} style={{
                                        fontSize: 32,
                                        color: colors.textGrey,
                                    }}/>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    {props.chatMessage.message !== 'MEDIA' && _renderTextMessage()}
                </>
            )
        }
    }

    const _renderVideoMessage = () => {
        let _payload = props.chatMessage?.payload;
        const videoUrl = _payload?.documentUrl;
        
        if (!videoUrl) {
            return null;
        }

        return (
            <>
                <TouchableOpacity
                    style={
                        props.chatMessage?.messageByUser ? {
                            alignSelf: 'flex-end',
                            backgroundColor: colors.userChatBubble,
                            padding: 6,
                            marginVertical: 4,
                            marginHorizontal: 12,
                            minWidth: 220,
                            maxWidth: 300,
                            borderBottomLeftRadius: 10,
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            justifyContent: 'center',
                            alignItems: 'center'
                        } : {
                            alignSelf: 'flex-start',
                            backgroundColor: colors.merchantChatBubble,
                            padding: 6,
                            marginVertical: 4,
                            marginHorizontal: 12,
                            minWidth: 220,
                            maxWidth: 300,
                            borderBottomLeftRadius: 10,
                            borderBottomRightRadius: 10,
                            borderTopRightRadius: 10,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }
                    }
                    ref={ref => {bubbleRef.current = ref}}
                    onLongPress={(event) => {
                        if (bubbleRef.current) {
                            bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
                                props?.onLongPress?.(pageX, pageY, height, width, event, event);
                            });
                        }
                    }}
                    onPress={() => {
                        try {
                            if (props.navigation && videoUrl) {
                                props.navigation.push("ISVideoViewer", {
                                    videourl: videoUrl
                                });
                            } else if (videoUrl) {
                                // Fallback to opening URL if navigation is not available
                                Linking.openURL(videoUrl).catch(err => {
                                    console.error('Failed to open video URL:', err);
                                });
                            }
                        } catch (error) {
                            console.error('Error opening video:', error);
                            // Fallback to opening URL
                            if (videoUrl) {
                                Linking.openURL(videoUrl).catch(err => {
                                    console.error('Failed to open video URL:', err);
                                });
                            }
                        }
                    }}
                    activeOpacity={0.8}
                >
                    <View style={{
                        width: 220,
                        height: 160,
                        borderTopRightRadius: 20,
                        borderTopLeftRadius: props.chatMessage?.messageByUser ? 20 : 0,
                        borderBottomRightRadius: props.chatMessage?.messageByUser ? 0 : 20,
                        borderBottomLeftRadius: 20,
                        backgroundColor: '#000000',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                    }}>
                        {videoLoadingRef.current && !videoErrorRef.current && (
                            <View style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 1,
                            }}>
                                <ActivityIndicator size="small" color="white" />
                            </View>
                        )}
                        {!videoErrorRef.current ? (
                            <Video
                                key={`video-${props.chatMessage?._id}-${videoUrl}`}
                                source={{uri: videoUrl}}
                                playInBackground={false}
                                playWhenInactive={false}
                                ref={player}
                                paused={true}
                                resizeMode={'cover'}
                                onLoad={() => {
                                    videoLoadingRef.current = false;
                                    videoErrorRef.current = false;
                                    triggerUpdate();
                                    try {
                                        if (player?.current) {
                                            player.current.seek(0); // this will set first frame of video as thumbnail
                                        }
                                    } catch (error) {
                                        console.error('Error seeking video:', error);
                                    }
                                }}
                                onError={(error) => {
                                    console.error('Video load error:', error);
                                    videoLoadingRef.current = false;
                                    videoErrorRef.current = true;
                                    triggerUpdate();
                                }}
                                onLoadStart={() => {
                                    videoLoadingRef.current = true;
                                    videoErrorRef.current = false;
                                    triggerUpdate();
                                }}
                                style={{
                                    width: 220,
                                    height: 160,
                                    borderTopRightRadius: 20,
                                    borderTopLeftRadius: props.chatMessage?.messageByUser ? 20 : 0,
                                    borderBottomRightRadius: props.chatMessage?.messageByUser ? 0 : 20,
                                    borderBottomLeftRadius: 20,
                                    backgroundColor: '#000000',
                                }}
                            />
                        ) : (
                            <View style={{
                                width: '100%',
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <IonIcon name={'videocam-outline'} style={{
                                    fontSize: 32,
                                    color: 'white',
                                }}/>
                            </View>
                        )}
                        {!videoErrorRef.current && (
                            <View style={{
                                height: 60,
                                width: 60,
                                position: 'absolute',
                                borderRadius: 120,
                                alignSelf: 'center',
                                backgroundColor: '#000000cc',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 2,
                            }}>
                                <IonIcon name={'play'} style={{
                                    color: 'white',
                                    marginLeft: 4,
                                    fontSize: 36,
                                }}/>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                {props.chatMessage.message !== 'MEDIA' && _renderTextMessage()}
            </>
        )
    }

    const _renderAudioMessage = () => {
        let _payload = props.chatMessage?.payload;
        return (
            <>
                <View style={
                    props.chatMessage?.messageByUser ? {
                        alignSelf: 'flex-end',
                        backgroundColor: colors.userChatBubble,
                        padding: 16,
                        marginVertical: 4,
                        marginHorizontal: 12,
                        minWidth: 220,
                        maxWidth: 300,
                        borderBottomLeftRadius: 10,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                    } : {
                        alignSelf: 'flex-start',
                        backgroundColor: colors.merchantChatBubble,
                        padding: 16,
                        marginVertical: 4,
                        marginHorizontal: 12,
                        minWidth: 220,
                        maxWidth: 300,
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        borderTopRightRadius: 10,
                    }
                }>
                    <ISAudioPlayerV2 
                        ref={ref => { bubbleRef.current = ref}}
                        onLongPress={(event) => {
                            bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
                                props?.onLongPress?.(pageX, pageY, height, width, event);
                            })
                        }}
                        isFromUser={props.chatMessage?.messageByUser} 
                        documentName={_payload?.documentName}
                        documentUrl={_payload?.documentUrl}
                    />
                </View>
                {props.chatMessage.message !== 'MEDIA' && _renderTextMessage()}
            </>
        )
    }

    const _renderDocumentMessage = () => {
        let _payload = props.chatMessage?.payload;
        return (
            <View style={{
                alignSelf: props.chatMessage?.messageByUser ? 'flex-end' : 'flex-start',
            }}>
                <View
                style={
                    props.chatMessage?.messageByUser ? {
                        alignSelf: 'flex-end',
                        backgroundColor: colors.userChatBubble,
                        padding: 4,
                        marginVertical: 4,
                        marginHorizontal: 12,
                        minWidth: 240,
                        maxWidth: 320,
                        borderBottomLeftRadius: 10,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                    } : {
                        alignSelf: 'flex-start',
                        backgroundColor: colors.merchantChatBubble,
                        marginVertical: 4,
                        marginHorizontal: 12,
                        minWidth: 240,
                        maxWidth: 320,
                        padding: 4,
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        borderTopRightRadius: 10,
                    }
                }>
                    <ISDocumentDownloader 
                        ref={ref => { bubbleRef.current = ref}}
                        onLongPress={(event) => {
                            bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
                            props?.onLongPress?.(pageX, pageY, height, width, event);
                            })
                        }}
                        isMessageByUser={props.chatMessage?.messageByUser}
                        color={props.chatMessage?.messageByUser ? 'white' : colors.primaryTextColor}
                        documentUrl={_payload?.documentUrl}
                        documentName={_payload?.documentName}
                    />
                </View>

            </View>
        )
    }

    const _renderTime = () => {
        return <Text
            style={{
                marginTop: 4,
                fontSize: 10,
                fontFamily: 'NotoSans',
                textAlign: props.chatMessage?.messageByUser ? 'right' : 'left',
                color: props.chatMessage?.messageByUser ? colors.textColorGray : colors.textGrey,
                marginRight: props.chatMessage?.messageByUser ? 16 : 0
            }}>
            {moment(props.chatMessage?.createdAt)
                .tz(_timeZone)
                .format('DD/MM, hh:mm A   ')}
            {props.chatMessage?.isSentToServer === false && <FAIcon style={{}} name={"clock-o"}/>}
        </Text>
    }

    const _renderCarouselItems = () => {
        let _items = Object.assign([], props.chatMessage?.payload?.items);
        if (_items.length > 0) {
            return <ScrollView horizontal
                            keyboardShouldPersistTaps='always'
                               contentContainerStyle={{flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8}}>
                {_items.map((carouselItem, index) => {
                    return (
                        <CarouselItem index={index} carouselItem={carouselItem}></CarouselItem>
                    )
                })}
            </ScrollView>
        }
    }

    const _renderCarouselMessage = () => {
        return (
            <>
                <View style={{paddingBottom: 16}}>
                    <View style={props.chatMessage?.messageByUser ? {
                        alignSelf: 'flex-end',
                        backgroundColor: colors.userChatBubble,
                        padding: 16,
                        marginVertical: 4,
                        marginHorizontal: 12,
                        minWidth: 220,
                        maxWidth: 300,
                        borderBottomLeftRadius: 10,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                    } : {
                        alignSelf: 'flex-start',
                        backgroundColor: colors.merchantChatBubble,
                        padding: 16,
                        marginVertical: 4,
                        marginHorizontal: 12,
                        minWidth: 220,
                        maxWidth: 300,
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        borderTopRightRadius: 10,
                    }}>
                        <Text
                            style={{
                                fontFamily: 'NotoSans',
                                fontSize: 14,
                                fontWeight: '400',
                                color: props.chatMessage?.messageByUser ? colors.backgroundWhite : colors.primaryTextColor,
                            }}>{props.chatMessage?.message}</Text>
                    </View>
                    {/* <View style={{ marginTop: 8, paddingLeft: 10 }}>
            {_renderTime()}
          </View> */}
                    {_renderCarouselItems()}
                </View>
            </>
        )
    }

    const _renderChartInside = () => {
        let _payload = props.chatMessage?.payload;
        if (_payload.chartType == CHART_TYPES.PIE) {
            return (
                <PieChartItem
                    chatMessage={props.chatMessage}
                    chartData={_payload?.chartData}
                ></PieChartItem>
            )
        } else if (_payload.chartType == CHART_TYPES.BAR) {
            return (
                <BarChartItem
                    chatMessage={props.chatMessage}
                    chartData={_payload?.chartData}
                ></BarChartItem>
            )
        } else if (_payload.chartType == CHART_TYPES.LINE) {
            return (
                <LineChartItem
                    chatMessage={props.chatMessage}
                    chartData={_payload?.chartData}
                ></LineChartItem>
            )
        }
    }

    const _renderChartItem = () => {
        return (
            <>
                <View style={props.chatMessage?.messageByUser ? {
                    alignSelf: 'flex-end',
                    backgroundColor: colors.userChatBubble,
                    padding: 16,
                    marginVertical: 4,
                    marginHorizontal: 12,
                    minWidth: 220,
                    maxWidth: 300,
                    borderBottomLeftRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                } : {
                    alignSelf: 'flex-start',
                    backgroundColor: colors.merchantChatBubble,
                    padding: 16,
                    marginVertical: 4,
                    marginHorizontal: 12,
                    minWidth: 220,
                    maxWidth: 300,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopRightRadius: 10,
                }}>
                    <Text style={{
                        fontStyle: 'normal',
                        fontSize: 16,
                        fontWeight: "700",
                        color: colors.actionTextColor
                    }}>Analysis Chart</Text>
                    {_renderChartInside()}
                </View>
            </>
        )
    }

    const _renderViewListButton = () => {
        return (
            <TouchableOpacity
                onPress={() => {
                    //TODO: Open the bottom sheet for selecting the list item
                    setDisplayListSheet(true);
                }}
            >
                <View
                    style={{
                        height: 50,
                        width: '100%',
                        justifyContent: 'center',
                        minWidth: 220,
                        alignItems: 'center',
                        backgroundColor: colors.userChatBubble,
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20,
                        flexDirection: 'row'
                    }}
                >
                    <IonIcon
                        name='list-outline'
                        style={{color: colors.inputBackGrey, fontSize: 18}}
                    />
                    <Text style={{
                        marginLeft: 8,
                        color: colors.inputBackGrey,
                        fontWeight: '400',
                        fontSize: 14
                    }}>List Button</Text>
                </View>
            </TouchableOpacity>
        )
    }

    const _renderListItem = () => {
        return (
            <View style={props.chatMessage?.messageByUser ? {
                alignSelf: 'flex-end',
                backgroundColor: colors.userChatBubble,
                marginVertical: 4,
                marginHorizontal: 12,
                minWidth: 220,
                maxWidth: 300,
                borderBottomLeftRadius: 10,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                maxHeight: 250,
            } : {
                alignSelf: 'flex-start',
                backgroundColor: colors.merchantChatBubble,
                marginVertical: 4,
                marginHorizontal: 12,
                minWidth: 300,
                maxWidth: 300,
                maxHeight: 300,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                borderTopRightRadius: 10,
            }}>
                <View style={{padding: 16}}>
                    <Text
                        style={{
                            fontFamily: 'NotoSans',
                            fontSize: 14,
                            fontWeight: '400',
                            color: props.chatMessage?.messageByUser ? colors.backgroundWhite : colors.primaryTextColor,
                        }}>{props.chatMessage?.message}</Text>
                    {/* {_renderTime()} */}
                </View>
                {_renderViewListButton()}
            </View>
        )
    }

    function renderFormMessage() {
        const payload = props.chatMessage?.payload;
        return (
            <>
                <View style={{
                    alignSelf: 'flex-start',
                    backgroundColor: colors.merchantChatBubble,
                    padding: 16,
                    marginTop: 4,
                    marginHorizontal: 12,
                    minWidth: 220,
                    borderTopRightRadius: 24,
                    maxWidth: 300,
                }}>
                    <Text style={{
                        fontFamily: 'NotoSans',
                        fontSize: 14,
                        fontWeight: '400',
                        color: colors.primaryTextColor,
                    }}>
                        {props.chatMessage.message}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        props.navigation.navigate('ChatForm', {
                            payload,
                            integrationId: props.integrationItem._id,
                            messageId: props.chatMessage._id,
                            chatRoomId: props.chatMessage.chatRoom
                        })
                    }}
                    style={{
                        backgroundColor: '#339AF0',
                        minHeight: 44,
                        marginHorizontal: 12,
                        marginBottom: 4,
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <Text
                        style={{
                            fontSize: 15,
                            fontWeight: '400',
                            color: colors.textWhite,
                        }}
                    >{payload?.buttonTitle ?? ''}</Text>
                </TouchableOpacity>
            </>
        )
    }

    const _renderMessage = () => {
        switch (props.chatMessage.type) {
            case 'TEXT':
                return _renderTextMessage();
            case 'IMAGE':
                return _renderMediaMessage();
            case 'VIDEO':
                return _renderVideoMessage();
            case 'AUDIO':
                return _renderAudioMessage();
            case 'DOCUMENT':
                return _renderDocumentMessage();
            case 'CAROUSEL':
                return _renderCarouselMessage();
            case 'CHART':
                return _renderChartItem();
            case 'LIST':
                return _renderListItem();
            case 'FORM':
                return renderFormMessage();
            // return <ChartItem></ChartItem>
        }
    }

    function isAnyActionItemSelected(messageActions) {
        let result = false;
        messageActions?.forEach?.(item => {
            if (item.isSelected) {
                result = true
            }
        })
        return result;
    }

    const _renderQuickActions = () => {
        let _actions = props.chatMessage?.messageActions;
        const isActionSelected = isAnyActionItemSelected(props.chatMessage?.messageActions);
        if (_actions?.length) {
            const screenWidth = Dimensions.get('window').width;
            // Calculate available width: screen width - left margin (24) - right margin (12)
            const availableWidth = screenWidth - 24 - 12;
            const maxContainerWidth = Math.min(380, availableWidth);
            const isSmallScreen = screenWidth < 375;
            
            return (
                <View style={{
                    maxWidth: maxContainerWidth,
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                    marginLeft: 24,
                    marginRight: 12,
                    marginBottom: 4,
                    alignSelf: 'flex-start'
                }}>
                    {
                        _actions.map((actionItem, index) => {
                            return (
                                <TouchableOpacity 
                                    key={index}
                                    activeOpacity={isActionSelected ? 1 : 0.2} 
                                    onPress={() => {
                                        if (props.onQuickActionPress && !isActionSelected) {
                                            actionItem.isSelected = true;
                                            props.onQuickActionPress(actionItem);
                                        }
                                    }}
                                    style={{
                                        marginLeft: index === 0 ? 0 : 8,
                                        marginTop: 8,
                                        flexShrink: 1,
                                        flexGrow: 0
                                    }}
                                >
                                    <View style={{
                                        backgroundColor: actionItem.isSelected ? '#2355C4' : 'white',
                                        paddingHorizontal: isSmallScreen ? 12 : 16,
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        borderColor: '#2355C4',
                                        borderWidth: 1,
                                        minWidth: isSmallScreen ? 50 : 60
                                    }}>
                                        <Text 
                                            numberOfLines={2}
                                            ellipsizeMode="tail"
                                            style={{
                                                color: actionItem.isSelected ? 'white' : '#2355C4',
                                                fontSize: isSmallScreen ? 12 : 14,
                                                fontWeight: "400",
                                                fontStyle: 'normal',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {actionItem?.title}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            )
        }
        return null;
    }

    const _isListMessage = () => {
        return props.chatMessage.type == 'LIST';
    }

    if (props.chatMessage.messageByUser) {
        return (
            <TouchableOpacity ref={ref => {
                bubbleRef.current = ref
            }} style={{flexDirection: 'row', paddingLeft: 4, width: '100%', justifyContent: 'flex-end'}}
                              activeOpacity={0.7} onLongPress={(event) => {
                bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
                    props?.onLongPress?.(pageX, pageY, height, width, event, event);
                })
            }}>
                <View style={{
                    alignSelf: 'flex-end',
                }}>
                    <View style={{display: 'flex', flex: 1}}>
                        {_renderMessage()}
                        <View style={{marginLeft: 38, marginTop: 4, marginBottom: 16}}>
                            {_renderTime()}
                        </View>
                    </View>
                    {props.hasNote &&
                        <View
                            style={[{
                                height: 24,
                                width: 24,
                                backgroundColor: '#FFC93E',
                                borderRadius: 60,
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                bottom: 24
                            }, props.chatMessage?.messageByUser ? {
                                left: 30,
                            } : {
                                right: 20,
                            }]}
                        >
                            <FAIcon name={'sticky-note'} style={{fontSize: 12, color: 'white'}}/>
                        </View>}
                    {props.hasBookmark &&
                        <View
                            style={[{
                                height: 24,
                                width: 24,
                                backgroundColor: '#FF3E3E',
                                borderRadius: 60,
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                bottom: 24
                            }, props.chatMessage?.messageByUser ? {
                                left: 70,
                            } : {
                                right: 20,
                            }]}
                        >
                            <FAIcon name={'bookmark'} style={{fontSize: 12, color: 'white'}}/>
                        </View>}
                </View>
            </TouchableOpacity>
        );
    } else {
        return (
            <>
                <View onTouchStart={(e) => {
                    console.log('touchMove', e.nativeEvent)
                }}>
                    <TouchableOpacity ref={ref => {
                        bubbleRef.current = ref
                    }} style={{flexDirection: 'row', paddingLeft: 4,}} activeOpacity={0.7} onLongPress={(event) => {
                        bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
                            props?.onLongPress?.(pageX, pageY, height, width, event);
                        })
                    }}>
                        <Image
                            source={{uri: props.integrationItem.logo}}
                            style={{height: 25, width: 25, borderRadius: 20,}}
                        />
                        <View style={{marginLeft: -6}}>
                            {_renderMessage()}
                            {props.hasNote &&
                                <View
                                    style={{
                                        height: 24,
                                        width: 24,
                                        backgroundColor: '#FFC93E',
                                        borderRadius: 60,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        position: 'absolute',
                                        right: 20,
                                        bottom: -10
                                    }}
                                >
                                    <FAIcon name={'sticky-note'} style={{fontSize: 12, color: 'white'}}/>
                                </View>}
                            {props.hasBookmark &&
                                <View
                                    style={{
                                        height: 24,
                                        width: 24,
                                        backgroundColor: '#FF3E3E',
                                        borderRadius: 60,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        position: 'absolute',
                                        right: 50,
                                        bottom: -10
                                    }}
                                >
                                    <FAIcon name={'bookmark'} style={{fontSize: 12, color: 'white'}}/>
                                </View>}
                        </View>
                    </TouchableOpacity>
                </View>
                {_renderQuickActions()}
                <View style={{marginLeft: 38, marginTop: 4, marginBottom: 16}}>
                    {_renderTime()}
                </View>
                {displayListSheet && _isListMessage && <ListSheetItem
                    payload={props.chatMessage?.payload}
                    onClose={() => {
                        setDisplayListSheet(false);
                    }}
                    onItemsSelected={(itemList) => {
                        //TODO: send the message to the integration
                        console.log(`The item list`);
                        console.log(itemList);
                        const message = itemList.join('\n');
                        setDisplayListSheet(false);
                        props.onListItemSendMessage(message);
                    }}
                    chatMessage={props.chatMessage?.message}
                    listType={props.chatMessage?.payload?.listType ?? 'RADIO'}
                ></ListSheetItem>}
            </>
        );
    }
}

export default ChatBubble;
