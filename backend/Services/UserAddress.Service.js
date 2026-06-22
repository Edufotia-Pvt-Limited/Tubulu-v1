const { User } = require('../Utils/Postgres');
const { generateUUID } = require('../Utils/Helper');

// Addresses are stored as a JSONB array on the User PG model

async function addUserAddress(userId, addressData) {
    const user = await User.findByPk(userId);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const addresses = Array.isArray(user.addresses) ? [...user.addresses] : [];

    // Prevent duplicate home/work
    const alreadyExists = addresses.some(
        (addr) =>
            addr.addressType === addressData.addressType &&
            !addr.isDeleted &&
            (addr.addressType === 'home' || addr.addressType === 'work')
    );
    if (alreadyExists) {
        throw Object.assign(
            new Error(`Address type "${addressData.addressType}" already exists for this user`),
            { statusCode: 400 }
        );
    }

    // Unset all defaults
    addresses.forEach((addr) => { addr.isDefault = false; });

    const newAddress = {
        id: generateUUID(),
        ...addressData,
        isDefault: true,
        isDeleted: false,
    };
    addresses.push(newAddress);

    user.changed('addresses', true);
    await user.update({ addresses });
    return addresses.filter((a) => !a.isDeleted);
}

async function deleteUserAddress(userId, addressId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const addresses = Array.isArray(user.addresses) ? [...user.addresses] : [];
    const address = addresses.find((a) => a.id === addressId);
    if (!address || address.isDeleted) throw new Error('Address not found');

    const wasDefault = address.isDefault;
    address.isDeleted = true;
    address.isDefault = false;

    if (wasDefault) {
        const other = addresses.find((a) => !a.isDeleted && a.id !== addressId);
        if (other) other.isDefault = true;
    }

    user.changed('addresses', true);
    await user.update({ addresses });
    return address;
}

async function updateUserAddress(userId, addressId, newAddressData) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const addresses = Array.isArray(user.addresses) ? [...user.addresses] : [];
    const address = addresses.find((a) => a.id === addressId);
    if (!address) throw new Error('Address not found');
    if (address.isDeleted) throw new Error('Cannot update a deleted address');

    const updatedAddressData = {
        fullName:     newAddressData.fullName     ?? address.fullName,
        contact:      newAddressData.contact      ?? address.contact,
        addressLine1: newAddressData.addressLine1 ?? address.addressLine1,
        addressLine2: newAddressData.addressLine2 ?? address.addressLine2,
        city:         newAddressData.city         ?? address.city,
        state:        newAddressData.state        ?? address.state,
        country:      newAddressData.country      ?? address.country,
        pincode:      newAddressData.pincode      ?? address.pincode,
        addressType:  newAddressData.addressType  ?? address.addressType,
        addressLabel: newAddressData.addressLabel ?? address.addressLabel,
    };

    // Prevent duplicate home/work
    if (['home', 'work'].includes(updatedAddressData.addressType)) {
        const alreadyExists = addresses.some(
            (addr) =>
                !addr.isDeleted &&
                addr.id !== addressId &&
                addr.addressType === updatedAddressData.addressType
        );
        if (alreadyExists) {
            throw new Error(`Address type "${updatedAddressData.addressType}" already exists`);
        }
    }

    Object.assign(address, updatedAddressData);

    if (newAddressData.isDefault === true) {
        addresses.forEach((addr) => { addr.isDefault = false; });
        address.isDefault = true;
    }

    user.changed('addresses', true);
    await user.update({ addresses });
    return address;
}

async function getUserAddressByIdService(userId, { addressId, default: isDefault }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const addresses = Array.isArray(user.addresses) ? user.addresses : [];

    if (isDefault) {
        const result = addresses.find((a) => a.isDefault && !a.isDeleted);
        if (!result) throw new Error('Default address not found');
        return result;
    } else if (addressId) {
        const result = addresses.find((a) => a.id === addressId);
        if (!result || (result.isDeleted && !result.isDefault)) throw new Error('Address not found');
        return result;
    } else {
        const result = addresses.filter((a) => !a.isDeleted);
        if (!result.length) throw new Error('No addresses found');
        return result;
    }
}

module.exports = {
    addUserAddress,
    deleteUserAddress,
    updateUserAddress,
    getUserAddressByIdService,
};
