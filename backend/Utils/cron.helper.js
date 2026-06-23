const cron = require('node-cron');
const moment = require('moment');
const { getAllScheduledCampaigns } = require('../Services/Campaigns.Service');
const { Queue } = require('bullmq');



const queue = new Queue('CAMPAIGN_QUEUE', {
    connection: {
        host: 'localhost',
        port: 6379
    }
})


cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
   
   console.log("🚀 ~ file: cron.helper.js:16 ~ cron.schedule ~ currentDateTime:", now.toISOString())

    const scheduledCampaigns = await getAllScheduledCampaigns(now);
   
    if (scheduledCampaigns.length) {
      await queue.addBulk(
        scheduledCampaigns.map(item => ({
          name: 'SEND_CAMPAIGN_QUEUE_JOB',
          data: item
        }))
      );
    }
  } catch (error) {
    console.error('Unable to schedule the cron', error);
  }
});





