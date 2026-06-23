const { Customization, Integration, Catalogue, Product } = require('../Utils/Postgres');
const { Op } = require('sequelize');

// Utility function to generate unique option IDs since we don't have Mongoose nested _id auto-gens
const generateOptionId = () => require('crypto').randomBytes(12).toString('hex');

// ===================== CREATE CUSTOMIZATION =====================
const createCustomizationService = async (data, integrationId) => {
    const existing = await Customization.findOne({
        where: {
            customizationName: { [Op.iLike]: data.customizationName },
            integrationId,
            isDeleted: false
        }
    });

    if (existing) {
        throw new Error("Customization name already exists for this integration");
    }

    return await Customization.create({
        ...data,
        integrationId,
        options: data.options || []
    });
};

// ===================== GET ALL CUSTOMIZATIONS =====================
const getAllCustomizationsService = async (integrationId, search, page) => {
    const limit = 5; 
    const offset = (page - 1) * limit;

    const whereClause = {
        isDeleted: false,
        integrationId
    };

    if (search) {
        whereClause.customizationName = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Customization.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset
    });

    const integration = await Integration.findByPk(integrationId, {
        attributes: ['category']
    });

    const totalPages = Math.ceil(count / limit);

    return {
        category: integration?.category || null,
        data: rows,
        pagination: {
            page: parseInt(page),
            limit,
            total: count,
            totalPages,
        },
    };
};

// ===================== SOFT DELETE CUSTOMIZATION =====================
const deleteCustomizationService = async (customizationId, integrationId) => {
    const customization = await Customization.findOne({
        where: { id: customizationId, integrationId, isDeleted: false }
    });

    if (!customization) {
        throw new Error("Customization not found or already deleted");
    }

    customization.isDeleted = true;
    customization.isActive = false;
    await customization.save();

    return customization;
};

const updateCustomizationStatusService = async (customizationId, isActive, integrationId) => {
    const customization = await Customization.findOne({
        where: { id: customizationId, integrationId, isDeleted: false }
    });

    if (!customization) {
        throw new Error("Customization not found or already deleted");
    }

    customization.isActive = isActive;
    await customization.save();

    return customization;
};

// ===================== GET CUSTOMIZATION BY ID =====================
const getCustomizationByIdService = async (id, integrationId) => {
    return await Customization.findOne({
        where: { id, integrationId, isDeleted: false }
    });
};

const editCustomizationService = async (id, customizationName, integrationId, updateData) => {
    const existing = await Customization.findOne({
        where: {
            id: { [Op.ne]: id },
            customizationName: { [Op.iLike]: customizationName },
            integrationId,
            isDeleted: false
        }
    });

    if (existing) {
        throw new Error("Customization name already exists for this integration");
    }

    const customization = await Customization.findOne({
        where: { id, integrationId, isDeleted: false }
    });

    if (!customization) {
        throw new Error("Customization not found or already deleted");
    }

    await customization.update(updateData);
    return customization;
};

// ===================== OPTIONS MGMT (Inside JSONB Column) =====================

const getAllOptionsByCustomizationIdService = async (customizationId, integrationId) => {
    const customization = await Customization.findOne({
        where: { id: customizationId, integrationId, isDeleted: false }
    });

    if (!customization) {
        throw new Error("Customization not found");
    }

    const integration = await Integration.findByPk(integrationId, { attributes: ['category'] });

    const options = Array.isArray(customization.options)
        ? customization.options.filter(opt => !opt.isDeleted)
        : [];

    return {
        category: integration?.category || null,
        customizationName: customization.customizationName,
        customizationIsActive: customization.isActive,
        options: options.length > 0 ? options : [],
    };
};

const deleteOptionByOptionIdService = async (customizationId, optionId, integrationId) => {
    const customization = await Customization.findOne({
        where: { id: customizationId, integrationId, isDeleted: false }
    });

    if (!customization) {
        throw new Error("Customization not found");
    }

    const options = customization.options || [];
    const optionIndex = options.findIndex(o => String(o._id || o.id) === String(optionId));

    if (optionIndex === -1 || options[optionIndex].isDeleted) {
        throw new Error("Option not found or already deleted");
    }

    options[optionIndex].isDeleted = true;
    options[optionIndex].isActive = false;

    customization.options = options;
    customization.changed('options', true);
    await customization.save();

    return {
        message: "Option deleted successfully",
        customizationName: customization.customizationName,
        deletedOptionId: optionId,
    };
};

