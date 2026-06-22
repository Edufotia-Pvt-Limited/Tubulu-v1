import { Box, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { UploadIcon } from "../integration-document-uploader/integration-document-uploader";

interface IFileType {
    file: string;
    fileName: string;
    mimeType: string;
}

type Props = {
    label: string;
    placeholder: string;
    maxLength: number;
    error: string;
    onFile: (e: any) => void;
    onInput: (e: string) => void;
    input?: string;
    file?: string;
}

export default function DocumentPreview({ label, placeholder, maxLength, onFile, onInput, input, file, error }: Props): JSX.Element {

    const fileRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<string>(file ?? '');
    const [fileDetails, setFileDetails] = useState({
        file: '',
        fileName: '',
        mimeType: ''
    });
    const [inputNumber, setInputNumber] = useState<string>(input ?? '')

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
                </> : <img alt='document card' src={selectedFile} style={{ objectFit: 'scale-down', maxHeight: 260, maxWidth: 250 }} />}
            </div>
            <div className="mt-2" />
            <Typography style={{
                fontSize: 18,
                color: 'black',
                fontWeight: '700'
            }}>{label}</Typography>
            <div className="mt-2" />
            <TextField error={!!error} value={inputNumber} onChange={e => setInputNumber(e.target.value)} label={placeholder} style={{ width: '100%' }} inputProps={{ maxLength: maxLength }} />
            {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
            <input onChange={(e: any) => onFileSelected(e.target.files[0])} accept="image/png, image/jpg, image/jpeg" ref={fileRef} type="file" style={{ display: 'none' }} />
        </div>
    )
}