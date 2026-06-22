// /* eslint-disable react/no-unescaped-entities */
// import { LoadingButton } from '@mui/lab';
// import { TextField } from '@mui/material';
// import { useEffect, useState } from 'react';
// import OTPInput from 'react-otp-input';

// export function CloseIcon() {
//     return (
//         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
//             <path d="M13.4032 11.9942L17.6976 7.70953C18.0892 7.3179 18.0892 6.68292 17.6976 6.29129C17.306 5.89965 16.671 5.89965 16.2794 6.29129L11.995 10.586L7.71063 6.29129C7.31902 5.89965 6.68409 5.89965 6.29248 6.29129C5.90087 6.68292 5.90087 7.3179 6.29248 7.70953L10.5869 11.9942L6.29248 16.2789C6.10342 16.4665 5.99707 16.7218 5.99707 16.9881C5.99707 17.2544 6.10342 17.5096 6.29248 17.6972C6.48 17.8863 6.73527 17.9926 7.00155 17.9926C7.26784 17.9926 7.52311 17.8863 7.71063 17.6972L11.995 13.4025L16.2794 17.6972C16.4669 17.8863 16.7222 17.9926 16.9885 17.9926C17.2548 17.9926 17.51 17.8863 17.6976 17.6972C17.8866 17.5096 17.993 17.2544 17.993 16.9881C17.993 16.7218 17.8866 16.4665 17.6976 16.2789L13.4032 11.9942Z" fill="#637381" />
//         </svg>
//     )
// }

// interface Props {
//     title: string;
//     onClose: () => void;
//     subTitle: string;
//     onResend: () => void;
//     onVerify: (code: string) => void;
//     loading?: boolean;
//     error?: string;
// }

// export function TubuluOtpVerification({ error, loading, onClose, onVerify, subTitle, title }: Props): JSX.Element {

//     const [otp, setOtp] = useState<string>('');

//     function renderHeader(): JSX.Element {
//         return (
//             <div style={{ maxHeight: '78px', justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
//                 <span className='verify-phone-title'>{title}</span>
//             </div>
//         )
//     }

//     function renderSubTitle(): JSX.Element {
//         return <div style={{ marginTop: 24, paddingRight: 12, paddingLeft: 32, }}>
//             <span className='verify-phone-subtitle'>{subTitle}</span>
//         </div>
//     }

//     function renderOTPInput(): JSX.Element {
//         return (
//             <div style={{
//                 // width: 352,
//                 display: 'flex',
//                 marginTop: 24,
//                 gap: 4,
//             }}>
//                 <OTPInput
//                     inputStyle={{
//                         border: '1px solid #e9ecee',
//                         width: 40,
//                         borderRadius: 5,
//                         margin: 10,
//                         padding: 8
//                     }}
//                     value={otp}
//                     onChange={setOtp}
//                     numInputs={6}
//                     // renderSeparator={<span>-</span>}
//                     renderInput={(props) => <input {...props} />}
//                 />
//             </div>
//         )
//     }

//     function onSubmit(): void {
//         onVerify(otp);
//     }

//     return (
//         <div className='h-screen w-screen absolute z-20 flex justify-center items-center'>
//             <div className='absolute h-screen w-screen bg-slate-500 opacity-50' />
//             <div style={{
//                 height: 590,
//                 width: 400
//             }} className='z-30 bg-white items-center rounded-3xl relative pt-6 w-full flex flex-col'>
//                 {renderHeader()}
//                 {renderSubTitle()}
//                 <div style={{
//                     background: "#D9D9D9",
//                     borderRadius: 10,
//                     height: 195,
//                     width: 352,
//                     marginTop: 24,
//                 }} />
//                 {renderOTPInput()}
//                 {!!error && <span className="text-xs text-red-500 mt-1">{error}</span>}
//                 <span className='didnt-receive-style'>Didn't receive an OTP? <label className='resend-style'>RESEND</label></span>
//                 <div style={{
//                     paddingLeft: 12,
//                     paddingRight: 12,
//                     marginTop: 24
//                 }}>
//                     <LoadingButton style={{ background: '#36F' }} loading={loading} variant='contained' onClick={onSubmit} >Verify OTP Code</LoadingButton>
//                 </div>
//                 <div onClick={onClose} style={{ position: "absolute", right: 10, cursor: 'pointer' }}>
//                     <CloseIcon />
//                 </div>
//             </div>
//         </div>
//     )
// }

