// @mui
import { Avatar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useAuthContext } from "src/auth/hooks";
import { IProfileDetails } from "src/pages/dashboard/user-profile";

// ----------------------------------------------------------------------

interface IUser {
    id: string;
    displayName: string;
    email: string;
    password: string;
    photoURL: string;
    phoneNumber: string;
    country: string;
    address: string;
    state: string;
    city: string;
    zipCode: string;
    about: string;
    role: string;
    isPublic: boolean;
}

interface NavTopGroupProps {
    user: IProfileDetails;
    role?: string;
}

// ----------------------------------------------------------------------

export function NavTopGroup({ user, role }: NavTopGroupProps) {
    const { user: authUser } = useAuthContext();

    const roleLower = role?.toLowerCase() || '';
    const isSuperAdmin = 
        roleLower === 'super_admin' || 
        roleLower === 'ops_admin' ||
        user?.integrationName?.trim() === 'Tubulu Master Admin' ||
        (authUser as any)?.integrationName?.trim() === 'Tubulu Master Admin';

    const isRegionalManager = roleLower === 'regional_manager' || roleLower === 'state_manager';
    const isCityManager = roleLower === 'city_manager';
    const isOpsManager = roleLower === 'ops_manager';

    let displayName = 'Merchant';
    let subTitle = '';

    if (isSuperAdmin) {
        displayName = 'Super Admin';
        subTitle = 'Platform Manager';
    } else if (isOpsManager) {
        displayName = 'Ops Manager';
        subTitle = 'Operations';
    } else if (isRegionalManager) {
        displayName = user?.integrationName || (authUser as any)?.integrationName || 'Regional Manager';
        subTitle = `${user?.state || 'Regional'} Manager`;
    } else if (isCityManager) {
        displayName = user?.integrationName || (authUser as any)?.integrationName || 'City Manager';
        subTitle = `${user?.city || 'City'} Manager`;
    } else {
        displayName = user?.integrationName || (authUser as any)?.integrationName || (authUser as any)?.displayName || authUser?.phoneNumber || 'Merchant';
    }

    const initials = isSuperAdmin 
        ? 'SA' 
        : isRegionalManager 
            ? 'RM' 
            : isCityManager 
                ? 'CM' 
                : isOpsManager
                    ? 'OM'
                    : displayName.charAt(0).toUpperCase();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                background: '#919EAB14',
                borderRadius: 1.5,
                position: "relative",
                left: 20,
                p: 1.5,
                minHeight: 76,
                height: 'auto',
                width: 240,
                border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
        >
            <Avatar
                src={(isSuperAdmin || isRegionalManager || isCityManager || isOpsManager) ? undefined : (user?.logo || (authUser as any)?.logo)}
                alt={displayName}
                sx={{
                    width: 40,
                    height: 40,
                    fontSize: 14,
                    fontWeight: 'bold',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    border: (theme) => `solid 2px ${theme.palette.background.default}`,
                }}
            >
                {initials}
            </Avatar>
            <Box sx={{ ml: 2, flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 'fontWeightBold', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                    {displayName}
                </Typography>
                {subTitle && (
                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                        {subTitle}
                    </Typography>
                )}
            </Box>
        </Box>
    )
}

// ----------------------------------------------------------------------