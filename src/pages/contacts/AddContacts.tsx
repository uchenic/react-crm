import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import {
  TextField,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Typography,
  Box,
  MenuItem,
  Tooltip,
  Divider,
  FormControl,
  Select,
  FormHelperText,
  Button
} from '@mui/material'
import { useQuill } from 'react-quilljs';
import 'react-quill/dist/quill.snow.css';
import { ContactUrl } from '../../services/ApiUrls';
import { CustomAppBar } from '../../components/CustomAppBar';
import { fetchData, Header } from '../../components/FetchData';
import { AntSwitch, RequiredTextField } from '../../styles/CssStyled';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../../styles/style.css'

// interface FormErrors {
//   [key: string]: string;
// }
type FormErrors = {
  salutation?: string[];
  first_name?: string[];
  last_name?: string[];
  organization?: string[];
  title?: string[];
  primary_email?: string[];
  secondary_email?: string[];
  mobile_number?: string[];
  secondary_number?: string[];
  department?: string[];
  country?: string[];
  language?: string[];
  do_not_call?: string[];
  address_line?: string[];
  street?: string[];
  city?: string[];
  state?: string[];
  postcode?: string[];
  description?: string[];
  linked_in_url?: string[];
  facebook_url?: string[];
  twitter_username?: string[];
};

