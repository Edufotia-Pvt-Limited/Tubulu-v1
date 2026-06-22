import React, {Component} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native'
import RBSheet from 'react-native-raw-bottom-sheet';
import PropTypes from 'prop-types';
import {deviceHeight} from '../Utils/Constants';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {colors} from '../Utils/Colors'
import {FormCheckBox, FormRadio} from "./ChatForm";

function ListItem(props) {
    let _listItem = Object.assign({}, props.listItem);
    return (
        <View style={{
            flexDirection: 'row',

        }}>
            <Text>{_listItem.title}</Text>

        </View>
    )
}

ListItem.propTypes = {
    listItem: PropTypes.object.isRequired
}

class ListSheetItem extends Component {

    sheetRef = React.createRef(null);

    constructor(props) {
        super(props);
        this.state = {
            selectedValues: []
        }
    }

    componentDidMount() {
        this.sheetRef.open();
    }

    checkItemSelected = (item) => {
        return this.state.selectedValues.includes(item);
    }

    onItemSelected = (item) => {
        const existingValues = [...this.state.selectedValues];
        if (existingValues.includes(item)) {
            const existingIndex = existingValues.findIndex(existingItem => {
                if (item === existingItem) {
                    return 1;
                }
                return 0;
            });
            existingValues.splice(existingIndex, 1);
            this.setState({
                selectedValues: existingValues,
            });
            return;
        }
        if (this.props.listType === 'RADIO') {
            this.setState({
                selectedValues: [item]
            })
        } else {
            this.setState({
                selectedValues: [...this.state.selectedValues, item],
            })
        }
    }

    renderListData = () => {
        let _listData = Object.assign([], this.props.payload?.listData);
        return (
            <View
                style={{marginTop: 16}}
            >
                <ScrollView>
                    {_listData.map(listItem => {
                        return (
                            <View style={{
                                paddingTop: 16,
                                paddingLeft: 16,
                                paddingRight: 16,
                            }}>
                                <View style={{flexDirection: 'row'}}>
                                    {
                                        this.props.listType === 'RADIO' && <FormRadio
                                            onPress={() => {
                                                this.onItemSelected(listItem.title)
                                            }}
                                            title={''}
                                            checked={this.checkItemSelected(listItem.title)}
                                        />
                                    }
                                    {
                                        this.props.listType === 'CHECKBOX' && <FormCheckBox
                                            onPress={() => this.onItemSelected(listItem.title)}
                                            title={''}
                                            checked={this.checkItemSelected(listItem.title)}
                                        />
                                    }
                                    <Text style={{
                                        fontWeight: '400',
                                        fontSize: 14,
                                        color: colors.actionTextColor
                                    }}>{listItem.title}</Text>
                                </View>
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }

    _renderSheetTitle = () => {
        return (
            <View style={{
                flexDirection: 'row',
                paddingLeft: 16,
                paddingTop: 16,
                paddingRight: 16,
            }}>
                <View style={{flex: 10}}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '400',
                        fontStyle: 'normal',
                        color: colors.actionTextColor,
                        width: '100%',
                        textAlign: 'center'
                    }}>{'Select the option'}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        if (this.props.onClose) {
                            this.props.onClose();
                        }
                    }}
                    style={{position: 'absolute', left: 12, top: 12}}>
                    <IonIcon style={{
                        fontSize: 28,

                    }} name='close'></IonIcon>
                </TouchableOpacity>
            </View>
        )
    }

    renderSelectButton = () => {
        return (
            <TouchableOpacity
                onPress={() => {
                    this.props.onItemsSelected(this.state.selectedValues)
                }}
                style={{
                    backgroundColor: '#2355C4',
                    height: 48,
                    marginTop: 16,
                    marginHorizontal: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid transparent',
                    borderRadius: 24,
                }}>
                <Text style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: 17,
                }}>Select</Text>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <RBSheet
                height={deviceHeight / 1.3}
                closeOnDragDown
                ref={e => this.sheetRef = e}
                onClose={() => {
                    if (this.props.onClose) {
                        this.props.onClose();
                    }
                }}
            >
                <View>
                    {this._renderSheetTitle()}
                    {this.renderListData()}
                    {this.renderSelectButton()}
                </View>
            </RBSheet>
        )
    }
}

ListSheetItem.propTypes = {
    onClose: PropTypes.func.isRequired,
    payload: PropTypes.object.isRequired,
    chatMessage: PropTypes.string.isRequired
}

export default ListSheetItem;
