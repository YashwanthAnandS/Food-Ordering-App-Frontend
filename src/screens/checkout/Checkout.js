import React, { Fragment, Component } from 'react';

import Header from "../../common/header/Header";
import './Checkout.css';

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from "@material-ui/core/StepContent";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import AppBar from "@material-ui/core/AppBar";
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Typography from "@material-ui/core/Typography";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from "@material-ui/core/Snackbar";
import OrderItems from "../../common/orderitems/OrderItems";
import { Redirect } from 'react-router-dom';

//Checkout Section UI
class Checkout extends Component {

    constructor() {
        super();
        this.state = {
            activeStep: 0,
            activeTabValue: 'existing_address',
            addresses: [],
            states: [],
            payments: [],
            selectedAddressId: undefined,
            flat: '',
            flatRequired: false,
            locality: '',
            localityRequired: false,
            city: '',
            cityRequired: false,
            stateUUID: '',
            stateUUIDRequired: false,
            pincode: '',
            pincodeRequired: false,
            pincodeValid: true,
            displayChange: 'display-none',
            paymentId: '',
            placeOrderMessage: undefined,
            placeOrderMessageOpen: false,
            couponId: undefined,
        }
    }

    //Fetch Data Before Component
    componentDidMount() {
        if (this.props.location.state !== undefined && sessionStorage.getItem('access-token') !== null) {
            this.fetchAddress();
            this.fetchStates();
            this.fetchPayments();
        }
    }

    //Switch Tab
    changeActiveTab = (value) => {
        this.setState({ activeTabValue: value })
        if (value === 'existing_address') {
            this.fetchAddress();
        }
    }

