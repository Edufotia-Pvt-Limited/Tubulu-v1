/* eslint-disable prettier/prettier */
// export const base_url = 'http://159.65.148.194:3008';
// export const base_url = "http://192.168.1.3:3008"

/// Prod & Staging --->
// Set the Environment here by commenting one of below envType :
// export const envType = 'PROD';
// export const envType = 'Local';

export const envType = 'Local';
const config = {
    STAGING: {
        base_url: 'https://staging.tubulu.in',
        base_qtm_url: 'https://staging-qtm.tubulu.in',
    },
    PROD: {
        base_url: 'https://dashboard.tubulu.in',
        base_qtm_url: 'https://qtm.tubulu.in',
    },
     Local: {
        base_url: 'http://10.0.2.2:3008',
        base_qtm_url: 'http://10.0.2.2:3008',
    },
    
    //  Tunnel: {  
    //     base_url: 'https://4565412t-3008.inc1.devtunnels.ms',
    //     base_qtm_url: 'https://4565412t-3008.inc1.devtunnels.ms',
    // },

};


// Access the configuration for the current environment
export const { base_url, base_qtm_url } = config[envType];

export const apiEndPoints = {
    loginUser: '/api/v1/user/register',
    verifyOtp: '/api/v1/user/verifyOtp',
    refreshToken: '/api/v1/user/refreshToken',
    onboardUser: '/api/v1/user/onboard',
    getIntegrationsList: '/api/v1/integrations/all',
    checkUserOnboarded: '/api/v1/user/checkOnboarded',
    upsertFcmToken: '/api/v1/userDevice/addToken',
    removeFcmToken :  `/api/v1/userDevice/clear/fcm-token`,
    getChatRoom: '/api/v1/chatRoom/checkChatRoomExists',
    sendChatMessage: '/api/v1/chatMessage/send',
    getChatMessages: '/api/v1/chatMessage/chatRoomMessages?page={{page}}&size=40',
    uploadDocumentFile: '/api/v1/chatDocument/create',
    getMessageById: '/api/v1/chatMessage/message/byId',
    welcomeUserToIntegration: '/api/v1/integrations/welcome',
    getRecentIntegrations: '/api/v1/integrations/user/recent',
    getNonInteractedIntegrations: '/api/v1/integrations/user/nonInteracted',
    newMessageNote: '/api/v1/notes/new',
    markActionSelected: '/api/v1/chatMessage/markActionSelected',
    getAllInteractionsOffline: '/api/v1/integrations/all/integrations',
    deleteUserAccount: '/api/v1/user/delete',
};


export const qtmEndPoints = {
    getTopics: '/api/v1/topic/all',
    createTopic: '/api/v1/topic/create',
    uploadFile: '/api/v1/user/attachement/upload',
    createTask: '/api/v1/topic/task/create',
    getTaskByTopicId: '/api/v1/topic/task/all',
    syncContacts: '/api/v1/user/contacts/sync',
    getContacts: '/api/v1/user/contacts/list',
    createSubTask: '/api/v1/topic/subTask/create',
    getSubTaskByTaskId: '/api/v1/topic/subTasks/all',
    getMembersByTaskId: '/api/v1/topic/task/members/all',
    getSubTasksByMemberIdAndTaskId: '/api/v1/topic/task/subTask/{taskId}/user/{userId}',
    updateSubTaskStatus: '/api/v1/topic/task/subTask/update',
    topicAttachmentCount: '/api/v1/topic/attachments/count/{topicId}',
    taskAttachmentCount: '/api/v1/topic/task/attachements/count/{taskId}',
    getTopicAttachments: '/api/v1/topic/attachements/{topicId}',
    getTaskAttachments: '/api/v1/topic/task/attachments/{taskId}',
    getSubTaskAttachments: '/api/v1/topic/task/subTask/attachments/{subTaskId}',
    // NEW API'S AS PER THE NEW REQUIREMENTS :
    getAllTasks: '/api/v1/topic/task/all',
    getUserDetails: '/api/v1/user/me',
    pinTask: '/api/v1/topic/task/pin',
    removeTaskPin: '/api/v1/topic/task/pin/remove/{taskId}',
    // ROLE INDUCED APIS :
    removeTask: '/api/v1/topic/task/remove/{taskId}',
    updateTask: '/api/v1/topic/task/update/{taskId}',
    removeSubTask: '/api/v1/topic/task/subtask/remove/{subTaskId}',
    updateSubTask: '/api/v1/topic/subTask/update/{subTaskId}',
    removeMember: '/api/v1/topic/task/remove/user/{userId}/task/{taskId}',
    updateRole: '/api/v1/topic/task/role/update/{userId}/{taskId}',
    // GET DETAILS BY ID :
    getTaskDetailsById: '/api/v1/topic/task/{taskId}',
    getSubTaskDetailsById: '/api/v1/topic/task/subTask/{subTaskId}',
    // REGISTER THE USER TO QTM :
    registerUser: '/api/v1/user/register',
    // USER TOPICS :
    createUserTopic: '/api/v1/userTopic/new',
    getUserTopics: '/api/v1/userTopics/byUser',
    updateUserTopic: '/api/v1/userTopics/edit',
    deleteUserTopic: '/api/v1/userTopics/remove/{userTopicId}',
    getTaskForUserTopic: '/api/v1/userTopics/tasks/{topicId}',
    // MOVE TASK :
    moveSingleTask: '/api/v1/userTopics/moveTask',
    removeSingleTask: '/api/v1/userTopics/removeTask',

    // GROUP CHAT :
    sendChatMessage: '/api/v1/chats/new/message/{taskId}',
    getChatMessage: '/api/v1/chats/all/messages/{taskId}',
    getMessageDetailsById: '/api/v1/chat/message/{messageId}',

    // DATE EXTENSION :
    requestDateExtension: '/api/v1/subtask/requestExtension',
    getAllDERequests: '/api/v1/subtasks/extensions',
    updateDERequest: '/api/v1/subtasks/extensions/reject',

    // DELETE QTM USER :
    deleteQTMUser: '/api/v1/user/delete',
};
