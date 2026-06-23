// import React from 'react';
// import { Box, CircularProgress } from "@mui/material";
// import { Typography } from 'antd';
// import { IoDocumentTextOutline } from 'react-icons/io5';
// import { FiDownload } from 'react-icons/fi';
// import { fetchDocument } from 'src/utils/ApiActions';

// type Props = {
//     payload: {
//         documentUrl: string;
//         documentName: string;
//         mimeType: string;
//         file?: string;        
//     },
//     type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
//     onClick?: () => void;
//     body?: string;
// }

// function onDownloadDocument(documentUrl: string, documentName: string) {
//     fetchDocument(documentUrl).then(
//         (response: Response) => {
//             response.blob().then((blob) => {
//                 // Creating new object of file
//                 const fileURL = window.URL.createObjectURL(blob);
//                 // Setting various property values
//                 const alink = document.createElement("a");
//                 alink.href = fileURL;
//                 alink.download = documentName;
//                 alink.click();
//             });
//         }
//     );
// }

// export default function ChatMessageType({ payload, type, onClick, body = '' }: Props) {
//     if (payload.documentUrl) {
//         switch (type) {
//             case 'IMAGE':
//                 return (
//                     <Box
//                         component="img"
//                         alt="Uploading..."
//                         src={payload?.documentUrl}
//                         onClick={onClick}
//                         sx={{
//                             minHeight: 220,
//                             borderRadius: 1.5,
//                             cursor: 'pointer',
//                             '&:hover': {
//                                 opacity: 0.9,
//                             },
//                         }}
//                     />
//                 );
//             case 'VIDEO':
//                 return (
//                     <video height={750} width={320} controls src={payload.documentUrl} />
//                 );
//             case 'AUDIO':
//                 return (
//                     <audio controls style={{ borderRadius: "0px" }}>
//                         <source src={payload.documentUrl} />
//                     </audio>
//                 );
//             case 'DOCUMENT':
//                 const docName = payload.documentName;
//                 const docUrl = payload.documentUrl;
//                 return (
//                     <div style={{ background: 'white', padding: '10px 15px', borderRadius: '8px', display: 'flex', border: '1px solid #e3e3e3' }} >
//                         <IoDocumentTextOutline fontSize={30} style={{ color: "red" }} />
//                         <div style={{ paddingLeft: 8, display: 'grid', width: 120 }}>
//                             <Typography.Text
//                                 ellipsis={{ tooltip: docName }}
//                                 style={{ fontWeight: 500, fontSize: 16 }}>
//                                 {docName}
//                             </Typography.Text>
//                             <Typography.Text
//                                 ellipsis={{ tooltip: docName }}
//                                 style={{ fontWeight: 400, fontSize: 13 }}>
//                                 {docName}
//                             </Typography.Text>
//                         </div>
//                         <div style={{ paddingLeft: 22 }}>
//                             <FiDownload onClick={() => onDownloadDocument(docUrl, docName)} fontSize={26} style={{ cursor: 'pointer', color: "blue" }} />
//                         </div>
//                     </div>
//                 )
//         }
//     } else {
//         <CircularProgress />;
//     }
// }


import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from "@mui/material";
import { Typography } from 'antd';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { FiDownload } from 'react-icons/fi';
import { fetchDocument } from 'src/utils/ApiActions';

type Props = {
  payload: {
    documentUrl?: string;
    documentName: string;
    mimeType: string;
    file?: string;
  };
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  onClick?: () => void;
  body?: string;
};

function onDownloadDocument(documentUrl: string, documentName: string) {
  fetchDocument(documentUrl).then((response: Response) => {
    response.blob().then((blob) => {
      const fileURL = window.URL.createObjectURL(blob);
      const alink = document.createElement("a");
      alink.href = fileURL;
      alink.download = documentName;
      alink.click();
      window.URL.revokeObjectURL(fileURL);
    });
  });
}

export default function ChatMessageType({ payload, type, onClick }: Props) {
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset loading state immediately when URL changes
  useEffect(() => {
    setLoading(true);
    setImageError(false);
  }, [payload.documentUrl]);

  /* =======================
     LOADING INDICATOR
     ======================= */
  const LoadingIndicator = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 220,
        minWidth:220,
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
      }}
    >
      <CircularProgress size={40} />
    </Box>
  );

  /* =======================
     NO URL → SHOW LOADER
     ======================= */
  if (!payload.documentUrl) {
    return LoadingIndicator;
  }

  switch (type) {
    /* =======================
       IMAGE
       ======================= */
    case 'IMAGE':
      return (
        <Box
          sx={{
            maxWidth: 340,
            width: '100%',
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
          }}
          onClick={onClick}
        >
          {/* Show loader while loading */}
          {loading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 220,
                backgroundColor: '#f5f5f5',
              }}
            >
              <CircularProgress size={40} />
            </Box>
          )}

          {/* Show error message if image fails */}
          {imageError && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 220,
                color: '#666',
                fontSize: 14,
              }}
            >
              Failed to load image
            </Box>
          )}

          {/* Image */}
          <Box
            component="img"
            src={payload.documentUrl}
            alt="chat image"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setImageError(true);
            }}
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: 400,
              display: loading || imageError ? 'none' : 'block',
              objectFit: 'contain',
              backgroundColor: '#000',
            }}
          />
        </Box>
      );

    /* =======================
       VIDEO
       ======================= */
    case 'VIDEO':
      return (
        <Box
          sx={{
            width: 280,
            height: 180,
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          {/* Show loader while loading */}
          {loading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                backgroundColor: '#f5f5f5',
              }}
            >
              <CircularProgress size={40} />
            </Box>
          )}

          {/* Video with fixed aspect ratio container */}
          <video
            controls
            preload="metadata"
            src={payload.documentUrl}
            onLoadedMetadata={() => setLoading(false)}
            onError={() => setLoading(false)}
            style={{
              width: '100%',
              height: '100%',
              display: loading ? 'none' : 'block',
              objectFit: 'contain',
            }}
          />
        </Box>
      );

    /* =======================
       AUDIO
       ======================= */
    case 'AUDIO':
      return (
        <Box
          sx={{
            width: '100%',
            maxWidth: 340,
            minHeight: 54,
            padding: 1,
            borderRadius: 1.5,
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading && <CircularProgress size={24} />}

          <audio
            controls
            src={payload.documentUrl}
            onCanPlay={() => setLoading(false)}
            onError={() => setLoading(false)}
            style={{
              display: loading ? 'none' : 'block',
              width: '100%',
            }}
          />
        </Box>
      );

    /* =======================
       DOCUMENT
       ======================= */
    case 'DOCUMENT':
      return (
        <Box
          sx={{
            width: '100%',
            maxWidth: 340,
            padding: '10px 15px',
            borderRadius: 2,
            border: '1px solid #e3e3e3',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            backgroundColor: 'white',
          }}
        >
          <IoDocumentTextOutline fontSize={30} style={{ color: 'red', flexShrink: 0 }} />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography.Text
              ellipsis={{ tooltip: payload.documentName }}
              style={{ fontWeight: 500, fontSize: 14 }}
            >
              {payload.documentName}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Document
            </Typography.Text>
          </Box>

          <FiDownload
            fontSize={24}
            style={{ cursor: 'pointer', color: '#1890ff', flexShrink: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onDownloadDocument(
                payload.documentUrl!,
                payload.documentName
              );
            }}
          />
        </Box>
      );

    default:
      return null;
  }
}