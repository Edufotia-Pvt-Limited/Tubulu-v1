const { Worker, Queue } = require("bullmq");
const { getUserByPhoneNumbers } = require("../Services/User.Service");
const {
  getTemplateById,
  updateCampaignStatus,
} = require("../Services/Campaigns.Service");
const {
  getChatRoomsForUsersByIntegration,
  bulkCreateChatRooms,
  sendNotificationToParticipants,
  bulkUpdateChatRoomLastMessageByIntegration,
} = require("../Services/ChatRoom.Service");

const { generateUUID, getMessageTypeFromMimeType } = require("./Helper");
const { bulkInsertMessages } = require("../Services/ChatMessage.Service");
const { getAllUsersForPhoneBookGroups } = require("../Services/PhoneBook.Service");

const CHUNK_SIZE = 2;

const MY_QUEUES = {
  CAMPAIGN_QUEUE: "CAMPAIGN_QUEUE",
  CAMPAIGN_SEND_QUEUE: "CAMPAIGN_SEND_QUEUE",
};

exports.QUEUES = MY_QUEUES;

const sendingQueue = new Queue(MY_QUEUES.CAMPAIGN_SEND_QUEUE, {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

const worker = new Worker(
  MY_QUEUES.CAMPAIGN_QUEUE,
  async (job) => {
    await processCampaignJob(job.data);
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);

const sendingWorker = new Worker(
  MY_QUEUES.CAMPAIGN_SEND_QUEUE,
  async (job) => {
    processSendingJob(job.data);
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
    concurrency: 4,
  }
);

worker.on("completed", (job) => {
  console.log(`Job with id: ${job.id}`);
});

async function processCampaignJob(campaignData) {
  console.log(
    "🚀 ~ file: queue.helper.js:49 ~ processCampaignJob ~ campaignData:",
    campaignData
  );
  try {
    let userList = [];
    if (campaignData.phoneBookIds?.length) {
      const phoneBookGroupData = await getAllUsersForPhoneBookGroups(campaignData.phoneBookIds);
      phoneBookGroupData.forEach(pItem => {
        const relation = pItem.relation;
        if (relation.length) {
          relation.forEach(rItem => {
            const phonebook = rItem.phoneBook;
            if (phonebook.length) {
              phonebook.forEach(phItem => {
                const users = phItem.user;
                users.forEach(uItem => {
                  userList.push(`${uItem.cc}${uItem.phoneNumber}`);
                })
              })
            }
          })
        }
      });
    } else {
      userList = campaignData.users;
    }
    const sanitizedUserList = [...new Set(userList)];
    const userChunks = chunkArray(sanitizedUserList, CHUNK_SIZE);
    const sendingJobs = [];
    userChunks.forEach((item, index) => {
      const itemData = {
        title: campaignData.title,
        template: campaignData.template,
        scheduledTime: campaignData.scheduledTime,
        integrationId: campaignData.integrationId,
        userChunks: item,
        isLast: index === userChunks.length - 1,
        variables: campaignData.variables,
        _id: campaignData._id,
      };
      sendingJobs.push({ name: "SENDING_CAMPAIGN", data: itemData });
    });
    await updateCampaignStatus(campaignData._id, "ACTIVE");
    await sendingQueue.addBulk(sendingJobs);
  } catch (error) {
    console.log(
      `Failed to process the data for the campaign ${campaignData._id}`
    );
    console.log(error);
    throw error;
  }
}

async function processSendingJob(sendingData) {
  try {
    const {
      userChunks,
      title,
      template,
      integrationId,
      isLast,
      _id,
      variables,
    } = sendingData;
    console.log(`Starting to send for the campaign: ${title}`);
    //Step 1: Get the list of users from the user chunks.
    const userList = await getUserByPhoneNumbers(userChunks);
    const newUserIds = [];
    const userIds = userList.map((item) => {
      return item.id;
    });
    //Step 2: Get the template details. from the template details get the welcome message and welcome body.
    const templateDetails = await getTemplateById(template);

    //Step 3: Get the list of the chat rooms for the users with the integrations.
    const chatRooms = await getChatRoomsForUsersByIntegration(
      userIds,
      integrationId
    );
    const newChatRooms = [];
    userList.forEach((item) => {
      const chatRoomIndex = chatRooms.findIndex((chatRoomItem) => {
        const userParticipants = chatRoomItem.participants;
        if (!userParticipants.includes(item)) {
          return 1;
        }
        return 0;
      });
      if (chatRoomIndex < 0) {
        newUserIds.push(item._id);
        newChatRooms.push({
          integrationId,
          participants: [item],
        });
      }
    });
    let newlyCreatedChatRooms = await bulkCreateChatRooms(newChatRooms);
    newlyCreatedChatRooms = await getChatRoomsForUsersByIntegration(newUserIds, integrationId);
    //Step 4: Prepare the chat message and bulk insert in DB for all the users in the chunks.
    mimeType = undefined;
    if (templateDetails.payload) {
      mimeType = templateDetails.payload.get("mimeType");
    }
    const chatMessages = [...chatRooms, ...newlyCreatedChatRooms].map(
      (item) => {
        //Update the messagebody correctly by variables.
        const uuid = generateUUID();
        const userDetails = item?.User?.[0];
        const updatedMessageBody = updateMessageBody(templateDetails.messageBody, variables, userDetails)

 const messageActionsWithTemplate = (templateDetails.messageActions || []).map(
    (action) => ({
      ...action,
      templateId: templateDetails._id,
    })
  );

        return {
          uuid,
          chatRoom: item._id,
          type: getMessageTypeFromMimeType(mimeType) ?? "TEXT",
          message: updatedMessageBody,
          messageActions: messageActionsWithTemplate,
          payload: templateDetails.payload,
          messageByUser: undefined,
          messageByIntegration: true,
          integrationId: integrationId.toString(),
        };
      }
    );
    await bulkUpdateChatRoomLastMessageByIntegration(
      templateDetails.messageBody,
      [...chatRooms, ...newlyCreatedChatRooms].map((item) => {
        return item._id;
      })
    );
    const createdChatMessages = await bulkInsertMessages(chatMessages);
    //Step 5: Get the push notification tokens for all the users in the phone numbers
    const sendingPromiseArr = [...chatRooms, ...newlyCreatedChatRooms].map(
      async (chatRoomItem) => {
        const chatMessage = createdChatMessages.filter(
          (chatMessageItem) => chatMessageItem.chatRoom === chatRoomItem._id
        );
        await sendNotificationToParticipants(chatRoomItem._id, {
          ...chatMessage,
          integrationId: integrationId.toString(),
        });
      }
    );
    await Promise.all(sendingPromiseArr);
    //Step 6: Update the campaign Status as completed.
    if (isLast) {
      await updateCampaignStatus(_id, "COMPLETED");
    }
  } catch (error) {
    console.log("Unable to complete the sending job at the moment");
    console.log(error);
    throw error;
  }
}

function chunkArray(array, chunkSize) {
  const chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return chunks;
}

function updateMessageBody(messageBody, variables, userDetails) {
  let newMessageBody = messageBody;
  if (variables && variables.length) {
    variables.forEach((vItem) => {
      if (vItem.value == "${firstName}") {
        newMessageBody = newMessageBody.replace(vItem.key, userDetails.firstName);
      } else if (vItem.value == "${lastName}") {
        newMessageBody = newMessageBody.replace(vItem.key, userDetails.lastName);
      } else {
        newMessageBody = newMessageBody.replace(vItem.key, vItem.value);
      }
    });
  }
  return newMessageBody;
}
