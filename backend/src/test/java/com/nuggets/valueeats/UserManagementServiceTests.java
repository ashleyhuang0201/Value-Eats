package com.nuggets.valueeats;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.nuggets.valueeats.controller.*;
import com.nuggets.valueeats.entity.*;
import com.nuggets.valueeats.service.*;
import com.nuggets.valueeats.repository.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import org.json.simple.JSONObject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
class UserManagementServiceTests {
	@Autowired
	DinerRepository dinerRepository;

	@Autowired
	EateryRepository eateryRepository;

	@Autowired
	private MockMvc mockMvc;

	// Test valid diner.
	@Test
	void dinerRegisterTest1() throws Exception {
		Map<String, String> body = new HashMap<>();
		body.put("alias", "diner1");
		body.put("email", "diner1@gmail.com");
		body.put("address", "Sydney");
		body.put("password", "12rwqeDsad@");
		System.out.println(new JSONObject(body));

		this.mockMvc.perform(
						post("/register/diner")
										.contentType(MediaType.APPLICATION_JSON)
										.content(String.valueOf(new JSONObject(body)))
						)
						.andExpect(status().isOk());
	}
	// Test diner with the duplicate alias.
	@Test
	void dinerRegisterTest2() throws Exception {
		Map<String, String> body = new HashMap<>();
		body.put("alias", "diner1");
		body.put("email", "diner1@gmail.com");
		body.put("address", "Sydney");
		body.put("password", "12rwqeDsad@");
		System.out.println(new JSONObject(body));

		this.mockMvc.perform(
			post("/register/diner")
							.contentType(MediaType.APPLICATION_JSON)
							.content(String.valueOf(new JSONObject(body)))
		  );

		this.mockMvc.perform(
						post("/register/diner")
										.contentType(MediaType.APPLICATION_JSON)
										.content(String.valueOf(new JSONObject(body)))
						)
						.andExpect(status().is4xxClientError());
	}

		// Test diner with the invalid email.
		@Test
		void dinerRegisterTest3() throws Exception {
			Map<String, String> body = new HashMap<>();
			body.put("alias", "diner2");
			body.put("email", "diner2");
			body.put("address", "Sydney");
			body.put("password", "12rwqeDsad@");
			System.out.println(new JSONObject(body));
	
	
			this.mockMvc.perform(
							post("/register/diner")
											.contentType(MediaType.APPLICATION_JSON)
											.content(String.valueOf(new JSONObject(body)))
							)
							.andExpect(status().is4xxClientError());
		}

		// Test diner with the invalid password.
		@Test
		void dinerRegisterTest4() throws Exception {
			Map<String, String> body = new HashMap<>();
			body.put("alias", "diner2");
			body.put("email", "diner2@gmail.com");
			body.put("address", "Sydney");
			body.put("password", "1234");
			System.out.println(new JSONObject(body));
	
	
			this.mockMvc.perform(
							post("/register/diner")
											.contentType(MediaType.APPLICATION_JSON)
											.content(String.valueOf(new JSONObject(body)))
							)
							.andExpect(status().is4xxClientError());
		}
}
