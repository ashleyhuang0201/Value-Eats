import React, { useState, useEffect } from "react";
import NavBar from "../components/Navbar";
import { MainContainer } from "../styles/MainContainer";
import {
    Typography,
    Grid,
    Box,
    Card,
    Button,
    Modal,
    makeStyles,
} from "@material-ui/core";
import StarRating from "../components/StarRating";
import Review from "../components/Review";
import { useLocation, Redirect } from "react-router-dom";
import { StoreContext } from "../utils/store";
import Carousel from "react-material-ui-carousel";

const useStyles = makeStyles({
    photo: {
        color: "black",
        transition: "transform 0.15s ease-in-out",
        "&:hover": { transform: "scale3d(1.02, 1.02, 1)", maxHeight: "none" },
        width: "150px",
        height: "150px",
        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.3)",
        objectFit: "contain",
        backgroundColor: "white",
    },
    photoCarousel: {
        width: "400px",
        height: "400px",
        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.3)",
        objectFit: "contain",
        backgroundColor: "white",
        padding: "100px",
    },
    gridContainer: {
        background: "rgba(255, 255, 255, 0.2)",
        marginTop: "10px",
        borderRadius: "10px",
        
    },
    subtitle: {
        background: "rgba(255, 255, 255, 0.5)",
        borderRadius: "10px",
        margin: "10px 0px",
        padding: "5px 0px",
    }
});

export default function EateryProfile() {
    const [eateryDetails, setEateryDetails] = useState([]);
    const location = useLocation();
    const classes = useStyles();
    const context = React.useContext(StoreContext);
    const [auth] = context.auth;
    const [isDiner] = context.isDiner;
    const eateryId = location.pathname.split("/")[3];

    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        const getEateryDetails = async () => {
            const response = await fetch(
                `http://localhost:8080/eatery/${eateryId}/details`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: auth,
                    },
                }
            );

            const responseData = await response.json();
            if (response.status === 200) {
                console.log(responseData);
                setEateryDetails(responseData);
            } else {
                // TODO
                console.log(responseData);
            }
        };
        getEateryDetails();
    }, [auth, eateryId]);
    if (auth === null || isDiner === "false") return <Redirect to="/" />;

    const getReviews = () => {
        if (!eateryDetails.reviews) return;
        if (eateryDetails.reviews.length === 0) {
            return <div>no reviews currently</div>;
        }
        console.log(eateryDetails.reviews);
        return eateryDetails.reviews.map((item, key) => {
            return (
                <Review
                    onEateryProfile={false}
                    eateryName={item.eateryName}
                    review={item.message}
                    rating={item.rating}
                    isOwner={item.isOwner}
                    key={key}
                ></Review>
            );
        });
    };

    const getImages = () => {
        if (!eateryDetails.menuPhotos) return;
        if (eateryDetails.menuPhotos.length === 0) {
            return <div>no images currently</div>;
        }
        return eateryDetails.menuPhotos.map((item, key) => {
            return (
                // TODO make it responsive
                <img
                    src={item}
                    alt="menu photos"
                    key={key}
                    className={classes.photoCarousel}
                />
            );
        });
    };

    const getSingleImage = () => {
        if (!eateryDetails.menuPhotos) return;
        if (eateryDetails.menuPhotos.length === 0) {
            return <div>no images currently</div>;
        }
        return (
            <img
                className={classes.photo}
                src={eateryDetails.menuPhotos[0]}
                alt="eatery menu"
                onClick={handleOpen}
            />
        );
    };

    const getNumberOfImages = () => {
        if (!eateryDetails.menuPhotos) return;
        if (eateryDetails.menuPhotos.length === 0) {
            return <div>0 images</div>;
        }
        return <div>{`${eateryDetails.menuPhotos.length} images`}</div>;
    };

    const getVouchers = () => {
        if (!eateryDetails.vouchers) return;
        if (eateryDetails.vouchers.length === 0) {
            return <div> no vouchers </div>;
        }
        return eateryDetails.vouchers.map((item, key) => {
            return (
                <Card
                    style={{
                        paddingTop: "25px",
                        paddingBottom: "25px",
                        borderRadius: "0px",
                    }}
                    key={key}
                >
                    <Grid container justify="space-around" alignItems="center">
                        <Grid item style={{ alignItems: "center" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                style={{ display: "block", width: "15vw" }}
                            >
                                {`${item.discount * 100}% OFF - ${item.type}`}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Box style={{ margin: "10px" }}>
                                5 LEFT PLACEHOLDER
                            </Box>
                            <Box style={{ margin: "10px" }}>
                                VALID 1-2PM PLACEHOLDER
                            </Box>
                        </Grid>
                    </Grid>
                </Card>
            );
        });
    };

    const getCuisines = () => {
        if (!eateryDetails.cuisines) return;
        return eateryDetails.cuisines.join(", ");
    };

    return (
        <>
            <NavBar isDiner={isDiner} />
            <MainContainer>
                <Grid container spacing={5} className={classes.gridContainer}>
                    <Grid
                        item
                        xs={6}
      
                    >
                        <Typography variant="h3">
                            {eateryDetails.name}
                        </Typography>
                        <StarRating rating={eateryDetails.rating} />
                        <Typography variant="subtitle2">
                            {eateryDetails.address}
                        </Typography>
                        <Typography variant="subtitle2">
                            {getCuisines()}
                        </Typography>
                        <Typography
                            variant="h5"
                            className={classes.subtitle}
                        >
                            Menu Photos
                        </Typography>
                        <Box flex-wrap="wrap" flexDirection="row">
                            {getSingleImage()}
                        </Box>
                        {getNumberOfImages()}
                        <Typography className={classes.subtitle} variant="h5">Reviews</Typography>
                        <Button
                            style={{ margin: "10px 0px" }}
                            variant="contained"
                            color="primary"
                        >
                            Write a Review
                        </Button>
                        <Box>{getReviews()}</Box>
                    </Grid>

                    <Grid item xs={6} >
                        <Typography variant="h3">Discounts</Typography>
                        {getVouchers()}
                        <div>
                            <Modal
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                open={open}
                                onClose={handleClose}
                            >
                                {
                                    <div
                                        style={{
                                            top: "25%",
                                            margin: "auto",
                                            outline: "none",
                                        }}
                                    >
                                        <Carousel
                                            navButtonsProps={{
                                                style: {
                                                    opacity: "50%",
                                                },
                                            }}
                                            navButtonsAlwaysVisible={true}
                                            autoPlay={false}
                                        >
                                            {getImages()}
                                        </Carousel>
                                    </div>
                                }
                            </Modal>
                        </div>
                    </Grid>
                </Grid>
            </MainContainer>
        </>
    );
}