/* eslint-disable react/no-unescaped-entities */
import { LoadingButton } from '@mui/lab';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import OTPInput from 'react-otp-input';

export function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M13.4032 11.9942L17.6976 7.70953C18.0892 7.3179 18.0892 6.68292 17.6976 6.29129C17.306 5.89965 16.671 5.89965 16.2794 6.29129L11.995 10.586L7.71063 6.29129C7.31902 5.89965 6.68409 5.89965 6.29248 6.29129C5.90087 6.68292 5.90087 7.3179 6.29248 7.70953L10.5869 11.9942L6.29248 16.2789C6.10342 16.4665 5.99707 16.7218 5.99707 16.9881C5.99707 17.2544 6.10342 17.5096 6.29248 17.6972C6.48 17.8863 6.73527 17.9926 7.00155 17.9926C7.26784 17.9926 7.52311 17.8863 7.71063 17.6972L11.995 13.4025L16.2794 17.6972C16.4669 17.8863 16.7222 17.9926 16.9885 17.9926C17.2548 17.9926 17.51 17.8863 17.6976 17.6972C17.8866 17.5096 17.993 17.2544 17.993 16.9881C17.993 16.7218 17.8866 16.4665 17.6976 16.2789L13.4032 11.9942Z" fill="#637381" />
        </svg>
    )
}

interface Props {
    title: string;
    onClose: () => void;
    subTitle: string;
    onResend: () => void;
    onVerify: (code: string) => void;
    loading?: boolean;
    error?: string;
}

export function TubuluOtpVerification({ error, loading, onClose, onVerify, subTitle, title }: Props): JSX.Element {

    const [otp, setOtp] = useState<string>('');

    function renderHeader(): JSX.Element {
        return (
            <div style={{ maxHeight: '78px', justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <span className='verify-phone-title'>{title}</span>
            </div>
        )
    }

    function renderSubTitle(): JSX.Element {
        return <div style={{ marginTop: 24, paddingRight: 12, paddingLeft: 32, }}>
            <span className='verify-phone-subtitle'>{subTitle}</span>
        </div>
    }

    function renderOTPInput(): JSX.Element {
        return (
            <div 
                style={{
                    display: 'flex',
                    marginTop: 24,
                    gap: 4,
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading && otp.length === 6) {
                        onSubmit();
                    }
                }}
            >
                <OTPInput
                    inputStyle={{
                        border: '1px solid #e9ecee',
                        width: 40,
                        borderRadius: 5,
                        margin: 10,
                        padding: 8
                    }}
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderInput={(props) => <input {...props} />}
                />
            </div>
        )
    }

    function onSubmit(): void {
        onVerify(otp);
    }

    return (
        <div className='h-screen w-screen absolute z-20 flex justify-center items-center'>
            <div className='absolute h-screen w-screen bg-slate-500 opacity-50' />
            <div style={{
                height: 590,
                width: 400
            }} className='z-30 bg-white items-center rounded-3xl relative pt-6 w-full flex flex-col'>
                {renderHeader()}
                {renderSubTitle()}
                <div style={{
                    background: "#D9D9D9",
                    borderRadius: 10,
                    height: 195,
                    width: 352,
                    marginTop: 24,
                }} />
                {renderOTPInput()}
                {!!error && <span className="text-xs text-red-500 mt-1">{error}</span>}
                <span className='didnt-receive-style'>Didn't receive an OTP? <label className='resend-style'>RESEND</label></span>
                <div style={{
                    paddingLeft: 12,
                    paddingRight: 12,
                    marginTop: 24
                }}>
                    <LoadingButton 
                        style={{ background: '#36F' }} 
                        loading={loading} 
                        variant='contained' 
                        onClick={onSubmit}
                    >
                        Verify OTP Code
                    </LoadingButton>
                </div>

                <div onClick={onClose} style={{ position: "absolute", right: 10, cursor: 'pointer' }}>
                    <CloseIcon />
                </div>
            </div>
        </div>
    )
}