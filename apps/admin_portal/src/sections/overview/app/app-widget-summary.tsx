// @mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card, { CardProps } from '@mui/material/Card';
// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  total: number;
  imageSRC: string;
}

export default function AppWidgetSummary({ title, total, imageSRC, sx, ...other }: Props) {

  function handleNumber(_num: number) {
    if (_num < 10) {
      return `0${_num}`;
    }
    return `${_num}`;
  }

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 3, ...sx }} {...other}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: "column", gap: 2 }}>
        <Typography style={{ display: 'flex', alignItems: 'flex-start' }} variant="h3">{handleNumber(total)}</Typography>

        <Typography style={{ display: 'flex', alignItems: 'flex-end', color: '#647382' }} variant="subtitle2">{title}</Typography>

      </Box>
      <img src={imageSRC} alt='users' style={{ height: 150, width: 150, objectFit: "scale-down" }} />
    </Card>
  );
}
