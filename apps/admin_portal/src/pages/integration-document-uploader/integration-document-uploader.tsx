import { LoadingButton } from "@mui/lab";
import { Grid, TextField, Typography, Stack } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateIntegrationDocuments } from "src/utils/ApiActions";
import { validateAadhar, validateGst, validatePan } from "src/utils/helper";
import Iconify from "src/components/iconify";
import { useAuthContext } from "src/auth/hooks";

export function UploadIcon(): JSX.Element {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 41 41" fill="none">
            <path d="M37.0002 20.5C37.0002 20.3166 36.9002 20.1333 36.8502 19.95C36.773 19.6265 36.6728 19.3091 36.5502 19C36.4668 18.8 36.3502 18.6 36.2502 18.3833C36.1502 18.1666 36.0002 17.8833 35.8502 17.65C35.7002 17.4166 35.5002 17.3 35.5002 17.1666C35.5002 17.0333 35.1668 16.75 34.9835 16.55C34.8002 16.35 34.6335 16.2166 34.4502 16.05L33.8335 15.5L33.2335 15.1C32.998 14.9558 32.753 14.8278 32.5002 14.7166L31.8502 14.4166C31.5779 14.3158 31.2996 14.2323 31.0168 14.1666C30.7928 14.1007 30.5645 14.0506 30.3335 14.0166L29.9502 13.8333C29.2701 11.8684 27.9945 10.1643 26.3007 8.95824C24.607 7.75214 22.5794 7.104 20.5002 7.104C18.4209 7.104 16.3933 7.75214 14.6996 8.95824C13.0059 10.1643 11.7302 11.8684 11.0502 13.8333L10.7502 13.9166C10.5192 13.9506 10.2908 14.0007 10.0668 14.0666C9.78406 14.1007 9.50572 14.2158 9.2335 14.3166L8.5835 14.6166C8.3307 14.7278 8.0857 14.8558 7.85016 15L7.25016 15.5L6.6335 16.0166C6.45016 16.1833 6.26683 16.3333 6.10016 16.5166C5.9335 16.7 5.75016 16.9333 5.5835 17.1333C5.41683 17.3333 5.2835 17.5166 5.15016 17.7333C5.01683 17.95 4.8835 18.2166 4.75016 18.4666C4.61683 18.7166 4.5335 18.8833 4.45016 19.0833C4.32757 19.3924 4.22731 19.7099 4.15016 20.0333C4.15016 20.2166 4.0335 20.4 4.00016 20.5833C3.89642 21.1049 3.84064 21.6349 3.8335 22.1666C3.84131 22.6755 3.89148 23.1828 3.9835 23.6833C3.9835 23.85 4.06683 24 4.10016 24.1666C4.18254 24.4941 4.28269 24.8168 4.40016 25.1333L4.60016 25.6166C4.74688 25.938 4.91388 26.2498 5.10016 26.55L5.3335 26.9166C5.35747 26.9633 5.38535 27.0079 5.41683 27.05L5.50016 27.1666C6.27639 28.2016 7.28292 29.0416 8.44005 29.6202C9.59718 30.1988 10.8731 30.5 12.1668 30.5H17.1668V28.2166C16.6604 28.5104 16.0856 28.6656 15.5002 28.6666C14.5973 28.6582 13.7344 28.2927 13.1002 27.65C12.7956 27.3349 12.5562 26.963 12.3956 26.5554C12.235 26.1477 12.1563 25.7124 12.164 25.2744C12.1717 24.8363 12.2658 24.404 12.4407 24.0023C12.6156 23.6006 12.868 23.2374 13.1835 22.9333L18.1835 18.1C18.8056 17.5004 19.6362 17.1657 20.5002 17.1666C21.3828 17.1704 22.2279 17.524 22.8502 18.15L27.8502 23.15C28.471 23.7745 28.8195 24.6193 28.8195 25.5C28.8195 26.3806 28.471 27.2254 27.8502 27.85C27.2279 28.4759 26.3828 28.8296 25.5002 28.8333C24.9139 28.8388 24.3373 28.6832 23.8335 28.3833V30.5H28.8335C30.1272 30.5 31.4032 30.1988 32.5603 29.6202C33.7174 29.0416 34.7239 28.2016 35.5002 27.1666L35.5835 27.0833C35.615 27.0413 35.6429 26.9967 35.6668 26.95L35.9002 26.5833C36.0865 26.2831 36.2535 25.9714 36.4002 25.65L36.6002 25.1666C36.7176 24.8501 36.8178 24.5274 36.9002 24.2C36.9002 24.0333 36.9835 23.8833 37.0168 23.7166C37.1107 23.2052 37.1609 22.6866 37.1668 22.1666C37.1649 21.607 37.1091 21.0489 37.0002 20.5Z" fill="#919EAB" />
            <path d="M21.6835 19.3166C21.372 19.0113 20.9531 18.8402 20.5168 18.8402C20.0806 18.8402 19.6617 19.0113 19.3502 19.3166L14.3502 24.15C14.1733 24.2959 14.0285 24.4767 13.9247 24.6812C13.8209 24.8857 13.7605 25.1093 13.7471 25.3382C13.7337 25.5671 13.7677 25.7963 13.8469 26.0115C13.9262 26.2266 14.049 26.4231 14.2076 26.5887C14.3663 26.7542 14.5573 26.8852 14.7689 26.9736C14.9805 27.0619 15.2081 27.1056 15.4373 27.1019C15.6666 27.0983 15.8926 27.0474 16.1013 26.9524C16.31 26.8575 16.4968 26.7204 16.6502 26.55L18.8335 24.4333V33.8333C18.8335 34.2753 19.0091 34.6993 19.3217 35.0118C19.6342 35.3244 20.0581 35.5 20.5002 35.5C20.9422 35.5 21.3661 35.3244 21.6787 35.0118C21.9912 34.6993 22.1668 34.2753 22.1668 33.8333V24.5166L24.3168 26.6833C24.4718 26.8395 24.6561 26.9635 24.8592 27.0481C25.0623 27.1327 25.2801 27.1763 25.5002 27.1763C25.7202 27.1763 25.938 27.1327 26.1411 27.0481C26.3442 26.9635 26.5286 26.8395 26.6835 26.6833C26.8397 26.5284 26.9637 26.344 27.0483 26.1409C27.1329 25.9378 27.1765 25.72 27.1765 25.5C27.1765 25.2799 27.1329 25.0621 27.0483 24.859C26.9637 24.6559 26.8397 24.4716 26.6835 24.3166L21.6835 19.3166Z" fill="#919EAB" />
        </svg>
    )
}

