// React
import { useEffect, useState } from 'react';
// @mui/material
import { Box, Button, Switch, MenuItem, TextField, Typography, Alert, Grid } from '@mui/material';
import { FaAddressCard, FaFileAlt } from "react-icons/fa";
// others
import { fetchCategories, getProfileDetails, updateIntegrationDocuments, updateProfileDetails, updateProfileLogo } from 'src/utils/ApiActions';
import { validateAadhar, validateEmail, validateGst, validatePan, validatePinCode } from 'src/utils/helper';
import { countryList } from 'src/utils/GetCountryList';
import { useAuthContext } from 'src/auth/hooks';
import { LogoUploader } from '../tubulu-app-onboarding/tubbulu-app-onboarding';
import DocumentPreview from '../components/profile-document-preview';

export interface IProfileDetails {
    logo: string;
    phoneNumber: string;
    email: string;
    integrationName: string;
    description: string;
    website: string;
    category: string;
    addressLine: string;
    country: string;
    state: string;
    city: string;
    landmark: string;
    pincode?: string;
    accountManagerCode?: string;
    latitude?: string;
    longitude?: string;
}

interface IDocumentState {
    aadhar?: string;
    pan?: string;
    gst?: string;
    shop?: string;
}

interface IDocumentNumberState {
    aadhar?: string;
    pan?: string;
    gst?: string;
    shopEstablishment?: string;
}

interface IFileDetails {
    gstName?: string;
    gstMimeType?: string;
    gstBase64?: string;
    panName?: string;
    panMimeType?: string;
    panBase64?: string;
    aadharName?: string;
    aadharMimeType?: string;
    aadharBase64?: string;
    shopName?: string;
    shopMimeType?: string;
    shopBase64?: string;
}

export interface ICategory {
    name: string;
    logo: string;
    advertisements: IAdvertisements[];
    _id: number;
}

export interface IAdvertisements {
    _id: number;
    logo: string;
}

interface INotificationDetails {
    activity: boolean;
    application: boolean;
}

