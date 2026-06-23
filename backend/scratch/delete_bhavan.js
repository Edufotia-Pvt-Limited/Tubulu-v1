const { Integration } = require('../Utils/Postgres');

async function main() {
    const id = '6a118b58-8ee8-4e18-ac05-0942e163ebbc';
    try {
        const integration = await Integration.findByPk(id);
        if (!integration) {
            console.log(`Vendor "bhavan" (id: ${id}) not found or already deleted.`);
            process.exit(0);
        }

        console.log(`Found vendor "bhavan" (id: ${id}). Deleting...`);

        const {
            Settlement, Review, Cart, Deal, Order, Customization,
            BlockedIntegration, MerchantMembership, VendorAIConfig, Advertisement,
            IntegrationDocument, PhoneBookGroup, PhoneBookGroupRelation, PhoneBook,
            ChatRoom, ChatMessage, MessageBookmark, MessageNote, ChatDocument,
            Product, Catalogue, QRCode, QRCategory, Campaign, CampaignTemplate, UserDealUsage
        } = require('../Utils/Postgres');

        // Clean up references
        await Integration.update({ parentId: null }, { where: { parentId: id } }).catch(() => {});

        // Delete associated records
        const chatRooms = await ChatRoom.findAll({ where: { integrationId: id }, attributes: ['id'] });
        const chatRoomIds = chatRooms.map(cr => cr.id);
        if (chatRoomIds.length > 0) {
            const { Op } = require('sequelize');
            await MessageBookmark.destroy({ where: { chatRoomId: { [Op.in]: chatRoomIds } } }).catch(() => {});
            await MessageNote.destroy({ where: { chatRoomId: { [Op.in]: chatRoomIds } } }).catch(() => {});
            await ChatMessage.destroy({ where: { chatRoomId: { [Op.in]: chatRoomIds } } }).catch(() => {});
            await ChatDocument.destroy({ where: { chatRoomId: { [Op.in]: chatRoomIds } } }).catch(() => {});
        }
        await ChatRoom.destroy({ where: { integrationId: id } }).catch(() => {});
        await ChatDocument.destroy({ where: { integrationId: id } }).catch(() => {});

        const phoneBooks = await PhoneBook.findAll({ where: { integrationId: id }, attributes: ['id'] });
        const phoneBookIds = phoneBooks.map(pb => pb.id);
        const pbGroups = await PhoneBookGroup.findAll({ where: { integrationId: id }, attributes: ['id'] });
        const pbGroupIds = pbGroups.map(pbg => pbg.id);

        if (phoneBookIds.length > 0 || pbGroupIds.length > 0) {
            const { Op } = require('sequelize');
            const pbRelationWhere = {};
            if (phoneBookIds.length > 0 && pbGroupIds.length > 0) {
                pbRelationWhere[Op.or] = [
                    { phoneBookId: { [Op.in]: phoneBookIds } },
                    { groupId: { [Op.in]: pbGroupIds } }
                ];
            } else if (phoneBookIds.length > 0) {
                pbRelationWhere.phoneBookId = { [Op.in]: phoneBookIds };
            } else {
                pbRelationWhere.groupId = { [Op.in]: pbGroupIds };
            }
            await PhoneBookGroupRelation.destroy({ where: pbRelationWhere }).catch(() => {});
        }
        await PhoneBookGroup.destroy({ where: { integrationId: id } }).catch(() => {});
        await PhoneBook.destroy({ where: { integrationId: id } }).catch(() => {});

        await Product.destroy({ where: { integrationId: id } }).catch(() => {});
        await Catalogue.destroy({ where: { integrationId: id } }).catch(() => {});
        await QRCode.destroy({ where: { integrationId: id } }).catch(() => {});
        await QRCategory.destroy({ where: { integrationId: id } }).catch(() => {});
        await Campaign.destroy({ where: { integrationId: id } }).catch(() => {});
        await CampaignTemplate.destroy({ where: { integrationId: id } }).catch(() => {});
        await Review.destroy({ where: { integrationId: id } }).catch(() => {});
        await Cart.destroy({ where: { integrationId: id } }).catch(() => {});
        await Deal.destroy({ where: { integrationId: id } }).catch(() => {});
        await Order.destroy({ where: { integrationId: id } }).catch(() => {});
        await Customization.destroy({ where: { integrationId: id } }).catch(() => {});
        await BlockedIntegration.destroy({ where: { integrationId: id } }).catch(() => {});
        await MerchantMembership.destroy({ where: { integrationId: id } }).catch(() => {});
        await VendorAIConfig.destroy({ where: { integrationId: id } }).catch(() => {});
        await Advertisement.destroy({ where: { integrationId: id } }).catch(() => {});
        await IntegrationDocument.destroy({ where: { integrationId: id } }).catch(() => {});
        await UserDealUsage.destroy({ where: { integrationId: id } }).catch(() => {});
        await Settlement.destroy({ where: { integrationId: id } }).catch(() => {});

        // Finally, destroy the integration itself
        await integration.destroy();
        console.log(`Vendor "bhavan" cleanly deleted.`);
        process.exit(0);
    } catch (e) {
        console.error('Error deleting bhavan:', e);
        process.exit(1);
    }
}

main();