const updateOptionStatusService = async (customizationId, optionId, isActive, integrationId) => {
    const customization = await Customization.findOne({
        where: { id: customizationId, integrationId, isDeleted: false }
    });

    if (!customization) {
        throw new Error("Customization not found");
    }

    const options = customization.options || [];
    const optionIndex = options.findIndex(o => String(o._id || o.id) === String(optionId));

    if (optionIndex === -1 || options[optionIndex].isDeleted) {
        throw new Error("Option not found or already deleted");
    }

    options[optionIndex].isActive = isActive;

    customization.options = options;
    customization.changed('options', true);
    await customization.save();

    return {
        message: "Option status updated successfully",
        customizationName: customization.customizationName,
        optionId: optionId,
        isActive: isActive,
    };
};

const addOptionService = async (customizationId, optionData, integrationId) => {
    const customization = await Customization.findOne({
        where: { id: customizationId, integrationId, isDeleted: false }
    });

    if (!customization) {
        throw new Error("Customization not found");
    }

    const options = customization.options || [];
    const existingOption = options.find(
        (opt) => !opt.isDeleted && opt.name.toLowerCase() === optionData.name.toLowerCase()
    );

    if (existingOption) {
        throw new Error(`Option name ${optionData.name} already exists`);
    }

    // Ensure option has valid unique id (mimic mongo _id for frontend compatibility)
    const newOption = {
        ...optionData,
        _id: generateOptionId(),
        isActive: true,
        isDeleted: false
    };

    options.push(newOption);
    customization.options = options;
    customization.changed('options', true);
    await customization.save();

    return {
        message: "Option added successfully",
        customizationName: customization.customizationName,
        option: newOption,
    };
};

const getSingleOptionByIdService = async (customizationId, optionId, integrationId) => {
    const customization = await Customization.findOne({
        where: { id: customizationId, integrationId, isDeleted: false }
    });

    if (!customization) {
        throw new Error("Customization not found");
    }

    const options = customization.options || [];
    const option = options.find(o => String(o._id || o.id) === String(optionId));

    if (!option || option.isDeleted) {
        throw new Error("Option not found or deleted");
    }

    return {
        customizationName: customization.customizationName,
        option,
    };
};

const editOptionService = async (customizationId, optionId, updateData, integrationId) => {
    const customization = await Customization.findOne({
        where: { id: customizationId, integrationId, isDeleted: false }
    });

    if (!customization) {
        throw new Error("Customization not found");
    }

    const options = customization.options || [];
    const optionIndex = options.findIndex(o => String(o._id || o.id) === String(optionId));

    if (optionIndex === -1 || options[optionIndex].isDeleted) {
        throw new Error("Option not found or already deleted");
    }

    // Check duplicate names
    if (updateData.name) {
        const duplicate = options.find(
            (opt) =>
                !opt.isDeleted &&
                String(opt._id || opt.id) !== String(optionId) &&
                opt.name.toLowerCase() === updateData.name.toLowerCase()
        );
        if (duplicate) {
            throw new Error(`Option name ${updateData.name} already exists`);
        }
    }

    // Apply delta update
    const fieldsToUpdate = ['name', 'type', 'required', 'choices', 'priceType'];
    fieldsToUpdate.forEach((field) => {
        if (updateData[field] !== undefined) {
            options[optionIndex][field] = updateData[field];
        }
    });

    customization.options = options;
    customization.changed('options', true);
    await customization.save();

    return {
        message: "Option updated successfully",
        customizationName: customization.customizationName,
        option: options[optionIndex],
    };
};

// ===================== APPLICATION TO PRODUCTS =====================