    //Fetch Address Using AJAX Call
    fetchAddress = () => {
        let token = sessionStorage.getItem('access-token');
        let xhr = new XMLHttpRequest();
        let that = this;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                that.setState({ addresses: JSON.parse(this.responseText).addresses });
            }
        });

        let url = this.props.baseUrl + 'address/customer';
        xhr.open('GET', url);
        xhr.setRequestHeader('authorization', 'Bearer ' + token);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.send();
    }

    //Fetch State Using AJAX Call
    fetchStates = () => {
        let xhr = new XMLHttpRequest();
        let that = this;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                that.setState({ states: JSON.parse(this.responseText).states });
            }
        });

        let url = this.props.baseUrl + 'states/';
        xhr.open('GET', url);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.send();
    }

    //Fetch Payment Modes Using AJAX Call
    fetchPayments = () => {
        let xhr = new XMLHttpRequest();
        let that = this;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                that.setState({ payments: JSON.parse(this.responseText).paymentMethods });
            }
        });

        let url = this.props.baseUrl + 'payment';
        xhr.open('GET', url);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.send();
    }

    //Select Address From Existing Address Tab
    selectAddress = (e) => {
        let elementId = e.target.id;
        if (elementId.startsWith('select-address-icon-')) {
            this.setState({ selectedAddressId: elementId.split('select-address-icon-')[1] });
        }
        if (elementId.startsWith('select-address-button-')) {
            this.setState({ selectedAddressId: elementId.split('select-address-button-')[1] })
        }
    }

    //Input Field Handler
    onInputFieldChangeHandler = (e) => {
        let stateKey = e.target.id;
        let stateValue = e.target.value;
        //Material UI Select doesn't return key
        if (stateKey === undefined) {
            stateKey = 'stateUUID';
        }
        //Form validation.
        let stateValueRequiredKey = stateKey + 'Required';
        let stateKeyRequiredValue = false;
        if (stateValue === '') {
            stateKeyRequiredValue = true;
        }
        let validPincode = this.state.pincodeValid;
        if (stateKey === 'pincode') {
            validPincode = this.validatePincode(stateValue);
        }
        this.setState({
            [stateKey]: stateValue,
            [stateValueRequiredKey]: stateKeyRequiredValue,
            'pincodeValid': validPincode
        });
    }

    //Pincode Validation
    validatePincode = (pincode) => {
        if (pincode !== undefined && pincode.length !== 6) {
            return false;
        } else if (!isNaN(pincode) && pincode.length === 6) {
            return true;
        } else {
            return false;
        }
    }

    // Save Address Using AJAX Calls 
    saveAddress = () => {
        let tempCityRequired = false;
        let tempPincodeRequired = false;
        let tempFlatRequired = false;
        let tempStateRequired = false;
        let tempLocalityRequired = false;
        if (this.state.city === '' || this.state.cityRequired) {
            tempCityRequired = true;
        }
        if (this.state.locality === '' || this.state.localityRequired) {
            tempLocalityRequired = true;
        }
        if (this.state.flat === '' || this.state.flatRequired) {
            tempFlatRequired = true;
        }
        if (this.state.stateUUID === '' || this.state.stateUUIDRequired) {
            tempStateRequired = true;
        }
        if (this.state.pincode === '' || this.state.pincodeRequired) {
            tempPincodeRequired = true;
        }
        if (tempFlatRequired || tempPincodeRequired || tempStateRequired || tempLocalityRequired || tempCityRequired) {
            this.setState({
                flatRequired: tempFlatRequired,
                localityRequired: tempLocalityRequired,
                cityRequired: tempCityRequired,
                stateUUIDRequired: tempStateRequired,
                pincodeRequired: tempPincodeRequired
            })
            return;
        }

        let address = {
            city: this.state.city,
            flat_building_name: this.state.flat,
            locality: this.state.locality,
            pincode: this.state.pincode,
            state_uuid: this.state.stateUUID
        }

        let token = sessionStorage.getItem('access-token');
        let xhr = new XMLHttpRequest();
        let that = this;

        // Post Address Inside 'restaurantdb'
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                that.setState({
                    addresses: JSON.parse(this.responseText).addresses,
                    city: '',
                    locality: '',
                    flat: '',
                    stateUUID: '',
                    pincode: ''
                });
            }
        });

        let url = this.props.baseUrl + 'address/';
        xhr.open('POST', url);
        xhr.setRequestHeader('authorization', 'Bearer ' + token);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.send(JSON.stringify(address));
    }

    // Place Address Using AJAX Call Inside 'restaurantdb'
    placeOrder = () => {
        if (this.state.selectedAddressId === '' || this.state.selectedAddressId === undefined || this.state.paymentId === '' || this.state.paymentId === undefined || this.state.displayChange === 'display-none') {
            this.setState({
                placeOrderMessage: 'Unable to place your order! Please try again!',
                placeOrderMessageOpen: true
            })
            return;
        }
        let bill = this.props.location.state.total;
        let itemQuantities = [];
        this.props.location.state.orderItems.items.map((item, index) => (
            itemQuantities.push({ item_id: item.id, price: item.quantity * item.pricePerItem, quantity: item.quantity })
        ))
        let order = {
            address_id: this.state.selectedAddressId,
            coupon_id: this.state.couponId,
            item_quantities: itemQuantities,
            payment_id: this.state.paymentId,
            restaurant_id: this.props.location.state.orderItems.id,
            bill: bill,
            discount: 0
        }

        let token = sessionStorage.getItem('access-token');
        let xhr = new XMLHttpRequest();
        let that = this;

        //Show Snackbar And Message Based On Place Order Success,Failure
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                if (this.status === 201) {
                    let orderId = JSON.parse(this.responseText).id;
                    that.setState({
                        placeOrderMessage: 'Order placed successfully! Your order ID is ' + orderId,
                        placeOrderMessageOpen: true
                    });
                } else {
                    that.setState({
                        placeOrderMessage: 'Unable to place your order! Please try again!',
                        placeOrderMessageOpen: true
                    });
                    console.clear();
                }
            }
        }
        );

        let url = this.props.baseUrl + 'order';
        xhr.open('POST', url);
        xhr.setRequestHeader('authorization', 'Bearer ' + token);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.send(JSON.stringify(order));
    }

    //Switch To Next Step Inside Stepper Component
    incrementActiveStep = () => {
        if (this.state.activeStep === 0 && this.state.selectedAddressId === undefined) {
        } else if (this.state.activeStep === 1 && this.state.paymentId === '') {
        } else {
            let activeState = this.state.activeStep + 1;
            let changeAddressPayment = 'display-none';
            if (activeState === 2) {
                changeAddressPayment = 'display-block';
            }
            this.setState({ activeStep: activeState, displayChange: changeAddressPayment })
        }
    }

    //Goes Back To Previous Step Inside Stepper Component
    decrementActiveStep = () => {
        let activeState = this.state.activeStep - 1;
        this.setState({ activeStep: activeState })
    }

    //Payment Handler
    onPaymentSelection = (e) => {
        this.setState({ 'paymentId': e.target.value });
    }

    //Reset Stepper Step
    resetActiveStep = () => {
        this.setState({ activeStep: 0, displayChange: 'display-none' })
    }

    //Close Place Order Snackbar
    placeOrderMessageClose = () => {
        this.setState({ placeOrderMessageOpen: false });
    }

    // Stepper Component And Order Summary Section
    render() {
        if (this.props.location.state === undefined || sessionStorage.getItem('access-token') === null) {
            return <Redirect to='/' />
        }
        return <Fragment>
            <Header baseUrl={this.props.baseUrl}></Header>
            <div className='main-container'>
                <div className='delivery-payment-section'>
                    <Stepper activeStep={this.state.activeStep} orientation='vertical'>
                        <Step key='Delivery'>
                            <StepLabel>Delivery</StepLabel>
                            <StepContent>
                                <div>
                                    <AppBar position={"relative"}>
                                        <Tabs value={this.state.activeTabValue} variant='standard'>
                                            <Tab value='existing_address' label='EXISTING ADDRESS'
                                                onClick={() => this.changeActiveTab('existing_address')} />
                                            <Tab value='new_address' label='NEW ADDRESS'
                                                onClick={() => this.changeActiveTab('new_address')} />
                                        </Tabs>
                                    </AppBar>
                                </div>
                                <div id='existing-address-display'
                                    className={this.state.activeTabValue === 'existing_address' ? 'display-block' : 'display-none'}>
                                    {

                                        this.state.addresses !== null ?

                                            this.state.addresses === undefined || this.state.addresses.length === 0 ?
                                                <Typography style={{ margin: 10, marginBottom: 200 }} color='textSecondary'
                                                    component='p'>
                                                    There are no saved addresses! You can save an address using the 'New
                                                    Address' tab or using your ‘Profile’ menu option.
                                                </Typography> :
                                                <ImageList style={{ flexWrap: 'nowrap' }} cols={3} rowHeight="auto">
                                                    {
                                                        (this.state.addresses || []).map((address, index) => (
                                                            <ImageListItem key={address.id}
                                                                className={this.state.selectedAddressId === address.id ? 'grid-list-tile-selected-address' : null}>
                                                                <div className='address-box'>
                                                                    <p>{address.flat_building_name}</p>
                                                                    <p>{address.locality}</p>
                                                                    <p>{address.city}</p>
                                                                    <p>{address.state.state_name}</p>
                                                                    <p>{address.pincode}</p>
                                                                </div>
                                                                <Grid container>
                                                                    <Grid item xs={6} lg={10}></Grid>
                                                                    <Grid item xs={2}>
                                                                        <IconButton
                                                                            id={'select-address-button-' + address.id}
                                                                            className='select-address-icon'
                                                                            onClick={this.selectAddress}>
                                                                            <CheckCircleIcon
                                                                                id={'select-address-icon-' + address.id}
                                                                                className={this.state.selectedAddressId === address.id ? 'display-green-icon' : 'display-grey-icon'} />
                                                                        </IconButton>
                                                                    </Grid>
                                                                </Grid>
                                                            </ImageListItem>
                                                        ))
                                                    }
                                                </ImageList>
                                            :
                                            <Typography style={{ margin: 10, marginBottom: 200 }} color='textSecondary'
                                                component='p'>
                                                There are no saved addresses! You can save an address using the 'New
                                                Address' tab or using your ‘Profile’ menu option.
                                            </Typography>
                                    }
                                </div>
                                <div id='new-address-display'
                                    className={this.state.activeTabValue === 'new_address' ? 'display-block' : 'display-none'}>
                                    <FormControl style={{ minWidth: 300 }}>
                                        <InputLabel htmlFor='flat'>Flat/Building No</InputLabel>
                                        <Input id='flat' name='flat' type='text' value={this.state.flat}
                                            flat={this.state.flat}
                                            onChange={this.onInputFieldChangeHandler} />
                                        {this.state.flatRequired ? <FormHelperText>
                                            <span style={{ color: "red" }}>required</span>
                                        </FormHelperText> : null}
                                    </FormControl>
                                    <br />
                                    <FormControl style={{ minWidth: 300 }}>
                                        <InputLabel htmlFor='locality'>Locality</InputLabel>
                                        <Input id='locality' name='locality' type='text' value={this.state.locality}
                                            locality={this.state.locality}
                                            onChange={this.onInputFieldChangeHandler} />
                                        {this.state.localityRequired ? <FormHelperText>
                                            <span style={{ color: "red" }}>required</span>
                                        </FormHelperText> : null}
                                    </FormControl>
                                    <br />
                                    <FormControl style={{ minWidth: 300 }}>
                                        <InputLabel htmlFor='city'>City</InputLabel>
                                        <Input id='city' name='city' type='text' value={this.state.city}
                                            city={this.state.city}
                                            onChange={this.onInputFieldChangeHandler} />
                                        {this.state.cityRequired ? <FormHelperText>
                                            <span style={{ color: "red" }}>required</span>
                                        </FormHelperText> : null}
                                    </FormControl>
                                    <br />
                                    <FormControl style={{ minWidth: 300 }}>
                                        <InputLabel htmlFor='stateUUID'>State</InputLabel>
                                        <Select id='stateUUID' name='stateUUID' value={this.state.stateUUID}
                                            onChange={this.onInputFieldChangeHandler}>
                                            {this.state.states.map((state, index) => (
                                                <MenuItem key={state.id} value={state.id}>{state.state_name}</MenuItem>
                                            ))}
                                        </Select>
                                        {this.state.stateUUIDRequired ? <FormHelperText>
                                            <span style={{ color: "red" }}>required</span>
                                        </FormHelperText> : null}
                                    </FormControl>
                                    <br />
                                    <FormControl style={{ minWidth: 300 }}>
                                        <InputLabel htmlFor='pincode'>Pincode</InputLabel>
                                        <Input id='pincode' name='pincode' type='text' value={this.state.pincode}
                                            pincode={this.state.pincode}
                                            onChange={this.onInputFieldChangeHandler} />
                                        {this.state.pincodeRequired ? <FormHelperText>
                                            <span style={{ color: "red" }}>required</span>
                                        </FormHelperText> : null}
                                        {!this.state.pincodeRequired && !this.state.pincodeValid ? <FormHelperText>
                                            <span style={{ color: "red" }}>Pincode must contain only numbers and must be 6 digits long</span>
                                        </FormHelperText> : null}
                                    </FormControl>
                                    <br />
                                    <br />
                                    <FormControl style={{ minWidth: 150 }}>
                                        <Button variant='contained' color='secondary' onClick={this.saveAddress}>SAVE
                                            ADDRESS</Button>
                                    </FormControl>
                                </div>
                                <div>
                                    <Button style={{ margin: 5 }} disabled={this.state.activeStep === 0}>Back</Button>
                                    <Button style={{ margin: 5 }} className='button' variant="contained" color="primary"
                                        onClick={this.incrementActiveStep}>Next</Button>
                                </div>
                            </StepContent>
                        </Step>
                        <Step key='Payment'>
                            <StepLabel>Payment</StepLabel>
                            <StepContent>
                                <div id='payment-modes'>
                                    <FormControl>
                                        <FormLabel>Select Mode of Payment</FormLabel>
                                        <RadioGroup onChange={this.onPaymentSelection} value={this.state.paymentId}>
                                            {(this.state.payments || []).map((payment, index) => (
                                                <FormControlLabel key={payment.id} value={payment.id} control={<Radio />}
                                                    label={payment.payment_name} />
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                                <Button style={{ margin: 5 }} onClick={this.decrementActiveStep}>Back</Button>
                                <Button style={{ margin: 5 }} variant="contained" color="primary"
                                    onClick={this.incrementActiveStep}>Finish</Button>
                            </StepContent>
                        </Step>
                    </Stepper>
                    <div className={this.state.displayChange}>
                        <Typography style={{ marginLeft: 40 }} variant='h5'>
                            View the summary and place your order now!
                        </Typography>
                        <Button style={{ marginLeft: 40, marginTop: 20 }} onClick={this.resetActiveStep}>CHANGE</Button>
                    </div>
                </div>
                <div className='summary-section'>
                    <Card variant='elevation' className='summary-card'>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                Summary
                            </Typography>
                            <br />
                            <Typography variant='h6' component='h3' color='textSecondary'
                                style={{ textTransform: "capitalize", marginBottom: 15 }}>
                                {this.props.location.state.restaurantName}
                            </Typography>
                            <OrderItems divider='true' orderitems={this.props.location.state.orderItems}
                                total={this.props.location.state.total} placeOrder={this.placeOrder} />
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div>
                <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} key='01'
                    message={this.state.placeOrderMessage}
                    open={this.state.placeOrderMessageOpen}
                    onClose={this.placeOrderMessageClose}
                    autoHideDuration={6000}
                    action={<Fragment> <IconButton color='inherit'
                        onClick={this.placeOrderMessageClose}><CloseIcon /></IconButton></Fragment>} />
            </div>
        </Fragment>
    }
}

export default Checkout;