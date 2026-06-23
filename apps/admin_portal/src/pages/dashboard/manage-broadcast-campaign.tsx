/* eslint-disable react/jsx-no-bind */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
// React
import React, { useEffect, useState } from 'react';
// @mui/material
import { Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, createSvgIcon } from '@mui/material';
// others
import moment from 'moment';
import { addNewCampaign, deleteCampaign, getAllCampaigns, removeCampaign } from 'src/utils/ApiActions';
import { useNavigate } from 'react-router';
import { PiTrash } from 'react-icons/pi';
import { CreateNewCampaign } from './create-new-campaign';
import { ICampaignTemplate } from './create-new-template';

const PlusIcon = createSvgIcon(
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>,
    'Plus'
);

export interface IVarArray {
    key: string;
    value: string;
}
export interface ICampaignDetails {
    _id: string;
    title: string;
    type: 'IMMEDIATE' | 'SCHEDULED',
    template: string;
    users: string[];
    scheduledTime?: string;
    createdAt?: string;
    status: 'DRAFT' | 'COMPLETED' | 'ACTIVE' | 'SCHEDULED' | 'CANCELLED',
    Templates?: ICampaignTemplate[];
    variables?: IVarArray[];
     phoneBookIds: string[];
}

export interface IDraftDetails {
    _id: string;
    title?: string;
    type: 'IMMEDIATE' | 'SCHEDULED',
    template?: string;
    users?: string[];
    scheduledTime?: string;
    createdAt?: string;
    status: 'DRAFT',
    Templates?: ICampaignTemplate[];
    variables?: IVarArray[];
}

interface IStatus {
    label: string;
    value: string;
    color?: string;
    background?: string;
}

const status: IStatus[] = [
    { label: 'ALL', value: 'all' },
    { label: 'DRAFT', value: 'DRAFT', color: '#919EAB', background: '#edeff2' },
    { label: 'SCHEDULED', value: 'SCHEDULED', color: '#B76E00', background: '#fff2d6' },
    { label: 'CANCELLED', value: 'CANCELLED', color: '#B76E00', background: '#fff2d6' },
    { label: 'ACTIVE', value: 'ACTIVE', color: '#1939B7', background: '#dfe8ff' },
    { label: 'COMPLETED', value: 'COMPLETED', color: '#007B55', background: '#d6f2e5' },
]