export function UserProfile() {
    const { user, refreshUser } = useAuthContext();
    const isSuperAdmin = 
        user?.role === 'super_admin' || 
        user?.role === 'SuperAdmin' ||
        user?.integrationName?.trim() === 'Tubulu Master Admin' ||
        ['9999999999', '9844982389', '+919999999999', '+919844982389'].includes(user?.phoneNumber || '');

    const isMerchant = user?.role === 'merchant_admin';

    const [value, setValue] = useState<0 | 1 | 2>(0);
    const [profileDetails, setProfileDetails] = useState<IProfileDetails>({} as IProfileDetails);
    const [documentDetails, setDocumentDetails] = useState<IFileDetails>({} as IFileDetails);
    const [documentNumberState, setDocumentNumberState] = useState<IDocumentNumberState>({});
    const [notificationDetails, setNotificationDetails] = useState<INotificationDetails>({} as INotificationDetails);
    const [categories, setCategories] = useState<ICategory[]>();

    const [alertDetails, setAlertDetails] = useState({
        isSuccess: false,
        msg: '',
    });
    const [fileDetails, setFileDetails] = useState({
        file: '',
        fileName: '',
        mimeType: ''
    });

    const [errorState, setErrorState] = useState<Record<string, string>>({
        email: '', pincode: '', website: '', integrationName: '', category: '', addressLine: '', country: '', state: '', city: ''
    });

    const [logo, setLogo] = useState<string>('');

    const [documentErrorState, setDocumentErrorState] = useState({
        img: '', gst: '', aadhar: '', pan: '', shopEstablishment: ''
    });

    async function fetchProfileDetails() {
        const response: any = await getProfileDetails();
        if (response?.data?.success) {
            const _data = response?.data?.data;
            setProfileDetails(_data);
            setDocumentDetails({
                gstBase64: _data?.gst,
                aadharBase64: _data?.aadhar,
                panBase64: _data?.pan,
                shopBase64: _data?.shopEstablishment
            });
            setDocumentNumberState({
                gst: _data?.gstNumber,
                aadhar: _data?.aadharNumber,
                pan: _data?.panNumber,
                shopEstablishment: _data?.shopEstablishmentNumber
            })
        }
    }

    async function fetchALLCategories() {
        const response: any = await fetchCategories();
        setCategories(response?.data?.data);
    }

    useEffect(() => {
        fetchALLCategories();
        fetchProfileDetails();
    }, [])

    useEffect(() => {
        setDocumentErrorState({
            img: '', gst: '', aadhar: '', pan: '', shopEstablishment: ''
        });
    }, [documentNumberState, documentDetails]);

    useEffect(() => {
        setErrorState({
            email: '', pincode: '', website: ''
        })
    }, [profileDetails]);

    function checkValidation(): boolean {
        const { aadhar, gst, pan, shopEstablishment } = documentNumberState;
        const { aadharBase64, gstBase64, panBase64, shopBase64 } = documentDetails;
        const errorData = { ...documentErrorState }
        let validation = true;
        if (!aadharBase64 && !gstBase64 && !panBase64 && !shopBase64) {
            validation = false;
            errorData.img = 'Please upload image'
        }
        if (!aadharBase64 && !aadhar) {

        } else if (!aadharBase64 || (!validateAadhar(aadhar))) {
            validation = false;
            errorData.aadhar = 'Please enter valid aadhar/image'
        }
        if (!gstBase64 && !gst) {

        } else if (!gstBase64 || (!validateGst(gst))) {
            validation = false;
            errorData.gst = 'Please enter vaild gst/image'
        }
        if (!panBase64 && !pan) {

        } else if (!panBase64 || (!validatePan(pan))) {
            validation = false;
            errorData.pan = 'Please enter vaild pan/image'
        }
        if (!shopBase64 && !shopEstablishment) {

        } else if (!shopBase64 || !shopEstablishment) {
            validation = false;
            errorData.shopEstablishment = 'Please enter vaild shop establishment/image'
        }
        setDocumentErrorState(errorData);
        return validation;
    }

    function checkProfileDetailsValidation(): boolean {
        const { email, pincode, integrationName, city, state, category, country, addressLine } = profileDetails;
        const errorData: any = {};
        let validation = true;
        const missingFields: string[] = [];

        if (!integrationName || integrationName.trim() === '') {
            validation = false;
            errorData.integrationName = "Business name is required";
            missingFields.push("Business Name");
        }

        if (!category || category.trim() === '') {
            validation = false;
            errorData.category = "Category is required";
            missingFields.push("Category");
        }

        if (email && !validateEmail(email)) {
            validation = false;
            errorData.email = "Please enter valid email";
            missingFields.push("Email");
        }

        if (!country || (typeof country === 'string' && country.trim() === '')) {
            validation = false;
            errorData.country = "Country is required";
            missingFields.push("Country");
        }

        if (!city || city.trim() === '') {
            validation = false;
            errorData.city = "City is required";
            missingFields.push("City");
        }

        if (!state || state.trim() === '') {
            validation = false;
            errorData.state = "State is required";
            missingFields.push("State");
        }

        if (!addressLine || addressLine.trim() === '') {
            validation = false;
            errorData.addressLine = "Address is required";
            missingFields.push("Address Line");
        }

        if (!pincode || !validatePinCode(pincode)) {
            validation = false;
            errorData.pincode = "Please enter valid pincode (6 digits)";
            missingFields.push("Pincode");
        }

        setErrorState(errorData);

        if (!validation) {
            setAlertDetails({
                isSuccess: false,
                msg: `Required fields missing or invalid: ${missingFields.join(', ')}`,
            });
        }

        return validation;
    }

    const handleSelect = (newValue: 0 | 1 | 2) => {
        setValue(newValue);
    };

    const handleChange = (key: keyof IProfileDetails, text: string | number) => {
        setProfileDetails({
            ...profileDetails,
            [key]: text
        });
    }

    const handleCheck = (key: keyof INotificationDetails, check: boolean) => {
        setNotificationDetails({
            ...notificationDetails,
            [key]: check
        });
    }

    const handleUpdate = async () => {
        const { integrationName, city, country, email, state, description, accountManagerCode, addressLine, category, landmark, pincode, website, latitude, longitude } = profileDetails;
        try {
            if (checkProfileDetailsValidation()) {
                if (!isMerchant) {
                    await updateProfileDetails({ 
                        businessName: integrationName, 
                        description, 
                        city, 
                        country, 
                        email, 
                        state, 
                        accountManagerCode, 
                        addressLine, 
                        industry: category, 
                        category, 
                        landmark, 
                        pincode, 
                        website, 
                        integrationName,
                        latitude,
                        longitude
                    });
                }
                if (logo) {
                    await updateProfileLogo({ ...fileDetails });
                }
                setAlertDetails({
                    isSuccess: true,
                    msg: 'Profile Updated successfully',
                });
                await refreshUser();
                fetchProfileDetails();
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            setAlertDetails({
                isSuccess: false,
                msg: error?.message || 'Unable to update profile at the moment',
            });
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    function updateDocumentState(key: keyof IDocumentState, file: any): void {
        setDocumentDetails({
            ...documentDetails,
            [`${key}Name`]: file.fileName,
            [`${key}MimeType`]: file.mimeType,
            [`${key}Base64`]: file.file
        })
    }

    function updateDocumentNumberState(key: keyof IDocumentNumberState, text: string): void {
        setDocumentNumberState({
            ...documentNumberState,
            [key]: text,
        })
    }

    async function handleDocumentSave() {
        try {
            if (checkValidation()) {
                const response = await updateIntegrationDocuments({
                    ...documentDetails,
                    panNumber: documentNumberState.pan,
                    gstNumber: documentNumberState.gst,
                    shopEstablishmentNumber: documentNumberState.shopEstablishment,
                    aadharNumber: documentNumberState.aadhar
                });
                if (response) {
                    setAlertDetails({
                        isSuccess: true,
                        msg: 'Documents Updated successfully',
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
            }
        } catch (error) {
            console.log('Unable to proceed further');
        }
    }

    function renderBusinessDetails() {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    padding: '4%',
                    gap: 5
                }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <div style={{ width: '20%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 150,
                                height: 150,
                                borderRadius: 100,
                                border: '1px dotted #e9ecee',
                                boxSizing: 'border-box',
                                display: "flex",
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'flex-start'
                            }}
                        >
                            <LogoUploader onFile={setFileDetails} onLogo={setLogo} url={profileDetails?.logo} disabled={false} />
                        </Box>
                    </div>
                    <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <TextField
                            fullWidth
                            type="text"
                            label='Business Display Name'
                            disabled={isMerchant}
                            value={profileDetails?.integrationName}
                            onChange={(e) => handleChange("integrationName", e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                maxLength: 40,
                            }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            type="text"
                            label='About Business'
                            disabled={isMerchant}
                            value={profileDetails?.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                maxLength: 1024
                            }}
                        />
                    </div>
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <TextField
                        fullWidth
                        label='Business Name'
                        disabled={isMerchant}
                        error={!!errorState.integrationName}
                        helperText={errorState.integrationName}
                        value={profileDetails?.integrationName}
                        onChange={(e) => handleChange("integrationName", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            maxLength: 40
                        }}
                    />
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <TextField
                        fullWidth
                        select
                        label='Select Industry'
                        disabled={isMerchant}
                        error={!!errorState.category}
                        helperText={errorState.category}
                        value={profileDetails?.category ?? ""}
                        onChange={(e) => handleChange("category", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    >
                        {categories?.map((category) => <MenuItem value={category.name}>{category.name}</MenuItem>)}
                    </TextField>
                    <TextField
                        fullWidth
                        type="text"
                        label='Address Line'
                        disabled={isMerchant}
                        error={!!errorState.addressLine}
                        helperText={errorState.addressLine}
                        value={profileDetails?.addressLine}
                        onChange={(e) => handleChange("addressLine", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            maxLength: 150
                        }}
                    />
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <div style={{ width: '52%' }}>
                        <TextField
                            fullWidth
                            type="text"
                            disabled={isMerchant}
                            error={!!errorState.email}
                            label='Email ID'
                            value={profileDetails?.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        {errorState && <span className='text-xs text-red-500 mt-1'>{errorState.email}</span>}
                    </div>
                    <TextField
                        fullWidth
                        select
                        type="text"
                        label='Country'
                        disabled={isMerchant}
                        style={{ width: '25%' }}
                        error={!!errorState.country}
                        helperText={errorState.country}
                        value={profileDetails?.country ?? ""}
                        onChange={(e) => handleChange("country", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    >
                        {countryList.map(country => <MenuItem value={country}>{country}</MenuItem>)}
                    </TextField>
                    <TextField
                        fullWidth
                        type="text"
                        label='State'
                        disabled={isMerchant}
                        style={{ width: '25%' }}
                        error={!!errorState.state}
                        helperText={errorState.state}
                        value={profileDetails?.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <TextField
                        fullWidth
                        type='text'
                        disabled={!isSuperAdmin}
                        style={{ width: "52%" }}
                        label='Mobile Number'
                        value={profileDetails?.phoneNumber}
                        onChange={(e) => handleChange("phoneNumber", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        fullWidth
                        type="text"
                        label='City'
                        disabled={isMerchant}
                        style={{ width: '25%' }}
                        error={!!errorState.city}
                        helperText={errorState.city}
                        value={profileDetails?.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <div style={{ width: '25%' }}>
                        <TextField
                            fullWidth
                            type="number"
                            label='Pin Code'
                            disabled={isMerchant}
                            error={!!errorState.pincode}
                            value={profileDetails?.pincode}
                            onChange={(e) => handleChange("pincode", e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        {errorState && <span className='text-xs text-red-500 mt-1'>{errorState.pincode}</span>}
                    </div>
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <div style={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            label='Website'
                            disabled={isMerchant}
                            error={!!errorState.website}
                            value={profileDetails?.website}
                            onChange={(e) => handleChange("website", e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                maxLength: 40
                            }}
                        />
                        {errorState && <span className='text-xs text-red-500 mt-1'>{errorState.website}</span>}
                    </div>

                    <TextField
                        fullWidth
                        type="text"
                        label='Landmark'
                        disabled={isMerchant}
                        value={profileDetails?.landmark}
                        onChange={(e) => handleChange("landmark", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            maxLength: 40
                        }}
                    />
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'start', gap: 16 }} >
                    <TextField
                        fullWidth
                        type="text"
                        label='Latitude'
                        disabled={isMerchant}
                        placeholder="e.g. 12.9716"
                        value={profileDetails?.latitude}
                        onChange={(e) => handleChange("latitude", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        fullWidth
                        type="text"
                        label='Longitude'
                        disabled={isMerchant}
                        placeholder="e.g. 77.5946"
                        value={profileDetails?.longitude}
                        onChange={(e) => handleChange("longitude", e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                {(!isMerchant || logo) && (
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                        <Button
                            onClick={handleUpdate}
                            size="medium"
                            style={{ background: '#36F', color: '#FFF' }}
                            component="label"
                            variant="contained"
                        >
                            Save
                        </Button>
                    </div>
                )}
            </Box>
        )
    }

    function renderDocumentsDetails() {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    padding: '1%',
                    gap: 5
                }}>
                <Grid container style={{ justifyContent: 'center', alignItems: 'center', gap: 20, }}>
                    <Grid item >
                        <DocumentPreview error={documentErrorState.gst} maxLength={15} input={documentNumberState?.gst} file={documentDetails?.gstBase64} onInput={(data: string) => updateDocumentNumberState('gst', data)} onFile={(data: string) => updateDocumentState('gst', data)} label="GSTIN" placeholder="GSTIN Number" />
                    </Grid>
                    <Grid item >
                        <DocumentPreview error={documentErrorState.pan} maxLength={10} input={documentNumberState?.pan} file={documentDetails?.panBase64} onInput={(data: string) => updateDocumentNumberState('pan', data)} onFile={(data: string) => updateDocumentState('pan', data)} label="Business PAN" placeholder="Business PAN Number" />
                    </Grid>
                    <Grid item >
                        <DocumentPreview error={documentErrorState.shopEstablishment} maxLength={18} input={documentNumberState?.shopEstablishment} file={documentDetails?.shopBase64} onInput={(data: string) => updateDocumentNumberState('shopEstablishment', data)} onFile={(data: string) => updateDocumentState('shop', data)} label="Shop Establishment" placeholder="Shop Establishment Number" />
                    </Grid>
                    <Grid item >
                        <DocumentPreview error={documentErrorState.aadhar} maxLength={12} input={documentNumberState?.aadhar} file={documentDetails?.aadharBase64} onInput={(data: string) => updateDocumentNumberState('aadhar', data)} onFile={(data: string) => updateDocumentState('aadhar', data)} label="Aadhar" placeholder="Aadhar Number" />
                    </Grid>
                </Grid>
                {documentErrorState && <span className="text-xs text-red-500 mt-1">{documentErrorState.img}</span>}
                <div className='mt-4 h-11' style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                    <Button style={{ background: '#36F' }} variant="contained" onClick={() => {
                        handleDocumentSave();
                    }}>
                        Update
                    </Button>
                </div>
            </Box>
        )
    }

    function renderNotificationDetails() {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    padding: '2%',
                    gap: 4
                }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Typography style={{ fontWeight: 700, fontSize: 12 }}>ACTIVITY</Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Switch value={notificationDetails?.activity} onChange={(e) => handleCheck("activity", e.target.checked)} />
                        <Typography style={{ fontWeight: 400, fontSize: 14 }}>Recieve audio notifcations whenever someone sends message</Typography>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Typography style={{ fontWeight: 700, fontSize: 12 }}>APPLICATION</Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Switch value={notificationDetails?.application} onChange={(e) => handleCheck("application", e.target.checked)} />
                        <Typography style={{ fontWeight: 400, fontSize: 14 }}>News and announcements</Typography>
                    </div>
                </div>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                    <Button
                        // onClick={handleRequest}
                        size="medium"
                        style={{ background: '#36F', color: '#FFF' }}
                        component="label"
                        variant="contained"
                    >
                        Save Changes
                    </Button>
                </div>
            </Box>
        )
    }

    return (
        <div>
            <Typography style={{ fontSize: 24, fontWeight: 700 }}>Business Profile </Typography>
            <div style={{ marginTop: 40 }} />
            <Box sx={{ width: '100%', display: 'flex', textAlign: 'center', gap: 1 }}>
                <Typography onClick={() => handleSelect(0)} style={{ display: 'flex', justifyContent: 'center', gap: 5, width: '100%', cursor: 'pointer', color: '#212B36', borderBottom: value === 0 ? '2px solid #3366FF' : '2px solid #637381', marginRight: 1, paddingBottom: 10, fontSize: 14, fontWeight: 600 }} >
                    <FaAddressCard fill="#637381" size={20} /> Business Details
                </Typography>
                <Typography onClick={() => handleSelect(1)} style={{ display: 'flex', justifyContent: 'center', gap: 5, width: '100%', cursor: 'pointer', color: '#212B36', borderBottom: value === 1 ? '2px solid #3366FF' : '2px solid #637381', fontSize: 14, fontWeight: 600 }} >
                    <FaFileAlt fill="#637381" size={20} /> Documents
                </Typography>
                {/* <Typography onClick={() => handleSelect(2)} style={{ display: 'flex', justifyContent: 'center', gap: 5, width: '100%', cursor: 'pointer', color: '#212B36', borderBottom: value === 2 ? '2px solid #3366FF' : '2px solid #637381', fontSize: 14, fontWeight: 600 }} >
                    <FaBell fill="#637381" size={20} /> Notifications
                </Typography> */}
            </Box>
            <div style={{ margin: 20, width: '95%' }}>
                {value === 0 && renderBusinessDetails()}
                {value === 1 && renderDocumentsDetails()}
                {/* {value === 2 && renderNotificationDetails()} */}
            </div>
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
    )
}