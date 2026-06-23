const { Cart, Integration, User, Customization, Catalogue, Product, Deal, UserDealUsage } = require('../Utils/Postgres');
const { sequelize } = require('../Utils/Postgres');
const { cartViewCdpEvent, addToCartCdpEvent } = require("../Utils/cdpHelper");



const createCartForCustomizedProductService = async (
  userId,
  integrationId,
  catalogueId,
  productId,
  quantity = 1,
  customizationId = null,
  selectedOptions = [],
  specialRequest = ''
) => {
  try {
    // 1️ Validate user
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    // 2️ Validate integration
    const integration = await Integration.findByPk(integrationId);
    if (!integration) throw new Error("Integration not found");

    const cdpAccessToken = integration.cdpAccessToken;

    // 3️ Validate catalogue
    const activeCatalogue = await Catalogue.findOne({
      where: {
        id: catalogueId.toString(),
        integrationId,
        isActive: true,
        isDeleted: false
      }
    });
    if (!activeCatalogue)
      throw new Error("Catalogue not found or inactive/deleted");

    // 4️ Validate product
    const productData = await Product.findOne({
      where: {
        id: productId.toString(),
        catalogueId: catalogueId.toString(),
        isActive: true,
        isDeleted: false
      }
    });

    if (!productData)
      throw new Error("Product not found in selected catalogue or inactive");


    // 4a️ Check stock before creating/adding to cart
    if (
      !productData.quantity ||
      productData.quantity <= 0 ||
      quantity > productData.quantity
    ) {
      throw new Error(
        "Insufficient stock")
    }



    // 5️ Validate customization (if provided)
    if (customizationId) {
      const customization = await Customization.findByPk(customizationId);
      if (!customization) throw new Error("Customization not found");


      for (const selectedOption of selectedOptions) {
        const option = customization.options.find(
          (o) => (o.id || o._id).toString() === selectedOption.optionId.toString()
        );


        if (!option)
          throw new Error(`Invalid option selected: ${selectedOption.optionId}`);

        for (const choiceId of selectedOption.selectedChoices) {
          const choice = option.choices.find(
            (c) => (c.id || c._id).toString() === choiceId.toString()
          );
          if (!choice)
            throw new Error(
              `Invalid choice selected: ${choiceId} for option ${option.name}`
            );
        }
      }
    }


    // 6️ Find or create cart
    let cart = await Cart.findOne({
      where: {
        userId,
        integrationId,
        catalogueId: catalogueId.toString(),
        isActive: true,
      }
    });

    if (!cart) {
      cart = await Cart.create({
        userId,
        integrationId,
        catalogueId: catalogueId.toString(),
        items: [],
        totalQuantity: 0,
      });
    }

    // 7️ Check if same product with same customization exists
    const cartItems = [...(cart.items || [])];
    const existingItem = cartItems.find(
      (item) =>
        item.productId.toString() === productId.toString() &&
        item.customizationId?.toString() === customizationId?.toString() &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );

    if (existingItem) {

      //  7a️ Validate total requested quantity doesn't exceed stock
      const newQuantity = (existingItem.quantity || 0) + quantity;

      if (newQuantity > productData.quantity) {
        throw new Error(
          `Cannot add ${quantity} more units. Only ${productData.quantity - existingItem.quantity
          } units left in stock.`
        );
      }

      existingItem.quantity = newQuantity;
    } else {
      if (
        !productData.quantity ||
        productData.quantity <= 0 ||
        quantity > productData.quantity
      ) {
        throw new Error("Insufficient stock");
      }


      cartItems.push({
        productId,
        customizationId,
        selectedOptions,
        quantity,
        specialRequest
      });
    }

    // 8️ Update total quantity
    const totalQuantity = cartItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
    
    await cart.update({ 
        items: cartItems,
        totalQuantity 
    });

    // 9️ CDP Events — only if CDP token and profile/session exist
    if (cdpAccessToken && cdpAccessToken.trim() !== "") {
      const existingDetail = (user.cdpDetails || []).find(
        (detail) =>
          detail.integration_id.toString() === integrationId.toString()
      );

      if (existingDetail?.cdpIDs?.profileId && existingDetail?.cdpIDs?.sessionId) {
        const { profileId, sessionId } = existingDetail.cdpIDs;

        // 9a️⃣ Send AddToCart event
        const productPayload = {
          productId: (productData.id || productData._id).toString(),
          productName: productData.name || "Unnamed Product",
          price: parseFloat((productData.discountPrice || productData.price || 0).toFixed(2)),
          quantity,
          category: productData.product_category || "",
          brand: integration.integrationName || "",
        };

        await addToCartCdpEvent(cdpAccessToken, {
          profileId,
          sessionId,
          product: productPayload,
        });

        // 9b️⃣ Send CartView event
        const cartItemsForCdp = cartItems.map((item) => {
          const product =
            activeCatalogue.products.find(
              (p) => (p.id || p._id).toString() === item.productId.toString()
            ) || {};
          return {
            productId: (product.id || product._id)?.toString() || "",
            productName: product.name || "Unnamed Product",
            price: (product.discountPrice || product.price || 0).toFixed(2),
            quantity: item.quantity,
            category: product.product_category || "",
          };
        });

        await cartViewCdpEvent(cdpAccessToken, { profileId, sessionId, cartItems: cartItemsForCdp });
      } else {
        console.warn("No CDP profile/session found — skipping CDP events.");
      }
    }

    return cart;
  } catch (error) {
    console.error("Service error:", error);
    throw error;
  }
};


