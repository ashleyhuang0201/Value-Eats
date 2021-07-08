import React, { useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, TextField , DialogActions, Button, Tabs, Tab } from '@material-ui/core';
import { ProfilePhoto } from '../styles/ProfilePhoto';
import UploadPhotos from './UploadPhotos';
import StarRating from './StarRating';
import { StoreContext } from '../utils/store';
import { validRequired } from '../utils/helpers';

export default function EditCreateVoucher ({ voucherId, open, setOpen, isEdit }) {

  const context = useContext(StoreContext);
  const setAlertOptions = context.alert[1];
  const token = context.auth[0];
  const defaultState = (initialValue = "") => {
    return { value: initialValue, valid: true }
  };
  // isOneOff will either be 0 or 1, used for tabs - 1 for is oneoff, 0 for is not oneoff
  const [isOneOff, setIsOneOff] = useState(defaultState(0));
  const [isDineIn, setisDineIn] = useState(defaultState(true));
  const [discount, setDiscount] = useState(defaultState(0));
  const [quantity, setQuantity] = useState(defaultState(0));
  const [startTime, setStartTime] = useState(defaultState());
  const [endTime, setEndTime] = useState(defaultState());

  const handleUpdateVoucher = async () => {
    console.log("Make the API call here that will udpate this particular Voucher for a particular restaurant");
  }

  const handleCreateVoucher = async () => {
    console.log("This will create the voucher");
    // const response = await fetch("http://localhost:8080/diner/createVoucher", 
    //   {
    //     method: "POST",
    //     headers: {
    //       "Accept": "application/json",
    //       "Content-Type": "application/json",
    //       "Authorization": token
    //     },
    //     body: JSON.stringify({
    //       "eateryId": eateryId,
    //       "rating": rating,
    //       "message": reviewText,
    //       "reviewPhotos": images
    //     })
    //   });
    // const responseData = await response.json();
    // if (response.status === 200) {
    //   setAlertOptions({ showAlert: true, variant: 'success', message: responseData.message });
    // } else {
    //   setAlertOptions({ showAlert: true, variant: 'error', message: responseData.message });
    // }
    // setOpen(false);
  }

  // const validDiscount = (discount, setDiscount) => {
  //   if (discount < 0 || discount > 100) {
  //     discount
  //   }
  // }

  return (
    <>
      <Dialog aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle>
          {isEdit ? "Edit Voucher" : "Create Voucher"}
        </DialogTitle>
        <DialogContent dividers>
          <Box>
            <Tabs value={isOneOff} aria-label="simple tabs example">
              <Tab label="One-off deal" onClick={() => setIsOneOff(0)} />
              <Tab label="Weekly deal" onClick={() => setIsOneOff(1)} />
            </Tabs>
          </Box>
          {
            isOneOff === 1 &&
            <Box >
              <h2>Weekly deal</h2>
            </Box>
          }
          {
            isOneOff === 0 &&
            <Box display="flex" flexDirection="column" alignItems="center">
              <h2>One off deal</h2>
              <TextField
                label="Discount (%)"
                type="number"
                onChange={(e) =>
                  setDiscount({
                    value: e.target.value,
                    valid: true
                  })
                }
                allowNegative={false}
                error={!discount.valid}
                helperText={
                  discount.valid ? "" : "Please enter a discount percentage"
                }
                onBlur={() => {
                  validRequired(discount, setDiscount);
                }}
                value={discount.value}
                variant="outlined"
                fullWidth
              />
              <TextField
                label="Quantity"
                type="number"
                onChange={(e) =>
                  setQuantity({
                    value: e.target.value,
                    valid: true
                  })
                }
                allowNegative={false}
                error={!quantity.valid}
                helperText={
                  quantity.valid ? "" : "Please enter the number of vouchers you would like to offer"
                }
                onBlur={() => {
                  validRequired(quantity, setQuantity);
                }}
                value={quantity.value}
                variant="outlined"
                fullWidth
            />
            </Box>
          }
          {/* <Box pt={2}>
            <TextField multiline
                id="outlined-basic"
                label="Let us know what you think..."
                onChange={(e) =>
                  setReviewText(e.target.value)
                }
                value={reviewText}
                variant="outlined"
                fullWidth
            />
          </Box> */}
        </DialogContent>
        <DialogActions>
          {/* Set the things below back to their default states here */}
          <Button autoFocus onClick={() => {setOpen(false)}} color="primary">
            Cancel
          </Button>
          <Button autoFocus onClick={isEdit ? handleUpdateVoucher : handleCreateVoucher} color="primary">
            {isEdit ? "Save changes" : "Create voucher"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}