const { Integration, Catalogue } = require('../Utils/Postgres');

async function activateCatalogue() {
    try {
        const integrationId = '9b0cbc8b-b630-4e2a-89aa-ee364231af9c';
        
        // 1. Update Catalogue table
        await Catalogue.update(
            { isActive: true },
            { where: { id: 'a452d1b5-5e5a-402a-990b-7e68e4883383' } }
        );

        // 2. Update Integration JSONB field
        const integration = await Integration.findByPk(integrationId);
        if (integration) {
            const catalogues = integration.catalogues || [];
            catalogues.forEach(c => {
                if (c.id === 'a452d1b5-5e5a-402a-990b-7e68e4883383' || c._id === 'a452d1b5-5e5a-402a-990b-7e68e4883383') {
                    c.isActive = true;
                    if (c.products) {
                        c.products.forEach((p, index) => {
                            if (!p.id && !p._id) p.id = `prod_${index + 1}`;
                            if (p.isActive === undefined) p.isActive = true;
                            if (p.isDeleted === undefined) p.isDeleted = false;
                        });
                    }
                }
            });
            await Integration.update(
                { catalogues },
                { where: { id: integrationId } }
            );
            console.log('Successfully updated Integration catalogues JSONB');
        }

        console.log('Activation complete');
        process.exit(0);
    } catch (error) {
        console.error('Error updating catalogue:', error);
        process.exit(1);
    }
}

activateCatalogue();
