package com.example.demo.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) { this.service = service; }

    // tạo thủ công (tiện seed/test)
    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Notification n) {
        Notification saved = service.push(n);
        return ResponseEntity.created(URI.create("/api/notifications/" + saved.getId())).body(saved);
    }

    // lấy theo userId (đơn giản như Category/Product)
    @GetMapping("/user/{userId}")
    public List<Notification> byUser(@PathVariable Long userId) {
        return service.listOfUser(userId);
    }

    @GetMapping("/user/{userId}/unread-count")
    public long unread(@PathVariable Long userId) {
        return service.unreadCount(userId);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> mark(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean read) {
        service.markRead(id, read);
        return ResponseEntity.noContent().build();
    }
}
