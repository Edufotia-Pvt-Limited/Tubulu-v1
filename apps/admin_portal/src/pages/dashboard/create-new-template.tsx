/* eslint-disable import/no-cycle */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react-hooks/exhaustive-deps */
// React
import React, { useEffect, useState } from "react";
// @mui/material
import { Box, Button, Checkbox, Divider, FormControl, FormControlLabel, FormLabel, MenuItem, Paper, Radio, RadioGroup, TextField, Typography, styled } from "@mui/material";
// Icons
import { MdCloudUpload } from "react-icons/md";
import { BiSolidInfoCircle } from 'react-icons/bi';
import { CiTrash } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
import { addNewTemplate, editNewTemplate, getAllTemplates } from "src/utils/ApiActions";
import { useLocation, useNavigate } from "react-router";
import uuidv4 from "src/utils/uuidv4";
import { LoadingButton } from "@mui/lab";
import { compareArrays } from "src/utils/helper";
import { TemplateMockup } from "../components/template-mockup";

export interface ICampaignTemplate {
    _id?: string;
    status?: "PENDING" | "APPROVED";
    title: string;
    mediaType: "AUDIO" | "IMAGE" | "VIDEO" | "DOCUMENT";
    mediaURL?: string;
    messageBody: string;
    payload?: {
        documentUrl?: string,
        mimeType?: string,
        documentName?: string,
    }
    messageActions?: IButtonGroup[];
    variables?: Array<{
        key: string;
        required: boolean;
        _id: string;
    }>;
}

export interface IButtonGroup {
    index?: number;
    id: string;
    type: 'QUICK_REPLY' | 'CALL_TO_ACTION';
    title: string;
    actionApi?: string;
    actionMessage?: string;
}

interface IFileUploads {
    mimeType: string;
    fileName: string;
    file: string;
}

const variableOptn = [
    { label: 'Call to Action', value: 'CALL_TO_ACTION' },
    { label: 'Quick Reply', value: 'QUICK_REPLY' }
]

const mediaGroup = [
    { label: 'Image', value: 'IMAGE' },
    { label: 'Video', value: 'VIDEO' },
    { label: 'Audio', value: 'AUDIO' },
    { label: 'Document', value: 'DOCUMENT' },
    // { label: 'Carousel Card', value: 'CAROUSEL' }
]

const MEDIA_TYPES = {
    IMAGE: "image/jpg, image/jpeg, image/png",
    VIDEO: "video/mp4, video/x-msvideo",
    AUDIO: "audio/mpeg, audio/x-wav",
    DOCUMENT: "application/pdf"
}

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

