// @mui
import { Box, CircularProgress, Typography } from "@mui/material";
import { QRCode } from "antd";
//
import PoweredBy from "src/assets/poweredby-tubulu.png";

interface CardProps {
    value: string;
    cardTitle: string;
    logoSRC: string;
    cardSubTitle: string;
    type: 'A' | 'B';
    loading?: boolean;
}

export function QRcard({ cardTitle, logoSRC, value, cardSubTitle, type, loading }: CardProps) {
    if (type === 'A') {
        return (
            <Box
                sx={{
                    boxSizing: 'border-box',
                    width: 304,
                    height: 456,
                    borderRadius: 2,
                    border: '1px solid rgba(196, 205, 213, 1)',
                    display: 'flex',
                    position: 'relative',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0px 0px 24px -4px rgba(145, 158, 171, 0.3)',
                    background: 'white',
                }}
            >

                {loading ? <div style={{ position: 'absolute', top: 180 }}><CircularProgress /> </div> :
                    <>
                        <div style={{ position: 'absolute', top: 30, left: 54, width: 200, height: 77 }}>
                            <img src={logoSRC} alt="LOGO" style={{ objectFit: 'scale-down', width: '100%', height: '100%' }} />
                        </div>
                        <QRCode value={value} size={203} style={{ position: "absolute", top: 130 }} />
                        <div style={{ position: 'absolute', top: 350 }}>
                            <Typography style={{ fontSize: 18, fontWeight: 700 }} >
                                {cardTitle}
                            </Typography>
                        </div>
                        <div style={{ position: 'absolute', top: 376, maxWidth: 246 }} >
                            <Typography style={{ fontSize: 10, fontWeight: 500, textAlign: 'center' }} >
                                {cardSubTitle}
                            </Typography>
                        </div>
                        <div style={{ position: 'absolute', top: 405, overflow: 'hidden' }} >
                            <img src={PoweredBy} style={{ height: 50, width: 304, borderRadius: '0 0 14px 14px' }} />
                        </div>
                    </>
                }
            </Box>
        )
    }
    if (type === 'B') {
        return (
            <Box
                sx={{
                    boxSizing: 'border-box',
                    width: 304,
                    height: 203,
                    borderRadius: 2,
                    border: '1px solid rgba(196, 205, 213, 1)',
                    display: 'flex',
                    position: 'relative',
                    flexDirection: 'column',
                    alignSelf: 'center',
                    boxShadow: '0px 0px 24px -4px rgba(145, 158, 171, 0.3)',
                    background: 'white',
                }}
            >
                {loading ? <div style={{ position: 'absolute', left: 130, top: 80 }}><CircularProgress /> </div> :
                    <>
                        <div style={{ position: 'absolute', top: 11, left: 160, width: 133, height: 52 }}>
                            <img src={logoSRC} alt="LOGO" style={{ objectFit: 'scale-down', width: '100%', height: '100%' }} />
                        </div>
                        <QRCode value={value} size={136} style={{ position: "absolute", top: 11, left: 10 }} />
                        <div style={{ position: 'absolute', top: 74, left: 160 }}>
                            <Typography style={{ fontSize: 12, fontWeight: 700 }} >
                                {cardTitle}
                            </Typography>
                        </div>
                        <div style={{ position: 'absolute', top: 114, left: 162, maxWidth: 131 }} >
                            <Typography style={{ fontSize: 7, fontWeight: 500, textAlign: 'left' }} >
                                {cardSubTitle}
                            </Typography>
                        </div>
                        <div style={{ position: 'absolute', top: 152, overflow: 'hidden' }} >
                            <img src={PoweredBy} style={{ height: 50, width: 304, borderRadius: '0 0 14px 14px' }} />
                        </div>
                    </>
                }
            </Box>
        )
    }
}

// ---------------------------------------------------------------------------------