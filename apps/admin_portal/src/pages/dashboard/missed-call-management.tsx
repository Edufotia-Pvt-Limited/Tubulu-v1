/* eslint-disable arrow-body-style */
import { useState } from "react";
// @mui/material
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
// react-icons
import { IoTime } from 'react-icons/io5';
import { AiFillMail } from 'react-icons/ai';
import { BsCheckCircleFill } from 'react-icons/bs';

interface IDetails {
    firstName: string;
    lastName: string;
    email: string;
    contact: number;
    address: string;
    city: string;
    state: string;
    message: string;
}

interface IRequestLog {
    id?: number;
    request: string;
    createdAt: string;
    status: 'Pending' | 'Completed';
}

const dummyRequestLog: IRequestLog[] = [
    {
        id: 1,
        request: 'Missed Call service number request 1',
        status: 'Pending',
        createdAt: '2023-10-02T19:38:08.458Z'
    },
    {
        id: 2,
        request: 'Missed Call service number request 2',
        status: 'Completed',
        createdAt: '2023-10-02T19:38:08.458Z'
    }
]

export function MissedCallManagement() {
    const [value, setValue] = useState<0 | 1>(0);
    const [details, setDetails] = useState<IDetails>({} as IDetails);

    const [requestLogData, setRequestLogData] = useState<IRequestLog[]>(dummyRequestLog);

    const handleSelect = (newValue: 0 | 1) => {
        setValue(newValue);
    };

    const handleChange = (key: keyof IDetails, text: string | number) => {
        setDetails({
            ...details,
            [key]: text
        })
    }

    const handleRequest = () => {
        console.log("send request")
    }

    const missedCallForm = () => {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: 600,
                    padding: '4%',
                    gap: 5
                }}>
                <div className="header">
                    <Typography style={{ fontSize: 18, fontWeight: 700 }}>Send request for a Missed call Service Number </Typography>
                </div>
                <div style={{ width: '90%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <TextField
                        fullWidth
                        type="text"
                        label='First Name'
                        value={details?.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        fullWidth
                        type="text"
                        label='Last Name'
                        value={details?.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                <div style={{ width: '90%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <TextField
                        fullWidth
                        type="email"
                        label='Email'
                        value={details?.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        fullWidth
                        type="number"
                        label='Contact'
                        value={details?.contact}
                        onChange={(e) => handleChange("contact", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                <div style={{ width: '90%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <TextField
                        fullWidth
                        type="text"
                        label='Address'
                        value={details?.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                <div style={{ width: '90%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <TextField
                        fullWidth
                        type="text"
                        label='City'
                        value={details?.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        fullWidth
                        type="text"
                        label='State'
                        value={details?.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                <div style={{ width: '90%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <TextField
                        style={{ width: '100%' }}
                        type='text'
                        multiline
                        rows={3}
                        label='Message'
                        value={details?.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                <div style={{ display: 'flex', width: '90%', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={handleRequest}
                        size="medium"
                        style={{ background: '#36F', color: '#FFF' }}
                        component="label"
                        variant="contained"
                    >
                        Send Request
                    </Button>
                </div>
            </Box>
        )
    }

    const requestLogScreen = () => {
        return (
            <Box
                sx={{
                    width: '90%',
                    marginTop: 5,
                }}
            >
                <Paper elevation={3}
                    sx={{
                        width: '100%',
                        height: 'auto',
                    }} >
                    <Typography style={{ fontSize: 18, fontWeight: 700, width: '100%', padding: 20 }}>Request Log</Typography>
                    <TableContainer component={Paper} style={{ marginTop: 10 }}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Request</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell >Status</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requestLogData?.map((row: IRequestLog) => {
                                    const date = new Date(row?.createdAt)?.toLocaleDateString?.('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    });
                                    return (
                                        <TableRow
                                            key={`${row.id}`}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell>{row?.request}</TableCell>
                                            <TableCell>{date}</TableCell>
                                            <TableCell align="center">
                                                <div>
                                                    <Typography style={{ display: 'flex', alignItems: 'center', justifyContent: 'start', gap: 8 }}>
                                                        {row.status === 'Completed' ? <BsCheckCircleFill size={20} fill="#00AB55" /> : <IoTime fill="#FFAB00" size={24} />}
                                                        {row?.status}
                                                    </Typography>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        )
    }


    return (
        <div>
            <Typography style={{ fontSize: 24, fontWeight: 700 }}>Features - Missed Call </Typography>
            <div style={{ marginTop: 40 }} />
            <Box sx={{ width: '90%', display: 'flex', textAlign: 'center', gap: '1%' }}>
                <Typography onClick={() => handleSelect(0)} style={{ display: 'flex', justifyContent: 'center', gap: 5, width: '100%', cursor: 'pointer', color: '#212B36', borderBottom: value === 0 ? '2px solid #3366FF' : '2px solid #637381', marginRight: 1, paddingBottom: 10, fontSize: 14, fontWeight: 600 }} >
                    <AiFillMail fill="#637381" size={20} /> Send request for a Missed call Service Number
                </Typography>
                <Typography onClick={() => handleSelect(1)} style={{ display: 'flex', justifyContent: 'center', gap: 5, width: '100%', cursor: 'pointer', color: '#212B36', borderBottom: value === 1 ? '2px solid #3366FF' : '2px solid #637381', fontSize: 14, fontWeight: 600 }} >
                    <IoTime fill="#637381" size={20} /> Request Log
                </Typography>
            </Box>
            {value === 0 ? missedCallForm() : requestLogScreen()}
        </div>
    )
}