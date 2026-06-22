const { connectPostgres, sequelize, State, ServiceProvider, StateServiceConfig } = require('../Utils/Postgres');

async function run() {
    try {
        console.log('--- CONNECTING TO DATABASE ---');
        await connectPostgres();
        console.log('Database connected and tables synced.');

        console.log('\n--- 1. READING EXISTING STATES DATA ---');
        // Check which columns exist before reading to make the script idempotent and safe
        const columns = await sequelize.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name='States'",
            { type: sequelize.QueryTypes.SELECT }
        );
        const columnNames = columns.map(c => c.column_name);

        const hasSarvam = columnNames.includes('sarvamApiKey');
        const hasGemini = columnNames.includes('geminiApiKey');
        const hasVoice = columnNames.includes('voiceProvider');
        const hasChat = columnNames.includes('chatProvider');

        if (!hasSarvam && !hasGemini && !hasVoice && !hasChat) {
            console.log('Old columns have already been dropped. Skipping data migration.');
        } else {
            let selectFields = ['id', 'name'];
            if (hasSarvam) selectFields.push('"sarvamApiKey"');
            if (hasGemini) selectFields.push('"geminiApiKey"');
            if (hasVoice) selectFields.push('"voiceProvider"');
            if (hasChat) selectFields.push('"chatProvider"');

            const oldStates = await sequelize.query(`SELECT ${selectFields.join(', ')} FROM "States"`, {
                type: sequelize.QueryTypes.SELECT
            });

            console.log(`Found ${oldStates.length} states to migrate.`);

            for (const state of oldStates) {
                console.log(`\nMigrating state: ${state.name} (${state.id})`);

                // A. Voice / STT_TTS Provider
                const voiceProv = hasVoice ? state.voiceProvider : null;
                const sarvamKey = hasSarvam ? state.sarvamApiKey : null;
                
                if (sarvamKey || voiceProv) {
                    const providerName = voiceProv || 'sarvam';
                    const [provider] = await ServiceProvider.findOrCreate({
                        where: {
                            serviceType: 'STT_TTS',
                            serviceProvider: providerName
                        }
                    });

                    await StateServiceConfig.findOrCreate({
                        where: {
                            stateId: state.id,
                            serviceProviderId: provider.id
                        },
                        defaults: {
                            config: {
                                apiKey: sarvamKey || null
                            }
                        }
                    });
                    console.log(`  - Linked STT_TTS provider "${providerName}"`);
                }

                // B. LLM Provider
                const chatProv = hasChat ? state.chatProvider : null;
                const geminiKey = hasGemini ? state.geminiApiKey : null;
                
                if (geminiKey || chatProv) {
                    const providerName = chatProv || 'gemini';
                    const [provider] = await ServiceProvider.findOrCreate({
                        where: {
                            serviceType: 'LLM',
                            serviceProvider: providerName
                        }
                    });

                    await StateServiceConfig.findOrCreate({
                        where: {
                            stateId: state.id,
                            serviceProviderId: provider.id
                        },
                        defaults: {
                            config: {
                                apiKey: geminiKey || null
                            }
                        }
                    });
                    console.log(`  - Linked LLM provider "${providerName}"`);
                }
            }
        }

        console.log('\n--- 2. ALTERING STATES TABLE (DROPPING OLD COLUMNS) ---');
        await sequelize.query('ALTER TABLE "States" DROP COLUMN IF EXISTS "sarvamApiKey"');
        await sequelize.query('ALTER TABLE "States" DROP COLUMN IF EXISTS "geminiApiKey"');
        await sequelize.query('ALTER TABLE "States" DROP COLUMN IF EXISTS "voiceProvider"');
        await sequelize.query('ALTER TABLE "States" DROP COLUMN IF EXISTS "chatProvider"');
        console.log('Successfully dropped old columns from "States" table.');

        console.log('\n--- MIGRATION COMPLETED SUCCESSFULLY ---');
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

run();
