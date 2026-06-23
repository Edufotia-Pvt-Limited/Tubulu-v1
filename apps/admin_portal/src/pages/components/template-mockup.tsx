/* eslint-disable import/no-cycle */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { MdArrowBack, MdDownload } from 'react-icons/md';
import { getProfileDetails } from 'src/utils/ApiActions';
import { getMessageTypeFromMimeType } from 'src/utils/helper';
import { Button } from '@mui/material';
import Footer from '../../assets/template_footer.png'
import { IButtonGroup } from '../dashboard/create-new-template';

interface TemplateMockupProps {
    message: string;
    messageDocumentType?: string;
    messageDocumentURL?: string;
    messageDocumentName?: string;
    btnGroup?: IButtonGroup[];
}

export function TemplateMockup({ message, messageDocumentType, messageDocumentURL, messageDocumentName, btnGroup }: TemplateMockupProps): JSX.Element {

    const [profileDetails, setProfileDetails] = useState<any>(undefined);

    useEffect(() => {
        getProfileDetailsCall();
    }, [])

    async function getProfileDetailsCall() {
        try {
            const { data: { data } } = await getProfileDetails();
            setProfileDetails(data);
        } catch (error) {
            console.log('Unable to get the profile details at the moment');
            console.log(error);
        }
    }

    function renderMediaBubble(): JSX.Element | null {
        if (messageDocumentType && messageDocumentURL) {
            const mediaType = getMessageTypeFromMimeType(messageDocumentType);
            let isBase64 = true;
            try {
                const url = new URL(messageDocumentURL);
                if (url.protocol === 'https:') {
                    isBase64 = false;
                }
            } catch (error) {
                console.log(`${messageDocumentType};base64,${messageDocumentURL}`);
                console.log('Invalid url');
            }
            switch (mediaType) {
                case 'IMAGE':
                    return (
                        <div className='flex flex-row gap-2'>
                            <img className='h-6 w-6 ml-2 rounded-full' src={profileDetails?.logo ?? ''} alt='avatar' />
                            <div style={{
                                maxWidth: 160,
                                wordWrap: 'break-word',
                                flexWrap: 'wrap',
                                background: 'white',
                                borderRadius: '2px 10px 10px 10px',
                                lineHeight: 1.1
                            }} className='px-1 py-1'>
                                <img className='rounded-md' src={!isBase64 ? messageDocumentURL : `data:${messageDocumentType};base64,${messageDocumentURL}`} alt='message' />
                            </div>
                        </div>
                    )
                case 'VIDEO':
                    return (
                        <div className='flex flex-row gap-2'>
                            <img className='h-6 w-6 ml-2 rounded-full' src={profileDetails?.logo ?? ''} alt='avatar' />
                            <div style={{
                                maxWidth: 160,
                                wordWrap: 'break-word',
                                flexWrap: 'wrap',
                                background: 'white',
                                borderRadius: '2px 10px 10px 10px',
                                lineHeight: 1.1
                            }} className='px-1 py-1'>
                                <video controls src={!isBase64 ? messageDocumentURL : `data:${messageDocumentType};base64,${messageDocumentURL}`} />
                            </div>
                        </div>
                    );
                case 'AUDIO':
                    return (
                        <div className='flex flex-row gap-2'>
                            <img className='h-6 w-6 ml-2 rounded-full' src={profileDetails?.logo ?? ''} alt='avatar' />
                            <div style={{
                                maxWidth: 160,
                                wordWrap: 'break-word',
                                flexWrap: 'wrap',
                                background: 'white',
                                borderRadius: '2px 10px 10px 10px',
                            }}>
                                <div style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    fontStyle: 'normal',
                                }} className='w-100'>
                                    <audio controls style={{ padding: 0 }}>
                                        <source src={!isBase64 ? messageDocumentURL : `data:${messageDocumentType};base64,${messageDocumentURL}`} />
                                    </audio>
                                </div>
                            </div>
                        </div>

                    );
                default:
                    return (
                        <div className='flex flex-row gap-2'>
                            <img className='h-6 w-6 ml-2 rounded-full' src={profileDetails?.logo ?? ''} alt='avatar' />
                            <div style={{
                                maxWidth: 160,
                                wordWrap: 'break-word',
                                flexWrap: 'wrap',
                                background: 'white',
                                borderRadius: '2px 10px 10px 10px',
                                lineHeight: 1.1
                            }} className='px-1 py-1'>
                                <div style={{
                                    fontSize: '12px',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    lineHeight: 0.2
                                }} className='w-90 py-2 pl-2 pr-4 gap-4'>
                                    {messageDocumentName}
                                    <MdDownload className='text-base' />
                                </div>
                            </div>
                        </div>
                    )
                    return null;
            }
        }
        return null;
    }

    function renderBtnGroup(): JSX.Element | null {
        if (btnGroup) {
            return (
                <div
                    style={{
                        display: 'flex',
                        position: 'relative',
                        gap: 5,
                        left: 40,
                        maxWidth: 160,
                        flexWrap: "wrap",
                    }}>
                    {btnGroup?.map((btn) => <Button variant='outlined' size='small' style={{ color: '#2355C4', backgroundColor: '#FFF', fontWeight: 400, minWidth: 10, border: '1px solid #2355C4' }}  >{btn.title}</Button>)}
                </div>
            )
        }
        return null
    }

    return (
        <div className='ml-20'>
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute" />
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg" />
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg" />
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg" />
                <div style={{
                    backgroundColor: '#EBF0FD',
                }} className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] dark:bg-gray-800">
                    <div className='bg-white h-4' />
                    <div className='bg-white py-2 px-2 h-16 flex flex-row items-center'>
                        <MdArrowBack style={{
                            color: '#2355C4',
                            fontSize: 24,
                        }} />
                        <img className='h-9 w-9 ml-2 rounded-full' src={profileDetails?.logo ?? ''} alt='avatar' />
                        <div className='mx-2 flex flex-col'>
                            <span style={{
                                fontSize: 14
                            }} className='color-black font-normal'>{profileDetails?.integrationName}</span>
                            <span style={{
                                color: '#8E8E93',
                                marginTop: 0,
                                fontSize: 11,
                            }} className='font-normal text-ellipsis'>Business Account</span>
                        </div>
                    </div>
                    <div className='px-2 py-2 flex flex-col gap-2'>
                        {renderMediaBubble()}
                        <div className='flex flex-row gap-2'>
                            <img className='h-6 w-6 ml-2 rounded-full' src={profileDetails?.logo ?? ''} alt='avatar' />
                            <div style={{
                                maxWidth: 160,
                                wordWrap: 'break-word',
                                flexWrap: 'wrap',
                                background: 'white',
                                borderRadius: '2px 10px 10px 10px',
                                lineHeight: 1.1
                            }} className='px-2 py-2'>
                                <span style={{
                                    fontSize: '12px',
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    lineHeight: 0.2
                                }}>{message}</span>
                            </div>
                        </div>
                        {renderBtnGroup()}
                    </div>
                    <img className='absolute bottom-7' src={Footer} alt='footer' />
                    <div style={{
                        borderBottomLeftRadius: 200,
                        borderBottomRightRadius: 200,
                    }} className=' w-[272px] h-7 absolute bg-white bottom-0' />
                </div>
            </div>
        </div>
    )
}