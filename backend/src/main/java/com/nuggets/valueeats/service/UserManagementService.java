package com.nuggets.valueeats.service;

import com.nuggets.valueeats.entity.User;
import com.nuggets.valueeats.entity.voucher.RepeatedVoucher;
import com.nuggets.valueeats.entity.voucher.Voucher;

import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import javax.persistence.PersistenceException;
import javax.transaction.Transactional;

import com.nuggets.valueeats.entity.Diner;
import com.nuggets.valueeats.entity.Eatery;
import com.nuggets.valueeats.entity.Review;
import com.nuggets.valueeats.repository.UserRepository;
import com.nuggets.valueeats.repository.voucher.RepeatVoucherRepository;
import com.nuggets.valueeats.repository.voucher.VoucherRepository;
import com.nuggets.valueeats.repository.BookingRecordRepository;
import com.nuggets.valueeats.repository.DinerRepository;
import com.nuggets.valueeats.repository.EateryRepository;
import com.nuggets.valueeats.repository.ReviewRepository;
import com.nuggets.valueeats.utils.AuthenticationUtils;
import com.nuggets.valueeats.utils.EncryptionUtils;
import com.nuggets.valueeats.utils.JwtUtils;
import com.nuggets.valueeats.utils.ResponseUtils;
import com.nuggets.valueeats.utils.ValidationUtils;
import com.nuggets.valueeats.utils.HelperFunctions;
import org.apache.commons.lang3.StringUtils;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;



@Service
public class UserManagementService {
    @Autowired
    private UserRepository<User> userRepository;

    @Autowired
    private DinerRepository dinerRepository;

    @Autowired
    private EateryRepository eateryRepository;

    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private VoucherRepository voucherRepository;
    
    @Autowired
    private RepeatVoucherRepository repeatVoucherRepository;
    
    @Autowired
    private BookingRecordRepository bookingRecordRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public ResponseEntity<JSONObject> registerEatery(Eatery eatery) {
        ResponseEntity<JSONObject> result = register(eatery);
        if (result.getStatusCode().is2xxSuccessful()) {
            eateryRepository.save(eatery);
        }

        return result;
    }

    @Transactional
    public ResponseEntity<JSONObject> registerDiner(Diner diner) {
        ResponseEntity<JSONObject> result = register(diner);
        if (result.getStatusCode().is2xxSuccessful()) {
            dinerRepository.save(diner);
        }

        return result;
    }

