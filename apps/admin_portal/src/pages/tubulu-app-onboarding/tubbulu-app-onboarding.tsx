/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Grid, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { createIntegration } from 'src/utils/ApiActions';
import { useNavigate } from 'react-router-dom';
import MobileAsset from '../../assets/image.png';

interface TubuluPhoneDisplayProps {
    title?: string;
    logo?: string;
    description?: string;
}

interface LogoUploaderProps {
    onFile?: (file: { fileName: string; mimeType: string; file: string }) => void;
    onLogo?: (logoData: string) => void;
    url?: string;
    disabled?: boolean;
}

function CameraIcon(): JSX.Element {
    return (
        <svg width="32" height="32" viewBox="0 0 24 25" fill="none">
            <path d="M3 8.5C3 9.05 3.45 9.5 4 9.5C4.55 9.5 5 9.05 5 8.5V6.5H7C7.55 6.5 8 6.05 8 5.5C8 4.95 7.55 4.5 7 4.5H5V2.5C5 1.95 4.55 1.5 4 1.5C3.45 1.5 3 1.95 3 2.5V4.5H1C0.45 4.5 0 4.95 0 5.5C0 6.05 0.45 6.5 1 6.5H3V8.5Z" fill="#637381" />
            <path d="M16 14.5C16 16.1569 14.6569 17.5 13 17.5C11.3431 17.5 10 16.1569 10 14.5C10 12.8431 11.3431 11.5 13 11.5C14.6569 11.5 16 12.8431 16 14.5Z" fill="#637381" />
            <path d="M17.83 6.5H21C22.1 6.5 23 7.4 23 8.5V20.5C23 21.6 22.1 22.5 21 22.5H5C3.9 22.5 3 21.6 3 20.5V10.22C3.3 10.39 3.63 10.5 4 10.5C5.1 10.5 6 9.6 6 8.5V7.5H7C8.1 7.5 9 6.6 9 5.5C9 5.13 8.89 4.8 8.72 4.5H15.12C15.68 4.5 16.22 4.74 16.59 5.15L17.83 6.5ZM8 14.5C8 17.26 10.24 19.5 13 19.5C15.76 19.5 18 17.26 18 14.5C18 11.74 15.76 9.5 13 9.5C10.24 9.5 8 11.74 8 14.5Z" fill="#637381" />
        </svg>
    )
}


function TubuluPhoneDisplay({ title, logo, description }: TubuluPhoneDisplayProps): JSX.Element {
    return (
        <div style={{ position: 'relative' }}>
            <img style={{
                height: '667px',
            }} alt='tubulu' src={MobileAsset} />
            {!!logo && <img style={{
                position: 'absolute',
                left: 56,
                top: 185,
                height: 60,
                width: 60,
                borderRadius: 60,
                objectFit: 'cover'
            }} src={logo.startsWith('http') || logo.startsWith('data:') ? logo : `http://localhost:3008${logo.startsWith('/') ? '' : '/'}${logo}`} alt='business-logo' />}
            {!!title && <div style={{
                position: 'absolute',
                left: 142,
                top: 195,
                minWidth: 150,
                background: 'white'
            }}>
                <Typography style={{
                    fontSize: 16,
                    fontWeight: '600',
                }}>{title}</Typography>
            </div>
            }
            {!!description && <div style={{
                position: 'absolute',
                left: 142,
                top: 216,
                minWidth: 270,
                maxWidth: 270,
                background: 'white'
            }}>
                <Typography style={{
                    fontSize: 12,
                    fontWeight: '400',
                    color: 'grey',
                    height: 50
                }}>{description}</Typography>
            </div>
            }
        </div>
    )
}