const deleteCartItemService = async (userId, integrationId, catalogueId, productId) => {
  try {
    // Find active cart
    const cart = await Cart.findOne({ where: { userId, integrationId, catalogueId: catalogueId.toString(), isActive: true } });
    if (!cart) {
      throw new Error(" No active cart found for user ");
    }

    if (productId === "all") {
      await cart.destroy();
      return { message: "All products removed" };
    }



    // Find index of the product in items
    const cartItems = [...(cart.items || [])];
    const itemIndex = cartItems.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );



    if (itemIndex === -1) {
      throw new Error(`Product ${productId} not found in cart`);
    }

    // Remove the item
    cartItems.splice(itemIndex, 1);

    //  If no items left, delete the cart
    if (cartItems.length === 0) {
      await cart.destroy();
      return { message: "Cart deleted because it had no items left" };
    }

    //  Otherwise, recalculate totals
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    await cart.update({
        items: cartItems,
        totalQuantity
    });
    return cart;
  } catch (error) {
    console.error('DeleteCartItem Service error:', error);
    throw error;
  }
};


const increaseCartItemQuantityService = async (userId, integrationId, catalogueId, itemId, isItemId) => {
  try {
    // 1️ Validate user
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    // 2️ Validate integration
    const integration = await Integration.findByPk(integrationId);
    if (!integration) throw new Error("Integration not found");

    const cdpAccessToken = integration.cdpAccessToken;

    // 3️ Get the active cart
    const cart = await Cart.findOne({ where: { userId, integrationId, catalogueId: catalogueId.toString(), isActive: true } });
    if (!cart) throw new Error("No active cart found");

    // 4️ Find the item (by itemId or productId)
    const cartItems = [...(cart.items || [])];
    let item;
    if (isItemId) {
      item = cartItems.find(i => (i.id || i._id).toString() === itemId.toString());
    } else {
      item = cartItems.find(i => i.productId.toString() === itemId.toString());
    }
    if (!item) throw new Error(`Item not found in cart (isItemId: ${isItemId})`);

    // 5️ Verify catalogue and product
    const catalogue = await Catalogue.findOne({
      where: { id: catalogueId.toString(), integrationId, isActive: true, isDeleted: false }
    });
    if (!catalogue) throw new Error("Catalogue not found or inactive/deleted");

    const productData = await Product.findOne({
      where: { id: item.productId.toString(), catalogueId: catalogueId.toString(), isActive: true, isDeleted: false }
    });
    if (!productData) throw new Error("Product not found or inactive/deleted");

    // 6️ Ensure stock availability
    const availableToAdd = productData.quantity - item.quantity;
    if (availableToAdd <= 0) {
      throw new Error(
        `Cannot increase quantity. Only ${productData.quantity} unit(s) available for ${productData.name}`
      );
    }

    // 7️ Increase quantity
    item.quantity += 1;

    // 8️ Update total quantity
    const totalQuantity = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    await cart.update({
        items: cartItems,
        totalQuantity
    });

    // 9️ CDP Events — only if token and profile/session exist
    if (cdpAccessToken && cdpAccessToken.trim() !== "") {
      const existingDetail = (user.cdpDetails || []).find(
        (detail) => detail.integration_id.toString() === integrationId.toString()
      );

      if (existingDetail?.cdpIDs?.profileId && existingDetail?.cdpIDs?.sessionId) {
        const { profileId, sessionId } = existingDetail.cdpIDs;

        // 9a. Send AddToCart event for this specific product
        const productPayload = {
          productId: (productData.id || productData._id).toString(),
          productName: productData.name || "Unnamed Product",
          price: parseFloat((productData.discountPrice || productData.price || 0).toFixed(2)),
          quantity: 1,
          category: productData.product_category || "",
          brand: integration.integrationName || "",
        };


        await addToCartCdpEvent(cdpAccessToken, {
          profileId,
          sessionId,
          product: productPayload,
        });

        //  9b. Send CartView event for entire updated cart
        const cartItemsForCdp = cartItems.map((cartItem) => {
          const prod =
            catalogue.products.find(
              (p) => (p.id || p._id).toString() === cartItem.productId.toString()
            ) || {};

          return {
            productId: (prod.id || prod._id)?.toString() || "",
            productName: prod.name || "Unnamed Product",
            price: prod.discountPrice ? Number(prod.discountPrice).toFixed(2) : Number(prod.price || 0).toFixed(2),
            quantity: cartItem.quantity,
            category: prod.product_category || "",
          };
        });


        await cartViewCdpEvent(cdpAccessToken, { profileId, sessionId, cartItems: cartItemsForCdp });
      } else {
        console.warn("No CDP profile/session found — skipping CDP events.");
      }
    }

    return cart;
  } catch (error) {
    console.error("Increase Quantity Service error:", error);
    throw error;
  }
};


