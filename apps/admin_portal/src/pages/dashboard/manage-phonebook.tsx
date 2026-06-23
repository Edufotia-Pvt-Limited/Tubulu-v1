/* eslint-disable no-plusplus */
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  createSvgIcon,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  styled,
  Tooltip,
  Popover,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import React, { useEffect, useState } from 'react';
import { CSVLink } from "react-csv";
import { addContactIntegration, deleteContactIntegration, editContactIntegration, getAllContactsIntegration, getAllGroupsIntegration, getUserDetailsFromPhoneNumber, importPhoneBookContacts } from 'src/utils/ApiActions';
import { PiTrash } from 'react-icons/pi';
import { BiCloudUpload } from 'react-icons/bi';
import { countryList } from 'src/utils/GetCountryList';
import PhoneInput from 'react-phone-input-2'
import { LogoUploader } from '../tubulu-app-onboarding/tubbulu-app-onboarding';
import 'react-phone-input-2/lib/style.css'

const PlusIcon = createSvgIcon(
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>,
  'Plus'
);

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

type MoreProps = {
  label: string;
}

const MoreChip = ({ label }: MoreProps) => (
  <div className='cursor-pointer flex justify-center items-center py-1.5 px-1.5 text-sm rounded-lg' style={{ background: "#d6f2e5", color: "#007B55" }}>
    {label}
  </div>
)