export function LogoUploader({ onFile, onLogo, url='', disabled = false }: LogoUploaderProps): JSX.Element {

    const [logo, setLogo] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState({
        fileName: '',
        mimeType: '',
        file: ''
    });
    const fileRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if(url){
            setLogo(url);
        }
    }, [url])

    async function onFileSelected(file: File): Promise<void> {
        try {
            const dataString = await getFileBase64(file);
            const data = {
                fileName: file.name,
                mimeType: file.type,
                file: dataString.split(',')[1]
            }
            onFile?.(data);
            onLogo?.(dataString);
            setSelectedFile(data);
            setLogo(dataString);
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

    const fixUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http") || path.startsWith("data:")) return path;
        const host = (window as any).HOST_API || "http://localhost:3008"; // Fallback or import
        return path.startsWith("/") ? `${host}${path}` : `${host}/${path}`;
    };

    return (
        <div style={{
            height: 144,
            width: 144,
            borderRadius: 144,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px dashed #919EAB52',
            padding: 8
        }}>
            <div onClick={() => {
                if (disabled) return;
                fileRef.current?.click?.();
            }} style={{
                background: '#F4F6F8',
                height: 128,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 128,
                cursor: disabled ? 'default' : 'pointer',
                borderRadius: 128,
                flexDirection: 'column',
                overflow: 'hidden', // Ensure image stays inside
                position: 'relative'
            }}>
                {(!logo || logo === "") ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CameraIcon />
                        <Typography style={{ fontSize: 12, fontWeight: 'normal', color: '#919EAB', textAlign: 'center', marginTop: 4 }}>
                            Upload logo
                        </Typography>
                    </div>
                ) : (
                    <img 
                        alt='' 
                        style={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                        }} 
                        src={fixUrl(logo)} 
                        onError={(e) => {
                            // If image fails to load, clear logo to show camera icon again
                            setLogo("");
                        }}
                    />
                )}
                
                {logo && !disabled && (
                    <div 
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            color: 'white',
                        }} 
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} 
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                         <CameraIcon />
                    </div>
                )}
            </div>
            <input onChange={(e: any) => onFileSelected(e.target.files[0])} accept="image/png, image/jpg, image/jpeg" ref={fileRef} type="file" style={{ display: 'none' }} />
        </div>
    )
}

export function TubuluAppOnboarding(): JSX.Element {

    const [displayName, setDisplayname] = useState<string>('');
    const [logo, setLogo] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [aboutBusiness, setAboutBusiness] = useState<string>('');

    const [nameError, setNameError] = useState<boolean>(false);
    const [logoError, setLogoError] = useState<boolean>(false);
    const [descriptionError, setDescriptionError] = useState<boolean>(false);
    const [fileDetails, setFileDetails] = useState({
        file: '',
        fileName: '',
        mimeType: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        setLogoError(false);
        setNameError(false);
        setDescriptionError(false);
    }, [fileDetails, aboutBusiness, displayName])

    function checkValidation(): boolean {
        let validation = true;
        if (displayName.trim() === '') {
            validation = false;
            setNameError(true);
        }
        if (!fileDetails) {
            validation = false;
            setLogoError(true);
        }
        if (aboutBusiness.trim() === '') {
            validation = false;
            setDescriptionError(true);
        }
        return validation;
    }

    async function onSubmit(): Promise<void> {
        try {
            if (checkValidation()) {
                const response = await createIntegration({
                    ...fileDetails, businessName: displayName, description: aboutBusiness,
                });
                if (response) {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.log('Unable to proceed');
        }
    }

    function renderForm(): JSX.Element {
        return (
            <Grid container style={{ justifyContent: 'center', }}>
                <Grid item xs={6} style={{
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    display: 'flex',
                }}>
                    <TubuluPhoneDisplay title={displayName} logo={logo} description={aboutBusiness} />
                </Grid>
                <Grid item xs={6} style={{ display: 'flex', paddingLeft: 16, flexDirection: 'column', }}>
                    <div style={{ flexDirection: 'column', maxWidth: 400, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <LogoUploader onFile={setFileDetails} onLogo={setLogo} />
                        <div className='mt-1' />
                        <Typography style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#212B36',
                        }}>Upload Logo</Typography>
                        {logoError && <span className='text-xs text-red-500 mt-1'>Please select Logo</span>}
                        <div className='mt-8' />
                        <TextField onChange={e => setDisplayname(e.target.value)} value={displayName} style={{ width: '400px' }} label="Business Display Name" />
                        {nameError && <span className='text-xs text-red-500 mt-1'>Please enter valid name</span>}
                        <div className='mt-4' />
                        <TextField onChange={e => setAboutBusiness(e.target.value)} value={aboutBusiness} inputProps={{
                            maxLength: 50,
                            style: {
                                height: '263px',
                            }
                        }} multiline style={{ width: '400px', height: '263px' }} label="About Business" />
                        {descriptionError && <span className='text-xs text-red-500 mt-1'>Please enter valid description</span>}
                        <div className='mt-20' />
                        <LoadingButton loading={loading} style={{ width: '400px', height: 46, background: '#36F' }} variant="contained" onClick={() => {
                            onSubmit();
                        }}>
                            Done
                        </LoadingButton>
                    </div>
                </Grid>
            </Grid>
        )
    }

    return (
        <div className="flex flex-col gap-4 justify-center items-center min-h-screen pb-6" >
            <Typography style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#36F',
            }}>Quick Onboarding</Typography>
            <Typography style={{
                fontSize: 32,
                fontWeight: '700',
                marginTop: -22,
            }}>Integration Creation</Typography>
            <div className='mt-4' />
            {renderForm()}
        </div>
    )
}