import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import FileUploadList from './file-upload-list';

interface FileUploadStepProps {
  error: string;
  selectedFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownloadSample: () => void;
  actionButtons?: React.ReactNode; // New prop for buttons
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({
  error,
  selectedFile,
  fileInputRef,
  handleDrop,
  handleFileSelect,
  handleDownloadSample,
  actionButtons,
}) => {
  return (
    <>
      {/* Info Boxes */}
     <Box sx={{ px: 5, display: 'flex', flexDirection: 'column', gap:1 }}>
      <Box >
         <Typography variant="body2" fontWeight={500}>
   Main Identifiers
 </Typography>
   <Typography variant="body2" color="textSecondary">
     Your subscriber list must include a phone number for each subscriber. This information will be used to identify <br/>
     the correct WhatsApp accounts and personalise your message.  
   </Typography>
       </Box>
  
   <Box>
     <Typography variant="body2" fontWeight={500}>
     Optional variables
   </Typography>
   <Typography variant="body2" color="textSecondary">
     You can add variables and use them as placeholders in your message. Placeholders get replaced with the value <br/>
     that you enter for each subscriber when the message is sent.
   </Typography>
   </Box>
 </Box>
           <Box sx={{ display: 'flex', alignItems: 'center', px: 5, py: 2, gap: 2 }}>
  {/* Sample Button */}
  <Button
    variant="contained"
    sx={{ backgroundColor: '#37b37d', color: '#FFF', whiteSpace: 'nowrap' }}
    onClick={handleDownloadSample}
  >
    Sample
  </Button>

  {/* Instruction Text */}
  <Typography
    variant="body2"
    color="textSecondary"
    sx={{ flex: 1, whiteSpace: 'pre-line', lineHeight: 1.6 }}
  >
    You can add variables and use them as placeholders in your message.
    Placeholders get replaced with the value that you enter for each subscriber.
  </Typography>
</Box>

            

            <Box sx={{ px: 5,py: 2,display: 'flex',flexDirection: 'column', alignItems: 'center'}}>
              <Box
                sx={{
                  border: 2,
                  borderColor: error && !selectedFile ? 'error.main' : 'black',
                  borderRadius: 3,
                  px: 3,
                  py: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100', borderColor: 'black.50' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                    width: '100%',      
                   maxWidth: 600,
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <Typography variant="body1" color="textPrimary">
                 Drag and Drop or click to upload File<br/>
                 .csv
                </Typography>
                
              </Box>
             

              {selectedFile && (
                <Box
    sx={{
      width: '100%',
      maxWidth: 600,
              
    }}
  >
    <FileUploadList files={[selectedFile]} />
  </Box>
              )}

              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </Box> 
     {actionButtons && (
  <Box
    sx={{
      px: 5,
      py: 2,
      width: '100%',
      display: 'flex',         
      justifyContent: 'flex-end', 
      gap: 2,                  
    }}
  >
    {actionButtons}
  </Box>
)}
    </>
  );
};

export default FileUploadStep;


