const decreaseCartItemQuantityService = async (userId, integrationId, catalogueId, itemId, isItemId) => {
  try {
    // 1️ Validate user
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    // 2️ Validate integration
    const integration = await Integration.findByPk(integrationId);
    if (!integration) throw new Error("Integration not found");

    const cdpAccessToken = integration.cdpAccessToken;

    // 3️ Get active cart
    const cart = await Cart.findOne({ where: { userId, integrationId, catalogueId: catalogueId.toString(), isActive: true } });
    if (!cart) throw new Error("No active cart found");

    // 4️ Find item (by itemId or productId)
    const cartItems = [...(cart.items || [])];
    let item;
    if (isItemId) {
      item = cartItems.find(i => (i.id || i._id).toString() === itemId.toString());
    } else {
      item = cartItems.find(i => i.productId.toString() === itemId.toString());
    }
    if (!item) throw new Error(`Item not found in cart (isItemId: ${isItemId})`);

    // 5️ Validate catalogue & product
    const catalogue = await Catalogue.findOne({
      where: { id: catalogueId.toString(), integrationId, isActive: true, isDeleted: false }
    });
    if (!catalogue) throw new Error("Catalogue not found or inactive/deleted");

    const productData = await Product.findOne({
      where: { id: item.productId.toString(), catalogueId: catalogueId.toString(), isActive: true, isDeleted: false }
    });
    if (!productData) throw new Error("Product not found or inactive/deleted");

    // 6 Handle quantity decrease or item removal
    if (item.quantity === 1) {
      // Remove item
      const itemIndex = cartItems.indexOf(item);
      cartItems.splice(itemIndex, 1);

      // If no items left, delete cart
      if (cartItems.length === 0) {
        await cart.destroy();

        // Send CDP 'cartView' event to show empty cart (optional)
        if (cdpAccessToken && cdpAccessToken.trim() !== "") {
          const existingDetail = (user.cdpDetails || []).find(
            (detail) => detail.integration_id.toString() === integrationId.toString()
          );
          if (existingDetail?.cdpIDs?.profileId && existingDetail?.cdpIDs?.sessionId) {
            const { profileId, sessionId } = existingDetail.cdpIDs;
            console.log("Sending empty CDP 'cartView' event...");
            await cartViewCdpEvent(cdpAccessToken, { profileId, sessionId, cartItems: [] });
          }
        }

        return { message: "Cart deleted because it had no items left" };
      }
    } else {
      // Otherwise just decrease quantity
      item.quantity -= 1;
    }

    // 7️ Update totals
    const totalQuantity = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    await cart.update({
        items: cartItems,
        totalQuantity
    });

    // 8 CDP Events — only if CDP token and profile/session exist
    if (cdpAccessToken && cdpAccessToken.trim() !== "") {
      const existingDetail = (user.cdpDetails || []).find(
        (detail) => detail.integration_id.toString() === integrationId.toString()
      );

      if (existingDetail?.cdpIDs?.profileId && existingDetail?.cdpIDs?.sessionId) {
        const { profileId, sessionId } = existingDetail.cdpIDs;

        // Send AddToCart event (but here we send quantity: -1 for clarity)
        const productPayload = {
          productId: (productData.id || productData._id).toString(),
          productName: productData.name || "Unnamed Product",
          price: parseFloat((productData.discountPrice || productData.price || 0).toFixed(2)),
          quantity: -1, // one item removed
          category: productData.product_category || "",
          brand: integration.integrationName || "",
        };


        await addToCartCdpEvent(cdpAccessToken, {
          profileId,
          sessionId,
          product: productPayload,
        });

        // Send CartView event with updated cart state
        const cartItemsForCdp = cartItems.map((cartItem) => {
          const prod =
            catalogue.products.find(
              (p) => (p.id || p._id).toString() === cartItem.productId.toString()
            ) || {};

          return {
            productId: (prod.id || prod._id)?.toString() || "",
            productName: prod.name || "Unnamed Product",
            price: prod.discountPrice ? Number(prod.discountPrice).toFixed(2) : Number(prod.price || 0).toFixed(2),
            quantity: cartItem.quantity,
            category: prod.product_category || "",
          };
        });


        await cartViewCdpEvent(cdpAccessToken, { profileId, sessionId, cartItems: cartItemsForCdp });
      } else {
        console.warn("No CDP profile/session found — skipping CDP events.");
      }
    }

    return cart;
  } catch (error) {
    console.error("Decrease Quantity Service error:", error);
    throw new Error(error.message || "Error decreasing item quantity");
  }
};


