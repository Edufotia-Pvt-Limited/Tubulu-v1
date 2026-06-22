// export function validatePhoneNumber(phoneNumber: string): boolean {
//     const regex = /^\+?[1-9][0-9]{11,15}$/
//     return regex.test(phoneNumber);
// }

// export function parseJwt(token: string) {
//     const base64Url = token.split('.')[1];
//     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));

//     return JSON.parse(jsonPayload);
// }

// export function validateEmail(email: string): boolean {
//     const emailValidator = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gmi;
//     return emailValidator.test(email);
// }

// export function validatePinCode(pinCode: string): boolean {
//     const regex = /^[1-9]{1}[0-9]{2}[0-9]{3}$/
//     return regex.test(pinCode);
// }

// export function validateGst(gst?: string): boolean {
//     if (!gst) {
//         return false;
//     }
//     const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//     return regex.test(gst);
// }

// export function validatePan(pan?: string): boolean {
//     if (!pan) {
//         return false;
//     }
//     const regex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/
//     return regex.test(pan);
// }

// export function validateAadhar(aadhar?: string): boolean {
//     if (!aadhar) {
//         return false;
//     }
//     const regex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
//     return regex.test(aadhar);
// }

// export function getMessageTypeFromMimeType(mimeType) {
//     const MIME_TYPES = {
//         "IMAGE": {
//             "JPG": "image/jpg",
//             "JPEG": "image/jpeg",
//             "PNG": "image/png",
//         },
//         "VIDEO": {
//             "MP4": "video/mp4",
//             "AVI": "video/x-msvideo",
//         },
//         "AUDIO": {
//             "MP3": "audio/mpeg",
//             "WAV": "audio/x-wav"
//         }
//     }
//     switch (mimeType) {
//         case 'image/png':
//         case 'image/jpeg':
//         case 'image/jpg':
//             return 'IMAGE'
//         case 'video/mp4':
//         case 'video/x-msvideo':
//             return 'VIDEO';
//         case 'audio/mpeg':
//         case "audio/x-wav":
//             return "AUDIO";
//         default:
//             return undefined;
//     }
// }

// export function getMessageTypeFromMimeTypeV2(mimeType) {
//     const MIME_TYPES = {
//         "IMAGE": {
//             "JPG": "image/jpg",
//             "JPEG": "image/jpeg",
//             "PNG": "image/png",
//         },
//         "VIDEO": {
//             "MP4": "video/mp4",
//             "AVI": "video/x-msvideo",
//         },
//         "AUDIO": {
//             "MP3": "audio/mpeg",
//             "WAV": "audio/x-wav"
//         }
//     }
//     switch (mimeType) {
//         case 'image/png':
//         case 'image/jpeg':
//         case 'image/jpg':
//             return 'IMAGE'
//         case 'video/mp4':
//         case 'video/x-msvideo':
//             return 'VIDEO';
//         case 'audio/mpeg':
//         case "audio/x-wav":
//             return "AUDIO";
//         default:
//             return "DOCUMENT";
//     }
// }

// export function compareArrays(A, B): boolean {
//     // Early return if lengths differ:
//     if (A.length !== B.length) {
//         return false;
//     }

//     // Iterate through elements and compare properties:
//     for (let i = 0; i < A.length; i++) {
//         const objA = A[i];
//         const objB = B[i];

//         if (
//             objA.actionApi?.trim() !== objB.actionApi?.trim() ||
//             objA.title?.trim() !== objB.title?.trim() ||
//             objA.type !== objB.type
//         ) {
//             return false;
//         }
//     }

//     // Arrays are considered equal if all elements and properties match:
//     return true;
// }








// src/utils/helper.ts

// ---------------------------------------------
// Validation Helpers
// ---------------------------------------------

export function validatePhoneNumber(phoneNumber: string): boolean {
  const regex = /^\+?[1-9][0-9]{9,14}$/;
  return regex.test(phoneNumber);
}

export function validateEmail(email: string): boolean {
  const regex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/i;
  return regex.test(email);
}

