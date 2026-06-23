/* eslint-disable react/jsx-no-bind */
// react
import React, { useEffect, useState, useRef, useCallback } from 'react';
// @mui material
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    createSvgIcon,
    MenuItem,
    Alert,
    Stepper,
    Step,
    StepLabel,
    SelectChangeEvent,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
} from '@mui/material';
import { styled } from '@mui/material/styles';
// react-icons
import { BiCloudUpload, BiSolidInfoCircle } from 'react-icons/bi';
import { PiTrash } from 'react-icons/pi';
import { FiDownload, FiLink2 } from 'react-icons/fi';
import { MdInfo } from 'react-icons/md';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// components
import { QRcard } from 'src/components/custom-QR-cards/QRcard';
import { UploadBox } from 'src/components/upload';
import Iconify from 'src/components/iconify';
// assets
import QRtemplateA from 'src/assets/QR-template-A.png';
import QRtemplateB from 'src/assets/QR-template-B.png';
// others
import uuidv4 from 'src/utils/uuidv4';
import { addNewQRCategory, addNewQRCode, baseUrl, deleteQRCode, editQRCode, getAllGroupsIntegration, getAllQRCategories, getAllQRCodes, getProfileDetails } from 'src/utils/ApiActions';
import { toPng } from 'html-to-image';
import { FaEye } from 'react-icons/fa';

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

const AddFileIcon = createSvgIcon(
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6"
    >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <line x1="9" y1="14" x2="15" y2="14" />
    </svg>,
    'AddFile'
);

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const steps = [
    { label: 'QR Card Details', btnText: 'Next' },
    { label: 'QR Card Message', btnText: 'Generate QR Card' },
    { label: 'Download QR Code', btnText: 'Download' }
];

