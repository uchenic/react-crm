import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    TextField,
    FormControl,
    TextareaAutosize,
    AccordionDetails,
    Accordion,
    AccordionSummary,
    Typography,
    Box,
    MenuItem,
    InputAdornment,
    Chip,
    Autocomplete,
    FormHelperText,
    IconButton,
    Select,
    Divider,
    Button
} from '@mui/material'
import { useQuill } from 'react-quilljs';
import 'react-quill/dist/quill.snow.css';
import { CasesUrl } from '../../services/ApiUrls'
import { fetchData } from '../../components/FetchData'
import { CustomAppBar } from '../../components/CustomAppBar'
import { FaCheckCircle, FaPlus, FaTimes, FaTimesCircle, FaUpload } from 'react-icons/fa'
import { CustomPopupIcon, RequiredTextField } from '../../styles/CssStyled'
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown'
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp'
import '../../styles/style.css'

type FormErrors = {
    name?: string[],
    status?: string[],
    priority?: string[],
    case_type?: string[],
    closed_on?: string[],
    teams?: string[],
    assigned_to?: string[],
    account?: string[],
    case_attachment?: string[],
    contacts?: string[],
    description?: string[],
    file?: string[]
};

interface FormData {
    name: string,
    status: string,
    priority: string,
    case_type: string,
    closed_on: string,
    teams: string[],
    assigned_to: string[],
    account: string,
    case_attachment: string,
    contacts: string[],
    description: string,
    file: string | null
}

