import { Dimensions } from 'react-native';

export const MIME_TYPES = {
  IMAGE: {
    JPG: 'image/jpg',
    JPEG: 'image/jpeg',
    PNG: 'image/png',
  },
  VIDEO: {
    MP4: 'video/mp4',
    AVI: 'video/x-msvideo',
  },
  AUDIO: {
    MP3: 'audio/mpeg',
    WAV: 'audio/x-wav',
  },
};

export const CHART_TYPES = {
  PIE: 'PIE',
  LINE: 'LINE',
  BAR: 'BAR',
};

export const deviceHeight = Dimensions.get('screen').height;
export const deviceWidth = Dimensions.get('screen').width;

export const allowedMimeTypes = [
  'text/plain',
  'text/html',
  'application/rtf',
  'text/markdown',
  'application/xml',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/pdf',
  'application/postscript',
  'application/zip',
  'application/gzip',
];


export const ORDER_STATUS_CONFIG = {
  ORDER_ACCEPTED: {
    color: "#1976d2",
    icon: "📨",
    template: (c, o) =>
      `Hi <b>${c}</b> 👋<br>Your order <b>#${o}</b> has been accepted.<br>We're getting your items ready.`,
  },

  ORDER_PACKING: {
    color: "#8e24aa",
    icon: "🧺",
    template: (c, o) =>
      `Hi <b>${c}</b> 👋<br>We're packing your order <b>#${o}</b> 🧺<br>Fresh items are being collected.`,
  },

  ORDER_DISPATCHED: {
    color: "#fb8c00",
    icon: "🛵",
    template: (c, o) =>
      `Good news, <b>${c}</b>!<br>Your order <b>#${o}</b> is out for delivery 🛵<br>Our delivery partner is on the way.`,
  },

  ORDER_DELIVERED: {
    color: "#388e3c",
    icon: "✔️",
    template: (c, o) =>
      `Hi <b>${c}</b> 😊<br>Your order <b>#${o}</b> has been delivered.<br>Thank you for ordering with us!`,
  },

  ORDER_CANCELED: {
    color: "#d32f2f",
    icon: "⚠️",
    template: (c, o) =>
      `Hi <b>${c}</b>,<br>Your order <b>#${o}</b> has been canceled.<br>Feel free to place a new order anytime.`,
  },

  ORDER_REFUND: {
    color: "#c62828",
    icon: "💸",
    template: (c, o) =>
      `Hi <b>${c}</b>,<br>Your order <b>#${o}</b> couldn't be fulfilled.<br>A refund has been initiated 💸<br>Sorry for the inconvenience.`,
  },
};


export const filterCategories = [
    {
        id: 'discount',
        title: 'Discount',
        multiSelect: false,
        options: [
            { id: '10', label: '10% or more', selected: false },
            { id: '20', label: '20% or more', selected: false },
            { id: '40', label: '40% or more', selected: false },
            { id: '50', label: '50% or more', selected: false },
        ],
    },
    {
        id: 'price',
        title: 'Price',
        multiSelect: false,
        options: [
            { id: 'budget', label: 'Budget', selected: false },
            { id: 'expensive', label: 'Expensive', selected: false },
        ],
    },
];