const getAllCartItemsService = async (userId, integrationId, catalogueId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const integration = await Integration.findByPk(integrationId);
    if (!integration) throw new Error("Integration not found");


    const activeCatalogue = await Catalogue.findOne({
      where: {
        id: catalogueId.toString(),
        integrationId,
        isActive: true,
        isDeleted: false
      },
      include: [
          {
              model: Product,
              as: 'products',
              where: { isDeleted: false },
              required: false
          }
      ]
    });

    if (!activeCatalogue)
      throw new Error("Catalogue not found in this integration");


    const deliveryType = activeCatalogue.deliveryType || [];


    const cart = await Cart.findOne({
      where: {
        userId,
        integrationId,
        catalogueId: catalogueId.toString(),
        isActive: true,
      }
    });

    if (!cart) {
      return {
        items: [],
        totalPrice: 0,
        cartId: "",
      };
    }

    // Build product map
    const productMap = {};
    for (const product of (activeCatalogue.products || [])) {
      if (!product.isActive || product.isDeleted) continue;

      const pId = (product.id || product._id).toString();
      productMap[pId] = {
        id: pId,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        imageUrls: product.imageUrls,
        sku: product.sku,
        product_category: product.product_category,
        product_subcategory: product.product_subcategory,
        foodType:
          typeof product.foodType === "string" && product.foodType.trim() === ""
            ? "Other"
            : product.foodType,

        quantity: product.quantity,
        discountPercentage: product.discountPercentage || 0,
        discountPrice:
          product.discountPrice != null
            ? Number(product.discountPrice).toFixed(2)
            : (product.price || 0).toFixed(2),
        cgst: product.cgst || 0,
        sgst: product.sgst || 0,
        otherTaxes: product.otherTaxes || 0,
        isActive: product.isActive,
        isDeleted: product.isDeleted,
        catalogueName: activeCatalogue.name,
      };
    }


    const enrichedItems = await Promise.all(
      (cart.items || []).map(async (item) => {
        console.log('DEBUG: processing cart item:', JSON.stringify(item));
        const product = productMap[item.productId.toString()];
        if (!product) {
          console.log('DEBUG: product not found in map for ID:', item.productId);
          return null;
        }
        console.log('DEBUG: found product:', product.name);

        const totalItemBasePrice = (product.price || 0) * (item.quantity || 1);

        let price = product.price;
        if (product.discountPercentage && product.discountPercentage > 0) {
          price = Number(product.discountPrice);
        }

        let total = price * item.quantity;
        let totalItemDiscountedPrice = total;


        // --- Extract choice details ---
        const choiceDetails = [];
        let basePriceAddition = 0;
        let adjustmentPriceAddition = 0;
        let totalChoicePrice = 0;
        let isBaseExist = false;

        if (item.customizationId && item.selectedOptions.length > 0) {
          const customization = await Customization.findByPk(item.customizationId);

          if (!customization || !customization.options) {
            return null;
          }

          // --- Loop through selected options ---
          for (const selectedOption of item.selectedOptions) {
            const option = (customization.options || []).find(
              (opt) =>
                (opt.id || opt._id).toString() === selectedOption.optionId.toString() &&
                opt.isActive === true &&
                opt.isDeleted !== true
            );

            if (!option) continue;

            // If any option has priceType = base → mark base exists (only once)
            if (!isBaseExist && option.priceType === "base") {
              isBaseExist = true;
            }

            // Loop selected choice IDs
            for (const choiceId of selectedOption.selectedChoices || []) {
              const choice = (option.choices || []).find(
                (c) => (c.id || c._id).toString() === choiceId.toString()
              );
              if (!choice) continue;

              choiceDetails.push(choice.name);

              // Add to base or adjustment accumulator
              if (option.priceType === "base") {
                basePriceAddition += Number(choice.priceAdjustment || 0);
              }

              if (option.priceType === "adjustment") {
                adjustmentPriceAddition += Number(choice.priceAdjustment || 0);
              }
            }
          }

          // --- FINAL PRICE CALCULATION ---
          if (isBaseExist) {
            // Case: any option has priceType = base
            totalChoicePrice =
              (basePriceAddition + adjustmentPriceAddition) * item.quantity;
          } else {
            // Case: no base options → use itemBasePrice + adjustment additions
            totalChoicePrice =
              totalItemBasePrice + adjustmentPriceAddition * item.quantity;
          }
        }

        // console.log('totalChoicePrice', totalChoicePrice)

        // Final total logic
        let finalTotal;
        let finalItemPrice = totalItemBasePrice;


        if (item.customizationId && item.selectedOptions.length > 0) {
          if (product.discountPercentage && product.discountPercentage > 0) {

            finalTotal = totalChoicePrice - (totalChoicePrice * product.discountPercentage) / 100;
            finalItemPrice = totalChoicePrice;

          } else {
            finalTotal = totalChoicePrice;
            finalItemPrice = totalChoicePrice;

          }
        } else {
          // Regular product
          finalTotal = totalItemDiscountedPrice;
        }


        return {
          ...item,
          product,
          price: finalItemPrice.toFixed(2),
          total: finalTotal.toFixed(2),
          choiceNames: choiceDetails,
        };
      })
    );

    console.log('DEBUG: enrichedItems count:', enrichedItems.length);
    const filteredItems = enrichedItems.filter((item) => item !== null);
    console.log('DEBUG: filteredItems count:', filteredItems.length);


    // ---------------- TAX LOGIC ----------------


    let totalCGST = 0;
    let totalSGST = 0;
    let totalOtherTaxes = 0;

    filteredItems.forEach(item => {
      const taxable = parseFloat(item.total);

      const p = item.product;

      const cgstAmount = (taxable * (p.cgst || 0)) / 100;
      const sgstAmount = (taxable * (p.sgst || 0)) / 100;
      const otherAmount = (taxable * (p.otherTaxes || 0)) / 100;

      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
      totalOtherTaxes += otherAmount;
    });

    const totalTax = totalCGST + totalSGST + totalOtherTaxes;


    // Format taxes
    const taxes = {
      cgst: totalCGST.toFixed(2),
      sgst: totalSGST.toFixed(2),
      otherTaxes: totalOtherTaxes.toFixed(2)
    };


    const itemsTotal = filteredItems.reduce(
      (sum, item) => sum + parseFloat(item.total),
      0
    );

    let totalPrice = itemsTotal + totalTax

    const billPrice = itemsTotal + totalTax




    // ---------------- FETCH DEALS LOGIC ----------------

    const now = new Date();
    const { Op } = require('sequelize');

    const deals = await Deal.findAll({
      where: {
        integrationId,
        catalogueId: catalogueId.toString(),
        isDeleted: false,
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
        [Op.or]: [
            { usageLimit: 0 },
            { usageCount: { [Op.lt]: sequelize.col('usageLimit') } }
        ]
      }
    });


    const dealIds = deals.map(d => d.id);

    const userDealUsages = await UserDealUsage.findAll({
      where: {
        userId,
        integrationId,
        dealId: { [Op.in]: dealIds }
      }
    });


    // Map: dealId -> user usageCount
    const userUsageMap = {};
    userDealUsages.forEach(u => {
      userUsageMap[u.dealId.toString()] = u.usageCount;
    });


    let dealDetails = [];

    for (let i = 0; i < deals.length; i++) {
      const deal = deals[i];


      // perUserLimit check

      if (deal.perUserLimit && deal.perUserLimit > 0) {
        const usedCount = userUsageMap[deal.id.toString()] || 0;
        if (usedCount >= deal.perUserLimit) {
          continue;
        }
      }

      let isEligible = false;
      let calculatedDiscount = 0;

      const eligibleItems = (deal.appliesOnProducts || []).length
        ? filteredItems.filter(item =>
          deal.appliesOnProducts.some(p =>
            p.toString() === item.productId.toString()
          )
        )
        : filteredItems;


      //  Skip deal if no cart product matches
      if (eligibleItems.length === 0) continue;

      const eligibleItemsTotal = eligibleItems.reduce(
        (sum, item) => sum + parseFloat(item.total),
        0
      );

      const hasMinOrder =
        typeof deal.minOrderValue === "number" && deal.minOrderValue > 0;

      const hasMaxDiscount =
        typeof deal.maxDiscount === "number" && deal.maxDiscount > 0;

      // ---------- NORMAL DEALS ----------
      if (deal.discountType !== "bogo") {
        //  CASE 1: No min order, no max discount
        if (!hasMinOrder && !hasMaxDiscount) {
          isEligible = eligibleItemsTotal > 0;
          calculatedDiscount =
            deal.discountType === "percentage"
              ? (eligibleItemsTotal * deal.discountValue) / 100
              : deal.discountValue;
        }

        //  CASE 2: Min order only (FIXED HERE)
        else if (hasMinOrder && !hasMaxDiscount && eligibleItemsTotal >= deal.minOrderValue) {
          isEligible = true;
          calculatedDiscount =
            deal.discountType === "percentage"
              ? (eligibleItemsTotal * deal.discountValue) / 100
              : deal.discountValue;
        }

        //  CASE 3: Min order + max discount (percentage)
        else if (
          hasMinOrder &&
          hasMaxDiscount &&
          deal.discountType === "percentage" &&
          eligibleItemsTotal >= deal.minOrderValue
        ) {
          const percentDiscount =
            (eligibleItemsTotal * deal.discountValue) / 100;

          calculatedDiscount = Math.min(percentDiscount, deal.maxDiscount);
          isEligible = true;
        }
      }

      // ---------- BOGO DEAL ----------
      else if (deal.discountType === "bogo") {
        let totalFreeValue = 0;
        let totalFreeQty = 0;

        const buyX = Number(deal.buyQuantity || 0);
        const getY = Number(deal.getQuantity || 0);

        if (buyX > 0 && getY > 0) {
          eligibleItems.forEach(item => {
            const qty = Number(item.quantity || 0);
            if (qty >= buyX) {
              const sets = Math.floor(qty / buyX);
              const freeQty = sets * getY;
              const unitPrice = parseFloat(item.total) / qty;

              totalFreeQty += freeQty;
              totalFreeValue += freeQty * unitPrice;
            }
          });
        }

        isEligible = totalFreeQty > 0;
        calculatedDiscount = isEligible ? totalFreeValue : 0;
      }


      const alreadyAppliedRaw =
        cart.appliedDeals?.some(
          (applied) => applied.dealId.toString() === deal._id.toString()
        ) || false;

      // NEW: applied only if still eligible
      const alreadyApplied = alreadyAppliedRaw && isEligible;


      dealDetails.push({
        dealId: deal._id,
        dealName: deal.name,
        descriptions: deal.descriptions,
        discountType: deal.discountType,
        couponType: deal.couponType,
        couponCode: deal.couponCode,
        isEligible,
        calculatedDiscount: calculatedDiscount.toFixed(2),
        isDefault: false,
        alreadyApplied
      });

    }

    const appliedDeals = dealDetails.filter(d => d.alreadyApplied);

    const totalAppliedDiscount = appliedDeals
      .reduce((sum, d) => sum + parseFloat(d.calculatedDiscount), 0)
      .toFixed(2);

    // Group deals by couponType
    const dealsByType = {};
    dealDetails.forEach(d => {
      const type = d.couponType;
      if (!dealsByType[type]) dealsByType[type] = [];
      dealsByType[type].push(d);
    });

    // For each couponType → determine 1 default deal
    const defaultByType = {};

    Object.keys(dealsByType).forEach(type => {
      const group = dealsByType[type];

      // 1️ Priority: alreadyApplied + eligible
      const appliedEligible = group.filter(d => d.alreadyApplied && d.isEligible);

      if (appliedEligible.length > 0) {
        // Pick highest discount among applied
        const bestApplied = appliedEligible.reduce((max, d) =>
          parseFloat(d.calculatedDiscount) > parseFloat(max.calculatedDiscount) ? d : max
        );
        defaultByType[type] = bestApplied.dealId.toString();
        return;
      }

      // 2️ Else pick highest discount among eligible
      const eligible = group.filter(d => d.isEligible);
      if (eligible.length > 0) {
        const bestEligible = eligible.reduce((max, d) =>
          parseFloat(d.calculatedDiscount) > parseFloat(max.calculatedDiscount) ? d : max
        );
        defaultByType[type] = bestEligible.dealId.toString();
      }
    });

    // 3️ Final mapping → only ONE default per couponType
    dealDetails = dealDetails.map(deal => ({
      ...deal,
      isDefault: defaultByType[deal.couponType] === deal.dealId.toString()
    }));


    // console.log("final dealDetails", dealDetails);





    // ---------------------CDP EVENT SENT------------------- 

    const cdpAccessToken = integration.cdpAccessToken;

    if (cdpAccessToken && cdpAccessToken.trim() !== "") {
      const existingDetail = user.cdpDetails.find(
        (detail) =>
          detail.integration_id.toString() === integrationId.toString()
      );

      if (
        existingDetail?.cdpIDs?.profileId &&
        existingDetail?.cdpIDs?.sessionId &&
        filteredItems.length > 0
      ) {
        const { profileId, sessionId } = existingDetail.cdpIDs;

        const cartItemsForCDP = filteredItems.map((item) => ({
          productId: item.product._id.toString(),
          productName: item.product.name || "Unnamed Product",
          price: parseFloat(Number(item.product.discountPrice || item.price || 0).toFixed(2)),
          quantity: item.quantity,
          category: item.product.product_category || "",
        }));

        console.log("Sending CDP 'cartView' event from getAllCartItemsService...");
        await cartViewCdpEvent(cdpAccessToken, {
          profileId,
          sessionId,
          cartItems: cartItemsForCDP,
        });
      } else {
        console.warn(" Missing CDP profile/session or empty cart — skipping 'cartView' event.");
      }
    }


    totalPrice = (totalPrice - Number(totalAppliedDiscount)).toFixed(2)

    return {
      items: filteredItems,
      totalPrice,
      cartId: cart.id,
      deliveryType,
      deals: dealDetails,
      itemsTotal: itemsTotal.toFixed(2),
      taxes,
      totalSaved: totalAppliedDiscount,
      billPrice: billPrice.toFixed(2)
    };
  } catch (error) {
    console.error("GetCartItems Service Error:", error);
    throw error;
  }
};




