// React
import React, { useEffect, useState } from 'react';
// @mui/material
import { Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, createSvgIcon } from '@mui/material';
// others
import { DatePicker } from '@mui/x-date-pickers';
import { getAllTemplates, removeTemplate } from 'src/utils/ApiActions';
import { useNavigate } from 'react-router';
import { status } from 'nprogress';
import { PiTrash } from 'react-icons/pi';

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

export interface ITemplate {
    _id: string;                 // MongoDB ObjectId
    title: string;
    mediaType?: string;
    mediaURL?: string;
    messageBody?: string;
    messageActions?: any[];      // Array of actions, match your MessageActionSchema if needed
    integrationId?: string;       // ObjectId as string
    status: 'APPROVED' | 'PENDING';
    payload?: Map<string, any>;
    deletedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}


interface IStatus {
    label: string;
    value: string;
    color?: string;
    background?: string;
}

const newStatus: IStatus[] = [
    { label: 'PENDING', value: 'PENDING', color: '#B76E00', background: '#fff2d6' },
    { label: 'APPROVED', value: 'APPROVED', color: '#007B55', background: '#d6f2e5' },
]

export function ManageBroadcastTemplate() {
    const [isEdit, setIsEdit] = useState<boolean>(false);

    // const [details, setDetails] = useState([]);
    // const [filteredDetails, setFilteredDetails] = useState(details);
    const [details, setDetails] = useState<ITemplate[]>([]);
const [filteredDetails, setFilteredDetails] = useState<ITemplate[]>([]);
const [selected, setSelected] = useState<ITemplate | null>(null);

    // const [selected, setSelected] = useState({});
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

    const [searchText, setSearchText] = useState<string>('');

    const navigate: any = useNavigate();

    // API Actions: 

    async function fetchAllTemplates(searchValue: string = "") {
        const response: any = await getAllTemplates(searchValue);
        if (response?.data?.success) {
            setDetails(response?.data?.data);
            setFilteredDetails(response?.data?.data);
        }
    }

    async function deleteTemplate(id: string) {
        const response: any = await removeTemplate(id);
        if (response) {
            fetchAllTemplates();
            handleClose();
        }
    }

    useEffect(() => {
        fetchAllTemplates();
    }, [])

    const onAddCardClick = () => {
        navigate('/broadcast/create-template');
    }

    const handleEdit = (data: any) => {
        navigate('/broadcast/create-template', { state: { data } });
    }

    const handleClose = () => {
        setIsEdit(false);
        setSelected(null);
        // setSelected({});
        setDeleteDialog(false);
    };

    // function handleTemplateCancel() {
    //     deleteTemplate(selected._id);
    // }
     function handleTemplateCancel() {
        if (selected) {
            deleteTemplate(selected._id);
        }
    }


    // Search
    const handleSearchText = (text: string) => {
        setSearchText(text);
        // Call API with search parameter instead of client-side filtering
        fetchAllTemplates(text);
    }

    function statusRender(label: string) {
        const _status: IStatus[] = newStatus?.filter((item) => item.label === label);
        return _status.map((s) => <Chip label={s.label} size='small' style={{ background: `${s.background}`, color: `${s.color}` }} />);
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
                {/* <DatePicker
                    format="dd/MM/yyyy"
                    label="From Date"
                    sx={{ width: '14%', marginRight: '2%' }}
                // onChange={(value) => handleFormChange(value, 'birthday', true)}
                // value={new Date(contactDetails?.birthday) || ''}
                />
                <DatePicker
                    format="dd/MM/yyyy"
                    label="To Date"
                    sx={{ width: '14%', marginRight: '2%' }}
                // onChange={(value) => handleFormChange(value, 'birthday', true)}
                // value={new Date(contactDetails?.birthday) || ''}
                /> */}
                <TextField
                    type='search'
                    placeholder='Search'
                    value={searchText}
                    style={{ width: '100%' }}
                    // style={{ width: '68%', fontSize: 16 }}
                    onChange={(e) => handleSearchText(e.target.value)}
                />
            </Box>
        )
    }

    const handleCancelDialog = () => (
        <Dialog
            open={deleteDialog}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle id="alert-dialog-title">Delete Template</DialogTitle>
            <DialogContent>
                <Typography><b>{selected?.title}</b> might be associated with other campaigns, deleting the template will not stop the campaigns.</Typography>
                <br />
                <Typography color='error'>Confirm Delete?</Typography>
            </DialogContent>
            <DialogActions>
                <Button style={{ background: '#FF5630', color: '#FFF' }} onClick={handleClose}>
                    No
                </Button>
                <Button
                    style={{ background: '#36F', color: '#FFF' }}
                    onClick={handleTemplateCancel}
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    )

    function renderTemplateTable() {
        return (
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {/* <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    checked={false}
                                    inputProps={{
                                        'aria-labelledby': '',
                                    }}
                                />
                            </TableCell> */}
                            <TableCell>Template Name</TableCell>
                            <TableCell>Status</TableCell>
                            {/* <TableCell>To Date</TableCell> */}
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDetails?.map((row: any) =>
                        // const startDate = new Date(row?.startDate)?.toLocaleDateString?.('en-US', {
                        //     year: 'numeric',
                        //     month: 'long',
                        //     day: 'numeric',
                        // });
                        // const endDate = new Date(row?.endDate)?.toLocaleDateString?.('en-US', {
                        //     year: 'numeric',
                        //     month: 'long',
                        //     day: 'numeric',
                        // });
                        (
                            <TableRow
                                // key={`${row.code}`}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                {/* <TableCell padding='checkbox'>
                                        <Checkbox
                                            color="primary"
                                            checked={false}
                                            inputProps={{
                                                'aria-labelledby': '',
                                            }}
                                        />
                                    </TableCell> */}
                                <TableCell>
                                    <Typography style={{ fontSize: 14, fontWeight: 600, color: '#212B6' }}>{row.title}</Typography>
                                    {/* <Typography style={{ fontSize: 14, fontWeight: 400, color: '#637381' }}>{row.code}</Typography> */}
                                </TableCell>
                                <TableCell>{statusRender(row?.status)}</TableCell>
                                {/* <TableCell>{endDate}</TableCell> */}
                                <TableCell>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 5, cursor: 'pointer' }} >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            x="0px"
                                            y="0px"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            onClick={() => {
                                                handleEdit(row);
                                            }}
                                        >
                                            <path
                                                d="M 18 2 L 15.585938 4.4140625 L 19.585938 8.4140625 L 22 6 L 18 2 z M 14.076172 5.9238281 L 3 17 L 3 21 L 7 21 L 18.076172 9.9238281 L 14.076172 5.9238281 z"
                                                fill="#637381"
                                            />
                                        </svg>
                                        <Button
                                            component="label"
                                            variant='outlined'
                                            size='small'
                                            color="error"
                                            onClick={() => { setSelected(row); setDeleteDialog(true) }}
                                            style={{ minWidth: 10 }}
                                        >
                                            <PiTrash size={16} fill='#FF5630' style={{ cursor: 'pointer' }} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }

    return (
        <div>
            <div>
                <Typography style={{ fontSize: 24, fontWeight: 700 }}>Broadcast - Manage Template </Typography>
                <div style={{ width: '100%', textAlign: 'end', fontSize: 14 }}>
                    <Button
                        onClick={onAddCardClick}
                        style={{ background: '#36F', color: '#FFF' }}
                        component="label"
                        variant="contained"
                        startIcon={<PlusIcon />}
                    >
                        Create new Template
                    </Button>
                </div>
                <Paper elevation={3}>
                    {renderSearchHeader()}
                    {renderTemplateTable()}
                </Paper>
                {handleCancelDialog()}
            </div>
        </div>
    )
}