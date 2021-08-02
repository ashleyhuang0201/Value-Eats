package com.nuggets.valueeats.service;

import com.nuggets.valueeats.entity.Diner;
import com.nuggets.valueeats.entity.Eatery;
import com.nuggets.valueeats.repository.BookingRecordRepository;
import com.nuggets.valueeats.repository.DinerRepository;
import com.nuggets.valueeats.repository.EateryRepository;
import com.nuggets.valueeats.repository.ReviewRepository;
import com.nuggets.valueeats.repository.voucher.RepeatVoucherRepository;
import com.nuggets.valueeats.repository.voucher.VoucherRepository;
import com.nuggets.valueeats.utils.EateryUtils;
import com.nuggets.valueeats.utils.ResponseUtils;
import me.xdrop.fuzzywuzzy.FuzzySearch;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {
    @Autowired
    private EateryRepository eateryRepository;
    @Autowired
    private DinerRepository dinerRepository;
    @Autowired
    private VoucherRepository voucherRepository;
    @Autowired
    private RepeatVoucherRepository repeatVoucherRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private BookingRecordRepository bookingRecordRepository;

    /**
    * This method is used to provide a list of eateries that closely matches with a search string.
    * The search is based on an eatery's alias, cuisines served and address.
    *
    * @param    search   A valid string to be used for search matching.
    */
    public ResponseEntity<JSONObject> fuzzySearch(final String search) {
        final PriorityQueue<AbstractMap.SimpleImmutableEntry<Integer, Eatery>> pq = eateryRepository.findAll().stream()
                .map(a -> new AbstractMap.SimpleImmutableEntry<>(FuzzySearch.weightedRatio(search, a.getCuisines().toString() + "|" + a.getAlias() + "|" + a.getAddress()), a))
                .collect(Collectors.toCollection(() -> new PriorityQueue<>((a, b) -> b.getKey() - a.getKey())));

        List<Object> result = new ArrayList<>();
        while (!pq.isEmpty() && result.size() <= 10) {
            AbstractMap.SimpleImmutableEntry<Integer, Eatery> poll = pq.poll();
            if (poll.getKey() > 70) {
                Eatery newEatery = poll.getValue();
                HashMap<String, Object> eatery = EateryUtils.createEatery(voucherRepository, repeatVoucherRepository, newEatery, null);
                result.add(eatery);
            }
        }

        Map<String, Object> dataMedium = new HashMap<>();
        dataMedium.put("eateryList", result);
        JSONObject data = new JSONObject(dataMedium);

        return ResponseEntity.status(HttpStatus.OK).body(ResponseUtils.createResponse(data));
    }

    /**
    * This method is used to provide a list of recommended eateries based on criteria weightings.
    * 
    * @param    token   An authentication token that uniquely identifies a diner.
    * @see      #getWeight(Diner, Eatery, List)
    */
    public ResponseEntity<JSONObject> recommendation(String token) {
        // - Eateries that are currently offering discount vouchers:
        //     - Diner has not previously booked for
        //     - Diner might be interested in using:
        //         - past bookings (using cuisines)
        //         - review ratings for past bookings
        //         - review ratings left by other diners

        if (!dinerRepository.existsByToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseUtils.createResponse("Invalid diner token"));
        }

        Diner diner = dinerRepository.findByToken(token);
        List<Long> eateriesDinerBeenTo = bookingRecordRepository.findEateriesDinerBeenTo(diner.getId());

        // Sort these eateries based on diner interests.
        List<Eatery> eateriesDinerNotBeenTo = eateryRepository.findAllEateriesNotInList(eateriesDinerBeenTo);

        final PriorityQueue<AbstractMap.SimpleImmutableEntry<Integer, Eatery>> pq = eateriesDinerNotBeenTo.stream()
                .map(a -> new AbstractMap.SimpleImmutableEntry<>(getWeight(diner, a, eateriesDinerBeenTo), a))
                .collect(Collectors.toCollection(() -> new PriorityQueue<>((a, b) -> b.getKey() - a.getKey())));

        List<Object> result = new ArrayList<>();
        while (!pq.isEmpty() && result.size() <= 10) {
            Eatery newEatery = pq.poll().getValue();
            HashMap<String, Object> eatery = EateryUtils.createEatery(voucherRepository, repeatVoucherRepository, newEatery, null);
            result.add(eatery);
        }

        Map<String, Object> dataMedium = new HashMap<>();
        dataMedium.put("eateryList", result);
        JSONObject data = new JSONObject(dataMedium);

        return ResponseEntity.status(HttpStatus.OK).body(ResponseUtils.createResponse(data));
    }

    /**
    * This method is invoked by recommendation to provide the weighting of a particular eatery for a user. The higher
    * the weighting, the more the eatery should be recommended.
    * 
    * @param    diner                   A Diner object that contains diner details.
    * @param    eatery                  An Eatery object that contains eatery details.
    * @param    eateriesDinerBeenTo     A list of eateryIds that the diner has been to.
    * @see      #recommendation(String)
    */
    private Integer getWeight(Diner diner, Eatery eatery, List<Long> eateriesDinerBeenTo) {
        int weight = 0;

        // If the restaurant serves a cuisine the diner had before, +1 per cuisine
        weight += eateryRepository.dinerHadCuisineBefore(eatery.getId(), eateriesDinerBeenTo);

        // If the diner had a poor experience (<3) with a certain cuisine at a previous restaurant, -1 per cuisine
        List<Long> eateriesDinerDidNotEnjoy = reviewRepository.listEateriesDinerDidNotEnjoy(diner.getId());
        // Count how many similar cuisines this eatery serves compared to past eatery that diner did not enjoy.
        weight -= eateryRepository.dinerHadCuisineBefore(eatery.getId(), eateriesDinerDidNotEnjoy);

        // If the restaurant has good rating (use avg rating - 3), add some weight, else subtract
        // 5* = 2
        // 4* = 1
        // 3* = 0
        // 2* = -1
        // 1* = -2
        if (eatery.getLazyRating() != null) {
            weight += eatery.getLazyRating() - 3;
        }

        return weight;
    }
}
