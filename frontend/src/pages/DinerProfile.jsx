import React, { useState } from "react";
import NavBar from "../components/Navbar";
import { MainContent } from "../styles/MainContent";
import { ProfilePhoto } from '../styles/ProfilePhoto'
import { Box, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField} from "@material-ui/core";
import { Label } from "../styles/Label";
import { FileUpload } from "../styles/FileUpload";
import { StatBox } from "../styles/StatBox";
import EditIcon from '@material-ui/icons/Edit';
import AddAPhoto from "@material-ui/icons/AddAPhoto";
import Review from "../components/Review";
import { fileToDataUrl, validRequired, validEmail, validPassword, validConfirmPassword } from "../utils/helpers";

export default function DinerProfile() {
  
  const [open, setOpen] = useState(false);

  const defaultState = { value: "", valid: true };
  const [username, setUsername] = useState(defaultState);
  const [email, setEmail] = useState(defaultState);
  const [password, setPassword] = useState(defaultState);
  const [confirmpassword, setConfirmpassword] = useState(defaultState);
  const [profilePic, setProfilePic] = useState("https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg");
  const [tmpProfilePic, setTmpProfilePic] = useState("https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg");

  const handleClose = () => {
    setOpen(false);
    setTmpProfilePic(profilePic);
  }

  const saveChanges = () => {
    console.log("changes are going");
    // Ideally this form should be validated when a form is submitted
    if (username.value === "") setUsername({ value: "", valid: false });
    if (email.value === "") setEmail({ value: "", valid: false });
    if (password.value === "") setPassword({ value: "", valid: false });
    if (confirmpassword.value === "")
        setConfirmpassword({ value: "", valid: false });
    // check that all fields are valid and not empty before registering
    if (
        !username.valid ||
        !email.valid ||
        !password.valid ||
        !confirmpassword.valid ||
        username.value === "" ||
        email.value === "" ||
        password.value === "" ||
        confirmpassword.value === ""
    )
        return;
  }

  const handleImage = (data) => {
    Array.from(data).forEach((file) => {
        fileToDataUrl(file).then((url) => {
          setTmpProfilePic(url);
            // setImages((prevArray) => [...prevArray, url]);
        });
    });
  };

  return (
    <>
      <NavBar isDiner={true}/>
      <MainContent>
        <Box display="flex" justifyContent="center" alignItems="center" paddingTop="10px">
          <ProfilePhoto size={150} src={profilePic} />
          <Box display="flex" flexDirection="column" alignItems="center" paddingX="20px">
            <h1>Put ur username here</h1>
            <Button variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setOpen(true)}>
              Edit profile
            </Button>
          </Box>
          <StatBox>
            <h1>5</h1>
            <h1>reviews</h1>
          </StatBox>
          <StatBox>
            <h1>4</h1>
            <h1>photos</h1>
          </StatBox>
        </Box>
        <Box paddingY="30px">
          <Divider variant="middle" />
        </Box>
        {/* Reviews would be mapped here... */}
        <Box display="flex" flexDirection="column" flexGrow="1" alignItems="center" style={{overflowY: 'scroll', height: "auto"}}>
          <Review eateryName="Test Eatery" review={"Ayo, this food was ass lmao kinda like my css XD HAHABHAB"} rating={3.5} isOwner={true}></Review>
          <Review eateryName="Test Eatery" review={"Ayo, this food was ass lmao kinda like my css XD HAHABHAB"} rating={3.5} isOwner={true}></Review>
          <Review eateryName="Test Eatery" review={"Ayo, this food was ass lmao kinda like my css XD HAHABHAB"} rating={3.5} isOwner={true}></Review>
          <Review eateryName="Test Eatery" review={"Ayo, this food was ass lmao kinda like my css XD HAHABHAB"} rating={3.5} isOwner={true}></Review>
          <Review eateryName="Test Eatery" review={"Ayo, this food was ass lmao kinda like my css XD HAHABHAB"} rating={3.5} isOwner={true}></Review>
        </Box>
        <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
          <DialogTitle id="customized-dialog-title" onClose={handleClose}>
            Update Profile
          </DialogTitle>
          <DialogContent dividers>
            <Box pt={1} display="flex">
              <ProfilePhoto size={70} src={tmpProfilePic}></ProfilePhoto>
              <Box pt={2}>
                <Label>
                  <FileUpload
                    type="file"
                    onChange={(e) => handleImage(e.target.files)}
                  />
                  {<AddAPhoto />} Change Profile Picture
                </Label>
                </Box>
            </Box>
            <Box pt={1}>
              <TextField
                  id="outlined-basic"
                  label="Username"
                  onChange={(e) =>
                      setUsername({ value: e.target.value, valid: true })
                  }
                  onBlur={() => validRequired(username, setUsername)}
                  error={!username.valid}
                  helperText={
                      username.valid ? "" : "Please enter a username"
                  }
                  variant="outlined"
                  fullWidth
              />
            </Box>
            <Box pt={2}>
                <TextField
                    id="outlined-basic"
                    label="Email Address"
                    onChange={(e) =>
                        setEmail({ value: e.target.value, valid: true })
                    }
                    onBlur={() => validEmail(email.value, setEmail)}
                    error={!email.valid}
                    helperText={
                        email.valid ? "" : "Please enter a valid email"
                    }
                    variant="outlined"
                    fullWidth
                />
            </Box>
            <Box pt={2}>
              <TextField
                id="outlined-basic"
                label="Password"
                type="password"
                onChange={(e) =>
                  setPassword({ value: e.target.value, valid: true })
                }
                onBlur={() => validPassword(password.value, setPassword)}
                error={!password.valid}
                helperText={
                  password.valid
                    ? ""
                    : "Please enter a valid password with 1 lowercase, 1 upper case, 1 number with at least 8 characters"
                }
                variant="outlined"
                fullWidth
              />
            </Box>
            <Box pt={2}>
              <TextField
                id="outlined-basic"
                label="Confirm Password"
                type="password"
                onChange={(e) =>
                  setConfirmpassword({
                    value: e.target.value,
                    valid: true,
                  })
                }
                onBlur={() => validConfirmPassword(password.value, confirmpassword.value, setConfirmpassword)}
                error={!confirmpassword.valid}
                helperText={
                  confirmpassword.valid
                    ? ""
                    : "Please make sure your passwords match"
                }
                variant="outlined"
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button autoFocus onClick={saveChanges} color="primary">
              Save changes
            </Button>
          </DialogActions>
        </Dialog>
      </MainContent>
    </>
  );
}