const getCartItemsByProductService = async (userId, integrationId, catalogueId, productId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const integration = await Integration.findByPk(integrationId);
    if (!integration) throw new Error('Integration not found');

    const activeCatalogue = await Catalogue.findOne({
      where: { id: catalogueId.toString(), integrationId, isActive: true, isDeleted: false },
      include: [{ model: Product, as: 'products', where: { isDeleted: false }, required: false }],
    });
    if (!activeCatalogue) throw new Error('Catalogue not found or inactive/deleted');

    const cart = await Cart.findOne({
      where: { userId, integrationId, catalogueId: catalogueId.toString(), isActive: true },
    });

    if (!cart) return { items: [], totalPrice: 0, cartId: '' };

    const productRelatedItems = (cart.items || []).filter(
      (item) => item.productId.toString() === productId.toString()
    );

    if (productRelatedItems.length === 0) return { items: [], totalPrice: 0, cartId: cart.id };

    // Build product map from the catalogue's products (already loaded)
    const productMap = {};
    for (const product of (activeCatalogue.products || [])) {
      if (!product.isActive || product.isDeleted) continue;
      const specs = product.specifications || {};
      const pId = product.id.toString();
      productMap[pId] = {
        id: pId,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        imageUrls: product.imageUrls,
        sku: product.sku,
        category: product.category,
        subcategory: product.subcategory,
        quantity: product.quantity,
        discountPercentage: 0,
        discountPrice: product.discountPrice != null ? Number(product.discountPrice).toFixed(2) : 0,
        cgst: specs.cgst || 0,
        sgst: specs.sgst || 0,
        otherTaxes: specs.otherTaxes || 0,
        isActive: product.isActive,
        isDeleted: product.isDeleted,
        catalogueName: activeCatalogue.name,
      };
    }

    const enrichedItems = await Promise.all(
      productRelatedItems.map(async (item) => {
        const product = productMap[item.productId.toString()];
        if (!product) return null;

        let price = product.price;
        const totalItemPrice = product.price * item.quantity;
        const totalItemDiscountedPrice = (price * item.quantity).toFixed(2);

        const choiceDetails = [];
        let basePriceAddition = 0;
        let adjustmentPriceAddition = 0;
        let isBaseExist = false;
        let totalChoicePrice = 0;

        if (item.customizationId && item.selectedOptions && item.selectedOptions.length > 0) {
          const customization = await Customization.findOne({
            where: { id: item.customizationId, isActive: true },
          });
          if (customization && customization.options) {
            for (const selectedOption of item.selectedOptions) {
              const option = customization.options.find(
                (opt) => opt.id?.toString() === selectedOption.optionId?.toString() && opt.isActive && !opt.isDeleted
              );
              if (!option) continue;
              if (!isBaseExist && option.priceType === 'base') isBaseExist = true;
              for (const choiceId of selectedOption.selectedChoices || []) {
                const choice = option.choices.find((c) => c.id?.toString() === choiceId?.toString());
                if (!choice) continue;
                choiceDetails.push(choice.name);
                if (option.priceType === 'base') basePriceAddition += Number(choice.priceAdjustment || 0);
                if (option.priceType === 'adjustment') adjustmentPriceAddition += Number(choice.priceAdjustment || 0);
              }
            }
          }
        }

        if (isBaseExist) {
          totalChoicePrice = (basePriceAddition + adjustmentPriceAddition) * item.quantity;
        } else {
          totalChoicePrice = totalItemPrice + adjustmentPriceAddition * item.quantity;
        }

        let finalTotal;
        let finalItemPrice = totalItemPrice;
        if (item.customizationId && item.selectedOptions && item.selectedOptions.length > 0) {
          finalTotal = totalChoicePrice;
          finalItemPrice = totalChoicePrice;
        } else {
          finalTotal = parseFloat(totalItemDiscountedPrice);
        }

        return {
          ...item,
          product,
          price: finalItemPrice.toFixed(2),
          total: finalTotal.toFixed(2),
          choiceNames: choiceDetails,
        };
      })
    );

    const filteredItems = enrichedItems.filter((item) => item !== null);
    const totalPrice = filteredItems.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2);

    return { items: filteredItems, totalPrice, cartId: cart.id };
  } catch (error) {
    console.error('GetCartItemsByProduct Service Error:', error);
    throw error;
  }
};




