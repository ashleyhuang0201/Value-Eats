// package com.nuggets.valueeats.service;

// import com.nuggets.valueeats.entity.User;
// import com.nuggets.valueeats.repository.UserRepository;
// import com.nuggets.valueeats.utils.EncryptionUtils;
// import com.nuggets.valueeats.utils.JwtUtils;
// import com.nuggets.valueeats.utils.ResponseUtils;
// import com.nuggets.valueeats.utils.ValidationUtils;
// import org.apache.commons.lang3.StringUtils;
// import org.json.simple.JSONObject;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.stereotype.Service;

// import java.util.*;

// @Service
// public abstract class LoggedInUserService {
//     @Autowired
//     private UserRepository<User> userRepository;
//     @Autowired
//     private LoggedInUserService loggedInUserService;
//     @Autowired
//     private JwtUtils jwtUtils;
//     @Autowired
//     private UserTokenRepository userTokenRepository;

//     public ResponseEntity<JSONObject> register(User user) {
//         if (!isValidInput(user)) {
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse("Please fill in all required fields."));
//         }

//         if (userRepository.existsByEmail(user.getEmail())) {
//             return ResponseEntity.status(HttpStatus.CONFLICT).body(ResponseUtils.createResponse("Email is taken, try another"));
//         }

//         String result = loggedInUserService.validInputChecker(user);
//         if (result != null) {
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseUtils.createResponse(result));
//         }

//         user.setId(userRepository.findMaxId() == null ? 0 : userRepository.findMaxId() + 1);
//         user.setPassword(EncryptionUtils.encrypt(user.getPassword(), String.valueOf(user.getId())));

//         Long tokenId = (userTokenRepository.findMaxId() == null ? 0 : userTokenRepository.findMaxId() + 1);
//         UserToken userToken = new UserToken(tokenId, jwtUtils.encode(String.valueOf(user.getId())));
//         user.addToken(userToken);
//         System.out.println("adding the new token from register");

//         Map<String, String> dataMedium = new HashMap<>();
//         dataMedium.put("token", userToken.getToken());
//         JSONObject data = new JSONObject(dataMedium);

//         dinerRepository.save(diner);

//         return ResponseEntity.status(HttpStatus.OK).body(ResponseUtils.createResponse("Welcome to ValueEats, " + user.getAlias(), data));
//     }

//     public ResponseEntity<JSONObject> login(User user){

//     }

//     public String validInputChecker(final User user) {
//         if (!ValidationUtils.isValidEmail(user.getEmail())) {
//             return "Invalid Email Format.";
//         }
//         if (!ValidationUtils.isValidPassword(user.getPassword())) {
//             return "Password must be between 8 to 32 characters long, and contain a lower and uppercase character.";
//         }

//         return null;
//     }

//     private boolean isValidInput(User user) {
//         return StringUtils.isNotBlank(String.valueOf(user.getId())) &&
//                 StringUtils.isNotBlank(user.getAddress()) &&
//                 StringUtils.isNotBlank(user.getAlias());
//     }
// }
