/* eslint-disable jsx-a11y/label-has-associated-control */
import { LoadingButton } from '@mui/lab';
import { Divider, Grid, MenuItem, TextField, TextFieldProps, Typography } from '@mui/material';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TubuluLogo } from 'src/components/tubulu-logo';
import { OnboardIntegration, fetchCategories, getSessionDetails } from 'src/utils/ApiActions';
import { countryList } from 'src/utils/GetCountryList';
import { validateEmail, validatePinCode } from 'src/utils/helper';
import { ICategory } from '../dashboard/user-profile';

function FormTextField(props: (PropsWithChildren & TextFieldProps)): JSX.Element {

    const { ...rest } = props;

    return (
        <TextField style={{ width: '100%' }} {...rest} />
    )
}

interface IAccountFormData {
    businessName: string;
    state: string;
    city: string;
    country: string;
    email: string;
    industry?: string;
    addressLine?: string;
    pincode?: string;
    website?: string;
    landmark?: string;
    accountManagerCode?: string;
}

interface IAccountErrorState {
    businessName?: string;
    state?: string;
    city?: string;
    country?: string;
    email?: string;
    industry?: string;
    addressLine?: string;
    pincode?: string;
    website?: string;
    landmark?: string;
    accountMangerCode?: string;
}

function WarningIcon() {
    return (
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
            <path d="M12 2.5C6.47715 2.5 2 6.97715 2 12.5C2 18.0228 6.47715 22.5 12 22.5C17.5228 22.5 22 18.0228 22 12.5C22 9.84784 20.9464 7.3043 19.0711 5.42893C17.1957 3.55357 14.6522 2.5 12 2.5ZM12 17.5C11.4477 17.5 11 17.0523 11 16.5C11 15.9477 11.4477 15.5 12 15.5C12.5523 15.5 13 15.9477 13 16.5C13 17.0523 12.5523 17.5 12 17.5ZM12 14.5C12.5523 14.5 13 14.0523 13 13.5V8.5C13 7.94772 12.5523 7.5 12 7.5C11.4477 7.5 11 7.94772 11 8.5V13.5C11 14.0523 11.4477 14.5 12 14.5Z" fill="#FFAB00" />
        </svg>
    )
}

function LandmarkIcon() {
    return (
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
            <path d="M13.5 10C13.5 10.8284 12.8284 11.5 12 11.5C11.1716 11.5 10.5 10.8284 10.5 10C10.5 9.17157 11.1716 8.5 12 8.5C12.8284 8.5 13.5 9.17157 13.5 10Z" fill="#FF5630" />
            <path d="M4 10.42C4.04387 6.033 7.61278 2.49978 12 2.5C16.3872 2.49978 19.9561 6.033 20 10.42C20 15.9 13 22 12.65 22.26C12.2758 22.5801 11.7242 22.5801 11.35 22.26L11.3484 22.2586C11.0254 21.9787 4 15.8904 4 10.42ZM8.5 10C8.5 11.933 10.067 13.5 12 13.5C12.9283 13.5 13.8185 13.1313 14.4749 12.4749C15.1313 11.8185 15.5 10.9283 15.5 10C15.5 8.067 13.933 6.5 12 6.5C10.067 6.5 8.5 8.067 8.5 10Z" fill="#FF5630" />
        </svg>
    )
}

