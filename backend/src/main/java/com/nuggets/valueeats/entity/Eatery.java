package com.nuggets.valueeats.entity;

import com.nuggets.valueeats.utils.TextUtils;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.stream.Collectors;

@Entity
@DiscriminatorValue(value = "Eatery")
@Data
@NoArgsConstructor
public final class Eatery extends User {
    private String name;
    private ArrayList<String> cuisines;
    private ArrayList<String> menuPhotos;

    public void setCuisines(String cuisines) {
        this.cuisines = Arrays.stream(cuisines.split(","))
                .map(a -> TextUtils.toTitle(a))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public void setMenuPhotos(String menuPhotos) {
        this.menuPhotos = Arrays.stream(menuPhotos.split(","))
                .map(String::trim)
                .collect(Collectors.toCollection(ArrayList::new));
    }
}
