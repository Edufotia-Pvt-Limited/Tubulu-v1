import { Box, Typography, Paper, IconButton } from '@mui/material';
import { MdOutlineFileUpload } from 'react-icons/md';

type FileUploadListProps = {
  files: File[];
};

const FileUploadList: React.FC<FileUploadListProps> = ({ files }) => {
  if (!files || files.length === 0) return null;

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {files.map((file, index) => (
        <Paper
          key={index}
          variant="outlined"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1,
            backgroundColor: 'grey.50',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundColor: 'green.200',
            }}
          >
          
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: 500 }}
            >
              {file.name}
            </Typography>
            <Typography sx={{ fontSize: 10 }} variant="caption" color="text.secondary">
              {(file.size / 1024).toFixed(1)} KB
            </Typography>
          </Box>
        </Paper>
      ))} 
    </Box>
  );
};

export default FileUploadList;