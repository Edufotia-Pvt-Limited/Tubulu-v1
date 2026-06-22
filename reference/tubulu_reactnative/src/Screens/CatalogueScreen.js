/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Image,
    ScrollView,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Animated, Easing } from "react-native";
import { addToCart, fetchCart } from "../Store/cart.store/cart.thunks";
import CatalogueScreenHeader from '../Components/CatalogueComponents/CatalogueScreenHeader';
import CatalogueChip from '../Components/CatalogueComponents/CatalogueChip';
import ProductCard from '../Components/CatalogueComponents/ProductCard';
import CatalogueFilterModal from '../Components/CatalogueComponents/CatalogueFilterModal';
import { getCatalogueByIntegrationId, getFoodTypes } from '../Utils/ApiActions';
import CartBanner from '../Components/CatalogueComponents/ CartBanner'
import OfferRow from '../Components/CatalogueComponents/OffersRow';
import OffersModal from '../Components/CatalogueComponents/OffersModal';
import CategoryTabs from '../Components/CatalogueComponents/CategoryTabs';
import ProductListCard from '../Components/CatalogueComponents/ProductListCard';
import ViewToggle from '../Components/CatalogueComponents/ViewToggle';
import { getProductView, saveProductView } from '../Utils/ProductViewStorage';
import CategorySkeleton from '../Components/CatalogueComponents/CategorySkeleton';
import { filterCategories } from '../Utils/Constants'


const FullPageLoader = () => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#2355C4" />
    </View>
);