export function ManageQRCode(): JSX.Element {
    const { user } = useAuthContext();
    const [open, setOpen] = useState<boolean>(false);
    const [categoryOpen, setCategoryOpen] = useState<boolean>(false);
    const [downloadOpen, setDownloadOpen] = useState<boolean>(false);
    const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const [cardDetails, setCardDetails] = useState<any>({
        value: uuidv4(),
        logoSRC: '',
        title: '',
        subTitle: '',
        categoryId: '',
        welcomeMessage: ''
    });

    const [errorState, setErrorState] = useState({
        value: '',
        logoSRC: '',
        title: '',
        subTitle: '',
        categoryId: '',
        welcomeMessage: ''
    });

    const [sameNameError, setSameNameError] = useState<boolean>(false);

    const [alertDetails, setAlertDetails] = useState({
        isSuccess: false,
        msg: '',
    });

    const [category, setCategory] = useState<string>('');
    const [categories, setCategories] = useState<any>([]);

    const [groups, setGroups] = useState([]);
    const [groupDetails, setGroupDetails] = useState<string[]>([]);

    const [QRcards, setQRCards] = useState([]);
    const [QRResponse, setQRResponse] = useState<any>({});

    const [activeStep, setActiveStep] = useState<number>(0);
    const [value, setValue] = useState<0 | 1>(0);
    const [cardTemplate, setCardTemplate] = useState<'A' | 'B'>('A');
    const [QRloading, setQRLoading] = useState<boolean>(false);

    const [logo, setLogo] = useState<string>('');
    const [QRlink, setLink] = useState<string>('');
    const [fileDetails, setFileDetails] = useState({});

    const [searchType, setSearchType] = useState<string>('all');
    const [searchText, setSearchText] = useState<string>('');

    const [filteredQRcards, setFilteredQRCards] = useState([]);
    const [categoryFilteredQRCards, setCategoryFilteredQRCards] = useState([]);

    const ref = useRef<HTMLDivElement>(null);

    async function fetchAllQRCards() {
        const response: any = await getAllQRCodes();
        if (response?.data?.success) {
            setQRCards(response?.data?.data);
            setFilteredQRCards(response?.data?.data);
            setCategoryFilteredQRCards(response?.data?.data);
        }
    }

    async function fetchAllCategories() {
        const response = await getAllQRCategories();
        const _category = { label: 'All', value: 'all' };
        if (response?.data?.success) {
            const groupData = [{ ..._category }, ...response?.data?.data?.map((item: any) => ({ label: item?.title, value: item?._id }))]
            setCategories(groupData);
        }
    }

    async function fetchAllGroups() {
        const response = await getAllGroupsIntegration();
        if (response?.data?.success) {
            const groupData = response?.data?.data?.map((item: any) => ({ label: item?.groupName, value: item?._id }))
            setGroups(groupData);
        }
    }

    async function fetchProfileDetails() {
        const response = await getProfileDetails();
        if (response) {
            const _data = response?.data?.data;
            setLogo(_data?.logo);
            setCardDetails({ ...cardDetails, logoSRC: _data?.logo });
        }
    }

    useEffect(() => {
        fetchAllQRCards();
        fetchAllCategories();
        fetchAllGroups();
        fetchProfileDetails();
    }, []);

    useEffect(() => {
        setErrorState({
            value: '',
            logoSRC: '',
            title: '',
            subTitle: '',
            categoryId: '',
            welcomeMessage: ''
        })
    }, [cardDetails]);

    useEffect(() => {
        if (!isEdit) {
            QRNameCheck();
        }
    }, [cardDetails?.title, isEdit])

    const onAddCardClick = () => {
        setOpen(true);
    };

    const handleNext = () => {
        if (activeStep < 2) {
            if (activeStep === 1) {
                if (checkValidation()) {
                    handleQREvent();
                }
            }
            if (activeStep < 1) {
                if (checkValidation()) {
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                }
            }
        }
        if (activeStep === 2) {
            handleQRCardDownload();
        }
    };

    const handleBack = () => {
        switch (activeStep) {
            case 2:
                return handleBackQRDelete();
            case 1:
                return setActiveStep(0);
        }
    }

    async function handleBackQRDelete() {
        await deleteQRCode(QRResponse?._id).then(res => {
            res?.data?.success && setActiveStep(1);
            fetchAllQRCards();
        });
    }

    const handleSelect = (event: "select" | "create", newValue: 0 | 1) => {
        setValue(newValue);
    };

    const handleClose = () => {
        setQRLoading(false);
        setOpen(false);
        setCategoryOpen(false);
        setCategory('');
        setActiveStep(0);
        setCardDetails({ value: uuidv4(), logoSRC: logo });
        setGroupDetails([]);
        setQRResponse({});
        setLink('');
        setDownloadOpen(false);
        setDeleteOpen(false);
        setIsEdit(false);
    };

    function checkValidation(): boolean {
        let validated = true;
        const { title, subTitle, categoryId, welcomeMessage } = cardDetails;
        const errorData = { ...errorState };
        if (activeStep === 0) {
            if (!title) {
                validated = false;
                errorData.title = 'Please add a Title'
            }
            if (!subTitle) {
                validated = false;
                errorData.subTitle = 'Please add a Sub Title'
            }
            if (!categoryId) {
                validated = false;
                errorData.categoryId = 'Please select a Category'
            }
            if (sameNameError) {
                validated = false;
            }
        }
        if (!welcomeMessage && activeStep === 1) {
            validated = false;
            errorData.welcomeMessage = 'Please enter a welcome message'
        }
        setErrorState(errorData);
        return validated;
    }

    function QRNameCheck(): boolean {
        let check = true;
        const _title: string = cardDetails?.title;
        const QRNames = QRcards?.map((QR: any) => QR?.title);
        const _checkName = QRNames?.find((name) => name?.trim?.()?.toLowerCase() === _title?.trim?.()?.toLowerCase());
        if (_checkName) {
            check = false;
            setSameNameError(true);
        } else {
            setSameNameError(false);
        }
        return check;
    }

    async function handleGenerateQRCode(): Promise<void> {
        try {
            const response: any = await addNewQRCode({
                title: cardDetails.title,
                subTitle: cardDetails.subTitle,
                categoryId: cardDetails.categoryId,
                welcomeMessage: cardDetails.welcomeMessage,
                phoneBookGroup: groupDetails,
                ...fileDetails
            });
            if (response) {
                setAlertDetails({
                    isSuccess: true,
                    msg: 'QR generated successfully',
                });
                const _data = response?.data;
                setQRResponse(_data);
                setLink(`${baseUrl}/qrCode/${_data._id}`);
                setQRLoading(false);
                fetchAllQRCards();
            } else {
                setAlertDetails({
                    isSuccess: false,
                    msg: 'Unable to generate QR at the moment',
                });
            }
        } catch (error) {
            console.log('Unable to proceed at the moment');
            // setErrorState({...errorState, firstName: 'Unable to submit request at the moment'});
        }
    }

    async function handleEditQRCode(): Promise<void> {
        try {
            const response: any = await editQRCode({
                title: cardDetails.title,
                subTitle: cardDetails.subTitle,
                categoryId: cardDetails.categoryId,
                welcomeMessage: cardDetails.welcomeMessage,
                phoneBookGroup: groupDetails,
                ...fileDetails
            }, cardDetails?._id);
            if (response) {
                setAlertDetails({
                    isSuccess: true,
                    msg: 'QR edited successfully',
                });
                const _data = response?.data;
                setQRResponse(_data);
                setLink(`${baseUrl}/qrCode/${_data._id}`);
                setQRLoading(false);
                fetchAllQRCards();
            } else {
                setAlertDetails({
                    isSuccess: false,
                    msg: 'Unable to edit QR at the moment',
                });
            }
        } catch (error) {
            console.log('Unable to proceed at the moment');
            // setErrorState({...errorState, firstName: 'Unable to submit request at the moment'});
        }
    }

    function handleEdit(details: any) {
        setOpen(true);
        setIsEdit(true);
        const _link: string = `${baseUrl}/qrCode/${details?._id}`;
        setGroupDetails(details?.phoneBookGroups);
        setCardDetails({ ...details, value: _link, logoSRC: logo });
    }

    async function handleQREvent() {
        setQRLoading(true);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        if (isEdit) {
            handleEditQRCode()
        } else {
            handleGenerateQRCode();
        }
        // setTimeout(() => {
        //     setQRLoading(false);
        // }, 1000);
    }

    const handleQRCardDownload = useCallback(() => {
        if (ref.current == null) {
            return
        }

        toPng(ref.current, { cacheBust: true, })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'QRCard.png';
                link.href = dataUrl;
                link.click();
            })
            .catch(error => {
                console.log(error);
            })
    }, [ref]);

    function handleDownloadClick(details: any) {
        setDownloadOpen(true);
        setLink(`${baseUrl}/qrCode/${details?._id}`);
        setCardDetails(details);
    }

    function handleCopyLink(_id: string, title: string) {
        const url = `${baseUrl}/qrCode/${_id}`;
        setLink(url);
        navigator.clipboard.writeText(url);
        // setCopied(true);
        setAlertDetails({
            isSuccess: true,
            msg: `Copied the link for ${title} successfully.`
        });
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function handleFileUpload(e: any) {
        const _file = e.target.files[0];
        setCardDetails({
            ...cardDetails,
            logoSRC: URL.createObjectURL(_file)
        })
    }

    const handleFormChange = (event: any, key: string) => {
        const _cardDetails = { ...cardDetails, [key]: event };
        setCardDetails(_cardDetails);
    };

    function handleFileChange(files: File[]) {
        const file: File = files[0];
        const reader: any = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            setFileDetails(
                {
                    mimeType: file.type,
                    fileName: file.name,
                    file: base64String
                }
            )
        };
    }

    const handleGroups = (event: SelectChangeEvent<typeof groupDetails>) => {
        const { target: { value }, } = event;
        const _groups = typeof value === 'string' ? value.split(',') : value;
        setGroupDetails(_groups);
        setCardDetails({
            ...cardDetails,
            phoneBookGroup: _groups
        });
    }

    const getCategoryById = (id: string) => {
        const _category: string = categories?.map((item: any) => item.value === id && item.label);
        return _category;
    }


    // QR card Dialog
    const handleQRCardDialog = () => (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
            maxWidth="md"
        >
            <DialogTitle id="alert-dialog-title">
                {isEdit ? 'Edit QR Card' : 'Add New QR Card'}
                <div style={{ marginTop: 16 }} />
                <Grid container spacing={2}>
                    <Grid
                        item
                        sm={18}
                    >
                        <Box sx={{ width: '100%' }}>
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {steps.map((item) => {
                                    const stepProps: { completed?: boolean } = {};
                                    return (
                                        <Step key={item.label} {...stepProps}>
                                            <StepLabel >{item.label}</StepLabel>
                                        </Step>
                                    );
                                })}
                            </Stepper>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                {activeStep === 0 && cardInputScreenA()}
                {activeStep === 1 && cardInputScreenB()}
                {activeStep === 2 && cardInputScreenC()}
            </DialogContent>
            <DialogActions>
                <Grid container sm={12} justifyContent="center" >
                    {activeStep > 0 && <Button
                        variant='contained'
                        color='error'
                        onClick={handleBack}
                    >
                        Back
                    </Button>}
                    {(activeStep === 2) && !QRloading && <div>
                        <Button
                            style={{ border: '1px solid #36F', color: '#36F', marginLeft: 8 }}
                            startIcon={<FiLink2 size={16} />}
                            onClick={() => handleCopyLink(QRResponse?._id, QRResponse?.title)}
                        >
                            Copy Link
                        </Button>
                    </div>}
                    <div style={{ margin: 4 }} />
                    {!QRloading && <div>
                        <Button
                            style={{ background: '#36F', color: '#FFF' }}
                            onClick={handleNext}
                            startIcon={activeStep == 2 && <FiDownload size={16} />}
                        >
                            {steps[activeStep].btnText}
                        </Button>
                    </div>}
                </Grid>
            </DialogActions>
        </Dialog>
    )

    const cardInputScreenA = () => (
        <Grid container spacing={1}>
            <Grid item xs={5} display='flex'>
                <QRcard
                    value={cardDetails.value}
                    type={cardTemplate}
                    cardTitle={cardDetails.title}
                    cardSubTitle={cardDetails.subTitle}
                    logoSRC={cardDetails.logoSRC}
                />
            </Grid>
            <Grid item xs={6}>
                <Grid item xs={6}>
                    <Typography style={{ fontSize: 14, fontWeight: 500 }}>Select QR Card Template</Typography>
                    <div style={{ display: 'flex', gap: 2 }}>
                        <img height={123} width={82} src={QRtemplateA} style={{ cursor: 'pointer', outline: cardTemplate === 'A' ? 'solid #3366FF' : 'none' }} onClick={() => setCardTemplate('A')} />
                        <img height={123} width={185} src={QRtemplateB} style={{ cursor: 'pointer', outline: cardTemplate === 'B' ? 'solid #3366FF' : 'none' }} onClick={() => setCardTemplate('B')} />
                    </div>
                </Grid>
                <div style={{ marginTop: 8 }} />
                {/* <Button
                        fullWidth
                        component="label"
                        style={{ background: '#36F', color: '#FFF', width: 500 }}
                        startIcon={<BiCloudUpload />}
                        variant="contained"
                    >
                        Upload Image
                        <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
                    </Button> */}
                <div style={{ marginTop: 14 }} />
                <Grid item sm={12} display="flex" >
                    <Grid item >
                        <TextField
                            style={{ width: 200, marginRight: 10 }}
                            type='text'
                            label='Card Title'
                            value={cardDetails.title}
                            error={(!!errorState?.title) || sameNameError}
                            onChange={(e) => handleFormChange(e.target.value, "title")}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        {sameNameError && <span className='text-xs text-red-500 mt-1'>Title already exists. Please use another title.</span>}
                        {errorState && <span className='text-xs text-red-500 mt-1'>{errorState?.title}</span>}
                        <Typography style={{ fontSize: 12, color: '#637381' }}>Title Maximum of 25 characters.</Typography>
                    </Grid>
                    <Grid item>
                        <TextField
                            style={{ width: 288 }}
                            type='text'
                            label='Card Sub Title'
                            value={cardDetails.subTitle}
                            error={!!errorState?.subTitle}
                            onChange={(e) => handleFormChange(e.target.value, "subTitle")}
                            InputLabelProps={{
                                shrink: true
                            }}
                        />
                        {errorState && <span className='text-xs text-red-500 mt-1'>{errorState?.subTitle}</span>}
                        <Typography style={{ fontSize: 12, color: '#637381' }}>Sub Title Maximum of 85 characters.</Typography>
                    </Grid>
                </Grid>
                <div style={{ marginTop: 12 }} />
                <Grid item xs={6}>
                    <TextField
                        label='Select QR Card Category'
                        select
                        error={!!errorState?.categoryId}
                        style={{ width: 500, fontSize: 14 }}
                        value={cardDetails.categoryId}
                        onChange={(e) => handleFormChange(e.target.value, "categoryId")}
                    >
                        {categories.map((item: any) => item.value !== 'all' && <MenuItem value={item.value}>{item.label}</MenuItem>)}
                    </TextField>
                    {errorState && <span className='text-xs text-red-500 mt-1'>{errorState?.categoryId}</span>}
                </Grid>
                <div style={{ marginTop: 12 }} />
                <Typography style={{ fontSize: 18, fontWeight: 500 }}>Add users to a User Group</Typography>
                <div style={{ marginTop: 12 }} />
                {/* <Box sx={{ width: '118%', display: 'flex', textAlign: 'center' }}>
                        <Typography onClick={() => handleSelect("select", 0)} style={{ width: '100%', cursor: 'pointer', color: value === 0 ? '#3366FF' : '#637381', borderBottom: value === 0 ? '2px solid #3366FF' : '2px solid #637381', marginRight: 1, paddingBottom: 10, fontSize: 14, fontWeight: 600 }} >Select Group</Typography>
                        <Typography onClick={() => handleSelect("create", 1)} style={{ width: '100%', cursor: 'pointer', color: value === 1 ? '#3366FF' : '#637381', borderBottom: value === 1 ? '2px solid #3366FF' : '2px solid #637381', fontSize: 14, fontWeight: 600 }} >Create Group</Typography>
                    </Box> */}
                <div style={{ marginTop: 12 }} />
                <FormControl style={{ width: 500 }}>
                    <InputLabel id="demo-multiple-name-label" >PhoneBook Groups</InputLabel>
                    <Select
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        multiple
                        value={groupDetails}
                        onChange={handleGroups}
                        input={<OutlinedInput label="PhoneBook Groups" />}
                    >
                        {
                            groups?.map((item: any) => (
                                <MenuItem value={item?.value}>{item?.label}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                <div style={{ marginTop: 12 }} />
                <Box sx={{ display: 'flex', width: '120%' }}>
                    <BiSolidInfoCircle size={18} fill='#FFAB00' />
                    <Typography style={{ fontSize: 12, fontWeight: 400 }}>
                        <b>Note: </b>
                        Upon Scanning this QR Code, the users will be automatically added to the designated Phonebook User Group.
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    )

    const cardInputScreenB = () => {
        if (!QRloading) {
            return (
                <Grid container spacing={1}>
                    <Grid item xs={5} display='flex'>
                        <QRcard
                            value={cardDetails.value}
                            type={cardTemplate}
                            cardTitle={cardDetails.title}
                            cardSubTitle={cardDetails.subTitle}
                            logoSRC={cardDetails.logoSRC}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <div style={{ marginTop: 6 }} />
                        <Grid item >
                            <TextField
                                style={{ width: 480, marginRight: 10 }}
                                type='text'
                                multiline
                                rows={6}
                                label='Message'
                                error={!!errorState?.welcomeMessage}
                                value={cardDetails.welcomeMessage}
                                onChange={(e) => handleFormChange(e.target.value, "welcomeMessage")}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            {errorState && <span className='text-xs text-red-500 mt-1'>{errorState.welcomeMessage}</span>}
                            <div style={{ marginTop: 6 }} />
                            <Typography style={{ fontSize: 12, color: '#637381', marginLeft: 8 }}>Maximum is 400 characters.</Typography>
                        </Grid>
                        <UploadBox
                            sx={{ width: '112%', height: '20%', border: '1px dashed' }}
                            maxSize={1024 * 1024 * 10}
                            placeholder={<><BiCloudUpload size={24} /> Upload Files</>}
                            onDropAccepted={(e) => handleFileChange(e)}
                        />
                        <Typography style={{ width: '112%', fontSize: 12, color: '#637381', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}><BiSolidInfoCircle size={16} fill='#FFAB00' />Upload Document or Image.</Typography>
                    </Grid>
                </Grid>
            )
        }
    }

    const cardInputScreenC = () => (
        <Grid container spacing={1}>
            <Grid item xs={12} display='flex' justifyContent='center'>
                <div ref={ref}>
                    <QRcard
                        loading={QRloading}
                        value={QRlink}
                        type={cardTemplate}
                        cardTitle={cardDetails?.title}
                        cardSubTitle={cardDetails?.subTitle}
                        logoSRC={cardDetails?.logoSRC ?? logo}
                    />
                </div>
            </Grid>
        </Grid>
    )

    // Category Dialog
    const onAddGroupClick = () => {
        setCategoryOpen(true);
    }

    async function handleAddCategorySubmit(): Promise<void> {
        try {
            const response = await addNewQRCategory({
                title: category
            });
            if (response) {
                setAlertDetails({
                    isSuccess: true,
                    msg: 'Category Added successfully',
                });
                fetchAllCategories();
                handleClose();
            } else {
                setAlertDetails({
                    isSuccess: false,
                    msg: 'Unable to add category at the moment',
                });
            }
        } catch (error) {
            console.log('Unable to proceed at the moment');
            // setErrorState({...errorState, firstName: 'Unable to submit request at the moment'});
        }
    }

    const handleCategoryDialog = () => (
        <Dialog
            open={categoryOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle id="alert-dialog-title">Create Category</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} style={{ marginTop: '1%' }}>
                    <Grid item style={{ width: '100%' }}>
                        <TextField
                            style={{ width: '100%' }}
                            onChange={(event) => setCategory(event?.target?.value)}
                            value={category}
                            type="text"
                            label="Category"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button style={{ background: '#FF5630', color: '#FFF' }} onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    style={{ background: '#36F', color: '#FFF' }}
                    onClick={handleAddCategorySubmit}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )

    // Download Dialog

    function handleDownloadDialog() {
        return (
            <Dialog
                open={downloadOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle id="alert-dialog-title">Download QR Card</DialogTitle>
                <DialogContent>
                    {cardInputScreenC()}
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        style={{ background: '#36F', color: '#FFF' }}
                        onClick={handleQRCardDownload}
                        startIcon={<FiDownload size={16} />}
                    >
                        Download
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    // Delete Dialog

    async function deleteQRCard(_id: string, title: string) {
        const response = await deleteQRCode(_id);
        if (response) {
            fetchAllQRCards();
            handleClose();
            setAlertDetails({
                isSuccess: true,
                msg: `Deleted the ${title} Card successfully.`
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const onClickDelete = (details: any) => {
        setDeleteOpen(true);
        setCardDetails(details);
    };

    function handleQRDelete() {
        deleteQRCard(cardDetails?._id, cardDetails?.title);
    }

    const handleDeleteDialog = () => (
        <Dialog
            open={deleteOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle>Delete QR Card</DialogTitle>
            <DialogContent>
                <Typography>Are you sure to delete <span className='text-red-500'>{cardDetails?.title}</span> QR card?</Typography>
            </DialogContent>
            <DialogActions>
                <Button style={{ background: '#FF5630', color: '#FFF' }} onClick={handleClose}>
                    No
                </Button>
                <Button
                    style={{ background: '#36F', color: '#FFF' }}
                    onClick={handleQRDelete}
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    )

    // Search Events

    const handleSearchType = (text: string) => {
        setSearchType(text);
        if (!text || text.trim().toLowerCase() === "all") {
            setFilteredQRCards(QRcards);
            setCategoryFilteredQRCards(QRcards);
        } else {
            const _data: any = QRcards.filter((card: any) => (card.categoryId || '').trim().toLowerCase() === (text || '').trim().toLowerCase());
            setFilteredQRCards(_data);
            setCategoryFilteredQRCards(_data);
        }
    }

    const handleSearchText = (text: string) => {
        setSearchText(text);
        const _data = categoryFilteredQRCards?.filter((card: any) => (card.title || '').trim().toLowerCase().includes((text || '').trim().toLowerCase()));
        setFilteredQRCards(_data);
    }

    const renderSearchHeader = () => (
        <Box
            sx={{
                width: '100%',
                marginTop: 2,
                padding: 2
            }}
        >
            <TextField
                select
                label='Category'
                value={searchType}
                onChange={(e) => handleSearchType(e.target.value)}
                style={{ width: '20%', fontSize: 16, marginRight: '2%' }}
            >
                {categories.map((item: any) => (
                    <MenuItem value={item.value}>{item.label}</MenuItem>
                ))}
            </TextField>
            <TextField
                placeholder='Search'
                value={searchText}
                style={{ width: '78%', fontSize: 16 }}
                onChange={(e) => handleSearchText(e.target.value)}
            />
        </Box>
    )

    const renderQRTable = () => (
        <TableContainer >
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
                        <TableCell>QR Code ID</TableCell>
                        <TableCell align="center">Title</TableCell>
                        <TableCell align="center">Sub Title</TableCell>
                        <TableCell align="center">Category</TableCell>
                        <TableCell align="center">Date Created</TableCell>
                        <TableCell align="center">Total Scanned</TableCell>
                        <TableCell align="center">Download</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredQRcards?.map((row: any) => {
                        const date = new Date(row?.createdAt)?.toLocaleDateString?.('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });
                        return (
                            <TableRow
                                key={`${row.QRCodeId}`}
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
                                <TableCell component="th" scope="row">
                                    {row?._id}
                                </TableCell>
                                <TableCell align="center">{row?.title}</TableCell>
                                <TableCell align="center">{row?.subTitle}</TableCell>
                                <TableCell align="center">
                                    {getCategoryById(row.categoryId)}
                                </TableCell>
                                <TableCell align="center">{date}</TableCell>
                                <TableCell align="center">{row?.totalScanned}</TableCell>
                                <TableCell align="center">
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} >
                                        <Button
                                            component="label"
                                            variant='outlined'
                                            startIcon={<FiLink2 />}
                                            size='small'
                                            onClick={() => handleCopyLink(row?._id, row?.title)}
                                        >
                                            Copy
                                        </Button>
                                        <Button
                                            style={{
                                                minWidth: 24,
                                                background: '#E02D69',
                                                color: 'white',
                                            }}
                                            onClick={() => handleDownloadClick(row)}
                                        >
                                            <FaEye size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell align='center'>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            x="0px"
                                            y="0px"
                                            style={{ cursor: 'pointer' }}
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
                                            onClick={() => { onClickDelete(row) }}
                                            style={{ minWidth: 24 }}
                                        >
                                            <PiTrash size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )

    const [storeDialogOpen, setStoreDialogOpen] = useState<boolean>(false);

    const onStoreQRClick = () => {
        setLink(`${baseUrl}/public/store/${user?._id}/qr`);
        setCardDetails({
            title: 'Our Store',
            subTitle: 'Scan to view our products',
            logoSRC: logo
        });
        setStoreDialogOpen(true);
    };

    const handleStoreDialog = () => (
        <Dialog
            open={storeDialogOpen}
            onClose={() => setStoreDialogOpen(false)}
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle>Customer Store QR</DialogTitle>
            <DialogContent sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <div ref={ref}>
                    <QRcard
                        value={QRlink}
                        type="A"
                        cardTitle="Our Online Store"
                        cardSubTitle="Scan to browse all products"
                        logoSRC={logo}
                    />
                </div>
            </DialogContent>
            <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    style={{ background: '#36F', color: '#FFF' }}
                    onClick={handleQRCardDownload}
                    startIcon={<FiDownload size={16} />}
                >
                    Download QR
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <div>
            <Typography style={{ fontSize: 24, fontWeight: 700 }}>Vendor Store - Manage QR Code </Typography>
            <div style={{ width: '100%', textAlign: 'end', fontSize: 14, display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                <Button
                    onClick={onStoreQRClick}
                    style={{ background: '#FFAB00', color: '#FFF' }}
                    variant="contained"
                    startIcon={<Iconify icon="solar:shop-bold" />}
                >
                    Customer Store QR
                </Button>
                <Button
                    onClick={onAddCardClick}
                    style={{ background: '#36F', color: '#FFF' }}
                    variant="contained"
                    startIcon={<PlusIcon />}
                >
                    Create new QR Card
                </Button>
                <Button
                    onClick={onAddGroupClick}
                    style={{ background: '#00AB55', color: '#FFF' }}
                    variant="contained"
                    startIcon={<AddFileIcon />}
                >
                    Add Category
                </Button>
            </div>
            <Paper elevation={3} sx={{ mt: 3 }}>
                {renderSearchHeader()}
                {renderQRTable()}
            </Paper>
            {handleQRCardDialog()}
            {handleCategoryDialog()}
            {handleDownloadDialog()}
            {handleDeleteDialog()}
            {handleStoreDialog()}
            {alertDetails?.msg && (
                <Alert
                    onClose={() => {
                        setAlertDetails({} as any);
                    }}
                    style={{ position: 'absolute', top: 6, zIndex: 1111, left: 580 }}
                    severity={alertDetails?.isSuccess ? 'success' : 'error'}
                >
                    {alertDetails?.msg}
                </Alert>
            )}
        </div>
    );
}