    @Transactional
    public ResponseEntity<JSONObject> register(User user) {
        if (!isValidInput(user)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Please fill in all required fields."));
        }
        user.setEmail(user.getEmail().toLowerCase());
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ResponseUtils.createResponse("Email is taken, try another"));
        }

        String result = validInputChecker(user);

        if (result != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse(result));
        }

        user.setId(userRepository.findMaxId() == null ? 0 : userRepository.findMaxId() + 1);

        user.setPassword(EncryptionUtils.encrypt(user.getPassword(), String.valueOf(user.getId())));

        String userToken = jwtUtils.encode(String.valueOf(user.getId()));

        user.setToken(userToken);

        Map<String, String> dataMedium = new HashMap<>();
        dataMedium.put("token", userToken);
        JSONObject data = new JSONObject(dataMedium);

        System.out.println(data);

        return ResponseEntity.status(HttpStatus.OK).body(ResponseUtils.createResponse("Welcome to ValueEats, " + user.getAlias(), data));
    }

    @Transactional
    public ResponseEntity<JSONObject> login(User user){
        User userDb;
        try {
            user.setEmail(user.getEmail().toLowerCase());
            userDb = userRepository.findByEmail(user.getEmail());
        } catch (PersistenceException e) {
            System.out.println("error");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse(e.toString()));
        }

        if (userDb == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Failed to login, please try again"));
        }

        String token = jwtUtils.encode(String.valueOf(userDb.getId()));
        userDb.setToken(token);
        System.out.println(userDb.getToken());
        userRepository.save(userDb);

        Map<String, String> dataMedium = new HashMap<>();
        dataMedium.put("token", token);
        JSONObject data = new JSONObject(dataMedium);

        System.out.println(data);

        return AuthenticationUtils.loginPasswordCheck(user.getPassword(), String.valueOf(userDb.getId()),
                                                      userDb.getPassword(), "Welcome back, " + userDb.getEmail(),
                                                      dinerRepository.existsByEmail(userDb.getEmail()), data);
    }

    @Transactional
    public ResponseEntity<JSONObject> logout(String token) {
        if (!userRepository.existsByToken(token) || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Can't find the token: " + token));
        }

        String userId = jwtUtils.decode(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Can't get user associated with token"));
        }


        User user = userRepository.findByToken(token);
        user.setToken("");
        userRepository.save(user);


        return ResponseEntity.status(HttpStatus.OK).body(ResponseUtils.createResponse("Logout was successful"));
    }

    @Transactional
    public ResponseEntity<JSONObject> updateDiner(Diner diner, String token) {
        ResponseEntity<JSONObject> result = update(diner, token);
        if (result.getStatusCode().is2xxSuccessful()) {
            diner.setToken(token);
            dinerRepository.save(diner);
        }

        return result;
    }

    @Transactional
    public ResponseEntity<JSONObject> updateEatery(Eatery eatery, String token) {
        ResponseEntity<JSONObject> result = update(eatery, token);
        if (result.getStatusCode().is2xxSuccessful()) {

            Eatery eateryDb = eateryRepository.findByToken(token);

            if (eatery.getCuisines() == null) {
                eatery.setCuisines(eateryDb.getCuisines());
            }
            if (eatery.getMenuPhotos() == null) {
                eatery.setMenuPhotos(eateryDb.getMenuPhotos());
            }
            eatery.setToken(token);
            eateryRepository.save(eatery);
        }

        return result;
    }

    @Transactional
    public ResponseEntity<JSONObject> update(User user, String token){
        User userDb;
        try {
            userDb = userRepository.findByToken(token);
        } catch (PersistenceException e) {
            System.out.println("error");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse(e.toString()));
        }

        if (userDb == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Failed to verify, please try again"));
        }
        String result = processNewProfile(user, userDb);

        if (result != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse(result));
        }


        return ResponseEntity.status(HttpStatus.OK).body(ResponseUtils.createResponse("Update profile successfully, "
         + user.getAlias()));
    }

    private boolean isValidInput(User user) {
        return StringUtils.isNotBlank(String.valueOf(user.getId())) &&
                StringUtils.isNotBlank(user.getAddress()) &&
                StringUtils.isNotBlank(user.getAlias());
    }

    public String validInputChecker(final User user) {
        if (!ValidationUtils.isValidEmail(user.getEmail())) {
            return "Invalid Email Format.";
        }
        if (!ValidationUtils.isValidPassword(user.getPassword())) {
            return "Password must be between 8 to 32 characters long, and contain a lower and uppercase character.";
        }
        return null;
    }

    public String processNewProfile (User newProfile, User oldProfile) {

        newProfile.setId(oldProfile.getId());

        if (newProfile.getEmail() != null) {
            if (!ValidationUtils.isValidEmail(newProfile.getEmail())) {
                return "Invalid Email Format.";
            }
            if (userRepository.existsByEmail(newProfile.getEmail())) {
                if (!oldProfile.getEmail().equals(newProfile.getEmail().toLowerCase()))
                    return "Email is taken, try another";
            }
            newProfile.setEmail(newProfile.getEmail().toLowerCase());
        } else {
            newProfile.setEmail(oldProfile.getEmail());
        }

        if (newProfile.getPassword() != null) {
            String newPassword = EncryptionUtils.encrypt(newProfile.getPassword(), String.valueOf(newProfile.getId()));
            if (!ValidationUtils.isValidPassword(newProfile.getPassword())) {
                return "Password must be between 8 to 32 characters long, and contain a lower and uppercase character.";
            }
            newProfile.setPassword(newPassword);
        }else {
            newProfile.setPassword(oldProfile.getPassword());
        }

        if (newProfile.getAlias() != null) {
            // Error checking for new alias if needed
        } else {
            newProfile.setAlias(oldProfile.getAlias());
        }

        if (newProfile.getAddress() != null) {
            // Error checking for new address if needed
        } else {
            newProfile.setAddress(oldProfile.getAddress());
        }

        if (newProfile.getProfilePic() != null) {
            // Error checking for new profile pic if needed.
        } else {
            newProfile.setProfilePic(oldProfile.getProfilePic());
        }
        return null;
    }

    public ResponseEntity<JSONObject> getDinerProfile(String token) {
        if (!dinerRepository.existsByToken(token) || token.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseUtils.createResponse("Token is invalid"));
        }

        Diner diner = dinerRepository.findByToken(token);
        if (diner == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Diner does not exist"));
        }
        List<Review> reviews = reviewRepository.findByDinerId(diner.getId());
        ArrayList<Object> reviewsList = new ArrayList<Object>();
        Map<String, Object> result = new HashMap<>();
        result.put("name", diner.getAlias());
        result.put("email", diner.getEmail());
        result.put("profile picture", diner.getProfilePic());
        for(Review r:reviews){
            Optional<Eatery> db = eateryRepository.findById(r.getEateryId());
            if(!db.isPresent()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Eatery does not exist"));
            }
            Eatery e = db.get();
            HashMap<String, Object> review = createReview(r.getId(), diner.getProfilePic(), diner.getAlias(), r.getMessage(), r.getRating(), r.getEateryId(), r.getReviewPhotos(), e.getAlias());
            reviewsList.add(review);
        }
        result.put("reviews", reviewsList);

        return ResponseEntity.status(HttpStatus.OK).body(new JSONObject(result));
    }

    public ResponseEntity<JSONObject> getEateryProfile(Long id, String token) {
        Eatery eateryDb;
        Diner dinerDb = null;
        if(eateryRepository.existsByToken(token) && !token.isEmpty()){
            eateryDb = eateryRepository.findByToken(token);
        }else{
            if(token.isEmpty() || !(dinerRepository.existsByToken(token))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Token is invalid"));
            }
            if(id == null){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("ID is required"));
            }
            Optional<Eatery> eateryInDb = eateryRepository.findById(id);
            if(!eateryInDb.isPresent()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Eatery does not exist"));
            }
            eateryDb = eateryInDb.get();
            dinerDb = dinerRepository.findByToken(token);
        }

        List<Float> ratings= reviewRepository.listReviewRatingsOfEatery(eateryDb.getId());
        Double averageRating = ratings.stream().mapToDouble(i -> i).average().orElse(0);
        DecimalFormat df = new DecimalFormat("#.0"); 
        
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("id", eateryDb.getId());
        map.put("name", eateryDb.getAlias());
        map.put("email", eateryDb.getEmail());
        map.put("rating", df.format(averageRating));
        map.put("address", eateryDb.getAddress());
        map.put("menuPhotos", eateryDb.getMenuPhotos());
        List<Review> reviews= reviewRepository.listReviewsOfEatery(eateryDb.getId());
        ArrayList<Object> reviewsList = new ArrayList<Object>();
        for(Review r:reviews){
            Long reviewDinerId = r.getDinerId();
            Optional<Diner> reviewerInDinerDb = dinerRepository.findById(reviewDinerId);
            if(!reviewerInDinerDb.isPresent()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Eatery does not exist"));
            }
            Diner reviewDinerDb = reviewerInDinerDb.get();

            HashMap<String, Object> review = createReview(r.getId(), reviewDinerDb.getProfilePic(), reviewDinerDb.getAlias(), r.getMessage(), r.getRating(), r.getEateryId(), r.getReviewPhotos(), eateryDb.getAlias());
            if(dinerDb != null){
                if(dinerDb.getId() == reviewDinerDb.getId()) {
                    review.put("isOwner", true);
                }else {
                    review.put("isOwner", false);
                }
            }
            reviewsList.add(review);
        }
        map.put("reviews", reviewsList);
        map.put("cuisines", eateryDb.getCuisines());

        ArrayList<Object> combinedVoucherList = new ArrayList<Object>();
        ArrayList<RepeatedVoucher> repeatVouchersList = repeatVoucherRepository.findActiveByEateryId(eateryDb.getId());
        System.out.println(repeatVouchersList);
        ArrayList<Voucher> vouchersList = voucherRepository.findActiveByEateryId(eateryDb.getId());
        for (RepeatedVoucher v:repeatVouchersList){
            HashMap<String, Object> voucher = new HashMap<String, Object>();
            voucher.put("id", v.getId());
            voucher.put("discount", v.getDiscount());
            voucher.put("eateryId", v.getEateryId());
            voucher.put("eatingStyle", v.getEatingStyle());
            voucher.put("quantity", v.getQuantity());
            voucher.put("duration", HelperFunctions.getDuration(v.getDate(), v.getEnd()));


            SimpleDateFormat formatter = new SimpleDateFormat("dd MMMM yyyy");
            String strDate = formatter.format(v.getDate());
            voucher.put("date", strDate);
            int startHour = v.getStart() / 60; //since both are ints, you get an int
            int startMinute = v.getStart() % 60;
            int endHour = v.getEnd() / 60; //since both are ints, you get an int
            int endMinute = v.getEnd() % 60;
            voucher.put("startTime", String.format("%d:%02d", startHour, startMinute));
            voucher.put("endTime", String.format("%d:%02d", endHour, endMinute));
            voucher.put("isRecurring", true);
            if(dinerDb != null){
                voucher.put("disableButton", (bookingRecordRepository.existsByDinerIdAndVoucherId(dinerDb.getId(), v.getId())) != 0);
            } else {
                voucher.put("disableButton", true);
            }
            combinedVoucherList.add(voucher);
        }

        for (Voucher v:vouchersList){
            HashMap<String, Object> voucher = new HashMap<String, Object>();
            voucher.put("id", v.getId());
            voucher.put("discount", v.getDiscount());
            voucher.put("eateryId", v.getEateryId());
            voucher.put("eatingStyle", v.getEatingStyle());
            voucher.put("quantity", v.getQuantity());
            voucher.put("duration", HelperFunctions.getDuration(v.getDate(), v.getEnd()));
            SimpleDateFormat formatter = new SimpleDateFormat("dd MMMM yyyy");
            String strDate = formatter.format(v.getDate());
            voucher.put("date", strDate);
            int startHour = v.getStart() / 60; //since both are ints, you get an int
            int startMinute = v.getStart() % 60;
            int endHour = v.getEnd() / 60; //since both are ints, you get an int
            int endMinute = v.getEnd() % 60;
            voucher.put("startTime", String.format("%d:%02d", startHour, startMinute));
            voucher.put("endTime", String.format("%d:%02d", endHour, endMinute));
            voucher.put("isRecurring", false);
            if(dinerDb != null){
                voucher.put("disableButton", (bookingRecordRepository.existsByDinerIdAndVoucherId(dinerDb.getId(), v.getId())) != 0);
            } else {
                voucher.put("disableButton", true);
            }
            combinedVoucherList.add(voucher);
        }

        map.put("vouchers", combinedVoucherList);

        JSONObject data = new JSONObject(map);

        return ResponseEntity.status(HttpStatus.OK).body(ResponseUtils.createResponse(data));
    }

    // HashMap<String, Object> createReview(Long id, String pic, String name, String message, float rating, boolean isOwner){
    //     HashMap<String, Object> review = createReview(id, pic, name, message, rating);
    //     review.put("isOwner", message);
    //     return review;
    // }

    HashMap<String, Object> createReview(Long id, String pic, String name, String message, float rating, Long eateryId, ArrayList<String> reviewPhotos, String eateryName){
        HashMap<String, Object> review = new HashMap<String, Object>();
        review.put("reviewId", id);
        review.put("profilePic", pic);
        review.put("name", name);
        review.put("rating", rating);
        review.put("message", message);
        review.put("eateryId", eateryId);
        review.put("reviewPhotos", reviewPhotos);
        review.put("eateryName", eateryName);
        return review;
    }
}