export function CreateNewTemplate() {

    const navigate: any = useNavigate();
    const location: any = useLocation();

    const [btnDetails, setBtnDetails] = useState<IButtonGroup>({
        id: '',
        type: 'CALL_TO_ACTION',
        title: '',
        actionApi: '',
        actionMessage: ''
    });
    const [details, setDetails] = useState<ICampaignTemplate>({} as ICampaignTemplate);
    const [fileDetails, setFileDetails] = useState<IFileUploads>({} as IFileUploads);
    const [buttons, setButtons] = useState<IButtonGroup[]>([]);
    const [locationDetails, setLocationDetails] = useState<ICampaignTemplate>({} as ICampaignTemplate);
    const [loading, setLoading] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [templateNames, setTemplateNames] = useState<string[]>([]);

    const [alertDetails, setAlertDetails] = useState({
        isSuccess: false,
        msg: '',
    });

    const [errorState, setErrorState] = useState({
        title: ''
    });

    const [buttonErrors, setButtonErrors] = useState<{ [key: string]: { actionApi?: string; actionMessage?: string } }>({});

    const [isEdit, setEdit] = useState<boolean>(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    useEffect(() => {
        if (location?.state?.data) {
            setEdit(true);
            setEditState();
        } else {
            // Clear error state on initial load if not editing
            setErrorState({ title: '' });
        }
    }, []);

    useEffect(() => {
        if (isEdit) {
            handleDisable();
        }
    }, [isEdit, details, buttons])

    async function setEditState() {
        if (location?.state?.data) {
            const _data: ICampaignTemplate = await location?.state?.data;
            setDetails(_data);
            setLocationDetails(_data);
            // Clear any validation errors when loading edit data
            setErrorState({ title: '' });
            if (_data?.messageActions) {
                // Ensure all buttons have unique IDs
                const buttonsWithIds = _data.messageActions.map((btn: IButtonGroup) => ({
                    ...btn,
                    id: btn.id || uuidv4()
                }));
                setButtons(buttonsWithIds);
            }
        }
    }

    function handleDisable() {
        let disable = true;
        const { title, mediaURL, messageBody, messageActions } = locationDetails;
        if (title?.trim() !== details?.title?.trim()) {
            disable = false;
        }
        if (mediaURL?.trim() !== details?.mediaURL?.trim()) {
            disable = false;
        }
        if (messageBody?.trim() !== details?.messageBody?.trim()) {
            disable = false;
        }
        // if (!compareArrays(messageActions, buttons)) {
        //     disable = false;
        // }
        if (!compareArrays(messageActions ?? [], buttons)) {
    disable = false;
}

        setDisabled(disable);
        return disable;
    }

    useEffect(() => {
        // Only validate title when creating new template, not when editing
        if (!isEdit && details?.title !== undefined) {
            templateNameCheck();
        } else if (isEdit && details?.title) {
            // Clear error when editing and title exists
            setErrorState({ title: '' });
        }
    }, [details?.title, isEdit])

    function templateNameCheck(): boolean {
        let check = true;
        const errorMsg = { ...errorState };
        const _title: string = details?.title;
        
        // Don't show required error when editing (data might still be loading)
        if (!isEdit) {
            // Check if title is required only when creating new template
            if (!_title || !_title.trim()) {
                errorMsg.title = 'Template title is required';
                check = false;
                setErrorState(errorMsg);
                return check;
            }
        }
        
        // If title is empty in edit mode, don't validate yet (data might be loading)
        if (isEdit && (!_title || !_title.trim())) {
            setErrorState({ title: '' });
            return true;
        }
        
        // When editing, allow the current template's title
        const currentTitle = isEdit ? locationDetails?.title?.trim()?.toLowerCase() : '';
        const _checkName = templateNames?.find((name) => {
            const nameLower = name?.trim?.()?.toLowerCase();
            const titleLower = _title?.trim?.()?.toLowerCase();
            // Exclude current template's title when editing
            if (isEdit && nameLower === currentTitle) {
                return false;
            }
            return nameLower === titleLower;
        });
        
        if (_checkName) {
            errorMsg.title = 'Title already exists. Please use another title.'
            check = false;
            setErrorState(errorMsg);
        } else {
            setErrorState(
                { title: '' }
            );
        }

        return check;
    }

    function validateButtons(): boolean {
        const errors: { [key: string]: { actionApi?: string; actionMessage?: string } } = {};
        let isValid = true;

        buttons.forEach((btn) => {
            const btnErrors: { actionApi?: string; actionMessage?: string } = {};
            
            if (btn.type === 'CALL_TO_ACTION') {
                if (!btn.actionApi || !btn.actionApi.trim()) {
                    btnErrors.actionApi = 'Website URL is required for Call to Action';
                    isValid = false;
                }
            } else if (btn.type === 'QUICK_REPLY') {
                if (!btn.actionMessage || !btn.actionMessage.trim()) {
                    btnErrors.actionMessage = 'Next Action Message is required for Quick Reply';
                    isValid = false;
                }
            }
            
            if (Object.keys(btnErrors).length > 0) {
                errors[btn.id] = btnErrors;
            }
        });

        setButtonErrors(errors);
        return isValid;
    }

    // Api Calls
    async function fetchAllTemplates(): Promise<void> {
        const response = await getAllTemplates();
        if (response?.data?.data) {
            const _data = response?.data?.data;
            setTemplateNames(_data?.map((template: any) => template?.title));
        }
    }

    useEffect(() => {
        fetchAllTemplates();
    }, [])

    async function handleSubmit(): Promise<void> {
        try {
            if (templateNameCheck() && validateButtons()) {
                setLoading(true);
                const response: any = await addNewTemplate({
                    ...details,
                    ...fileDetails,
                    messageActions: buttons.map(item => ({
                        title: item.title,
                        actionApi: item.actionApi,
                        type: item.type,
                        ...(item.type === 'QUICK_REPLY' && { actionMessage: item.actionMessage }),
                    })),
                })
                if (response) {
                    setLoading(false);
                    setAlertDetails({
                        isSuccess: true,
                        msg: 'Template created successfully',
                    });
                    navigate('/broadcast/manage-template');
                } else {
                    setLoading(false);
                    setAlertDetails({
                        isSuccess: false,
                        msg: 'Unable to create template at the moment',
                    });
                }
            }
        } catch (error) {
            setLoading(false);
            console.log('Unable to proceed at the moment');
        }
    }

    async function handleEditSubmit(): Promise<void> {
        try {
            if (location?.state?.data) {
                if (templateNameCheck() && validateButtons()) {
                    setLoading(true);
                    const response = await editNewTemplate({
                        ...details,
                        ...fileDetails,
                        messageActions: buttons.map(item => ({
                            title: item.title,
                            actionApi: item.actionApi,
                            type: item.type,
                            ...(item.type === 'QUICK_REPLY' && { actionMessage: item.actionMessage }),
                        })),
                    }, location?.state?.data._id);
                    if (response) {
                        setLoading(false);
                        setAlertDetails({
                            isSuccess: true,
                            msg: 'Template Updated successfully',
                        });
                        navigate('/broadcast/manage-template');
                    } else {
                        setLoading(false);
                        setAlertDetails({
                            isSuccess: false,
                            msg: 'Unable to edit template at the moment',
                        });
                    }
                }
            }
        } catch (error) {
            setLoading(false);
            console.log('Unable to proceed at the moment');
            // setErrorState({...errorState, firstName: 'Unable to submit request at the moment'});
        }
    }

    function handleClose() {
        setDisabled(false);
        navigate('/broadcast/manage-template');
    }

    function handleFileUpload(e: any) {
        const file = e.target.files[0];
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

    function handleChange(key: keyof ICampaignTemplate, type: string | number | boolean): void {
        setDetails({
            ...details,
            [key]: type
        })
    }

    // Button functions
    const handleAddMore = () => {
        setButtons([...buttons, { ...btnDetails, id: uuidv4() }]);
        setBtnDetails({
            id: '',
            type: 'CALL_TO_ACTION',
            title: '',
            actionApi: '',
            actionMessage: ''
        });
        setFocusedIndex(-1);
    };

    const handleDeleteButton = (index: number) => {
        const newButtons = [...buttons];
        newButtons.splice(index, 1);
        setButtons(newButtons)
    };

    const handleAddBtn = () => {
        handleAddMore();
    }

    function handleAddBtnChange(key: keyof IButtonGroup, value: string, selectedID: string, index?: number) {
        const _buttons = [...buttons];
        // Use index if provided, otherwise find by ID
        const _index = index !== undefined ? index : _buttons.findIndex((btn) => btn.id === selectedID);
        
        if (_index === -1) {
            console.error('Button not found with ID:', selectedID);
            return;
        }
        
        const currentButton = _buttons[_index];
        
        // Ensure button has an ID - create new object with ID if missing
        const buttonWithId = currentButton.id 
            ? currentButton 
            : { ...currentButton, id: uuidv4() };
        
        // If changing button type, clear the related field
        if (key === 'type' && buttonWithId.type !== value) {
            if (value === 'CALL_TO_ACTION') {
                // Switching to CALL_TO_ACTION, clear actionMessage
                _buttons[_index] = { 
                    ...buttonWithId, 
                    [key]: value, 
                    actionMessage: '',
                    actionApi: buttonWithId.actionApi || ''
                };
            } else if (value === 'QUICK_REPLY') {
                // Switching to QUICK_REPLY, clear actionApi
                _buttons[_index] = { 
                    ...buttonWithId, 
                    [key]: value, 
                    actionApi: '',
                    actionMessage: buttonWithId.actionMessage || ''
                };
            }
        } else {
            _buttons[_index] = { ...buttonWithId, [key]: value };
        }
        
        setButtons(_buttons);
        
        // Clear error for this button field when user starts typing
        if (key === 'actionApi' || key === 'actionMessage') {
            const updatedErrors = { ...buttonErrors };
            const buttonId = _buttons[_index].id;
            if (updatedErrors[buttonId]) {
                delete updatedErrors[buttonId][key];
                if (Object.keys(updatedErrors[buttonId]).length === 0) {
                    delete updatedErrors[buttonId];
                }
            }
            setButtonErrors(updatedErrors);
        }
    }

    function getButtonGroup(btn: IButtonGroup, index: number) {
        // Ensure button has an ID
        const buttonId = btn.id || `btn-${index}-${uuidv4()}`;
        return (
            <Box 
                key={`${buttonId}-${index}`} 
                sx={{ 
                    width: '100%', 
                    marginBottom: 2, 
                    padding: 2.5,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    display: 'flex', 
                    gap: 2,
                    boxSizing: 'border-box',
                    backgroundColor: '#fafafa',
                    minHeight: 140,
                    alignItems: 'flex-start'
                }}
            >
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                        <TextField
                            select
                            label='Select button type'
                            sx={{ flex: '0 0 48%', minWidth: 0, marginTop:1 }}
                            value={btn?.type}
                            onChange={(e) => handleAddBtnChange("type", e.target.value, btn.id || '', index)}
                            size="small"
                        >
                            {variableOptn?.map((item) => <MenuItem key={item.value} value={item.value} >{item.label}</MenuItem>)}
                        </TextField>
                        <TextField
                            label='Enter button text'
                            sx={{ flex: 1, minWidth: 0, marginTop:1 }}
                            value={btn?.title}
                            onChange={(e) => handleAddBtnChange("title", e.target.value, btn.id || '', index)}
                            InputLabelProps={{
                                shrink: true
                            }}
                            onFocus={() => setFocusedIndex(index || -1)}
                            onBlur={() => setFocusedIndex(-1)}
                            focused={focusedIndex === index}
                            size="small"
                        />
                    </Box>
                    {btn?.type === 'CALL_TO_ACTION' && <TextField
                        label='Website URL'
                        fullWidth
                        value={btn?.actionApi || ''}
                        required
                        error={!!buttonErrors[btn.id || '']?.actionApi}
                        helperText={buttonErrors[btn.id || '']?.actionApi}
                        onChange={(e) => handleAddBtnChange("actionApi", e.target.value, btn.id || '', index)}
                        InputLabelProps={{
                            shrink: true
                        }}
                        size="small"
                    />}
                    {btn?.type === 'QUICK_REPLY' && <TextField
                        label='Next Action Message'
                        fullWidth
                        value={btn?.actionMessage || ''}
                        required
                        error={!!buttonErrors[btn.id || '']?.actionMessage}
                        helperText={buttonErrors[btn.id || '']?.actionMessage}
                        onChange={(e) => handleAddBtnChange("actionMessage", e.target.value, btn.id || '', index)}
                        InputLabelProps={{
                            shrink: true
                        }}
                        multiline
                        minRows={2}
                        maxRows={4}
                        size="small"
                    />}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
                    <Button
                        size='medium'
                        variant="outlined"
                        onClick={() => handleDeleteButton(index)}
                        color="error"
                        sx={{ 
                            minWidth: 48,
                            height: 40,
                            padding: 0,
                            marginTop:1
                        }}
                    >
                        <CiTrash size={20} />
                    </Button>
                </Box>
            </Box>
        )
    }

    function renderCampaignForm() {
        return (
            <Box
                sx={{
                    width: '60%',
                }}
            >
                <Paper elevation={3} style={{ width: '100%', boxSizing: 'border-box' }}>
                    <Typography style={{ fontSize: 18, fontWeight: 700, padding: 20 }}>Template Form</Typography>
                    <Divider style={{ width: '100%', marginBottom: 20 }} />
                    <TextField
                        label='Template Title'
                        value={details.title || ''}
                        error={!!errorState.title}
                        required
                        onChange={(e) => handleChange("title", e.target.value)}
                        style={{ margin: '0 20px', width: '95%' }}
                    />
                    {errorState.title && <span className="text-xs text-red-600 w-11/12 ml-6">{errorState.title}</span>}
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', margin: 20, gap: '2%' }}>
                        <Typography style={{ fontSize: 18, fontWeight: 700 }}>Media Type</Typography>
                        <FormControl >
                            <RadioGroup
                                row
                                name="radio-buttons-group"
                                value={details.mediaType}
                                onChange={(e) => handleChange("mediaType", e.target.value)}
                            >
                                {mediaGroup?.map((btn) => <FormControlLabel value={btn.value} control={<Radio />} label={btn.label} />)}
                            </RadioGroup>
                        </FormControl>
                    </div>
                    <div style={{ width: '95%', margin: '0 20px', display: 'flex', alignItems: 'center' }}>
                        <TextField
                            label='Media URL'
                            value={details?.mediaURL}
                            onChange={(e) => handleChange("mediaURL", e.target.value)}
                            InputLabelProps={{
                                shrink: true
                            }}
                            sx={{ width: '50%' }}
                        />
                        <Typography style={{ fontSize: 14, fontWeight: 600, padding: 20 }}>OR</Typography>
                        <div style={{ width: '30%', display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Button
                                disabled={!details?.mediaType ? true : false}
                                size='large'
                                component="label"
                                variant="contained"
                                startIcon={<MdCloudUpload />}
                                sx={{ width: '100%', background: '#36F', color: '#FFF' }}
                            >
                                Upload Media File
                                <VisuallyHiddenInput type="file" accept={MEDIA_TYPES[`${details?.mediaType}`]} onChange={handleFileUpload} />
                            </Button>
                            <Typography style={{ fontSize: 14, fontWeight: 400, color: '#637381', textAlign: 'center' }}>
                                {fileDetails?.fileName}
                            </Typography>
                        </div>

                    </div>
                    <Box sx={{ display: 'flex', width: '90%', margin: '0 20px', gap: 1 }}>
                        <BiSolidInfoCircle size={18} fill='#FFAB00' />
                        <Typography style={{ fontSize: 12, fontWeight: 400, color: '#637381' }}>
                            Image .jpeg,  .png  |  Video mp4  |  Audio mp3 |  Document .pdf  |  Maximum file size should be 5MB, and  URL, it should be https URL for example: https://domainame/imagename
                        </Typography>
                    </Box>
                    <Typography style={{ fontSize: 18, fontWeight: 700, padding: '10px 20px' }}>Message Body</Typography>
                    <TextField
                        multiline
                        minRows={6}
                        value={details?.messageBody}
                        onChange={(e) => handleChange("messageBody", e.target.value)}
                        style={{ width: '95%', margin: '0 20px' }}
                    />
                    <Box sx={{ display: 'flex', width: '65%', margin: '0 20px', gap: 1 }}>
                        <BiSolidInfoCircle size={18} fill='#FFAB00' />
                        <Typography style={{ fontSize: 12, fontWeight: 400, color: '#637381' }}>
                            Curly brackets {`'{ }'`} are used to declare variables in the message properties.
                            Example: Hello <b>{`{Name}`}</b>, offer a <b>{`{Value}`}</b> discount.
                        </Typography>
                    </Box>
                    <Divider style={{ margin: 20, width: '95%' }} />
                    <Typography style={{ fontSize: 18, fontWeight: 700, padding: '0 20px' }}>Buttons Optional</Typography>
                    <Box sx={{ display: 'flex', width: '95%', margin: '0 20px', gap: 1 }}>
                        <Typography style={{ fontSize: 12, fontWeight: 400, color: '#637381' }}>
                            Create buttons that let customers respond to your message or take action.
                        </Typography>
                    </Box>
                    <Box sx={{ width: '95%', margin: '0 20px', paddingBottom: 2, maxWidth: '100%', overflow: 'hidden', marginTop:1 }}>
                        {buttons?.map((btn: IButtonGroup, index: number) => getButtonGroup(btn, index))}
                    </Box>
                    <div style={{ width: '95%', textAlign: 'end', fontSize: 14, margin: 10, paddingBottom: 10 }}>
                        <Button
                            onClick={handleAddBtn}
                            style={{ background: '#36F', color: '#FFF', margin: 5 }}
                            size='medium'
                            component="label"
                            variant="contained"
                            startIcon={<FaPlus />}
                        >
                            Add Button
                        </Button>
                    </div>
                    <div>
                        <div style={{ width: '95%', textAlign: 'end', fontSize: 14, margin: 10, paddingBottom: 10 }}>
                            <Button
                                onClick={handleClose}
                                style={{ background: '#FF5630', color: '#FFF', margin: 5 }}
                                size='medium'
                                component="label"
                                variant="contained"
                            >
                                Cancel
                            </Button>
                            <LoadingButton
                                loading={loading}
                                disabled={disabled}
                                onClick={() => isEdit ? handleEditSubmit() : handleSubmit()}
                                variant="contained"
                                size="medium"
                                color="primary"
                                style={{ margin: 5 }}
                            >
                                <span>Save</span>
                            </LoadingButton>
                        </div>
                    </div>
                </Paper>
            </Box>
        )
    }

    function renderCampaignTemplate() {
        return (
            <Box
                sx={{
                    width: '28%',
                }}
            >
                <TemplateMockup messageDocumentName={fileDetails?.fileName ?? details?.payload?.documentName} messageDocumentURL={fileDetails.file ?? details?.payload?.documentUrl} messageDocumentType={fileDetails?.mimeType ?? details?.payload?.mimeType} message={details.messageBody} btnGroup={buttons} />
            </Box>
        )
    }

    return (
        <div>
            <Typography style={{ fontSize: 24, fontWeight: 700 }}>Broadcast - {isEdit ? 'Edit' : 'Create new'}  Template </Typography>
            <div style={{ width: '100%', display: 'flex', marginTop: 40, padding: 2, gap: '2%' }}>
                {renderCampaignForm()}
                {renderCampaignTemplate()}
            </div>
        </div>
    )
}