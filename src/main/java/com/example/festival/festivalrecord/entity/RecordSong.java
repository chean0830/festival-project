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
@Table(name = "record_song")
@Getter
@NoArgsConstructor
public class RecordSong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "song_id")
    private Long songId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private FestivalRecord record;

    @Column(name = "song_title", nullable = false, length = 200)
    private String songTitle;

    @Column(name = "artist_name", length = 100)
    private String artistName;

    private RecordSong(FestivalRecord record, String songTitle, String artistName) {
        this.record = record;
        this.songTitle = songTitle;
        this.artistName = artistName;
    }

    public static RecordSong of(FestivalRecord record, String songTitle, String artistName) {
        return new RecordSong(record, songTitle, artistName);
    }
}