// interface FormData {
//   salutation: string;
//   // Add other form fields as needed
// }
function AddContacts() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { quill, quillRef } = useQuill();
  const initialContentRef = useRef(null);
  // const currentPage = new URLSearchParams(location.search).get('page')

  // useEffect(() => {
  //   // Save the current location to localStorage or any other storage mechanism
  //   localStorage.setItem('currentPage', location.pathname);
  // }, [location.pathname]);

  const [error, setError] = useState(false)
  const [formData, setFormData] = useState({
    salutation: '',
    first_name: '',
    last_name: '',
    primary_email: '',
    secondary_email: '',
    mobile_number: '',
    secondary_number: '',
    date_of_birth: '',
    organization: '',
    title: '',
    language: '',
    do_not_call: false,
    department: '',
    address_line: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postcode: '',
    description: '',
    linked_in_url: '',
    facebook_url: '',
    twitter_username: ''
  })
  const [errors, setErrors] = useState<FormErrors>({});
  const [countrySelectOpen, setCountrySelectOpen] = useState(false)

  const [validationErrors, setValidationErrors] = useState({
    first_name: '',
    last_name: '',
    primary_email: '',
    mobile_number: '',
    secondary_number: ''
  });

  useEffect(() => {
    if (quill) {
      // Save the initial state (HTML content) of the Quill editor
      initialContentRef.current = quillRef.current.firstChild.innerHTML;
    }
  }, [quill]);

  // useEffect(() => {
  //   if (quill) {
  //     // quill.on('text-change', (delta: any, oldDelta: any, source: any) => {
  //     quill.on('text-change', () => {
  //       setFormData({ ...formData, description: quillRef.current.firstChild.innerHTML });
  //       // console.log('Text change!');
  //       // console.log(quill.getText()); // Get text only
  //       // console.log(quill.getContents()); // Get delta contents
  //       // console.log(quill.root.innerHTML); // Get innerHTML using quill
  //       // console.log(quillRef.current.firstChild.innerHTML); // Get innerHTML using quillRef
  //     });
  //   }
  // }, [quill]);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    // if (name === 'file') {
    //   setFormData({ ...formData, file: files[0] });
    // }
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
    // setValidationErrors(({ ...validationErrors, [name]: '' }));
    // setErrors({});
    // const newValue = type === 'checkbox' ? checked : value;
    // setFormData({ ...formData, [name]: newValue });
  };


  const resetQuillToInitialState = () => {
    // Reset the Quill editor to its initial state
    setFormData({ ...formData, description: '' })
    if (quill && initialContentRef.current !== null) {
      quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // if (quill) {
    //   if (quillRef.current.firstChild.innerHTML !== "" && quillRef.current.firstChild.innerHTML === formData.description) {
    //     submitForm();
    //   } else
    //     onDescriptionChange(quillRef.current.firstChild.innerHTML)
    // } else {
    submitForm();
    // }
  };

  const isValidEmail = (email: any) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const isValidPhoneNumber = (phoneNumber: any) => {
    return /^\+91\d{10}$/.test(phoneNumber);
  };

  const submitForm = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org')
    }
    // console.log(formData.description, 'des')
    const data = {
      salutation: formData.salutation,
      first_name: formData.first_name,
      last_name: formData.last_name,
      organization: formData.organization,
      title: formData.title,
      primary_email: formData.primary_email,
      secondary_email: formData.secondary_email,
      mobile_number: formData.mobile_number,
      secondary_number: formData.secondary_number,
      department: formData.department,
      country: formData.country,
      language: formData.language,
      do_not_call: formData.do_not_call,
      address_line: formData.address_line,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      description: formData.description,
      linked_in_url: formData.linked_in_url,
      facebook_url: formData.facebook_url,
      twitter_username: formData.twitter_username
    }
    fetchData(`${ContactUrl}/`, 'POST', JSON.stringify(data), Header)
      .then((res: any) => {
        // console.log('Form data:', res);
        if (!res.error) {
          // setResponceError(data.error)
          navigate('/app/contacts')
          resetForm()
        }
        if (res.error) {
          setError(true)
          setErrors(res?.errors?.contact_errors)
        }
      })
      .catch(() => {
      })
  };

  const resetForm = () => {
    setFormData({
      salutation: '',
      first_name: '',
      last_name: '',
      primary_email: '',
      secondary_email: '',
      mobile_number: '',
      secondary_number: '',
      date_of_birth: '',
      organization: '',
      title: '',
      language: '',
      do_not_call: false,
      department: '',
      address_line: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postcode: '',
      description: '',
      linked_in_url: '',
      facebook_url: '',
      twitter_username: ''
    });
    setErrors({});
  }
  const backbtnHandle = () => {
    navigate('/app/contacts')
  }
  const module = 'Contacts'
  const crntPage = 'Add Contacts'
  const backBtn = 'Back To Contacts'

  const onCancel = () => {
    resetForm()
  }

  // console.log(errors, 'err')
  return (
    <Box sx={{ mt: '60px' }}>
      <CustomAppBar backbtnHandle={backbtnHandle} module={module} backBtn={backBtn} crntPage={crntPage} onCancel={onCancel} onSubmit={handleSubmit} />
      <Box sx={{ mt: "120px" }}>
        <form onSubmit={handleSubmit}>
          {/* contact details */}
          <div style={{ padding: '10px' }}>
            <div className='leadContainer'>
              <Accordion style={{ width: '98%' }}
                defaultExpanded
              >
                <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                  <Typography className='accordion-header'>Contact Information</Typography>
                </AccordionSummary>
                <Divider className='divider' />
                <AccordionDetails>
                  <Box
                    sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                    component='form'
                    autoComplete='off'
                  >
                    <div className='fieldContainer'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Salutation</div>
                        <TextField
                          name='salutation'
                          className="custom-textfield"
                          value={formData.salutation}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors?.salutation?.[0]}
                          helperText={errors?.salutation?.[0] ? errors?.salutation[0] : ''}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>First Name</div>
                        <RequiredTextField
                          name='first_name'
                          value={formData.first_name}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          required
                          error={!!errors?.first_name?.[0]}
                          helperText={errors?.first_name?.[0] ? errors?.first_name[0] : ''}
                        />
                      </div>
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Last Name</div>
                        <RequiredTextField
                          name='last_name'
                          value={formData.last_name}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          required
                          error={!!errors?.last_name?.[0]}
                          helperText={errors?.last_name?.[0] ? errors?.last_name[0] : ''}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Organization</div>
                        <RequiredTextField
                          name='organization'
                          value={formData.organization}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          required
                          error={!!errors?.organization?.[0]}
                          helperText={errors?.organization?.[0] ? errors?.organization[0] : ''}
                        />
                      </div>
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Primary Email</div>
                        <RequiredTextField
                          name='primary_email'
                          value={formData.primary_email}
                          onChange={handleChange}
                          required
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors?.primary_email?.[0]}
                          helperText={errors?.primary_email?.[0] ? errors?.primary_email[0] : ''}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Secondary Email</div>
                        <TextField
                          name='secondary_email'
                          value={formData.secondary_email}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors?.secondary_email?.[0]}
                          helperText={errors?.secondary_email?.[0] ? errors?.secondary_email[0] : ''}
                        />
                      </div>

                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Department</div>
                        <RequiredTextField
                          name='department'
                          id='outlined-error-helper-text'
                          value={formData.department}
                          onChange={handleChange}
                          required
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors?.department?.[0]}
                          helperText={errors?.department?.[0] ? errors?.department[0] : ''}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Title</div>
                        <TextField
                          name='title'
                          value={formData.title}
                          onChange={handleChange}
                          required
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors?.title?.[0]}
                          helperText={errors?.title?.[0] ? errors?.title[0] : ''}
                        />
                      </div>
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Mobile Number</div>
                        <Tooltip title="Number must starts with +91">
                          <RequiredTextField
                            name='mobile_number'
                            value={formData.mobile_number}
                            onChange={handleChange}
                            required
                            style={{ width: '70%' }}
                            size='small'
                            error={!!errors?.mobile_number?.[0]}
                            helperText={errors?.mobile_number?.[0] ? errors?.mobile_number[0] : ''}
                          />
                        </Tooltip>
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Secondary Number</div>
                        <Tooltip title="Number must starts with +91">
                          <RequiredTextField
                            required
                            name='secondary_number'
                            value={formData.secondary_number}
                            onChange={handleChange}
                            style={{ width: '70%' }}
                            size='small'
                            error={!!errors?.secondary_number?.[0]}
                            helperText={errors?.secondary_number?.[0] ? errors?.secondary_number[0] : ''}
                          />
                        </Tooltip>
                      </div>
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Language</div>
                        <RequiredTextField
                          required
                          name='language'
                          value={formData.language}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors?.language?.[0]}
                          helperText={errors?.language?.[0] ? errors?.language[0] : ''}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Do Not Call</div>
                        {/* <FormControlLabel
                          control={<AntSwitch
                            name='do_not_call'
                            checked={formData.do_not_call}
                            onChange={handleChange}
                            sx={{ mt: '1%' }}
                          />}
                        /> */}
                        <AntSwitch
                          name='do_not_call'
                          checked={formData.do_not_call}
                          // onChange={handleChange}
                          onChange={(e: any) => { setFormData((prevData) => ({ ...prevData, do_not_call: e.target.checked })) }}
                          sx={{ mt: '1%' }}
                        />
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
            {/* address details */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '20px' }}>
              <Accordion style={{ width: '98%' }}
                defaultExpanded
              >
                <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                  <Typography className='accordion-header'>Address</Typography>
                </AccordionSummary>
                <Divider className='divider' />
                <AccordionDetails>
                  <Box
                    sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                    component='form'
                  >
                    <div className='fieldContainer'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Billing Address</div>
                        <RequiredTextField
                          required
                          name='address_line'
                          value={formData.address_line}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors?.address_line?.[0]}
                          helperText={errors?.address_line?.[0] ? errors?.address_line[0] : ''}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Street</div>
                        <TextField
                          name='street'
                          value={formData.street}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          required
                          error={!!errors?.street?.[0]}
                          helperText={errors?.street?.[0] ? errors?.street[0] : ''}
                        />
                      </div>
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>City</div>
                        <TextField
                          name='city'
                          value={formData.city}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          required
                          error={!!errors?.city?.[0]}
                          helperText={errors?.city?.[0] ? errors?.city[0] : ''}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>State</div>
                        <TextField
                          name='state'
                          value={formData.state}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          required
                          error={!!errors?.state?.[0]}
                          helperText={errors?.state?.[0] ? errors?.state[0] : ''}
                        />
                      </div>
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Postcode</div>
                        <TextField
                          name='postcode'
                          value={formData.postcode}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          required
                          error={!!errors?.postcode?.[0]}
                          helperText={errors?.postcode?.[0] ? errors?.postcode[0] : ''}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Country</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name='country'
                            value={formData.country}
                            open={countrySelectOpen}
                            onClick={() => setCountrySelectOpen(!countrySelectOpen)}
                            IconComponent={() => (
                              <div onClick={() => setCountrySelectOpen(!countrySelectOpen)} className="select-icon-background">
                                {countrySelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                              </div>
                            )}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  height: '200px'
                                }
                              }
                            }}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.country?.[0]}
                          >
                            {state?.countries?.length && state?.countries.map((option: any) => (
                              <MenuItem key={option[0]} value={option[0]}>
                                {option[1]}
                              </MenuItem>
                            ))}

                          </Select>
                          <FormHelperText>{errors?.country?.[0] ? errors?.country[0] : ''}</FormHelperText>
                        </FormControl>
                        {/* <TextField
                          name='country'
                          // error={error && !!errors?.country?.[0]}
                          value={formData.country}
                          onChange={handleChange}
                          // InputProps={{
                          //   classes: {
                          //     root: textFieldClasses.fieldHeight
                          //   }
                          // }}
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors.country || !!errors?.country?.[0]}
                          helperText={errors.country || errors?.country?.[0] || ''}
                        /> */}
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
            {/* Description details  */}
            <div className='leadContainer'>
              <Accordion
                defaultExpanded
                style={{ width: '98%' }}>
                <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                  <Typography className='accordion-header'>Description</Typography>
                </AccordionSummary>
                <Divider className='divider' />
                <AccordionDetails>
                  <Box
                    sx={{ width: '100%', color: '#1A3353', mb: 1 }}
                    component='form'
                    noValidate
                    autoComplete='off'
                  >
                    <div className='DescriptionDetail'>
                      <div className='descriptionTitle'>Description</div>
                      {/* <TextareaAutosize
                          aria-label='minimum height'
                          name='description'
                          minRows={8}
                          value={formData.description}
                          onChange={handleChange}
                          style={{ width: '80%', padding: '5px' }}
                          placeholder='Add Description'
                        // error={error && !!errors?.description?.[0]}
                        // helperText={error && errors?.description?.[0] ? errors?.d   escription[0] : ''}
                        /> */}
                      <div style={{ width: '100%', marginBottom: '3%' }}>
                        <div ref={quillRef} />
                      </div>
                    </div>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
                      <Button
                        className='header-button'
                        onClick={resetQuillToInitialState}
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
            {/* Socials */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '20px' }}>
              <Accordion
                defaultExpanded
                style={{ width: '98%' }}>
                <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                  <Typography className='accordion-header'>Socials</Typography>
                </AccordionSummary>
                <Divider className='divider' />
                <AccordionDetails>
                  <Box
                    sx={{ width: '100%', color: '#1A3353', mb: 1 }}
                    component='form'
                    noValidate
                    autoComplete='off'
                  >
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                      <div style={{ width: '40%', display: 'flex', flexDirection: 'row' }}>
                        <div style={{ marginRight: '10px', fontSize: '13px', width: '22%', textAlign: 'right', fontWeight: 'bold' }}>Linkedin Url</div>
                        <TextField
                          name='linked_in_url'
                          value={formData.linked_in_url}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors?.linked_in_url?.[0]}
                          helperText={errors?.linked_in_url?.[0] ? errors?.linked_in_url[0] : ''}
                        />
                      </div>
                      <div style={{ width: '40%', display: 'flex', flexDirection: 'row' }}>
                        <div style={{ marginRight: '10px', fontSize: '13px', width: '22%', textAlign: 'right', fontWeight: 'bold' }}>Facebook Url</div>
                        <TextField
                          name='facebook_url'
                          value={formData.facebook_url}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors?.facebook_url?.[0]}
                          helperText={errors?.facebook_url?.[0] ? errors?.facebook_url[0] : ''}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                      <div style={{
                        width: '40%', display: 'flex', flexDirection: 'row'
                        , marginLeft: '5%'
                      }}>
                        <div style={{ marginRight: '10px', fontSize: '13px', width: '22%', textAlign: 'right', fontWeight: 'bold' }}>Twitter Username</div>
                        <RequiredTextField
                          required
                          name='twitter_username'
                          value={formData.twitter_username}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          error={!!errors?.twitter_username?.[0]}
                          helperText={errors?.twitter_username?.[0] ? errors?.twitter_username[0] : ''}
                        />
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </form>
      </Box>

    </Box>
  )
}

export default AddContacts