const getAllUserCartsService = async (userId) => {
  try {
    const carts = await Cart.findAll({ where: { userId, isActive: true } });
    if (!carts.length) return [];

    // Gather unique integrationIds
    const integrationIds = [...new Set(carts.map(c => c.integrationId))];
    const integrations = await Integration.findAll({
      where: { id: integrationIds },
      include: [{ model: Catalogue, as: 'catalogues', where: { isActive: true, isDeleted: false }, required: false }],
    });

    const integrationMap = {};
    integrations.forEach(int => {
      const cat = (int.catalogues || [])[0];
      integrationMap[int.id] = {
        integrationName: int.integrationName,
        integrationLogo: int.logo,
        catalogueId: cat?.id || null,
      };
    });

    return carts.map(cart => {
      const integrationData = integrationMap[cart.integrationId] || {};
      return {
        cartId: cart.id,
        integrationId: cart.integrationId,
        integrationName: integrationData.integrationName || 'Unknown',
        integrationLogo: integrationData.integrationLogo || '',
        catalogueId: integrationData.catalogueId || null,
        itemsCount: cart.totalQuantity || 0,
      };
    });
  } catch (error) {
    console.error('getAllUserCartsService Error:', error);
    throw error;
  }
};


const deleteAllCartsService = async (userId) => {
  try {
    const deleted = await Cart.destroy({ where: { userId, isActive: true } });
    if (deleted === 0) throw new Error('No active carts found for this user');
    return { message: 'All active carts removed successfully', deletedCount: deleted };
  } catch (error) {
    console.error('DeleteAllCarts Service error:', error);
    throw error;
  }
};