type Props = {
    label: string;
    placeholder: string;
    maxLength: number;
    error: string;
    onFile: (e: any) => void;
    onInput: (e: string) => void;
    initialInput?: string;
    initialFile?: string;
}

function DocumentUploaderComponent({ label, placeholder, onFile, onInput, error, maxLength, initialInput, initialFile }: Props): JSX.Element {

    const fileRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [fileDetails, setFileDetails] = useState({
        file: '',
        fileName: '',
        mimeType: ''
    });
    const [inputNumber, setInputNumber] = useState<string>('')

    useEffect(() => {
        if (initialInput) {
            setInputNumber(initialInput);
        }
    }, [initialInput]);

    useEffect(() => {
        if (initialFile) {
            setSelectedFile(initialFile);
        }
    }, [initialFile]);

    useEffect(() => {
        onInput(inputNumber);
    }, [inputNumber])

    async function onFileSelected(file: File): Promise<void> {
        try {
            const dataString = await getFileBase64(file);
            const data = {
                file: dataString.split(',')[1],
                fileName: file.name,
                mimeType: file.type,
            }
            onFile(data);
            setFileDetails(data);
            setSelectedFile(dataString);
        } catch (error) {
            console.log('Conversion error');
            console.log(error);
        }
    }

    function getFileBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Make a fileInfo Object                                
                resolve(typeof reader.result === 'string' ? reader.result : '');
            };
            reader.onerror = (error) => {
                reject(error);
            }
        })
    }

    return (
        <div style={{
            width: '270px',
            height: '386px',
            padding: 8,
            borderRadius: 16,
            boxShadow: '0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.20)'
        }} >
            <div
                onClick={() => {
                    fileRef.current?.click?.();
                }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#919EAB14',
                    width: '254px',
                    flexDirection: 'column',
                    height: '268px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                }}
            >
                {!selectedFile ? <>
                    <UploadIcon />
                    <Typography style={{ fontSize: 14, fontWeight: 'normal', color: '#919EAB' }}>Upload file</Typography>
                </> : (
                    selectedFile.startsWith('data:') ? (
                        <img alt='document card' src={selectedFile} style={{ objectFit: 'scale-down', maxHeight: 260, maxWidth: 250 }} />
                    ) : (
                        <Stack alignItems="center" spacing={1} sx={{ p: 2, textAlign: 'center' }}>
                            <Iconify icon="solar:check-circle-bold" width={64} sx={{ color: 'success.main' }} />
                            <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>Provided by Admin</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Already verified and uploaded on your behalf.
                            </Typography>
                        </Stack>
                    )
                )}
            </div>
            <div className="mt-4" />
            <Typography style={{
                fontSize: 18,
                color: 'black',
                fontWeight: '700'
            }}>{label}</Typography>
            <div className="mt-1" />
            <TextField error={!!error} value={inputNumber} onChange={e => setInputNumber(e.target.value)} label={placeholder} style={{ width: '100%' }} inputProps={{ maxLength: maxLength }} />
            <input onChange={(e: any) => onFileSelected(e.target.files[0])} accept="image/png, image/jpg, image/jpeg" ref={fileRef} type="file" style={{ display: 'none' }} />
        </div>
    )
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

export function IntegrationDocumentUploader(): JSX.Element {
    const { user } = useAuthContext();

    const [loading, setLoading] = useState<boolean>(false);

    const [fileDetails, setFileDetails] = useState<IFileDetails>({});
    const [documentNumberState, setDocumentNumberState] = useState<IDocumentNumberState>({});

    const [documentErrorState, setDocumentErrorState] = useState({
        img: '', gst: '', aadhar: '', pan: '', shopEstablishment: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setDocumentNumberState({
                gst: user.gstNumber || '',
                pan: user.panNumber || '',
                aadhar: user.aadharNumber || '',
                shopEstablishment: '',
            });

            const initialDetails: IFileDetails = {};
            if (user.gstNumber) {
                initialDetails.gstBase64 = 'prefilled';
                initialDetails.gstName = 'gst_registration.pdf';
            }
            if (user.panNumber) {
                initialDetails.panBase64 = 'prefilled';
                initialDetails.panName = 'pan_card.pdf';
            }
            if (user.aadharNumber) {
                initialDetails.aadharBase64 = 'prefilled';
                initialDetails.aadharName = 'aadhar_card.pdf';
            }
            setFileDetails(initialDetails);
        }
    }, [user]);

    useEffect(() => {
        setDocumentErrorState({
            img: '', gst: '', aadhar: '', pan: '', shopEstablishment: ''
        });
    }, [documentNumberState, fileDetails]);


    function checkValidation(): boolean {
        const { aadhar, gst, pan, shopEstablishment } = documentNumberState;
        const { aadharBase64, gstBase64, panBase64, shopBase64 } = fileDetails;
        const errorData = { ...documentErrorState }
        let validation = true;
        if (!aadharBase64 && !gstBase64 && !panBase64 && !shopBase64) {
            validation = false;
            errorData.img = 'Please select one document and enter respective number'
        }
        if (!aadharBase64 && !aadhar) {

        } else if (!aadharBase64 || (aadharBase64 !== 'prefilled' && !validateAadhar(aadhar))) {
            validation = false;
            errorData.aadhar = 'Please enter valid aadhar/image'
        }
        if (!gstBase64 && !gst) {

        } else if (!gstBase64 || (gstBase64 !== 'prefilled' && !validateGst(gst))) {
            validation = false;
            errorData.gst = 'Please enter vaild gst/image'
        }
        if (!panBase64 && !pan) {

        } else if (!panBase64 || (panBase64 !== 'prefilled' && !validatePan(pan))) {
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

    function updateDocumentState(key: keyof IDocumentState, value: any): void {
        setFileDetails({
            ...fileDetails,
            [`${key}Name`]: value.fileName,
            [`${key}MimeType`]: value.mimeType,
            [`${key}Base64`]: value.file
        })
    }

    function updateDocumentNumberState(key: keyof IDocumentNumberState, value: string): void {
        setDocumentNumberState({
            ...documentNumberState,
            [key]: value,
        })
    }

    async function onSubmit(): Promise<void> {
        try {
            if (checkValidation()) {
                setLoading(true);
                const response = await updateIntegrationDocuments({
                    ...fileDetails,
                    panNumber: documentNumberState.pan,
                    gstNumber: documentNumberState.gst,
                    shopEstablishmentNumber: documentNumberState.shopEstablishment,
                    aadharNumber: documentNumberState.aadhar
                })
                if (response) {
                    navigate('/create-integration');
                }
                setLoading(false);
            }
        } catch (error) {
            console.log('Unable to proceed further');
        }
    }

    function renderForm(): JSX.Element {
        return (
            <>
                <Grid container style={{ justifyContent: 'center', alignItems: 'center', gap: 20, }}>
                    <Grid item >
                        <DocumentUploaderComponent initialInput={documentNumberState.gst} initialFile={fileDetails.gstBase64} error={documentErrorState.gst} maxLength={15} onInput={(data: string) => updateDocumentNumberState('gst', data)} onFile={(data: string) => updateDocumentState('gst', data)} label="GSTIN" placeholder="GSTIN Number" />
                    </Grid>
                    <Grid item >
                        <DocumentUploaderComponent initialInput={documentNumberState.pan} initialFile={fileDetails.panBase64} error={documentErrorState.pan} maxLength={10} onInput={(data: string) => updateDocumentNumberState('pan', data)} onFile={(data: string) => updateDocumentState('pan', data)} label="Business PAN" placeholder="Business PAN Number" />
                    </Grid>
                    <Grid item >
                        <DocumentUploaderComponent initialInput={documentNumberState.shopEstablishment} initialFile={fileDetails.shopBase64} error={documentErrorState.shopEstablishment} maxLength={18} onInput={(data: string) => updateDocumentNumberState('shopEstablishment', data)} onFile={(data: string) => updateDocumentState('shop', data)} label="Shop Establishment" placeholder="Shop Establishment Number" />
                    </Grid>
                    <Grid item >
                        <DocumentUploaderComponent initialInput={documentNumberState.aadhar} initialFile={fileDetails.aadharBase64} error={documentErrorState.aadhar} maxLength={12} onInput={(data: string) => updateDocumentNumberState('aadhar', data)} onFile={(data: string) => updateDocumentState('aadhar', data)} label="Aadhar" placeholder="Aadhar Number" />
                    </Grid>
                </Grid>
                {documentErrorState && <span className="text-xs text-red-500 mt-1">{documentErrorState.img}</span>}
                <div className='mt-4 h-11'>
                    <LoadingButton loading={loading} style={{ width: '428px', height: 46, background: '#36F' }} variant="contained" onClick={() => {
                        onSubmit();
                    }}>
                        Next
                    </LoadingButton>
                </div>
                <div className='mt-2'>
                    <Typography style={{
                        color: '#637381',
                        fontSize: 12,
                        fontWeight: '400',
                    }}>By signing up, I agree to <label style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Use</label> and <label style={{ cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</label></Typography>
                </div>
            </>
        )
    }

    return (
        <div className="flex flex-col gap-4 justify-center items-center min-h-screen pb-6">
            <Typography style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#36F',
            }}>Quick Onboarding</Typography>
            <Typography style={{
                fontSize: 32,
                fontWeight: '700',
                marginTop: -22,
            }}>Document Upload</Typography>
            {renderForm()}
        </div>
    )
}