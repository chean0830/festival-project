package com.example.festival.festivalrecord.controller;

import com.example.festival.festivalrecord.dto.FestivalRecordRequest;
import com.example.festival.festivalrecord.dto.FestivalRecordResponse;
import com.example.festival.festivalrecord.dto.FestivalRecordSummaryResponse;
import com.example.festival.festivalrecord.dto.ShareRequest;
import com.example.festival.festivalrecord.service.FestivalRecordService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/members/{memberId}/festival-records")
public class FestivalRecordController {

    private final FestivalRecordService festivalRecordService;

    public FestivalRecordController(FestivalRecordService festivalRecordService) {
        this.festivalRecordService = festivalRecordService;
    }

    @GetMapping
    public List<FestivalRecordSummaryResponse> getRecords(@PathVariable Long memberId) {
        return festivalRecordService.getRecords(memberId);
    }

    @GetMapping("/{recordId}")
    public FestivalRecordResponse getRecord(@PathVariable Long memberId, @PathVariable Long recordId) {
        return festivalRecordService.getRecord(memberId, recordId);
    }

    @PostMapping
    public FestivalRecordResponse createRecord(@PathVariable Long memberId, @Valid @RequestBody FestivalRecordRequest request) {
        return festivalRecordService.createRecord(memberId, request);
    }

    @PatchMapping("/{recordId}")
    public FestivalRecordResponse updateRecord(
            @PathVariable Long memberId,
            @PathVariable Long recordId,
            @Valid @RequestBody FestivalRecordRequest request
    ) {
        return festivalRecordService.updateRecord(memberId, recordId, request);
    }

    @DeleteMapping("/{recordId}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long memberId, @PathVariable Long recordId) {
        festivalRecordService.deleteRecord(memberId, recordId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{recordId}/images")
    public FestivalRecordResponse addImage(
            @PathVariable Long memberId,
            @PathVariable Long recordId,
            @RequestParam("file") MultipartFile file
    ) {
        return festivalRecordService.addImage(memberId, recordId, file);
    }

    @DeleteMapping("/{recordId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long memberId,
            @PathVariable Long recordId,
            @PathVariable Long imageId
    ) {
        festivalRecordService.deleteImage(memberId, recordId, imageId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{recordId}/share")
    public FestivalRecordResponse shareRecord(
            @PathVariable Long memberId,
            @PathVariable Long recordId,
            @Valid @RequestBody ShareRequest request
    ) {
        return festivalRecordService.shareRecord(memberId, recordId, request);
    }
}