const applyDealOnCartService = async (
  userId,
  cartId,
  dealIds,
  integrationId,
  catalogueId
) => {
  try {
    // 1️ Find Cart
    const cart = await Cart.findOne({
      where: {
        id: cartId,
        userId,
        integrationId,
        catalogueId,
        isActive: true
      }
    });

    if (!cart) throw new Error("Cart not found");

    // 2️ Loop through all the dealIds
    for (const dealId of dealIds) {
      const deal = await Deal.findOne({
        where: { id: dealId, integrationId, catalogueId, isActive: true, isDeleted: false },
      });

      if (!deal) {
        throw new Error(`Deal not found or inactive: ${dealId}`);
      }

      const { usageLimit, usageCount, couponType } = deal;

      // 3️ Check usage limit
      if (usageLimit !== 0 && usageCount >= usageLimit) {
        throw new Error(`Deal limit reached for dealId: ${dealId}`);
      }

      // 4️ Apply / Replace Deal for same couponType
      const existingDealIndex = cart.appliedDeals.findIndex(
        d => d.couponType === couponType
      );

      if (existingDealIndex !== -1) {
        // Replace old deal of same coupon type
        cart.appliedDeals[existingDealIndex] = {
          dealId,
          couponType
        };
      } else {
        // Add new deal
        cart.appliedDeals.push({
          dealId,
          couponType
        });
      }
    }

    // Save final cart
    await cart.save();

    return cart;
  } catch (error) {
    console.error("Apply Deal Service Error:", error);
    throw error;
  }
};



