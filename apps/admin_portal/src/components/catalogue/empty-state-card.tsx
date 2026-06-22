import { Card, CardContent, Typography, Button } from "@mui/material";

interface EmptyStateCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick: () => void;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  buttonLabel,
  onButtonClick,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        textAlign: "center",
        p: 8,
        border: "2px dashed #D1D5DB",
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#666", mb: 3 }}>
          {description}
        </Typography>
        <Button
          variant="contained"
          sx={{ background: "#36F", color: "#FFF", px: 4 ,  '&:hover': {
                  backgroundColor: '#36F',
                  boxShadow: 'none',
                },}}
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