export function EditCase() {
    const navigate = useNavigate()
    const { state } = useLocation()
    const { quill, quillRef } = useQuill();
    const initialContentRef = useRef<string | null>(null);
    const pageContainerRef = useRef<HTMLDivElement | null>(null);

    const [hasInitialFocus, setHasInitialFocus] = useState(false);

    const autocompleteRef = useRef<any>(null);
    const [error, setError] = useState(false)
    const [reset, setReset] = useState(false)
    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
    const [selectedAssignTo, setSelectedAssignTo] = useState<any[]>([]);
    const [selectedTags, setSelectedTags] = useState<any[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<any[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<any[]>([]);
    const [leadSelectOpen, setLeadSelectOpen] = useState(false)
    const [statusSelectOpen, setStatusSelectOpen] = useState(false)
    const [countrySelectOpen, setCountrySelectOpen] = useState(false)
    const [accountSelectOpen, setAccountSelectOpen] = useState(false)
    const [contactSelectOpen, setContactSelectOpen] = useState(false)
    const [prioritySelectOpen, setPrioritySelectOpen] = useState(false)
    const [caseTypeSelectOpen, setCaseTypeSelectOpen] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<FormData>({
        name: '',
        status: 'New',
        priority: 'Normal',
        case_type: '',
        closed_on: '',
        teams: [],
        assigned_to: [],
        account: '',
        case_attachment: '',
        contacts: [],
        description: '',
        file: null
    })
    useEffect(() => {
        // Scroll to the top of the page when the component mounts
        window.scrollTo(0, 0);
        // Set focus to the page container after the Quill editor loads its content
        if (quill && !hasInitialFocus) {
            quill.on('editor-change', () => {
                if (pageContainerRef.current) {
                    pageContainerRef.current.focus();
                    setHasInitialFocus(true); // Set the flag to true after the initial focus
                }
            });
        }
        // Cleanup: Remove event listener when the component unmounts
        return () => {
            if (quill) {
                quill.off('editor-change');
            }
        };
    }, [quill, hasInitialFocus]);

    useEffect(() => {
        setFormData(state?.value)
        if (state?.value?.contacts) {
            setSelectedContacts(state.value.contacts);
        }
    }, [state?.id])

    useEffect(() => {
        if (reset) {
            setFormData(state?.value)
            if (quill && initialContentRef.current !== null) {
                quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
            }
        }
        return () => {
            setReset(false)
        }
    }, [reset, quill, state?.value])

    useEffect(() => {
        if (quill && initialContentRef.current === null) {
            // Save the initial state (HTML content) of the Quill editor only if not already saved
            initialContentRef.current = formData.description;
            quill.clipboard.dangerouslyPasteHTML(formData.description);
        }
    }, [quill, formData.description]);

    const backbtnHandle = () => {
        if (state?.edit) {
            navigate('/app/cases')
        } else {
            navigate('/app/cases/case-details', { state: { caseId: state?.id, detail: true } })
        }
    }
    const handleChange2 = (title: any, val: any) => {
        if (title === 'contacts') {
            setFormData({ ...formData, contacts: val.length > 0 ? val.map((item: any) => item.id) : [] });
            setSelectedContacts(val);
        } else if (title === 'assigned_to') {
            setFormData({ ...formData, assigned_to: val.length > 0 ? val.map((item: any) => item.id) : [] });
            setSelectedAssignTo(val);
        } else if (title === 'tags') {
            setFormData({ ...formData, assigned_to: val.length > 0 ? val.map((item: any) => item.id) : [] });
            setSelectedTags(val);
        } else if (title === 'teams') {
            setFormData({ ...formData, teams: val.length > 0 ? val.map((item: any) => item.id) : [] });
            setSelectedTags(val);
        }
        else {
            setFormData({ ...formData, [title]: val })
        }
    }
    const handleChange = (e: any) => {
        const { name, value, files, type, checked, id } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: e.target.files?.[0] || null });
        }
        else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (event: any) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            setFormData((prevData) => ({
                ...prevData,
                case_attachment: file.name,
                file: prevData.file,
            }));

            const reader = new FileReader();
            reader.onload = () => {
                setFormData((prevData) => ({
                    ...prevData,
                    file: reader.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const emptyDescription = () => {
        setFormData({ ...formData, description: '' })
        if (quill) {
            quill.clipboard.dangerouslyPasteHTML('');
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        submitForm();
    }
    const submitForm = () => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        // console.log('Form data:', formData.lead_attachment,'sfs', formData.file);
        const data = {
            name: formData.name,
            status: formData.status,
            priority: formData.priority,
            case_type: formData.case_type,
            closed_on: formData.closed_on,
            teams: formData.teams,
            assigned_to: formData.assigned_to,
            account: formData.account,
            case_attachment: formData.file,
            contacts: formData.contacts,
            description: formData.description
        }
        fetchData(`${CasesUrl}/${state?.id}/`, 'PUT', JSON.stringify(data), Header)
            .then((res: any) => {
                // console.log('Form data:', res);
                if (!res.error) {
                    // setReset(!reset)
                    navigate('/app/cases')
                }
                if (res.error) {
                    setError(true)
                    setErrors(res?.errors)
                }
            })
            .catch(() => {
            })
    };

    const onCancel = () => {
        // resetForm()
        setReset(true)
        if (state?.value?.contacts) {
            setSelectedContacts(state?.value?.contacts);
        }
    }

    const module = 'Cases'
    const crntPage = 'Add Case'
    const backBtn = state?.edit ? 'Back to Cases' : 'Back to CaseDetails'

    // console.log(state, 'caseedit')
    return (
        <Box sx={{ mt: '60px' }}>
            <CustomAppBar backbtnHandle={backbtnHandle} module={module} backBtn={backBtn} crntPage={crntPage} onCancel={onCancel} onSubmit={handleSubmit} />
            <Box sx={{ mt: "120px" }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '10px' }}>
                        <div className='leadContainer'>
                            <Accordion defaultExpanded style={{ width: '98%' }}>
                                <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                                    <Typography className='accordion-header'>Cases Information</Typography>
                                </AccordionSummary>
                                <Divider className='divider' />
                                <AccordionDetails>
                                    <Box sx={{ width: '98%', color: '#1A3353', mb: 1 }}>
                                        <div className='fieldContainer'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Name</div>
                                                <RequiredTextField
                                                    ref={pageContainerRef} tabIndex={-1}
                                                    name='name'
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size='small'
                                                    helperText={errors?.name?.[0] ? errors?.name[0] : ''}
                                                    error={!!errors?.name?.[0]}
                                                />
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Contact</div>
                                                <FormControl error={!!errors?.contacts?.[0]} sx={{ width: '70%' }}>
                                                    <Autocomplete
                                                        multiple
                                                        value={selectedContacts}
                                                        limitTags={2}
                                                        // options={state.contacts || []}
                                                        // getOptionLabel={(option: any) => state.contacts ? option?.first_name : option}
                                                        options={state?.contacts?.length ? state?.contacts.filter((option: any) => !selectedContacts.some((selectedOption) => selectedOption.id === option.id)) : []}
                                                        getOptionLabel={(option: any) => state?.contacts?.length ? option?.first_name : option}
                                                        onChange={(e: any, value: any) => handleChange2('contacts', value)}
                                                        size='small'
                                                        filterSelectedOptions
                                                        renderTags={(value: any, getTagProps: any) =>
                                                            value.map((option: any, index: any) => (
                                                                <Chip
                                                                    deleteIcon={<FaTimes style={{ width: '9px' }} />}
                                                                    sx={{ backgroundColor: 'rgba(0, 0, 0, 0.08)', height: '18px' }}
                                                                    variant='outlined'
                                                                    label={state?.contacts?.length ? option?.first_name : option}
                                                                    {...getTagProps({ index })}
                                                                />
                                                            ))
                                                        }
                                                        filterOptions={(options) => options.filter(option => !selectedContacts.includes(option?.id))}
                                                        popupIcon={<CustomPopupIcon><FaPlus className='input-plus-icon' /></CustomPopupIcon>}
                                                        renderInput={(params: any) => (
                                                            <TextField {...params}
                                                                placeholder='Add Contacts'
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    sx: {
                                                                        '& .MuiAutocomplete-popupIndicator': { '&:hover': { backgroundColor: 'white' } },
                                                                        '& .MuiAutocomplete-endAdornment': {
                                                                            mt: '-8px',
                                                                            mr: '-8px',
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <FormHelperText>{errors?.contacts?.[0] || ''}</FormHelperText>
                                                </FormControl>
                                            </div>
                                        </div>
                                        <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Status</div>
                                                <FormControl sx={{ width: '70%' }}>
                                                    <Select
                                                        name='status'
                                                        value={formData.status}
                                                        open={statusSelectOpen}
                                                        onClick={() => setStatusSelectOpen(!statusSelectOpen)}
                                                        IconComponent={() => (
                                                            <div onClick={() => setStatusSelectOpen(!statusSelectOpen)} className="select-icon-background">
                                                                {statusSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                                                            </div>
                                                        )}
                                                        className='select'
                                                        onChange={handleChange}
                                                        error={!!errors?.status?.[0]}
                                                    >
                                                        {state?.status?.length ? state?.status.map((option: any) => (
                                                            <MenuItem key={option[0]} value={option[0]}>
                                                                {option[1]}
                                                            </MenuItem>
                                                        )) : ''}
                                                    </Select>
                                                    <FormHelperText>{errors?.status?.[0] ? errors?.status[0] : ''}</FormHelperText>
                                                </FormControl>
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Teams</div>
                                                <FormControl error={!!errors?.teams?.[0]} sx={{ width: '70%' }}>
                                                    <Autocomplete
                                                        value={selectedTeams}
                                                        multiple
                                                        limitTags={5}
                                                        options={state?.teams?.length || []}
                                                        getOptionLabel={(option: any) => option}
                                                        onChange={(e: any, value: any) => handleChange2('teams', value)}
                                                        size='small'
                                                        filterSelectedOptions
                                                        renderTags={(value, getTagProps) =>
                                                            value.map((option, index) => (
                                                                <Chip
                                                                    deleteIcon={<FaTimes style={{ width: '9px' }} />}
                                                                    sx={{ backgroundColor: 'rgba(0, 0, 0, 0.08)', height: '18px' }}
                                                                    variant='outlined'
                                                                    label={option}
                                                                    {...getTagProps({ index })}
                                                                />
                                                            ))
                                                        }
                                                        popupIcon={<CustomPopupIcon ><FaPlus className='input-plus-icon' /></CustomPopupIcon>}
                                                        renderInput={(params) => (
                                                            <TextField {...params}
                                                                placeholder='Add Teams'
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    sx: {
                                                                        '& .MuiAutocomplete-popupIndicator': { '&:hover': { backgroundColor: 'white' } },
                                                                        '& .MuiAutocomplete-endAdornment': {
                                                                            mt: '-8px',
                                                                            mr: '-8px',
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <FormHelperText>{errors?.teams?.[0] || ''}</FormHelperText>
                                                </FormControl>
                                            </div>
                                        </div>
                                        <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Priority</div>
                                                <FormControl sx={{ width: '70%' }}>
                                                    <Select
                                                        name='priority'
                                                        value={formData.priority}
                                                        open={prioritySelectOpen}
                                                        onClick={() => setPrioritySelectOpen(!prioritySelectOpen)}
                                                        IconComponent={() => (
                                                            <div onClick={() => setPrioritySelectOpen(!prioritySelectOpen)} className="select-icon-background">
                                                                {prioritySelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                                                            </div>
                                                        )}
                                                        className='select'
                                                        onChange={handleChange}
                                                        error={!!errors?.priority?.[0]}
                                                    >
                                                        {state?.priority?.length ? state?.priority.map((option: any) => (
                                                            <MenuItem key={option[0]} value={option[0]}>
                                                                {option[1]}
                                                            </MenuItem>
                                                        )) : ''}
                                                    </Select>
                                                    <FormHelperText>{errors?.priority?.[0] ? errors?.priority[0] : ''}</FormHelperText>
                                                </FormControl>
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Users</div>
                                                <FormControl error={!!errors?.assigned_to?.[0]} sx={{ width: '70%' }}>
                                                    <Autocomplete
                                                        multiple
                                                        value={selectedAssignTo}
                                                        limitTags={2}
                                                        options={state?.users?.length || []}
                                                        getOptionLabel={(option: any) => state?.users?.length ? option?.user__email : option}
                                                        onChange={(e: any, value: any) => handleChange2('assigned_to', value)}
                                                        size='small'
                                                        filterSelectedOptions
                                                        renderTags={(value, getTagProps) =>
                                                            value.map((option, index) => (
                                                                <Chip
                                                                    deleteIcon={<FaTimes style={{ width: '9px' }} />}
                                                                    sx={{ backgroundColor: 'rgba(0, 0, 0, 0.08)', height: '18px' }}
                                                                    variant='outlined'
                                                                    label={state?.users?.length ? option?.user__email : option}
                                                                    {...getTagProps({ index })}
                                                                />
                                                            ))
                                                        }
                                                        popupIcon={<CustomPopupIcon><FaPlus className='input-plus-icon' /></CustomPopupIcon>}
                                                        renderInput={(params) => (
                                                            <TextField {...params}
                                                                placeholder='Add Users'
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    sx: {
                                                                        '& .MuiAutocomplete-popupIndicator': { '&:hover': { backgroundColor: 'white' } },
                                                                        '& .MuiAutocomplete-endAdornment': {
                                                                            mt: '-8px',
                                                                            mr: '-8px',
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <FormHelperText>{errors?.assigned_to?.[0] || ''}</FormHelperText>
                                                </FormControl>
                                            </div>
                                        </div>
                                        <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Type of Case</div>
                                                <FormControl sx={{ width: '70%' }}>
                                                    <Select
                                                        name='case_type'
                                                        value={formData.case_type}
                                                        open={caseTypeSelectOpen}
                                                        onClick={() => setCaseTypeSelectOpen(!caseTypeSelectOpen)}
                                                        IconComponent={() => (
                                                            <div onClick={() => setCaseTypeSelectOpen(!caseTypeSelectOpen)} className="select-icon-background">
                                                                {caseTypeSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                                                            </div>
                                                        )}
                                                        className='select'
                                                        onChange={handleChange}
                                                        error={!!errors?.case_type?.[0]}
                                                    >
                                                        {state?.typeOfCases?.length ? state?.typeOfCases.map((option: any) => (
                                                            <MenuItem key={option[0]} value={option[0]}>
                                                                {option[1]}
                                                            </MenuItem>
                                                        )) : ''}
                                                    </Select>
                                                    <FormHelperText>{errors?.case_type?.[0] ? errors?.case_type[0] : ''}</FormHelperText>
                                                </FormControl>
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Account</div>
                                                <FormControl sx={{ width: '70%' }}>
                                                    <Select
                                                        name='account'
                                                        value={formData.account}
                                                        open={accountSelectOpen}
                                                        onClick={() => setAccountSelectOpen(!accountSelectOpen)}
                                                        IconComponent={() => (
                                                            <div onClick={() => setAccountSelectOpen(!accountSelectOpen)} className="select-icon-background">
                                                                {accountSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                                                            </div>
                                                        )}
                                                        className='select'
                                                        onChange={handleChange}
                                                        error={!!errors?.account?.[0]}
                                                    >
                                                        {state?.account?.length ? state?.account.map((option: any) => (
                                                            <MenuItem key={option.id} value={option.id}>
                                                                {option.name}
                                                            </MenuItem>
                                                        )) : ''}
                                                    </Select>
                                                    <FormHelperText>{errors?.account?.[0] ? errors?.account[0] : ''}</FormHelperText>
                                                </FormControl>
                                            </div>
                                        </div>
                                        <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Closed Date</div>
                                                <TextField
                                                    type={'date'}
                                                    name='closed_on'
                                                    value={formData.closed_on}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size='small'
                                                    helperText={errors?.closed_on?.[0] ? errors?.closed_on[0] : ''}
                                                    error={!!errors?.closed_on?.[0]}
                                                    sx={{
                                                        '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                                            backgroundColor: 'whitesmoke',
                                                            padding: '13px',
                                                            marginRight: '-15px'
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Case Attachment</div>
                                                <TextField
                                                    name='case_attachment'
                                                    value={formData.case_attachment}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position='end'>
                                                                <IconButton disableFocusRipple
                                                                    disableTouchRipple
                                                                    sx={{ width: '40px', height: '40px', backgroundColor: 'whitesmoke', borderRadius: '0px', mr: '-13px', cursor: 'pointer' }}
                                                                >
                                                                    <label htmlFor='icon-button-file'>
                                                                        <input
                                                                            hidden
                                                                            accept='image/*'
                                                                            id='icon-button-file'
                                                                            type='file'
                                                                            name='case_attachment'
                                                                            onChange={(e: any) => {
                                                                                //  handleChange(e); 
                                                                                handleFileChange(e)
                                                                            }}
                                                                        />
                                                                        <FaUpload color='primary' style={{ fontSize: '15px', cursor: 'pointer' }} />
                                                                    </label>
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                    sx={{ width: '70%' }}
                                                    size='small'
                                                    helperText={errors?.case_attachment?.[0] ? errors?.case_attachment[0] : ''}
                                                    error={!!errors?.case_attachment?.[0]}
                                                />
                                            </div>
                                        </div>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </div>
                    </div >
                    {/* Description details  */}
                    <div className='leadContainer'>
                        <Accordion defaultExpanded style={{ width: '98%' }}>
                            <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                                <Typography className='accordion-header'>Description</Typography>
                            </AccordionSummary>
                            <Divider className='divider' />
                            <AccordionDetails>
                                <Box
                                    sx={{ width: '100%', mb: 1 }}
                                    component='form'
                                    noValidate
                                    autoComplete='off'
                                >
                                    <div className='DescriptionDetail'>
                                        <div className='descriptionTitle'>Description</div>
                                        <div style={{ width: '100%', marginBottom: '3%' }}>
                                            <div ref={quillRef} />
                                        </div>
                                    </div>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
                                        <Button
                                            className='header-button'
                                            onClick={emptyDescription}
                                            size='small'
                                            variant='contained'
                                            startIcon={<FaTimesCircle style={{ fill: 'white', width: '16px', marginLeft: '2px' }} />}
                                            sx={{ backgroundColor: '#2b5075', ':hover': { backgroundColor: '#1e3750' } }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className='header-button'
                                            onClick={() => setFormData({ ...formData, description: quillRef.current.firstChild.innerHTML })}
                                            variant='contained'
                                            size='small'
                                            startIcon={<FaCheckCircle style={{ fill: 'white', width: '16px', marginLeft: '2px' }} />}
                                            sx={{ ml: 1 }}
                                        >
                                            Save
                                        </Button>
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                </form >
            </Box >
        </Box >
    )
}