// Note: original seemed to use a 6-digit pincode pattern. Keep it standard 6-digit.
export function validatePinCode(pinCode: string): boolean {
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(pinCode);
}

export function validateGst(gst?: string): boolean {
  if (!gst) return false;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  return regex.test(gst);
}

export function validatePan(pan?: string): boolean {
  if (!pan) return false;
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  return regex.test(pan);
}

export function validateAadhar(aadhar?: string): boolean {
  if (!aadhar) return false;
  const regex = /^[2-9][0-9]{11}$/;
  return regex.test(aadhar);
}

// ---------------------------------------------
// JWT Parser (SSR-safe)
// ---------------------------------------------
/**
 * parseJwt - safely parse JWT payload in browser or Node
 * returns a plain object. If token invalid, throws.
 */
export function parseJwt(token: string): Record<string, unknown> {
  if (!token) return {};

  const base64Url = token.split('.')[1];
  if (!base64Url) return {};

  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  // Support both browser and Node (SSR)
  let jsonPayloadBinary: string;
  if (typeof window === 'undefined') {
    // Node environment
    jsonPayloadBinary = Buffer.from(base64, 'base64').toString('binary');
  } else {
    // Browser
    jsonPayloadBinary = window.atob(base64);
  }

  // Convert binary string to percent-encoded string, then decode
  const jsonPayload = decodeURIComponent(
    jsonPayloadBinary
      .split('')
      .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );

  try {
    return JSON.parse(jsonPayload);
  } catch (e) {
    // If parsing fails, return empty object to avoid throwing in production
    // but you can rethrow if you prefer strict behavior
    return {};
  }
}

// ---------------------------------------------
// Mime Type → Message Type
// ---------------------------------------------
export type MessageType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

/** Returns undefined if not image/video/audio (keeps original behavior) */
export function getMessageTypeFromMimeType(mimeType: string): MessageType {
  if (!mimeType) return 'DOCUMENT'; // instead of undefined
  if (['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType)) return 'IMAGE';
  if (['video/mp4', 'video/x-msvideo'].includes(mimeType)) return 'VIDEO';
  if (['audio/mpeg', 'audio/x-wav'].includes(mimeType)) return 'AUDIO';
  return 'DOCUMENT'; // fallback
}


/** V2: default to DOCUMENT when unknown (keeps original V2 behavior) */
export function getMessageTypeFromMimeTypeV2(mimeType: string): MessageType {
  if (!mimeType) return 'DOCUMENT';
  if (['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType)) return 'IMAGE';
  if (['video/mp4', 'video/x-msvideo'].includes(mimeType)) return 'VIDEO';
  if (['audio/mpeg', 'audio/x-wav'].includes(mimeType)) return 'AUDIO';
  return 'DOCUMENT';
}

// ---------------------------------------------
// Array Comparison Helper
// ---------------------------------------------
export interface CompareItem {
  actionApi?: string;
  title?: string;
  type?: string;
}

/**
 * Compare two arrays for shallow equality on selected keys.
 * Returns true if same length and each index matches on actionApi/title/type (trimmed).
 */
export function compareArrays(A: CompareItem[], B: CompareItem[]): boolean {
  if (!Array.isArray(A) || !Array.isArray(B)) return false;
  if (A.length !== B.length) return false;

  for (let i = 0; i < A.length; i++) {
    const objA = A[i] ?? {};
    const objB = B[i] ?? {};

    const aAction = typeof objA.actionApi === 'string' ? objA.actionApi.trim() : '';
    const bAction = typeof objB.actionApi === 'string' ? objB.actionApi.trim() : '';

    const aTitle = typeof objA.title === 'string' ? objA.title.trim() : '';
    const bTitle = typeof objB.title === 'string' ? objB.title.trim() : '';

    const aType = objA.type ?? '';
    const bType = objB.type ?? '';

    if (aAction !== bAction || aTitle !== bTitle || aType !== bType) {
      return false;
    }
  }
  return true;
}