function CatalogueScreen(props) {

    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState(filterCategories);
    const [catalogData, setCatalogData] = useState([]);
    const [isBootLoading, setIsBootLoading] = useState(true);
    const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);
    const [searchProduct, setSearchProduct] = useState("")
    const [foodTypes, setFoodTypes] = useState([]);
    const [catalogId, setCatalogId] = useState("");
    const [newCatData, setNewCatData] = useState([]);
    const [integrationName, setIntegrationName] = useState("");
    const [selectedFiltersCount, setSelectedFiltersCount] = useState(0);
    const [selectedFoodTypes, setSelectedFoodTypes] = useState([]);
    const [offersModalVisible, setOffersModalVisible] = useState(false);
    const [categoryList, setCategoryList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isListView, setIsListView] = useState(false);

    const dispatch = useDispatch();

    const integrationId = props?.route?.params?.integrationItem?._id;
    const baseWidth = 375;
    const baseHeight = 130;
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const scaledHeight = (baseHeight / baseWidth) * screenWidth;
    const hasUserPreference = useRef(false);


    const totalCartQuantity = useSelector(state => {
        if (!integrationId || !catalogId) return 0;
        const key = `${integrationId}:${catalogId}`;
        return state.cartState.carts[key]?.totalQuantity ?? 0;
    });



    useEffect(() => {
        const timer = setTimeout(() => {
            setIsBootLoading(false);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    async function fetchProducts(filterQuery = "") {

        try {
            setIsSkeletonLoading(true);
            if (!integrationId) return;
            const response = await getCatalogueByIntegrationId(integrationId, searchProduct, filterQuery);
            const data = response.data;
            setCatalogId(data[0]?.catalogueId);
            console.log("catalogue data", data)
            setNewCatData(data);
            setIntegrationName(data[0]?.integrationName);


            if (Array.isArray(data[0]?.categoryNames) && data[0]?.categoryNames.length > 0) {
                setCategoryList(["All", ...data[0]?.categoryNames || []]);
            }

            if (Object.keys(data[0]?.products).length > 0) {
                const filteredData = normalizeCatalogData(data[0]?.products)

                setCatalogData(filteredData);

            } else {
                setCatalogData([]);

            }


        } catch (error) {
            console.error('Error fetching products:', error.message);
        } finally {
            setIsSkeletonLoading(false);
        }

    }




    function normalizeCatalogData(catalogdata) {
        return Object.entries(catalogdata).map(([category, catArr]) => {
            const categoryArr = Array.isArray(catArr) ? catArr : []

            return {
                category: category,
                subCategories: categoryArr?.map(subCat => (

                    {
                        name: subCat.subcategory || null,
                        products: subCat.items
                    }
                ))
            }
        })
    }



    const filteredProducts = useMemo(() => {
        if (!selectedCategory || selectedCategory === "All") {
            return catalogData;
        }
        return catalogData.filter(cat => cat.category === selectedCategory);
    }, [catalogData, selectedCategory]);


    const onSelectCategory = (category) => {

        setSelectedCategory(category);

    }


    useEffect(() => {

        if (!integrationId) return;
        const filterQuery = handleFilterQuery(filters, selectedFoodTypes);
        fetchProducts(filterQuery);

    }, [integrationId, searchProduct, filters, selectedFoodTypes]);


    useEffect(() => {
        props.navigation.setOptions({
            headerShown: false,
        });
    }, [props.integrationItem]);


    useEffect(() => {
        async function fetchFoodTypes() {
            try {
                if (!integrationId) return;
                const response = await getFoodTypes(integrationId);
                if (Array.isArray(response) && response.length && typeof response[0] === "string") {
                    setFoodTypes(response.map((t, i) => ({ id: i, name: t })));
                } else {
                    setFoodTypes([]);
                }
            } catch (err) {
                console.error("Error fetching food types: ", err);
            }
        }

        fetchFoodTypes()

    }, [])


    useEffect(() => {

        if (!integrationId || !catalogId) return;
        dispatch(fetchCart({ integrationId, catalogueId: catalogId }));
    }, [integrationId, catalogId, dispatch]);


    async function handleAddToCart(prodId) {
        try {

            await dispatch(addToCart({ integrationId, catalogueId: catalogId, productId: prodId })).unwrap();
        } catch (err) {
            console.error("Add to cart failed:", err);
            setSuccessCopiedMessage("Add to cart failed");
        }
    }



    const handleFilterQuery = (updatedFilters, foodTypes) => {
        const filterCategory = {};
        updatedFilters.forEach((category) => {
            const selectedOptions = category.options.find((opt) => opt.selected);
            if (!selectedOptions) return;

            if (category.id === "price") {
                filterCategory["pricerange"] = selectedOptions.id;
            }
            if (category.id === "discount") {
                filterCategory["discountrange"] = selectedOptions.id;
            }
        })

        const query = Object.keys(filterCategory).map(key => `${key}=${filterCategory[key]}`).join("&");
        let foodTypeQuery = ""
        if (foodTypes && foodTypes.length) {
            foodTypeQuery = foodTypes.map(ft => `foodType=${encodeURIComponent(ft.name)}`).join("&");
        }

        const combinedQuery = [query, foodTypeQuery].filter(Boolean).join("&");

        if (combinedQuery) {

            return combinedQuery;
        }

        return "";

    }

    const handleFiltersCount = (updatedFilters, foodTypes) => {
        let filterCount = 0;
        updatedFilters?.forEach((category) => {
            category?.options.forEach((option) => {
                if (option.selected) {
                    filterCount += 1;
                }
            })
        })

        filterCount += foodTypes?.length
        setSelectedFiltersCount(filterCount)
        // return filterCount
    }

    const toggleFoodTypeSelection = useCallback((food) => () => {
        handleFilterQuery(filters, [...selectedFoodTypes, food])
        setSelectedFoodTypes((prevSelected) => {
            let updatedFoodTypes = [];
            const isExist = prevSelected?.includes(food)
            if (isExist) {
                updatedFoodTypes = prevSelected.filter((f) => f.id !== food.id)
            } else {

                updatedFoodTypes = [...prevSelected, food]
            }

            handleFiltersCount(filters, updatedFoodTypes)
            return updatedFoodTypes
        })
    }, [filters])



    const removeFoodTypeSelection = (food) => () => {
        setSelectedFoodTypes((prevSelected) => {
            const foodTypesSelected = prevSelected.filter((f) => f.id !== food.id)
            handleFilterQuery(filters, foodTypesSelected)
            handleFiltersCount(filters, foodTypesSelected)
            return foodTypesSelected
        })
    }



    const handleViewCart = () => {
        props.navigation.navigate('CatalogCartScreen', {
            integrationId: props?.route?.params?.integrationItem?._id,
            catalogId: catalogId,
            integrationItem: props?.route?.params?.integrationItem,
            integrationName: integrationName
        });
    };


    useEffect(() => {
        getProductView().then(view => {
            if (view !== null) {
                setIsListView(view === 'list');
                hasUserPreference.current = true;
            }
        });
    }, []);



    useEffect(() => {
        if (!hasUserPreference.current && newCatData[0]?.length > 0) {
            setIsListView(newCatData[0]?.displayType === "List View");
        }
    }, [newCatData]);



    const handleViewChange = async (value) => {
        setIsListView(value); // true = list, false = grid
        hasUserPreference.current = true;
        saveProductView(value);
        //   await AsyncStorage.setItem(
        //     "PRODUCT_VIEW",
        //     value ? "list" : "grid"
        //   );
    };




    if (isBootLoading) {
        return <FullPageLoader />;
    }


    const CategoryBlock = ({ category }) => {
        return (
            <View style={{ marginBottom: 0 }}>
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: "700",
                        marginLeft: 15,
                        marginBottom: 8,
                        color: "#000"
                    }}
                >
                    {category.category}
                </Text>

                {category?.subCategories?.map((sub, i) => (
                    <SubCategoryBlock
                        key={i}
                        name={sub.name}
                        items={sub.products}
                    />
                ))}
            </View>
        );
    };


    const SubCategoryBlock = ({ name, items }) => {
        const [expanded, setExpanded] = useState(true);

        // Smooth arrow rotation
        const rotateAnim = useRef(new Animated.Value(0)).current;

        const toggleExpand = () => {
            Animated.timing(rotateAnim, {
                toValue: expanded ? 1 : 0,
                duration: 200,
                easing: Easing.linear,
                useNativeDriver: true
            }).start();

            setExpanded(!expanded);
        };

        const rotation = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "180deg"]
        });

        return (
            <View style={{ marginBottom: 20 }}>

                {/* Header */}
                {name && (
                    <TouchableOpacity
                        onPress={toggleExpand}
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingHorizontal: 15,
                            paddingVertical: 6,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "600",
                                color: "#7e7b7bff" // dim black
                            }}
                        >
                            {name}
                        </Text>

                        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                            <Ionicons name="chevron-down" size={18} color="#444" />
                        </Animated.View>
                    </TouchableOpacity>
                )}



                {expanded && (
                    <View
                        style={[
                            {
                                paddingBottom: 6,
                            },
                            !isListView && {
                                flexDirection: "row",
                                flexWrap: "wrap",
                                paddingHorizontal: 15,
                                gap: 12,
                            },
                        ]}
                    >
                        {items?.map((item) =>
                            isListView ? (
                                <View style={{ paddingHorizontal: 15, marginBottom: 12 }} key={item.productId}>
                                    <ProductListCard
                                        key={item.productId}
                                        product={{ ...item, integrationId, catalogueId: catalogId }}
                                        onPress={() => handleAddToCart(item.productId)}
                                    />
                                </View>
                            ) : (
                                <ProductCard
                                    key={item.productId}
                                    product={{ ...item, integrationId, catalogueId: catalogId }}
                                    onPress={() => handleAddToCart(item.productId)}
                                />
                            )
                        )}
                    </View>
                )}

            </View>
        );
    };




    return (

        <View style={{ flex: 1, backgroundColor: "white" }}>

            <CatalogueScreenHeader setSearchProduct={setSearchProduct} navigation={props.navigation} searchTitle={integrationName} />

            <FlatList

                data={filteredProducts}

                renderItem={({ item }) =>
                    isSkeletonLoading ? (
                        <CategorySkeleton isListView={isListView} />
                    ) : (
                        <CategoryBlock category={item} />
                    )
                }

                keyExtractor={(cat) => cat.category}


                contentContainerStyle={{
                    paddingBottom: 140,

                }}
                ListHeaderComponent={
                    <ScrollView>
                        <View
                        >
                            <View
                                style={{

                                    alignItems: 'center',
                                    position: "relative"
                                }}
                            >


                                {newCatData?.[0]?.advBannerUrl ? (
                                    <Image

                                        style={{
                                            height: scaledHeight,
                                            width: '100%',
                                            marginTop: -4,
                                        }}
                                        resizeMode="cover"
                                        source={{ uri: newCatData?.[0]?.advBannerUrl }}
                                        //   source={{ uri: bannerUrl }}
                                        onError={(e) =>
                                            console.log("Banner image failed:", e.nativeEvent.error)
                                        }
                                    />
                                ) : (
                                    <View
                                        style={{
                                            height: scaledHeight,
                                            width: '100%',
                                            marginTop: -4,
                                            backgroundColor: '#E0E0E0',
                                            borderRadius: 8,
                                        }}
                                    />



                                )}



                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: -47,
                                        right: 20,
                                    }}
                                >
                                    {newCatData[0]?.integrationLogo ? (
                                        <Image
                                            style={{
                                                height: 100,
                                                width: 100,
                                                borderWidth: 2,
                                                borderColor: 'white',
                                                borderRadius: 8,
                                            }}
                                            resizeMode="cover"
                                            source={{ uri: newCatData[0]?.integrationLogo }}
                                        />
                                    ) : (
                                        <View
                                            style={{
                                                height: 100,
                                                width: 100,
                                                backgroundColor: '#D5D5D5',
                                                borderRadius: 8,
                                                borderWidth: 2,
                                                borderColor: 'white',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: '#8A8A8A',
                                                    fontSize: 14,
                                                    fontWeight: '600',
                                                }}
                                            >
                                                LOGO
                                            </Text>
                                        </View>
                                    )}
                                </View>


                            </View>
                            <View style={{ marginTop: 8, gap: 12, borderRadius: 8, paddingRight: 15, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}>


                            </View>
                            <View style={{ marginTop: 0, paddingLeft: 15, paddingRight: 15, }}>
                                <View>
                                    <Text style={{
                                        fontFamily: 'Roboto',
                                        fontWeight: '700',
                                        fontSize: 20,
                                        color: "#171725",
                                    }}>{integrationName}</Text>

                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <View style={{ flexDirection: "row", alignItems: 'center', gap: 4, }}>
                                        <Image
                                            style={{
                                                height: 13,
                                                width: 14,

                                            }}

                                            source={require('../assets/star-icon.png')}
                                        />
                                        <Text style={{

                                            fontFamily: 'Roboto',
                                            fontWeight: '700',
                                            fontSize: 13,
                                            color: "#171725",
                                            fontStyle: "bold"
                                        }}>4.8</Text>

                                        <Image
                                            style={{
                                                height: 14,
                                                width: 2,
                                                marginLeft: 4,
                                                marginRight: 4,

                                            }}
                                            source={require('../assets/space.png')}
                                        />

                                        <Image
                                            style={{
                                                height: 14,
                                                width: 12,
                                                marginLeft: 4,
                                                marginRight: 4,
                                            }}
                                            source={require('../assets/order-icon.png')}
                                        />

                                        <Text
                                            style={{
                                                fontFamily: 'Roboto',
                                                fontWeight: '400',
                                                fontSize: 13,
                                                lineHeight: 18,
                                                marginTop: 2
                                            }}
                                        >
                                            {(newCatData?.[0]?.totalOrders ?? 0) === 0
                                                ? '0 Order'
                                                : (newCatData?.[0]?.totalOrders ?? 0) === 1
                                                    ? '1 Order'
                                                    : (newCatData?.[0]?.totalOrders ?? 0) > 99
                                                        ? '99+ Orders'
                                                        : `${newCatData?.[0]?.totalOrders - 1}+ Orders`}
                                        </Text>
                                    </View>
                                    <View style={{ marginTop: 8, flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: "row", alignItems: 'center', gap: 4, }}>
                                            <Image
                                                style={{
                                                    height: 9.33,
                                                    width: 13.33,

                                                }}

                                                source={require('../assets/delivery-icon.png')}
                                            />
                                            <Text style={{

                                                fontFamily: 'Roboto',
                                                fontWeight: '400',
                                                fontSize: 13,
                                                color: "#000000",
                                                fontStyle: "bold"
                                            }}>26.9 km</Text>

                                            <Image
                                                style={{
                                                    height: 14,
                                                    width: 2,
                                                    marginLeft: 4,
                                                    marginRight: 4,
                                                }}

                                                source={require('../assets/space.png')}
                                            />
                                            <Image
                                                style={{
                                                    height: 13.33,
                                                    width: 9.33,
                                                    marginLeft: 4,
                                                    marginRight: 4,
                                                    tintColor: '#AEAEB2',
                                                }}

                                                source={require('../assets/location-icon.png')}
                                            />
                                            <Text style={{
                                                fontFamily: 'Roboto',
                                                fontWeight: '400',
                                                fontStyle: 'normal',
                                                fontSize: 13,
                                                lineHeight: 18,
                                                letterSpacing: 0,
                                                color: "#000000"

                                            }}>
                                                Store Address
                                            </Text>

                                        </View>
                                        <View>

                                            <View
                                                style={{
                                                    borderRadius: 12,
                                                    backgroundColor: "#F2F2F7",
                                                    padding: 3,
                                                    width: 24,
                                                    height: 24,
                                                    // overflow: 'hidden',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >

                                                <Image
                                                    style={{
                                                        width: 13.33,
                                                    }}

                                                    resizeMode='contain'
                                                    source={require('../assets/info-icon.png')}

                                                />
                                            </View>
                                        </View>

                                    </View>
                                </View>
                            </View>
                        </View>
                        {newCatData[0]?.deals.length > 0 &&
                            <OfferRow
                                deals={newCatData[0]?.deals}
                                onOpen={() => setOffersModalVisible(true)}
                            />
                        }



                        <CategoryTabs
                            categories={categoryList}
                            selectedCategory={selectedCategory}
                            onSelect={onSelectCategory}
                        />


                        <View style={{ position: "relative" }}>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingHorizontal: 15,
                                    marginTop: 25,
                                    marginBottom: 20,
                                    gap: 10,
                                }}
                            >


                                <CatalogueChip
                                    label="Filters"
                                    leftElement={
                                        <Image
                                            source={require("../assets/filter-icon.png")}
                                            style={{ height: 15, width: 15, tintColor: "#000000" }}
                                            resizeMode="contain"
                                        />
                                    }
                                    onPress={() => setFilterModalVisible(true)}
                                    removeBtn={true}
                                    onRemove={() => {
                                        setSelectedFiltersCount(0)
                                        setFilters(filterCategories);
                                        fetchProducts('');
                                        setFilterModalVisible(false);
                                        setSelectedFoodTypes([]);
                                    }
                                    }
                                    selectedFiltersCount={selectedFiltersCount}
                                />
                                {foodTypes.length > 0 && foodTypes.map((food, i) => (
                                    <CatalogueChip
                                        key={i}
                                        label={food.name}
                                        onPress={toggleFoodTypeSelection(food)}
                                        selected={selectedFoodTypes.includes(food)}
                                        onRemove={removeFoodTypeSelection(food)}
                                        itemFilter={selectedFoodTypes.includes(food)}
                                    />
                                ))}

                            </ScrollView>


                        </View>

{ filteredProducts.length > 0 &&
                        <View style={{ alignItems: "flex-end", paddingHorizontal: 15, }}>
                            <ViewToggle
                                isListView={isListView}
                                // onChange={setIsListView}
                                onChange={handleViewChange}
                            />
                        </View>
                }

                    </ScrollView>
                }



                ListEmptyComponent={() => (
                    !isSkeletonLoading && (
                        <View style={{ alignItems: 'center', marginTop: 40, flex: 1, width: '100%' }}>
                            <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '600', color: "#888", fontFamily: 'Roboto' }}>
                                No products found
                            </Text>

                        </View>
                    )
                )}
            />

            <CatalogueFilterModal
                visible={isFilterModalVisible}
                filters={filters}
                onClose={() => setFilterModalVisible(false)}
                onApplyFilters={(updatedFilters) => {
                    handleFilterQuery(updatedFilters, selectedFoodTypes)
                    handleFiltersCount(updatedFilters, selectedFoodTypes)

                    setFilters(updatedFilters);
                    setFilterModalVisible(false);
                }}
                onRemoveFilters={(updatedFilters) => {
                    handleFilterQuery(updatedFilters, selectedFoodTypes)
                    setFilters(updatedFilters);
                    handleFiltersCount(updatedFilters, selectedFoodTypes)
                    setFilterModalVisible(false);
                }}
            />

            <CartBanner cartCount={totalCartQuantity} onViewCart={handleViewCart} />

            <OffersModal
                visible={offersModalVisible}
                onClose={() => setOffersModalVisible(false)}
                deals={newCatData[0]?.deals}
                storeName={newCatData[0]?.integrationName}
            />

        </View>


    );
}

export default CatalogueScreen;
