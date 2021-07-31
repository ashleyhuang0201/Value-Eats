import React, { useContext, useState, useEffect } from "react";
import NavBar from "../components/Navbar";
import { MainContent } from "../styles/MainContent";
import { StoreContext } from "../utils/store";
import { Redirect, useHistory } from "react-router-dom";
import { Box } from "@material-ui/core";
import { ButtonStyled } from "../styles/ButtonStyle";
import EateryVoucher from "../components/EateryVoucher";
import EditCreateVoucher from "../components/EditCreateVoucher";
import { logUserOut } from "../utils/logoutHelper";
import { VoucherContainer } from "../styles/VoucherContainer";
import { Subtitle } from "../styles/Subtitle";
import Loading from "../components/Loading";
import request from "../utils/request";

export default function EateryLanding () {
  const context = useContext(StoreContext);
  const [auth, setAuth] = context.auth;
  const [isDiner, setIsDiner] = context.isDiner;
  const history = useHistory();
  const [eateryDetails, setEateryDetails] = useState({});
  const [openCreateDiscount, setOpenCreateDiscount] = useState(false);
  const [loading, setLoading] = useState(false);

  const getEateryDetails = async () => {
    setLoading(true);
    const response = await request.get("eatery/profile/details", auth);
    const responseData = await response.json();
    setLoading(false);
    if (response.status === 200) {
      console.log(responseData);
      setEateryDetails(responseData);
    } else if (response.status === 401) {
      logUserOut(setAuth, setIsDiner);
    } else {
      // TODO
      console.log(responseData);
    }
  };

  useEffect(() => {
    getEateryDetails();
  }, [auth]);

  if (auth === null) return <Redirect to="/" />;
  if (isDiner === "true") return <Redirect to="/DinerLanding" />;
  console.log(isDiner);

  return (
    <>
      <NavBar isDiner={isDiner} />
      <MainContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Subtitle>{eateryDetails.name}&apos;s Discounts</Subtitle>
          <VoucherContainer>
            {eateryDetails.vouchers &&
              eateryDetails.vouchers.map((v, key) => {
                return (
                  ((v.nextUpdate !== "Deleted" && v.isRecurring === true) ||
                    v.isRecurring === false) && (
                    <EateryVoucher
                      voucherId={v.id}
                      key={key}
                      eateryId={v.eateryId}
                      discount={v.discount}
                      isOneOff={!v.isRecurring}
                      isDineIn={v.eatingStyle === "DineIn"}
                      vouchersLeft={v.quantity}
                      date={v.date}
                      startTime={v.startTime}
                      endTime={v.endTime}
                      timeRemaining={v.duration}
                      nextUpdate={v.nextUpdate ? v.nextUpdate : null}
                      isActive={v.isActive}
                      isRedeemable={v.isRedeemable}
                      refreshList={() => getEateryDetails()}
                    ></EateryVoucher>
                  )
                );
              })}
            {eateryDetails.vouchers && eateryDetails.vouchers.length === 0 && (
              <Box
                display="flex"
                flexDirection="column"
                minHeight="100%"
                justifyContent="center"
                alignItems="center"
              >
                <h1 style={{ marginTop: "0px" }}>No active discounts!</h1>
                <ButtonStyled
                  widthPercentage={25}
                  onClick={() => setOpenCreateDiscount(true)}
                >
                  Get started!
                </ButtonStyled>
              </Box>
            )}
            <Loading isLoading={loading} />
          </VoucherContainer>
        </Box>
        <Box display="flex" flexDirection="column" height="30vh">
          <Box display="flex" justifyContent="space-evenly">
            <ButtonStyled
              variant="contained"
              color="primary"
              onClick={() => history.push("/RedeemVoucher")}
            >
              Redeem Voucher
            </ButtonStyled>
            <ButtonStyled
              variant="contained"
              color="primary"
              onClick={() => setOpenCreateDiscount(true)}
            >
              Create Discount
            </ButtonStyled>
          </Box>
        </Box>
      </MainContent>
      <EditCreateVoucher
        eateryId={eateryDetails.id}
        voucherId={-1}
        open={openCreateDiscount}
        setOpen={setOpenCreateDiscount}
        isEdit={false}
        refreshList={() => getEateryDetails()}
      ></EditCreateVoucher>
    </>
  );
}