export function ManageBroadcastCampaign() {
    const [clicked, setClicked] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
    const [cancelCampagin, setCancelCampagin] = useState<boolean>(false);

    const [selected, setSelected] = useState<ICampaignDetails>({} as ICampaignDetails);

    const [details, setDetails] = useState<ICampaignDetails[]>([]);
    const [filteredDetails, setFilteredDetails] = useState<ICampaignDetails[]>(details);
    const [statusFilteredDetails, setStatusFilteredDetails] = useState<ICampaignDetails[]>(details);

    const [searchType, setSearchType] = useState<string>('all');
    const [searchText, setSearchText] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const onAddCardClick = () => {
        setClicked(true);
    }

    useEffect(() => {
        getCampaigns();
    }, []);

    async function getCampaigns() {
        try {
            const { data: { success, data } } = await getAllCampaigns();
            if (success && data.length) {
                setDetails(data);
                setFilteredDetails(data);
            }
        } catch (error) {
            console.log('Unable to get the campaigns');
            console.log(error);
        }
    }

    async function deleteScheduledCampaigns(id: string) {
        const response: any = await removeCampaign(id);
        if (response) {
            getCampaigns();
            handleClose();
        }
    }

    async function deleteTheCampaigns(id: string) {
        const response: any = await deleteCampaign(id);
        if (response) {
            getCampaigns();
            handleClose();
        }
    }


    // Search
    const handleSearchType = (type: string) => {
        setSearchType(type);
        if (type?.trim()?.toLowerCase() === "all") {
            setFilteredDetails(details);
            setStatusFilteredDetails(details);
        } else {
            const _details: ICampaignDetails[] = details.filter((item: ICampaignDetails) => item.status === type);
            setFilteredDetails(_details);
            setStatusFilteredDetails(_details);
        }
    }


    const handleSearchText = (text: string) => {
        setSearchText(text);
        const _details = statusFilteredDetails?.filter((item: ICampaignDetails) => item.title?.trim()?.toLowerCase()?.includes(text?.trim()?.toLowerCase()));
        setFilteredDetails(_details);
    }

    function renderSearchHeader() {
        return (
            <Box
                sx={{
                    width: '100%',
                    marginTop: 2,
                    padding: 2
                }}
            >
                <TextField
                    select
                    label='Status'
                    value={searchType}
                    onChange={(e) => handleSearchType(e.target.value)}
                    style={{ width: '14%', fontSize: 16, marginRight: '2%' }}
                >
                    {status.map((item: any) => (
                        <MenuItem value={item.value}>{item.label}</MenuItem>
                    ))}

                </TextField>
                <TextField
                    type='search'
                    placeholder='Search'
                    value={searchText}
                    style={{ width: '84%', fontSize: 16 }}
                    onChange={(e) => handleSearchText(e.target.value)}
                />
            </Box>
        )
    }

    function statusRender(label: string) {
        const _status: IStatus[] = status?.filter((item) => item.value !== 'all' && item.label === label);
        return _status.map((s) => <Chip label={s.label} size='small' style={{ background: `${s.background}`, color: `${s.color}` }} />);
    }

    function handleClose() {
        setCancelCampagin(false);
        setIsDelete(false);
        setDeleteDialog(false);
        setSelected({} as ICampaignDetails);
    }

    function handleCampaginCancel() {
        deleteScheduledCampaigns(selected._id);
    }

    function handleDeleteCampaign() {
        deleteTheCampaigns(selected._id);
    }

    const handleCancelDialog = () => (
        <Dialog
            open={isDelete ? deleteDialog : cancelCampagin}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle id="alert-dialog-title">{isDelete ? 'Delete' : 'Cancel'} Campaign</DialogTitle>
            <DialogContent>
                <Typography>Are you sure to {isDelete ? 'delete' : 'cancel'} {selected.title} ?</Typography>
            </DialogContent>
            <DialogActions>
                <Button style={{ background: '#FF5630', color: '#FFF' }} onClick={handleClose}>
                    No
                </Button>
                <Button
                    style={{ background: '#36F', color: '#FFF' }}
                    onClick={() => isDelete ? handleDeleteCampaign() : handleCampaginCancel()}
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    )

    function renderCampaignTable() {
        return (
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Campaign Name</TableCell>
                            <TableCell>Template</TableCell>
                            <TableCell align='center'>Created Date</TableCell>
                            <TableCell align='center'>Excution Date</TableCell>
                            <TableCell align='center' >Status</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDetails?.map((row: any) => {
                            const startDate = new Date(row?.createdAt)?.toLocaleDateString?.('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            });
                            const scheduledTime = new Date(row?.scheduledTime)?.toLocaleDateString?.('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            });
                            return (
                                <TableRow
                                    key={`${row._id}`}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell>
                                        <Typography style={{ fontSize: 14, fontWeight: 600, color: '#212B6' }}>{row.title}</Typography>
                                        <Typography style={{ fontSize: 14, fontWeight: 400, color: '#637381' }}>{row._id}</Typography>
                                    </TableCell>
                                    <TableCell onClick={() => {
                                        navigate('/broadcast/create-template', { state: { data: row?.Templates?.[0] } });
                                    }}>
                                        <span className='text-sky-500 bold text-base cursor-pointer'>
                                            {row?.Templates?.[0]?.title}
                                        </span>
                                    </TableCell>
                                    <TableCell align='center'>{startDate}</TableCell>
                                    <TableCell align='center'>{scheduledTime}</TableCell>
                                    <TableCell align='center'>{statusRender(row.status)}</TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {row?.status === 'SCHEDULED' &&
                                                <Button
                                                    onClick={() => { setCancelCampagin(true); setSelected(row) }}
                                                    color="error"
                                                    component="label"
                                                    variant="contained"
                                                >
                                                    Cancel
                                                </Button>
                                            }
                                            {row?.status === 'DRAFT' &&
                                                <Button
                                                    onClick={() => { setIsEdit(true); setSelected(row); setClicked(true); }}
                                                    component="label"
                                                    variant="outlined"
                                                >
                                                    Edit Draft
                                                </Button>
                                            }
                                            {/* {(row?.status === 'COMPLETED' || row?.status === 'SCHEDULED') && ( */}
                                            <Button
                                                component="label"
                                                variant='outlined'
                                                size='small'
                                                color="error"
                                                onClick={() => { setSelected(row); setDeleteDialog(true); setIsDelete(true); }}
                                                style={{ minWidth: 10, padding: 16 }}
                                            >
                                                <PiTrash size={16} fill='#FF5630' style={{ cursor: 'pointer' }} />
                                            </Button>
                                            {/* )} */}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        }
                        )}
                    </TableBody>
                </Table>
            </TableContainer >
        )
    }

    async function newCampaignCall(campaignDetails: ICampaignDetails) {
        try {
            setLoading(true);
            const response = await addNewCampaign({ ...campaignDetails });
            console.log("this is immediate res", response);
            if (response) {
                getCampaigns();
                setLoading(false);
                setClicked(false);
            }
        } catch (error) {
            setLoading(false);
            console.log('Unable to create the new campaign at the moment');
            console.log(error);
        }finally{
            setLoading(false)
        }
    }

    // async function draftCampaignCall(draftDetails: ICampaignDetails) {
    //     try {
    //         setLoading(true);
    //         const response = await addNewCampaign({ ...draftDetails });
    //         if (response) {
    //             getCampaigns();
    // setLoading(false);
    //             setClicked(false);
    //         }
    //     } catch (error) {
    // setLoading(false);
    //         console.log('Unable to draft the new campaign at the moment');
    //         console.log(error);
    //     }
    // }

    return (
        <div>
            {!clicked ? (
                <div>
                    <Typography style={{ fontSize: 24, fontWeight: 700 }}>Broadcast - Manage Campaign </Typography>
                    <div style={{ width: '100%', textAlign: 'end', fontSize: 14 }}>
                        <Button
                            onClick={onAddCardClick}
                            style={{ background: '#36F', color: '#FFF' }}
                            component="label"
                            variant="contained"
                            startIcon={<PlusIcon />}
                        >
                            Create new Campaign
                        </Button>
                    </div>
                    <Paper elevation={3}>
                        {renderSearchHeader()}
                        {renderCampaignTable()}
                    </Paper>
                    {handleCancelDialog()}
                </div>
            ) : <CreateNewCampaign
                onSave={(campaignDetail: ICampaignDetails) => {
                    newCampaignCall(campaignDetail);
                }}
                onCancel={() => {
                    setClicked(false);
                    setLoading(false);
                    setSelected({} as ICampaignDetails);
                }}
                onDraft={(draftDetails: any) => {
                    newCampaignCall(draftDetails);
                }}
                draftDetails={isEdit ? selected : {} as ICampaignDetails}
                loading={loading}
            />}

        </div>
    )
}