const getCustomizationDetailsForApplyService = async (customizationId, integrationId) => {
    const integration = await Integration.findByPk(integrationId, {
        include: [
            {
                model: Catalogue,
                as: 'catalogues',
                where: { isDeleted: false },
                required: false
            }
        ]
    });
    
    if (!integration) throw new Error("Integration not found");

    const catalogues = (integration.catalogues || []).map(c => ({
        _id: c.id,
        name: c.name
    }));

    const customization = await Customization.findOne({
        where: { id: customizationId, integrationId, isDeleted: false }
    });

    if (!customization) {
        throw new Error("Customization not found");
    }

    const plainCustomization = customization.toJSON ? customization.toJSON() : customization;

    // Filter options that are active
    const filteredOptions = (plainCustomization.options || []).filter(
        (option) => option.isActive && !option.isDeleted
    );

    return {
        customization: {
            ...plainCustomization,
            options: filteredOptions,
        },
        catalogues: catalogues,
    };
};

const applyProductCustomizationService = async (
    integrationId,
    customizationId,
    catalogueId,
    productIds,
    removedProductIds
) => {
    // Validate integration / catalogue ownership implicitly by checking existence
    const catalogue = await Catalogue.findOne({
        where: { id: catalogueId, integrationId, isDeleted: false }
    });

    if (!catalogue) throw new Error("Catalogue not found or belongs to different integration");

    let updatedCount = 0;

    // 1. Apply customizationId to new products
    if (productIds && productIds.length > 0) {
        const [affectedCount] = await Product.update(
            { customizationId: customizationId },
            {
                where: {
                    id: { [Op.in]: productIds },
                    catalogueId,
                    integrationId
                }
            }
        );
        updatedCount += affectedCount;
    }

    // 2. Clear customizationId for removed products
    if (removedProductIds && removedProductIds.length > 0) {
        const [affectedCountRemoved] = await Product.update(
            { customizationId: null },
            {
                where: {
                    id: { [Op.in]: removedProductIds },
                    catalogueId,
                    integrationId
                }
            }
        );
        updatedCount += affectedCountRemoved;
    }

    return { updatedCount };
};

const searchProductsForCustomizationService = async (
    query,
    catalogueId,
    customizationId,
    integrationId,
    page = 1,
    limit = 5
) => {
    const offset = (page - 1) * limit;

    // First, find valid customizations mapping table if needed,
    // but in Postgres we just verify if current product's customizationId is present and non-null.
    // We'll fetch customizations directly via where clause later to optimize.

    const whereClause = {
        integrationId,
        isDeleted: false
    };

    if (catalogueId) {
        whereClause.catalogueId = catalogueId;
    }

    if (query && query.trim() !== "") {
        whereClause.name = { [Op.iLike]: `%${query.trim()}%` };
    }

    const { count, rows } = await Product.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: Catalogue,
                as: 'catalogue',
                attributes: ['name', 'description']
            }
        ],
        limit,
        offset,
        order: [['name', 'ASC']]
    });

    const results = rows.map((product) => {
        const hasCustomization = !!product.customizationId;
        const isSameCustomization = hasCustomization && String(product.customizationId) === String(customizationId);

        // Product can be selected if it has no customization OR is already assigned THIS customization
        const isSelectable = !hasCustomization || isSameCustomization;

        return {
            productId: product.id,
            productName: product.name,
            productDescription: product.description,
            productImages: product.imageUrls || [],
            quantity: product.quantity,
            category: product.category,
            subCategory: product.subcategory,
            productPrice: product.price,
            discountPrice: product.discountPrice,
            catalogueId: product.catalogueId,
            catalogueName: product.catalogue?.name || 'Unknown',
            catalogueDescription: product.catalogue?.description || '',
            integrationId: product.integrationId,
            isActive: product.isActive,
            customizationId: product.customizationId,
            matchCustomization: isSameCustomization,
            isSelectable: isSelectable,
        };
    });

    return { results, total: count };
};

module.exports = {
    createCustomizationService,
    getAllCustomizationsService,
    deleteCustomizationService,
    updateCustomizationStatusService,
    editCustomizationService,
    getCustomizationByIdService,
    getAllOptionsByCustomizationIdService,
    deleteOptionByOptionIdService,
    updateOptionStatusService,
    addOptionService,
    getSingleOptionByIdService,
    editOptionService,
    getCustomizationDetailsForApplyService,
    applyProductCustomizationService,
    searchProductsForCustomizationService
};
