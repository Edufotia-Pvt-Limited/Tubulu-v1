// @mui
import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
//
import Doc from "src/assets/documentation.png";

// ----------------------------------------------------------------------

export function NavBottomGroup() {
    return (
        <Box
            sx={{
                position: "relative",
                borderRadius: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                marginTop: 8,
                gap: 2,
                width: 150,
                bottom: 30,
                left: 50
            }}
        >
            <img width={150} height={80} src={Doc} alt="Document" />
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: "center" }}>
                Need Help,
                <br />
                Please check our docs
            </Typography>

            <Button
                //   onClick={}
                style={{ background: '#36F', color: '#FFF' }}
                component="label"
                variant="contained"
            >
                Documentation
            </Button>
        </Box>
    )
}

// ----------------------------------------------------------------------