export function ManagePhoneBook(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const [groupDetails, setGroupDetails] = useState<string[]>([]);
  const [contactDetails, setContactDetails] = useState<any>({
    cc: '',
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    pinCode: '',
    state: '',
    email: '',
    phoneBookGroups: groupDetails,
    phoneNumber: '',
    gender: '',
    birthday: '',
  });

  const [errorState, setErrorState] = useState<any>({
    cc: '',
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    pinCode: '',
    state: '',
    email: '',
    phoneBookGroups: [],
    phoneNumber: '',
    gender: '',
    birthday: '',
  });

  const [alertDetails, setAlertDetails] = useState({
    isSuccess: false,
    msg: '',
  });

  const [contacts, setContacts] = useState<any>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [groups, setGroups] = useState([]);
  const [importOpen, setImportOpen] = useState<boolean>(false);

  const [selected, setSelected] = useState<any>({});
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const popOverOpen = Boolean(anchorEl);

  const handleClose = () => {
    setOpen(false);
    setContactDetails({
      cc: '',
      profilePictureUrl: '',
      firstName: '',
      lastName: '',
      country: '',
      city: '',
      pinCode: '',
      state: '',
      email: '',
      phoneBookGroups: groupDetails,
      phoneNumber: '',
      gender: '',
      birthday: '',
    });
    setErrorState({});
    setIsEdit(false);
    setGroupDetails([]);
    setDisabled(false);
  };

  const handleImportClose = () => {
    setImportOpen(false);
  };

  const handleDeleteClose = () => {
    setDeleteDialog(false);
    setSelected({});
  }

  async function fetchAllContacts() {
    const response = await getAllContactsIntegration();
    if (response?.data?.success) {
      const _data = response?.data?.data;
      const usersWithGroups = _data.map((pb: { User: any[], phonebookgrouprelation: any[], _id: string }) => ({
        ...pb.User[0], // Extract first user and spread its properties
        deleteId: pb._id,
        phoneGroupIds: pb.phonebookgrouprelation
          .flatMap((relation: any) => relation?.groups)
          .map((group: any) => group?._id),
        phoneBookGroups: pb.phonebookgrouprelation
          .flatMap((relation: any) => relation.groups) // Flatten nested groups
          .map((group: any) => group.groupName), // Extract group names
      }));
      setContacts(usersWithGroups);

      // const _groupDetails = _data.map((pb: { phonebookgrouprelation: any[] }) => pb.phonebookgrouprelation);
      // const _groupsArray = _groupDetails?.map((item: any[]) => item.map((group) => group.groups));
      // const _groups = _groupsArray?.map((item: any[]) => item?.map((group) => group?.map((g: any) => g.groupName)));
      // const _groupNamesArr = _groups?.map((group: any[]) => group?.map((item) => item[0]));
      // const _users = (_data.map((res: { User: any[]; }) => res.User[0]));
      // for (let i = 0; i < _groupNamesArr.length; i++) {
      //   _users[i].phoneBookGroups = _groupNamesArr[i];
      // }
      // setContacts(_users);
    }
  }

  async function fetchAllGroups() {
    const response = await getAllGroupsIntegration();
    if (response?.data?.success) {
      const groupData = response?.data?.data?.map((item: any) => ({ label: item?.groupName, value: item?._id }))
      setGroups(groupData);
    }
  }

  async function populateUserDetails(cc: string, phoneNumber: string) {
    const response: any = await getUserDetailsFromPhoneNumber({ cc, phoneNumber });
    if (response?.data?.success) {
      const _data = response?.data?.data;
      if (_data) {
        setContactDetails(_data);
        setDisabled(true);
        // setGroupDetails(_data?.phoneBookGroups);
      }
    }
  }

  useEffect(() => {
    fetchAllContacts();
    fetchAllGroups();
  }, []);

  useEffect(() => {
    if ((contactDetails?.phoneNumber.length === 10) && !isEdit) {
      populateUserDetails(contactDetails?.cc, contactDetails?.phoneNumber);
    } else if (contactDetails?.phoneNumber.length < 10 && disabled && !isEdit) {
      setDisabled(false);
      setContactDetails({
        cc: '',
        profilePictureUrl: '',
        firstName: '',
        lastName: '',
        country: '',
        city: '',
        pinCode: '',
        state: '',
        email: '',
        phoneBookGroups: [],
        phoneNumber: contactDetails?.phoneNumber,
        gender: '',
        birthday: '',
      })
    }
  }, [contactDetails?.cc, contactDetails?.phoneNumber, disabled, isEdit])

  function checkValidation(): boolean {
    let validation = true;
    const {
      firstName,
      lastName,
      country,
      city,
      pinCode,
      state,
      email,
      phoneNumber,
      gender,
      birthday,
    } = contactDetails;
    const errorData = { ...errorState };
    if (firstName.trim() === '') {
      validation = false;
      errorData.firstName = 'Please enter valid first name.';
    }
    if (lastName.trim() === '') {
      validation = false;
      errorData.lastName = 'Please enter valid last name.';
    }
    if (!disabled && (city.trim() === '')) {
      validation = false;
      errorData.city = 'Should not be empty';
    }
    if (!disabled && (country.trim() === '')) {
      validation = false;
      errorData.country = 'Should not be empty';
    }
    if (!disabled && (email.trim() === '')) {
      validation = false;
      errorData.email = 'Should not be empty';
    }
    if (!disabled && (state.trim() === '')) {
      validation = false;
      errorData.state = 'Should not be empty';
    }
    if (!disabled && (pinCode?.trim?.() === '')) {
      validation = false;
      errorData.pinCode = 'Should not be empty';
    }
    if (!phoneNumber || phoneNumber?.trim?.() === '') {
      validation = false;
      errorData.mobileNumber = 'Should not be empty';
    }
    if (!disabled && (!gender || gender.trim() === '')) {
      validation = false;
      errorData.gender = 'Should not be empty';
    }
    setErrorState(errorData);
    return validation;
  }

  async function handleAddContactSubmit(): Promise<void> {
    try {
      if (checkValidation()) {
        const response = await addContactIntegration({
          ...contactDetails,
        });
        if (response) {
          setAlertDetails({
            isSuccess: true,
            msg: 'Contact Added successfully',
          });
          fetchAllContacts();
          handleClose();
        } else {
          setAlertDetails({
            isSuccess: false,
            msg: 'Unable to add contact at the moment',
          });
        }
      }
    } catch (error) {
      console.log('Unable to proceed at the moment');
      // setErrorState({...errorState, firstName: 'Unable to submit request at the moment'});
    }
  }

  async function handleEditContactSubmit(): Promise<void> {
    try {
      if (checkValidation()) {
        const response = await editContactIntegration({
          ...contactDetails,
        }, contactDetails?.deleteId);
        if (response) {
          setAlertDetails({
            isSuccess: true,
            msg: 'Contact Updated successfully',
          });
          handleClose();
          fetchAllContacts();
        } else {
          setAlertDetails({
            isSuccess: false,
            msg: 'Unable to edit contact at the moment',
          });
        }
      }
    } catch (error) {
      console.log('Unable to proceed at the moment');
      // setErrorState({...errorState, firstName: 'Unable to submit request at the moment'});
    }
  }

  async function deleteUser(id: string) {
    const response = await deleteContactIntegration(id);
    if (response) {
      fetchAllContacts();
      handleDeleteClose();
    }
  }

  const handlePhoneBookDelete = () => {
    deleteUser(selected?.deleteId);
  }

  function handleEdit(row: any) {
    setOpen(true);
    setIsEdit(true);
    setContactDetails(row);
    setGroupDetails(row?.phoneGroupIds);
    setDisabled(true);
  }

  const onAddContactClick = () => {
    setOpen(true);
  };

  const handleFormChange = (event: any, key: string, isDate?: boolean) => {
    const _contactDetails = { ...contactDetails };
    _contactDetails[key] = isDate ? event : event?.target?.value;
    setContactDetails(_contactDetails);
  };

  const handlePhoneChange = (value: string, country: any) => {
    const _index = country.dialCode.length;
    const _phoneNumber = value.substring(_index);
    const _cc = `+${country.dialCode}`;
    setContactDetails({
      ...contactDetails,
      phoneNumber: _phoneNumber,
      cc: _cc
    });
  }

  const handleGroups = (event: SelectChangeEvent<typeof groupDetails>) => {
    const { target: { value }, } = event;
    const _groups = typeof value === 'string' ? value.split(',') : value;
    setGroupDetails(_groups);
    setContactDetails({
      ...contactDetails,
      phoneBookGroups: _groups
    });
  }

  const handleUpload = (fileDetails: { file: string, fileName: string, mimeType: string }) => {
    setContactDetails({
      ...contactDetails,
      ...fileDetails,
    });
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const blob = await handleCSVtoBlob(event);
      console.log(blob);
      const response = await importPhoneBookContacts(blob);
      if (response) {
        setAlertDetails({
          isSuccess: true,
          msg: 'PhoneBook Contacts imported successfully'
        });
        handleImportClose();
        fetchAllContacts();
      } else {
        setAlertDetails({
          isSuccess: false,
          msg: 'Unable to import contacts'
        })
      }
    } catch (error) {
      console.error("Error handling CSV file:", error);
    }
  }

  async function handleCSVtoBlob(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader: any = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve(new Blob([reader.result], { type: "text/csv" }));
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }
    throw new Error("No file selected");

  }

  const CSVHeaders = [
    { label: 'First Name', key: 'firstName' },
    { label: 'Last Name', key: 'lastName' },
    { label: 'Profile Picture URL', key: 'profilePictureUrl' },
    { label: 'Email', key: 'email' },
    { label: 'Country Code', key: 'cc' },
    { label: 'Phone Number', key: 'phoneNumber' },
    { label: 'Country', key: 'country' },
    { label: 'State', key: 'state' },
    { label: 'City', key: 'city' },
    { label: 'Pin Code', key: 'pinCode' },
    { label: 'PhoneBook Groups', key: 'phoneBookNames' }
  ];

  const sampleCSV = [
    {
      firstName: 'John',
      lastName: 'Doe',
      profilePictureUrl: 'https://example.com/john-smith',
      email: 'john.doe@example.com',
      cc: '+91',
      phoneNumber: '8888888888',
      country: 'India',
      state: 'Maharashtra',
      city: 'Nagpur',
      pinCode: '440011',
      phoneBookNames: ['Test Groups, Groups']
    }
  ];


  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  }


  function showPhoneBookGroups(_groups: string[]) {
    const length = _groups?.length;
    if (length > 2) {
      return (
        <div className='flex justify-center'>
          {_groups.slice(0, 2).map((group: string) => (
            <Chip label={group} size='medium' style={{ background: "#d6f2e5", color: "#007B55", marginRight: 5 }} />
          ))}
          <Typography
            aria-owns={open ? 'mouse-over-popover' : undefined}
            aria-haspopup="true"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
          >
            <MoreChip label='More..' />
          </Typography>
          <Popover
            id="mouse-over-popover"
            sx={{
              pointerEvents: 'none',
            }}
            open={popOverOpen}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
          >
            <Typography sx={{ display: 'flex', flexFlow: 'wrap', width: '180px', gap: 1 }}>
              {_groups?.slice(2, length).map((grp: string) => <MoreChip label={grp} />)}
            </Typography>
          </Popover>
        </div>
      );
    }
    return _groups?.map((group: string) => (
      <Chip label={group} size='medium' style={{ background: "#d6f2e5", color: "#007B55", marginRight: 5 }} />
    ));
  }


  return (
    <div>
      <Typography style={{ fontSize: 24, fontWeight: 700 }}>Phonebook - Manage Users</Typography>
      <div style={{ width: '100%', textAlign: 'end', fontSize: 14 }}>
        <Button
          onClick={onAddContactClick}
          style={{ background: '#36F', color: '#FFF' }}
          component="label"
          variant="contained"
          startIcon={<PlusIcon />}
        >
          Add new contact
        </Button>
        <Button
          onClick={() => setImportOpen(true)}
          style={{ background: '#00AB55', color: '#FFF', marginLeft: 8 }}
          component="label"
          variant="contained"
          startIcon={<BiCloudUpload />}
        >
          Import Contacts
        </Button>
      </div>
      <TableContainer component={Paper} style={{ marginTop: 40 }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {/* <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={false}
                  inputProps={{
                    'aria-labelledby': '',
                  }}
                />
              </TableCell> */}
              <TableCell>Name</TableCell>
              <TableCell align="center">Phone Number</TableCell>
              <TableCell align="center">Phonebook Groups</TableCell>
              <TableCell align="center">Date Created</TableCell>
              {/* <TableCell align="center">Block by user</TableCell> */}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts?.map((row: any) => {
              const date = new Date(row?.createdAt)?.toLocaleDateString?.('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              return (
                <TableRow
                  key={`${row.firstName}_${row.lastName}`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={false}
                      inputProps={{
                        'aria-labelledby': '',
                      }}
                    />
                  </TableCell> */}
                  <TableCell component="th" scope="row">
                    {`${row?.firstName} ${row?.lastName}`}
                  </TableCell>
                  <TableCell align="center">{row?.phoneNumber}</TableCell>
                  <TableCell align="center">
                    {showPhoneBookGroups(row?.phoneBookGroups)}
                  </TableCell>
                  <TableCell align="center">{date}</TableCell>
                  {/* <TableCell align="center">
                    {row?.blockByUser && (
                      <Chip
                        style={{
                          background: 'rgba(255, 86, 48, 0.16)',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#B71D18',
                          border: 'none',
                        }}
                        label="Blocked"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </TableCell> */}
                  <TableCell align="center">
                    <div style={{ display: 'flex', gap: 5, cursor: 'pointer', alignItems: "center" }} >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        onClick={() => {
                          handleEdit(row);
                        }}
                      >
                        <path
                          d="M 18 2 L 15.585938 4.4140625 L 19.585938 8.4140625 L 22 6 L 18 2 z M 14.076172 5.9238281 L 3 17 L 3 21 L 7 21 L 18.076172 9.9238281 L 14.076172 5.9238281 z"
                          fill="#637381"
                        />
                      </svg>
                      <Button
                        component="label"
                        variant='outlined'
                        size='small'
                        color="error"
                        onClick={() => { setSelected(row); setDeleteDialog(true) }}
                        style={{ minWidth: 10 }}
                      >
                        <PiTrash size={16} fill='#FF5630' style={{ cursor: 'pointer' }} />
                      </Button>
                      {/* <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                      >
                        <circle cx="10" cy="5" r="2" fill="#637381" />
                        <circle cx="10" cy="10" r="2" fill="#637381" />
                        <circle cx="10" cy="15" r="2" fill="#637381" />
                      </svg> */}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="alert-dialog-title">{isEdit ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid
              item
              sm={12}
              style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
            >
              <Typography fontSize={16} fontWeight={600}>
                Upload Photo
              </Typography>
              <LogoUploader onFile={handleUpload} onLogo={undefined} url={contactDetails?.profilePictureUrl} />
            </Grid>
            <Grid item sm={3}>
              <TextField
                error={!!errorState?.firstName}
                onChange={(event) => handleFormChange(event, 'firstName')}
                value={contactDetails?.firstName}
                type="text"
                label="First Name"
                disabled={disabled}
              />
              {!!errorState.firstName && (
                <span className="text-xs text-red-500 mt-1">{errorState.firstName}</span>
              )}
            </Grid>
            <Grid item sm={3}>
              <TextField
                error={!!errorState?.lastName}
                onChange={(event) => handleFormChange(event, 'lastName')}
                value={contactDetails?.lastName}
                type="text"
                label="Last Name"
                disabled={disabled}
              />
              {!!errorState.lastName && (
                <span className="text-xs text-red-500 mt-1">{errorState.lastName}</span>
              )}
            </Grid>
            <Grid item sm={3}>
              <TextField
                select
                label="Country"
                style={{ width: '100%' }}
                value={contactDetails?.country}
                error={!!errorState?.country}
                onChange={(event) => handleFormChange(event, 'country')}
                disabled={disabled}
              >
                {countryList?.map((country) => <MenuItem value={country}>{country}</MenuItem>)}
              </TextField>
              {!!errorState.country && (
                <span className="text-xs text-red-500 mt-1">{errorState.country}</span>
              )}
            </Grid>
            <Grid item sm={3}>
              <TextField
                error={!!errorState?.state}
                onChange={(event) => handleFormChange(event, 'state')}
                value={contactDetails?.state}
                type="text"
                label="State"
                disabled={disabled}
              />
              {!!errorState.state && (
                <span className="text-xs text-red-500 mt-1">{errorState.state}</span>
              )}
            </Grid>
            <Grid item sm={6}>
              {/* <TextField
                error={!!errorState?.mobileNumber}
                onChange={(event) => handleFormChange(event, 'mobileNumber')}
                value={contactDetails?.mobileNumber}
                style={{ width: '100%' }}
                type="text"
                label="Mobile Number"
              /> */}
              <PhoneInput
                country="in"
                enableSearch
                inputStyle={{
                  width: "100%",
                  height: "1%"
                }}
                dropdownStyle={{
                  width: "800%",
                  height: "245%",
                  display: "inline-grid",
                  justifyContent: "space-around"
                }}
                value={`${contactDetails.cc}${contactDetails?.phoneNumber}`}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: true
                }}
              />
              {!!errorState.mobileNumber && (
                <span className="text-xs text-red-500 mt-1">{errorState.mobileNumber}</span>
              )}
            </Grid>
            <Grid item sm={3}>
              <TextField
                error={!!errorState?.city}
                onChange={(event) => handleFormChange(event, 'city')}
                value={contactDetails?.city}
                type="text"
                label="City"
                disabled={disabled}
              />
              {!!errorState.city && (
                <span className="text-xs text-red-500 mt-1">{errorState.city}</span>
              )}
            </Grid>
            <Grid item sm={3}>
              <TextField
                error={!!errorState?.pinCode}
                onChange={(event) => handleFormChange(event, 'pinCode')}
                value={contactDetails?.pinCode}
                type="text"
                label="Pin Code"
                disabled={disabled}
              />
              {!!errorState.pinCode && (
                <span className="text-xs text-red-500 mt-1">{errorState.pinCode}</span>
              )}
            </Grid>
            <Grid item sm={6}>
              <TextField
                error={!!errorState?.email}
                onChange={(event) => handleFormChange(event, 'email')}
                value={contactDetails?.email}
                style={{ width: '100%' }}
                type="text"
                label="Email ID"
                disabled={disabled}
              />
              {!!errorState.email && (
                <span className="text-xs text-red-500 mt-1">{errorState.email}</span>
              )}
            </Grid>
            <Grid item sm={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-multiple-name-label" >Groups</InputLabel>
                <Select
                  labelId="demo-multiple-name-label"
                  id="demo-multiple-name"
                  multiple
                  value={groupDetails}
                  onChange={handleGroups}
                  input={<OutlinedInput label="Groups" />}
                >
                  {
                    groups?.map((item: any) => (
                      <MenuItem value={item?.value}>{item?.label}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={3}>
              <TextField
                select
                label="Gender"
                style={{ width: '100%' }}
                onChange={(event) => handleFormChange(event, 'gender')}
                value={contactDetails?.gender}
                error={!!errorState?.gender}
                disabled={disabled}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              {!!errorState.gender && (
                <span className="text-xs text-red-500 mt-1">{errorState.gender}</span>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button style={{ background: '#FF5630', color: '#FFF' }} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            style={{ background: '#36F', color: '#FFF' }}
            onClick={() => isEdit ? handleEditContactSubmit() : handleAddContactSubmit()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="alert-dialog-title">Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button style={{ background: '#FF5630', color: '#FFF' }} onClick={handleDeleteClose}>
            No
          </Button>
          <Button
            style={{ background: '#36F', color: '#FFF' }}
            onClick={handlePhoneBookDelete}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={importOpen}
        onClose={handleImportClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="alert-dialog-title">Import Contact</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item sm={12} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Typography style={{ fontSize: 13, fontWeight: 500 }}>Download sample XLSX file</Typography>
              <Button
                variant="outlined"
                size="small"
                style={{ color: "#37b37d", backgroundColor: "#eef9f5", border: "1px solid #94d6ba" }}
              >
                <CSVLink data={sampleCSV} headers={CSVHeaders} filename="Tubulu_PhoneBook.csv">Download</CSVLink>
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button style={{ background: '#FF5630', color: '#FFF' }} onClick={handleImportClose}>
            Cancel
          </Button>
          <Button
            component="label"
            variant="outlined"
            style={{ background: '#36F', color: '#FFF', marginLeft: 10 }}
          >
            Import
            <VisuallyHiddenInput type="file" onChange={handleImport} />
          </Button>
        </DialogActions>
      </Dialog>

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
  );
}