const removeDealFromCartService = async (
  userId,
  cartId,
  dealId,
  integrationId,
  catalogueId
) => {
  try {
    // 1️ Find Cart
    const cart = await Cart.findOne({
      where: {
        id: cartId,
        userId,
        integrationId,
        catalogueId,
        isActive: true
      }
    });

    if (!cart) throw new Error("Cart not found");

    // 2️ Find Deal
    const deal = await Deal.findOne({
      where: {
        id: dealId,
        integrationId,
        catalogueId,
        isActive: true,
        isDeleted: false
      }
    });

    if (!deal) throw new Error("Deal not found for this integration or catalogue");

    // 3️ Check if deal is in cart
    const dealIndex = cart.appliedDeals.findIndex(
      d => d.dealId.toString() === dealId.toString()
    );

    if (dealIndex === -1) {
      throw new Error("Deal is not applied to this cart");
    }

    // 4️ Remove the deal from cart
    cart.appliedDeals.splice(dealIndex, 1);


    // Save only the cart
    await cart.save();

    return cart;

  } catch (error) {
    console.error("Remove Deal Service Error:", error);
    throw error;
  }
};

const clearDealByCouponTypeService = async (
  userId,
  cartId,
  couponType,
  integrationId,
  catalogueId
) => {
  try {
    // 1️ Find the cart
    const cart = await Cart.findOne({
      where: {
        id: cartId,
        userId,
        integrationId,
        catalogueId,
        isActive: true
      }
    });

    if (!cart) throw new Error("Cart not found");

    // 2️ Find deal by couponType inside appliedDeals
    const dealIndex = cart.appliedDeals.findIndex(
      d => d.couponType === couponType
    );


    // 3️ If not found → NO ERROR → return cart as is
    if (dealIndex === -1) {
      console.log(`No deal found for couponType ${couponType}, skipping removal`);
      return cart;
    }

    // 4️ Remove the deal entry
    cart.appliedDeals.splice(dealIndex, 1);

    // 5️ Save updated cart
    await cart.save();

    return cart;

  } catch (error) {
    console.error("Clear Deal By CouponType Service Error:", error);
    throw error;
  }
};




module.exports = { deleteCartItemService, increaseCartItemQuantityService, decreaseCartItemQuantityService, getAllCartItemsService, createCartForCustomizedProductService, getCartItemsByProductService, getAllUserCartsService, deleteAllCartsService, applyDealOnCartService, removeDealFromCartService, clearDealByCouponTypeService };
