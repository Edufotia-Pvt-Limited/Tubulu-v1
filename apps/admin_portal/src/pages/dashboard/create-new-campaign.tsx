/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
// React
import React, { useEffect, useState } from "react";
// @mui/material
import { Box, Button, Checkbox, CircularProgress, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, SelectChangeEvent, TextField, Typography, styled } from "@mui/material";
// Icons
import { IoSendSharp } from 'react-icons/io5';
import { BiSolidInfoCircle } from 'react-icons/bi';
import { MdCloudUpload, MdPermContactCalendar } from 'react-icons/md';
import { BsFillFileEarmarkFill } from 'react-icons/bs';
import { DatePicker, TimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { getAllCampaigns, getAllGroupsIntegration, getAllTemplates } from "src/utils/ApiActions";
import moment from "moment";
import { CSVLink } from "react-csv";
import { readString} from "react-papaparse";
import { ICampaignTemplate } from "./create-new-template";
import { ICampaignDetails, IVarArray } from "./manage-broadcast-campaign";
import { TemplateMockup } from "../components/template-mockup";
import { validatePhoneNumber } from "src/utils/helper";

interface Props {
    onSave: (details: ICampaignDetails) => void;
    onCancel: () => void;
    onDraft: (details: any) => void;
    draftDetails: ICampaignDetails;
    loading: boolean;
}

interface ICampaign {
    name: string;
    type: 'IMMEDIATE' | 'SCHEDULED';
    template: string;
    date?: string;
    time?: string;
    title?: string;
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

const variableOptn = [
    { label: "FirstName", value: "${firstName}" },
    { label: "LastName", value: "${lastName}" },
]

export function CreateNewCampaign({ onSave, onCancel, onDraft, draftDetails, loading }: Props) {

    const [details, setDetails] = useState<ICampaignDetails>({
        title: '',
        type: 'IMMEDIATE',
        template: '',
        _id: '',
        status: 'DRAFT',
        users: [],
        scheduledTime: '',
        phoneBookIds: []
    });

    const [value, setValue] = useState<0 | 1 | 2>(1);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [fileName, setFileName] = useState("");
    const [groups, setGroups] = useState([]);
    const [groupDetails, setGroupDetails] = useState<string[]>([]);

    const [varArray, setVarArray] = useState<IVarArray[]>([]);

    // const [scheduleTime, setScheduleTime] = useState<any>({
    //     date: '',
    //     time: '',
    // });

    const [scheduledTime, setScheduledTime] = useState<Pick<ICampaign, 'date' | 'time'>>({
  date: '',
  time: '',
});
    const [errorState, setErrorState] = useState({
        users: ''
    });

    const [sameNameError, setSameNameError] = useState<boolean>(false);
    const [campaignNames, setCampaignNames] = useState<string[]>([]);

    const [campaignTemplates, setCampaignTemplates] = useState<ICampaignTemplate[]>([]);

    useEffect(() => {
        getCampaignTemplates();
        fetchAllGroups();
        fetchAllCampaigns();
    }, []);

    useEffect(() => {
        if (draftDetails?._id) {
            setEdit(true);
            setEditState();
        }
    }, []);

    useEffect(() => {
        if (details.template) {
            getTemplateVariables()
        }
    }, [details?.template])

    useEffect(() => {
        setErrorState({
            users: ''
        });
    }, [details])

    useEffect(() => {
        if (!isEdit) {
            handleSameNameError();
        }
    }, [details?.title, isEdit])

    async function setEditState() {
        if (draftDetails?._id) {
            const _data = draftDetails;
            setDetails(_data);
        }
    }

    async function fetchAllCampaigns() {
        const response = await getAllCampaigns();
        if (response?.data?.success) {
            const _campaigns = response?.data?.data;
            setCampaignNames(_campaigns?.map((campaign: any) => campaign?.title));
        }
    }

    async function getCampaignTemplates() {
        try {
            const { data: { success, data } } = await getAllTemplates();
            if (success && data.length) {
                setCampaignTemplates(data);
            }
        } catch (error) {
            console.log(`Unable to get the campaign templates at the moment`);
            console.log(error);
        }
    }

    async function fetchAllGroups() {
        const response = await getAllGroupsIntegration();
        if (response?.data?.success) {
            const groupData = response?.data?.data?.map((item: any) => ({ label: item?.groupName, value: item?._id }))
            setGroups(groupData);
        }
    }

    const handleSelect = (newValue: 0 | 1 | 2) => {
        setValue(newValue);
        setDetails({
            ...details,
            users: []
        });
        setGroupDetails([]);
    }

    function handleChange(key: keyof ICampaign, type: string | number | boolean): void {
        setDetails({
            ...details,
            [key]: type
        })
    }

    function checkValidation(): boolean {
        let validation = true;
        const users = details?.users;
        const errorData = { ...errorState };
        for (let i = 0; i < users?.length; i++) {
            if (!validatePhoneNumber(users[i])) {
                validation = false;
                errorData.users = 'Please enter vaild phone numbers'
            }
        }
        if (sameNameError) {
            validation = false;
        }
        setErrorState(errorData);
        return validation;
    }

    async function handleSameNameError(): Promise<boolean> {
        let check = false;
        const { title } = details;
        const response = await checkSameName(title);
        if (response) {
            check = true;
            setSameNameError(true);
        } else {
            setSameNameError(false);
        }
        return check;
    }

    async function checkSameName(name: string) {
        const _name = name?.trim?.()?.toLowerCase();
        const checkName = campaignNames?.find((campaign) => campaign?.trim?.()?.toLowerCase() === _name);
        return checkName
    }

    function handleEditSubmit() {
        setEdit(false);
    }

    function handleSave() {
        if (checkValidation()) {
            if (details.type === 'SCHEDULED') {
                const momentString = moment(`${scheduledTime.date} ${scheduledTime.time}`, 'ddd MMM DD YYYY HH:mm:ss Z');
                onSave({
                    ...details,
                    status: 'SCHEDULED',
                    variables: varArray,
                    phoneBookIds: groupDetails,
                    scheduledTime: momentString.format()
                })
                setDetails({
                    ...details,
                    status: 'SCHEDULED',
                    variables: varArray,
                    phoneBookIds: groupDetails,
                    scheduledTime: momentString.format()
                })
            } else {
                onSave({
                    ...details,
                    status: 'ACTIVE',
                    variables: varArray,
                    phoneBookIds: groupDetails,
                    scheduledTime: moment().format(),
                })
            }
        }
    }

    function handleCancel() {
        onCancel();
        setEdit(false);
    }

    function handleSaveDraft() {
        if (details.type === 'SCHEDULED') {
            const momentString = moment(`${scheduledTime.date} ${scheduledTime.time}`, 'ddd MMM DD YYYY HH:mm:ss Z');
            onDraft({
                ...details,
                status: 'DRAFT',
                variables: varArray,
                phoneBookIds: groupDetails,
                scheduledTime: momentString.format()
            })
            setDetails({
                ...details,
                status: 'DRAFT',
                variables: varArray,
                phoneBookIds: groupDetails,
                scheduledTime: momentString.format()
            })
        } else {
            onDraft({
                ...details,
                status: "DRAFT",
                variables: varArray,
                phoneBookIds: groupDetails,
                _id: isEdit ? details._id : '',
                scheduledTime: moment().format()
            });
        }
    }

    function renderBroadcast() {
        return (
            <div>
                <TextField
                    multiline
                    error={!!errorState?.users}
                    minRows={4}
                    fullWidth
                    label='Seperate each contact using comma'
                    placeholder="+918888888888,+917777777777,etc"
                    InputLabelProps={{
                        shrink: true
                    }}
                    onChange={(event) => {
                        setDetails({
                            ...details,
                            users: event.target.value.split(','),
                        })
                    }}
                    style={{ width: '95%', margin: '10px 20px' }}
                />
                {errorState && <span className='text-xs text-red-500' style={{ width: "90%", marginLeft: 20, marginBottom: 20 }} >{errorState.users}</span>}
                <Box sx={{ display: 'flex', width: '90%', margin: '0 20px', gap: 1 }}>
                    <BiSolidInfoCircle size={18} fill='#FFAB00' />
                    <Typography style={{ fontSize: 12, fontWeight: 400, color: '#637381' }}>
                        Add <b>Country code</b> before each number. Please leave no spaces in between numbers.
                    </Typography>
                </Box>
            </div>
        )
    }

    function getTemplateVariables() {
        const selectedTemplate = campaignTemplates?.find((item) => item._id === details.template);
        
        if (selectedTemplate?.variables && selectedTemplate.variables.length > 0) {
            const variables: IVarArray[] = selectedTemplate.variables.map((variable) => ({
                key: `{${variable.key}}`,
                value: ""
            }));
            setVarArray(variables);
        } else {
            setVarArray([]);
        }
    }

    function handleVariableChange(variable: string, key: "default" | "custom", text: string) {
        const _varArray = [...varArray];
        const _index = _varArray.findIndex((item) => item.key === variable);
        _varArray[_index] = { ..._varArray[_index], value: text };
        setVarArray(_varArray);
    }

    const handleGroups = (event: SelectChangeEvent<typeof groupDetails>) => {
        const { target: { value }, } = event;
        const _groups = typeof value === 'string' ? value.split(',') : value;
        setGroupDetails(_groups);
    }

    function renderPhonebook() {
        return (
            <div style={{ margin: '0 20px', width: '95%', gap: 10, display: "flex", flexDirection: 'column' }}>
                <FormControl style={{ marginTop: 10 }}>
                    <InputLabel id="demo-multiple-name-label">Select Phonebook Group</InputLabel>
                    <Select
                        fullWidth
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        multiple
                        value={groupDetails}
                        onChange={handleGroups}
                        input={<OutlinedInput label="Select Phonebook Group" />}
                    >
                        {
                            groups?.map((item: any) => (
                                <MenuItem value={item?.value}>{item?.label}</MenuItem>
                            ))
                        }
                    </Select>
                    <Box sx={{ display: 'flex', width: '100%', gap: 1, marginTop: 2 }}>
                        <BiSolidInfoCircle size={18} fill='#FFAB00' />
                        <Typography style={{ fontSize: 12, fontWeight: 400, color: '#637381' }}>
                            Select atleast <b>One PhoneBook</b> Group.
                        </Typography>
                    </Box>
                </FormControl>
            </div>

        )
    }

    // async function handleFileUpload(event: any) {
    //     const file: File = event.target.files?.[0];

    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             const csvData = e.target.result;
    //             const filename = file.name;
    //             const result = readString(csvData, {
    //                 header: true,
    //             });
    //             const jsonData = result?.data?.map((row: any) => row["Phone Number"]);
    //             setFileName(filename);
    //             setDetails({
    //                 ...details,
    //                 users: jsonData
    //             });
    //         };
    //         reader.readAsText(file);
    //     }
    // }

async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        const csvData = reader.result;

        if (typeof csvData !== 'string') {
            console.error('CSV data is not a string');
            return;
        }

        // Parse CSV with inline typing
        readString<{ "Phone Number": string }>(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const jsonData = results.data.map(row => row["Phone Number"]);

                setFileName(file.name);
                setDetails(prev => ({
                    ...prev,
                    users: jsonData
                }));
            }
        });
    };

    reader.readAsText(file);
}
    

    function renderDocumentUpload() {
        const headers = [{ label: 'Phone Number', key: 'phoneNumber' }];
        const sampleCSV = [{ phoneNumber: "+919999999999" }];

        return (
            <div style={{ width: '94%', margin: 20 }}>
                <Typography style={{ fontSize: 14, fontWeight: 400, display: 'flex', justifyContent: 'center', alignItems: "center", gap: 5 }}>
                    Download sample <b>.csv</b> file
                    <Button
                        variant="outlined"
                        size="small"
                        style={{ color: "#37b37d", backgroundColor: "#eef9f5", border: "1px solid #94d6ba" }}
                    >
                        <CSVLink data={sampleCSV} headers={headers} filename="Tubulu_sample.csv">Download</CSVLink>
                    </Button>
                </Typography>
                <Button
                    size="large"
                    component="label"
                    variant="outlined"
                    style={{ width: "100%", margin: "20px 0", color: "#FFF", backgroundColor: "#3366FF" }}
                    startIcon={<MdCloudUpload />}
                >
                    Import Contacts
                    <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
                </Button>
                <Typography style={{ fontSize: 14, fontWeight: 400, color: '#637381', textAlign: 'center' }}>
                    {fileName}
                </Typography>
                <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                    <BiSolidInfoCircle size={18} fill='#FFAB00' />
                    <Typography style={{ fontSize: 12, fontWeight: 400, color: '#637381' }}>
                        Upload files in .csv format only.
                    </Typography>
                </Box>
            </div>
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
                    <Typography style={{ fontSize: 18, fontWeight: 700, padding: 20 }}>Campaign Form</Typography>
                    <Divider style={{ width: '100%' }} />
                    <TextField
                        label='Campaign Title'
                        value={details.title}
                        error={sameNameError}
                        onChange={(e) => handleChange("title", e.target.value)}
                        style={{ margin: '0 20px', width: '95%' }}
                    />
                    {sameNameError && <span className="m-5 text-xs text-red-500">Campaign Title already exits. Please add a different title.</span>}
                    <FormControl style={{ width: '118%', margin: 20, padding: '0 10px' }}>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            value={details?.type}
                            onChange={(e) => handleChange("type", e.target.value)}
                            style={{ gap: '2%' }}
                        >
                            <FormControlLabel value="IMMEDIATE" control={<Radio onChange={event => {
                                if (event.target.checked) {
                                    setDetails({
                                        ...details,
                                        type: 'IMMEDIATE',
                                    })
                                }
                            }} />} label="Immediate" style={{ width: '40%', padding: 8, border: '1px solid #e9ecee', borderRadius: 5 }} />
                            <FormControlLabel value="SCHEDULED" control={<Radio
                                onChange={event => {
                                    if (event.target.checked) {
                                        setDetails({
                                            ...details,
                                            type: 'SCHEDULED',
                                        })
                                    }
                                }}
                            />} label="Schedule" style={{ width: '40%', padding: 8, border: '1px solid #e9ecee', borderRadius: 5 }} />
                        </RadioGroup>
                    </FormControl>
                    {details?.type === 'SCHEDULED' && <div style={{ width: '100%', margin: 20 }}>
                        <DatePicker
                            format="dd/MM/yyyy"
                            label="DD/MM/YYYY"
                            sx={{ width: '46%' }}
                            onChange={(v: any) => {
                                setScheduledTime({
                                    ...scheduledTime,
                                    date: new Date(v).toDateString()
                                })
                            }}
                        // value={new Date(details?.date) || ''}
                        />
                        <TimePicker
                            label="HH:MM AA"
                            viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock,
                                seconds: renderTimeViewClock
                            }}
                            onChange={(v: any) => {
                                setScheduledTime({
                                    ...scheduledTime,
                                    time: new Date(v).toTimeString()
                                })

                            }}
                            // value={details?.time}
                            sx={{ width: '46%', marginLeft: 3 }}
                        />
                    </div>}
                    <TextField
                        select
                        label='Select Campaign Template'
                        value={details.template}
                        style={{ margin: '20px 20px 10px 20px', width: '95%' }}
                        onChange={(e) => handleChange("template", e.target.value)}
                    >
                        {campaignTemplates.map((item) => (
                            item.status === "APPROVED" &&
                            <MenuItem value={item._id} >{item.title}</MenuItem>
                        ))}
                    </TextField>
                    <Box sx={{ display: 'flex', width: '90%', margin: '0 20px', gap: 1 }}>
                        <BiSolidInfoCircle size={18} fill='#FFAB00' />
                        <Typography style={{ fontSize: 12, fontWeight: 400, color: '#637381' }}>
                            Campaign Template needs to be <b>APPROVED</b> for it to be visible.
                        </Typography>
                    </Box>
                    <Box sx={{ margin: '10px 20px', width: '95%', display: 'flex', textAlign: 'center', gap: '1%' }}>
                        {details?.template !== 'templateA' && <Typography onClick={() => handleSelect(0)} style={{ display: 'flex', justifyContent: 'center', gap: 5, width: '100%', cursor: 'pointer', color: value === 0 ? '#3366FF' : '#637381', borderBottom: value === 0 ? '2px solid #3366FF' : '2px solid #637381', paddingBottom: 10, fontSize: 14, fontWeight: 600 }} >
                            <IoSendSharp fill={value === 0 ? '#3366FF' : '#637381'} size={20} />
                            Broadcast To
                        </Typography>}
                        <Typography onClick={() => handleSelect(1)} style={{ display: 'flex', justifyContent: 'center', gap: 5, width: '100%', cursor: 'pointer', color: value === 1 ? '#3366FF' : '#637381', borderBottom: value === 1 ? '2px solid #3366FF' : '2px solid #637381', paddingBottom: 10, fontSize: 14, fontWeight: 600 }} >
                            <MdPermContactCalendar fill={value === 1 ? '#3366FF' : '#637381'} size={20} />
                            PhoneGroup
                        </Typography>
                        <Typography onClick={() => handleSelect(2)} style={{ display: 'flex', justifyContent: 'center', gap: 5, width: '100%', cursor: 'pointer', color: value === 2 ? '#3366FF' : '#637381', borderBottom: value === 2 ? '2px solid #3366FF' : '2px solid #637381', paddingBottom: 10, fontSize: 14, fontWeight: 600 }} >
                            <BsFillFileEarmarkFill fill={value === 2 ? '#3366FF' : '#637381'} size={20} />
                            File Upload
                        </Typography>
                    </Box>
                    {value === 0 && renderBroadcast()}
                    {value === 1 && renderPhonebook()}
                    {value === 2 && renderDocumentUpload()}
                    {varArray.map((item) => <Box sx={{ width: '94%', margin: 2, display: 'flex', alignItems: 'center', boxSizing: "border-box" }}>
                        <Typography style={{ minWidth: "20%" }}>{`{${item.key}}`}</Typography>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'end', gap: 10 }}>
                            <TextField
                                select
                                style={{ width: '31%' }}
                                label='Select default value'
                                onChange={(e) => handleVariableChange(item.key, "default", e.target.value)}
                            >
                                {variableOptn.map((i) => (
                                    <MenuItem value={i.value} >{i.label}</MenuItem>
                                ))}
                            </TextField>
                            <Typography>OR</Typography>
                            <TextField
                                style={{ width: '30%' }}
                                label='Custom variable value'
                                onChange={(e) => handleVariableChange(item.key, "custom", e.target.value)}
                            />
                        </div>
                    </Box>)}
                    <div>
                        <Divider style={{ width: '100%', marginTop: 10 }} />
                        <div style={{ width: '95%', textAlign: 'end', fontSize: 14, display: 'flex', justifyContent: 'flex-end', margin: 10, paddingBottom: 10 }}>
                            <Button
                                onClick={() => handleSaveDraft()}
                                style={{ margin: 5 }}
                                size='medium'
                                variant="outlined"
                                disabled={loading}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                onClick={() => handleCancel()}
                                style={{ background: '#FF5630', color: '#FFF', margin: 5 }}
                                size='medium'
                                component="label"
                                variant="contained"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                onClick={() => isEdit ? handleEditSubmit() : handleSave()}
                                style={{ margin: 5 }}
                                color="primary"
                                size='medium'
                                variant="contained"
                            >
                                Save
                            </Button>
                            {loading &&
                                <CircularProgress variant="indeterminate" />
                            }
                        </div>
                    </div>
                </Paper>
            </Box>
        )
    }

    function getTemplateById(id: string) {
        const template = campaignTemplates?.findIndex?.(item => {
            if (item._id === id) {
                return 1;
            }
            return 0;
        })
        return campaignTemplates?.[template]?.messageBody ?? '';
    }

    function getTemplateBtnsById(id: string) {
        const template = campaignTemplates?.findIndex?.(item => {
            if (item?._id === id) {
                return 1;
            }
            return 0;
        })
        return campaignTemplates?.[template]?.messageActions;
    }

    function getTemplatePayloadById(id: string): {
        documentUrl?: string,
        mimeType?: string,
        documentName?: string,
    } | undefined {
        const template = campaignTemplates?.findIndex?.(item => {
            if (item._id === id) {
                return 1;
            }
            return 0;
        })
        return campaignTemplates?.[template]?.payload;
    }

    function renderCampaignTemplate() {
        const template = getTemplatePayloadById(details.template);
        return (
            <Box
                sx={{
                    width: '28%',
                }}
            >
                <TemplateMockup messageDocumentName={template?.documentName} messageDocumentType={template?.mimeType} messageDocumentURL={template?.documentUrl} btnGroup={getTemplateBtnsById(details.template)} message={getTemplateById(details.template)} />
            </Box>
        )
    }

    return (
        <div>
            <Typography style={{ fontSize: 24, fontWeight: 700 }}>Broadcast - Create Campaign </Typography>
            <div style={{ width: '100%', display: 'flex', marginTop: 40, padding: 2, gap: '2%' }}>
                {renderCampaignForm()}
                {renderCampaignTemplate()}
            </div>
        </div>
    )
}