package com.civicpulse.nexus.controller;

import com.civicpulse.nexus.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {
        String imageUrl = uploadService.uploadImage(file);

        return ResponseEntity.ok(Map.of(
                "message", "Image uploaded successfully",
                "url", imageUrl
        ));
    }
}