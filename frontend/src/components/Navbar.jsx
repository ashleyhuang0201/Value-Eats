import React, { useContext, useState } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { makeStyles } from '@material-ui/core/styles';
import { NavbarStyled } from '../styles/NavbarStyled';
import { useHistory } from "react-router";
import { StoreContext } from "../utils/store";

const useStyles = makeStyles((theme) => ({
    searchContainer: {
        border: "1px solid white",
        borderRadius: 10,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems:'center',
        justifyContent: 'center',
        paddingLeft: 10
    },
    logo: {
        fontSize: '2em',
        fontWeight:"bold",
        flex: 1,
        '&:hover': {
            cursor: 'pointer'
        }
    },
    barSize: {
        flex: 3
    },
    searchBar: {
        fontSize: 20,
        color: "white",
        minWidth: '50ch',
        width: '35vw',
        paddingRight: 10,
        backgroundColor:"transparent"
    },
    menu: {
        flex: 0
    },
    singleLine: {
        whiteSpace: 'nowrap'
    }
  }));


export default function Navbar () {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const history = useHistory();

    const context = useContext(StoreContext);
    const setAlertOptions = context.alert[1];
    const [auth, setAuth] = context.auth;
    const [isDiner, setIsDiner] = context.isDiner;

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleProfile = () => {
        if (isDiner === "true") {
            history.push("/DinerProfile");
        } else {
            history.push("/EateryProfile");
        }
        handleClose();
    }

    const handleEditProfile = () => {
        history.push("/EditEateryProfile");
        handleClose();
    }

    const handleLogout = async () => {
        console.log("You are getting logged out");
        const logoutResponse = await fetch("http://localhost:8080/logout", {
            method: "POST",
            headers: {
                "Accept": "application/json", 
                "Content-Type": "application/json",
                Authorization: auth,
            },
        })
        // const ans = await logoutResult.json();
        const logoutData = await logoutResponse.json();
        if (logoutResponse.status === 200) {
            setAlertOptions({ showAlert: true, variant: 'success', message: logoutData.message });
            setAuth(null);
            setIsDiner(null);
            localStorage.removeItem('token');
            localStorage.removeItem('isDiner');
            history.push("/");
        } else {
            setAlertOptions({ showAlert: true, variant: 'error', message: logoutData.message });
        }
    }

    const handleLogoClick = () => {
        console.log(localStorage.getItem('token'));
        if (auth === null) return history.push('/');
        // if token is manually deleted from localstorage on browser
        if (localStorage.getItem('token') === null) {
            setAuth(null);
            return history.push('/');
        }
        if (isDiner === "true") return history.push('/DinerLanding');
        if (isDiner === "false") return history.push('/EateryLanding');
    }

    return (
        <div>
            <NavbarStyled>
                <Toolbar className={classes.singleLine}>
                    <Typography className={classes.logo} onClick={handleLogoClick}>Value Eats</Typography>
                    {
                        (isDiner === "true") &&
                        <Toolbar className={classes.barSize}>
                            <div className={classes.searchContainer}>
                                <div style={{marginRight: 10}}>
                                    <SearchIcon/>
                                </div>
                                <div>
                                    <InputBase className={classes.searchBar}
                                        placeholder="Restaurants, dishes, postcode, keywords..."
                                        inputProps={{ 'aria-label': 'search' }}/>
                                </div>
                            </div>
                        </Toolbar>
                    }
                    <IconButton onClick={handleClick} color="inherit">
                        <AccountCircle style={{fontSize: "50px"}}/>
                    </IconButton>
                    <Menu className={classes.menu}
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        getContentAnchorEl={null}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={() => handleProfile()}>Profile</MenuItem>
                        {
                            (isDiner === "true") &&
                            <MenuItem onClick={handleClose}>My Vouchers</MenuItem>
                        }
                        {
                            (isDiner === "false") &&
                            <MenuItem onClick={() => handleEditProfile()}>Edit Profile</MenuItem>
                        }
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </NavbarStyled>
            {/* <div style={{height:80}}></div>
            <div style={{height:"100vh", width:"80vw", marginRight:'auto', marginLeft:'auto'}}>a</div> */}
        </div>
    )
}