export function IntegrationCreateAccount(): JSX.Element {

    const mobileNumbner = getSessionDetails()?.phoneNumber ?? '';

    const [formData, setFormData] = useState<IAccountFormData>({
        businessName: '', city: '', country: '', email: '', state: '', accountManagerCode: '',
        addressLine: '', industry: '', landmark: '', pincode: '', website: '',
    })

    const [errorState, setErrorState] = useState<IAccountErrorState>({
        accountMangerCode: '', addressLine: '', businessName: '', city: '',
        country: '', email: '', industry: '', landmark: '', pincode: '', state: '', website: ''
    });

    const [categories, setCategories] = useState<ICategory[]>();

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setErrorState({
            accountMangerCode: '', addressLine: '', businessName: '', city: '',
            country: '', email: '', industry: '', landmark: '', pincode: '', state: '', website: ''
        })
    }, [formData]);

    async function fetchALLCategories() {
        const response: any = await fetchCategories();
        setCategories(response?.data?.data);
    }

    useEffect(() => {
        fetchALLCategories();
    }, [])

    const navigate = useNavigate();

    function updateFormData(key: keyof IAccountFormData, value: string): void {
        setFormData({
            ...formData,
            [key]: value
        })
    }

    function checkValidation(): boolean {
        let validation = true;
        const { businessName, city, country, email, state, addressLine, industry, landmark, pincode, website } = formData;
        const errorData = { ...errorState };
        if (businessName.trim() === '') {
            validation = false;
            errorData.businessName = 'Please enter valid business name.';
        }
        if (city.trim() === '') {
            validation = false;
            errorData.city = 'Should not be empty';
        }
        if (country.trim() === '') {
            validation = false;
            errorData.country = 'Should not be empty';
        }
        if (!validateEmail(email)) {
            validation = false;
            errorData.email = 'Please enter vaild email';
        }
        if (state.trim() === '') {
            validation = false;
            errorData.state = 'Should not be empty'
        }
        if (!addressLine || addressLine?.trim?.() === '') {
            validation = false;
            errorData.addressLine = 'Should not be empty';
        }
        if (!industry || industry?.trim?.() === '') {
            validation = false;
            errorData.industry = 'Should not be empty';
        }
        if (!landmark || landmark.trim() === '') {
            validation = false;
            errorData.landmark = 'Should not be empty';
        }
        if (!pincode || !validatePinCode(pincode)) {
            validation = false;
            errorData.pincode = 'Please enter valid pincode';
        }
        if (!website || website.trim() === '') {
            validation = false;
            errorData.website = 'Should not be empty';
        }
        setErrorState(errorData);
        return validation;
    }

    async function onSubmit(): Promise<void> {
        try {
            if (checkValidation()) {
                setLoading(true);
                const response = await OnboardIntegration({
                    ...formData,
                    integrationName: formData.businessName,
                    category: formData.industry,
                    Address: {
                        addressLine: formData.addressLine,
                        country: formData.country,
                        city: formData.city,
                        state: formData.state,
                        pinCode: formData.pincode,
                        landmark: formData.landmark,
                    }
                });
                if (response) {
                    // TODO: Add the route
                    navigate('/verify-documents');
                }
                setLoading(false);
            }
        } catch (error) {
            console.log('Unable to proceed at the moment');
            setErrorState({ ...errorState, businessName: 'Unable to submit request at the moment' });
        }
    }

    function renderForm(): JSX.Element {
        return (
            <>
                <Grid container style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Grid item xs={8} style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <FormTextField
                            value={formData.businessName}
                            label='Business Name'
                            error={!!errorState.businessName}
                            onChange={event => updateFormData('businessName', event.target.value)}
                        />
                        {!!errorState.businessName && <span className="text-xs text-red-500 mt-1">{errorState.businessName}</span>}
                    </Grid>
                </Grid>
                <Grid container style={{ justifyContent: 'center', alignItems: 'center', gap: 0, }}>
                    <Grid item xs={4} style={{ justifyContent: 'center', alignItems: 'center', paddingRight: 8, }}>
                        <FormTextField
                            select
                            value={formData.industry}
                            label='Select Industry'
                            error={!!errorState.industry}
                            onChange={event => updateFormData('industry', event.target.value)}
                        >
                            {categories?.map((category) => <MenuItem value={category.name}>{category.name}</MenuItem>)}
                        </FormTextField>
                        {!!errorState.industry && <span className='text-xs text-red-500 mt-1'>{errorState.industry}</span>}
                    </Grid>
                    <Grid item xs={4} style={{ justifyContent: 'center', alignItems: 'center', paddingLeft: 8, }}>
                        <FormTextField
                            value={formData.addressLine}
                            label='Address Line'
                            error={!!errorState.addressLine}
                            InputProps={{
                                endAdornment: <LandmarkIcon />
                            }}
                            onChange={event => updateFormData('addressLine', event.target.value)}
                        />
                        {!!errorState.addressLine && <span className='text-xs text-red-500 mt-1'>{errorState.addressLine}</span>}
                    </Grid>
                    <Grid container style={{ justifyContent: 'center', alignItems: 'center', gap: 0, marginTop: 16 }}>
                        <Grid item xs={4} style={{ justifyContent: 'center', alignItems: 'center', paddingRight: 8, }}>
                            <FormTextField
                                value={formData.email}
                                label='Email ID'
                                error={!!errorState.email}
                                InputProps={{
                                    endAdornment: <WarningIcon />
                                }}
                                onChange={event => updateFormData('email', event.target.value)}
                            />
                            {!!errorState.email && <span className='text-xs text-red-500 mt-1'>{errorState.email}</span>}
                        </Grid>
                        <Grid item xs={2} style={{ justifyContent: 'center', alignItems: 'center', paddingLeft: 8, }}>
                            <FormTextField
                                select
                                error={!!errorState.country}
                                value={formData.country}
                                label='Country'
                                onChange={event => updateFormData('country', event.target.value)}
                            >
                                {countryList.map((country) => <MenuItem value={country}>{country}</MenuItem>)}
                            </FormTextField>
                            {!!errorState.country && <span className='text-xs text-red-500 mt-1'>{errorState.country}</span>}
                        </Grid>
                        <Grid item xs={2} style={{ justifyContent: 'center', alignItems: 'center', paddingLeft: 8, }}>
                            <FormTextField
                                error={!!errorState.state}
                                value={formData.state}
                                label='State'
                                onChange={event => updateFormData('state', event.target.value)}
                            />
                            {!!errorState.city && <span className='text-xs text-red-500 mt-1'>{errorState.city}</span>}
                        </Grid>
                    </Grid>
                    <Grid container style={{ justifyContent: 'center', alignItems: 'center', gap: 0, marginTop: 16 }}>
                        <Grid item xs={4} style={{ justifyContent: 'center', alignItems: 'center', paddingRight: 8, }}>
                            <FormTextField
                                value={mobileNumbner}
                                label='Phone Number'
                                disabled
                                onChange={event => updateFormData('email', event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={2} style={{ justifyContent: 'center', alignItems: 'center', paddingLeft: 8, }}>
                            <FormTextField
                                value={formData.city}
                                label='City'
                                error={!!errorState.city}
                                onChange={event => updateFormData('city', event.target.value)}
                            />
                            {!!errorState.state && <span className='text-xs text-red-500 mt-1'>{errorState.state}</span>}
                        </Grid>
                        <Grid item xs={2} style={{ justifyContent: 'center', alignItems: 'center', paddingLeft: 8, }}>
                            <FormTextField
                                value={formData.pincode}
                                label='Pin Code'
                                error={!!errorState.pincode}
                                onChange={event => updateFormData('pincode', event.target.value)}
                            />
                            {!!errorState.pincode && <span className='text-xs text-red-500 mt-1'>{errorState.pincode}</span>}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container style={{ justifyContent: 'center', alignItems: 'center', gap: 0, }}>
                    <Grid item xs={4} style={{ justifyContent: 'center', alignItems: 'center', paddingRight: 8, }}>
                        <FormTextField
                            value={formData.website}
                            label='Website'
                            error={!!errorState.website}
                            onChange={event => updateFormData('website', event.target.value)}
                        />
                        {!!errorState.website && <span className='text-xs text-red-500 mt-1'>{errorState.website}</span>}
                    </Grid>
                    <Grid item xs={4} style={{ justifyContent: 'center', alignItems: 'center', paddingLeft: 8, }}>
                        <FormTextField
                            value={formData.landmark}
                            label='Landmark'
                            error={!!errorState.landmark}
                            onChange={event => updateFormData('landmark', event.target.value)}
                        />
                        {!!errorState.landmark && <span className='text-xs text-red-500 mt-1'>{errorState.landmark}</span>}
                    </Grid>
                </Grid>
                <Grid container style={{ justifyContent: 'center', alignItems: 'center', marginTop: 8, }}>
                    <Grid item xs={8}>
                        <Divider style={{ background: '#919EAB3D', width: '' }} />
                    </Grid>
                </Grid>
                <Grid container style={{ justifyContent: 'center', alignItems: 'center', marginTop: 8, }}>
                    <Grid item xs={8}>
                        <FormTextField
                            label="Account manager code"
                            value={formData.accountManagerCode}
                            onChange={event => updateFormData('accountManagerCode', event.target.value)}
                        />
                    </Grid>
                </Grid>
                <TubuluLogo />
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
            }}>Business Details</Typography>
            {renderForm()}
        </div>
    )
}