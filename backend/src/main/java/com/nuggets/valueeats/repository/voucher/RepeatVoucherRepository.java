package com.nuggets.valueeats.repository.voucher;

import com.nuggets.valueeats.entity.voucher.RepeatedVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public interface RepeatVoucherRepository extends JpaRepository<RepeatedVoucher, Long> {
    @Query("select e from RepeatedVoucher e where e.nextUpdate < CURRENT_DATE")
    List<RepeatedVoucher> findOverdueRepeatVouchers();

    @Query("select max(id) from RepeatedVoucher")
    Long findMaxId();

    void deleteById(Long id);

    ArrayList<RepeatedVoucher> findByEateryId (Long eateryId);
}
