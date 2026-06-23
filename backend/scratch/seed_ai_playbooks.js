const { config } = require('../config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    config.POSTGRES.database,
    config.POSTGRES.user,
    config.POSTGRES.password,
    {
        host: config.POSTGRES.host,
        dialect: 'postgres',
        logging: false
    }
);

async function main() {
    try {
        await sequelize.authenticate();
        console.log("Database connection verified.");

        // Ensure table exists first by syncing via code rather than raw SQL to preserve definitions!
        const AICategoryPlaybook = require('../Models/AICategoryPlaybook.pg');
        await AICategoryPlaybook.sync(); 
        
        console.log("Syncing AI Playbooks...");
        
        const playbooks = [
            {
                categoryKey: 'FB',
                displayName: 'Food & Beverage',
                masterPrompt: 'You are an AI assistant for a restaurant. Help users browse the menu, answer diet questions, and encourage placing orders.',
                requiredAttributes: ['cuisine', 'spicyLevel', 'vegNonVeg'],
                actionConfig: { hasCart: true, hasTableBooking: true }
            },
            {
                categoryKey: 'GROCERY',
                displayName: 'Grocery & Essentials',
                masterPrompt: 'You are an AI assistant for a grocery store. Help users find daily essentials, verify stocks, and maintain organized carts.',
                requiredAttributes: ['brand', 'expiry', 'weight'],
                actionConfig: { hasCart: true }
            },
            {
                categoryKey: 'SERVICES',
                displayName: 'Professional Services',
                masterPrompt: 'You are an AI assistant for a service provider. Schedule appointments, describe your specialized expertise, and secure calendar slots.',
                requiredAttributes: ['duration', 'expertName'],
                actionConfig: { hasSeatSelection: true }
            },
            {
                categoryKey: 'RETAIL',
                displayName: 'Retail & E-commerce',
                masterPrompt: 'You are a retail AI assistant. Highlight trending collections, resolve size inquiries, and push upsells.',
                requiredAttributes: ['sizeChart', 'material'],
                actionConfig: { hasCart: true }
            }
        ];

        for (const p of playbooks) {
            const [record, created] = await AICategoryPlaybook.findOrCreate({
                where: { categoryKey: p.categoryKey },
                defaults: p
            });
            if (created) {
                console.log(`Created playbook for: ${p.categoryKey}`);
            } else {
                console.log(`Playbook already exists for: ${p.categoryKey}`);
            }
        }
        
        console.log("SEED COMPLETE!");
        
    } catch (error) {
        console.error("Database Error:", error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

main();
