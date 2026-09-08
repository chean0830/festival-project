package com.example.festival.festivalrecord.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "record_food")
@Getter
@NoArgsConstructor
public class RecordFood {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_id")
    private Long foodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private FestivalRecord record;

    @Column(name = "food_name", nullable = false, length = 200)
    private String foodName;

    private RecordFood(FestivalRecord record, String foodName) {
        this.record = record;
        this.foodName = foodName;
    }

    public static RecordFood of(FestivalRecord record, String foodName) {
        return new RecordFood(record, foodName);
    }
}
