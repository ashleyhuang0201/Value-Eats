import React, { useContext } from "react";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import { makeStyles } from "@material-ui/core/styles";
import { NavbarStyled } from "../styles/NavbarStyled";
import { useHistory } from "react-router";
import { StoreContext } from "../utils/store";
import { MainContainer } from "../styles/MainContainer";
import { NavLink } from "../styles/NavLink";
import logo from "../assets/logo.png";

const useStyles = makeStyles((theme) => ({
    searchContainer: {
        //border: "1px solid #FF855B",
        borderRadius: 10,
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 10,
        color: "#FF855B",
    },
    logo: {
        fontSize: "2em",
        fontWeight: "bold",
        color: "#FF855B",
        flex: 1,
        "&:hover": {
            cursor: "pointer",
            color: "#e06543",
        },
    },
    barSize: {
        flex: 1,
    },
    searchBar: {
        fontSize: "1em",
        color: "#FF855B",
        minWidth: "50ch",
        width: "20vw",
        paddingRight: 10,
        backgroundColor: "transparent",
        borderBottom: "1px solid rgba(255, 132, 91, 0.5)",
    },
    menu: {
        flex: 0,
    },
    singleLine: {
        whiteSpace: "nowrap",
        padding: "5px 0px",
    },
}));

export default function Navbar() {
    const classes = useStyles();
    const history = useHistory();

    const context = useContext(StoreContext);
    const setAlertOptions = context.alert[1];
    const [auth, setAuth] = context.auth;
    const [isDiner, setIsDiner] = context.isDiner;

    const handleLogout = async () => {
        console.log("You are getting logged out");
        const logoutResponse = await fetch("http://localhost:8080/logout", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: auth,
            },
        });
        // const ans = await logoutResult.json();
        const logoutData = await logoutResponse.json();
        if (logoutResponse.status === 200) {
            setAlertOptions({
                showAlert: true,
                variant: "success",
                message: logoutData.message,
            });
            setAuth(null);
            setIsDiner(null);
            localStorage.removeItem("token");
            localStorage.removeItem("isDiner");
            history.push("/");
        } else {
            setAlertOptions({
                showAlert: true,
                variant: "error",
                message: logoutData.message,
            });
        }
    };

    const handleLogoClick = () => {
        console.log(localStorage.getItem("token"));
        if (auth === null) return history.push("/");
        // if token is manually deleted from localstorage on browser
        if (localStorage.getItem("token") === null) {
            setAuth(null);
            return history.push("/");
        }
        if (isDiner === "true") return history.push("/DinerLanding");
        if (isDiner === "false") return history.push("/EateryLanding");
    };

    return (
        <NavbarStyled elevation={0}>
            <MainContainer>
                <Toolbar className={classes.singleLine}>
                    <Typography
                        className={classes.logo}
                        onClick={handleLogoClick}
                    >
                        Value Eats
                    </Typography>
                    {isDiner === "true" && (
                        <Toolbar className={classes.barSize}>
                            <div className={classes.searchContainer}>
                                <div style={{ marginRight: 10 }}>
                                    <SearchIcon />
                                </div>
                                <div>
                                    <InputBase
                                        className={classes.searchBar}
                                        placeholder="Restaurants, dishes, postcode, keywords..."
                                        inputProps={{
                                            "aria-label": "search",
                                        }}
                                    />
                                </div>
                            </div>
                        </Toolbar>
                    )}
                    <NavLink
                        to={
                            isDiner === "true"
                                ? "/DinerProfile"
                                : "/EateryProfile"
                        }
                    >
                        PROFILE
                    </NavLink>
                    {isDiner === "true" && (
                        <NavLink to="/DinerVouchers">MY VOUCHERS</NavLink>
                    )}
                    {isDiner === "false" && (
                        <NavLink to="/EditEateryProfile">EDIT PROFILE</NavLink>
                    )}
                    <NavLink onClick={handleLogout}>LOGOUT</NavLink>

                    {/* <IconButton onClick={handleClick} color="inherit">
                        <AccountCircle style={{ fontSize: "50px" }} />
                    </IconButton> */}
                </Toolbar>
            </MainContainer>
        </NavbarStyled>
    );
}
