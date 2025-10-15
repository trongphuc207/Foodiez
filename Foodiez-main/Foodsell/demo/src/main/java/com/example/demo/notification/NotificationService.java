package com.example.demo.notification;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class NotificationService {
    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) { this.repo = repo; }

    public Notification push(Notification n) { return repo.save(n); }
    public List<Notification> listOfUser(Long userId) { return repo.findByUserIdOrderByCreatedAtDesc(userId); }
    public long unreadCount(Long userId) { return repo.countByUserIdAndIsReadFalse(userId); }
    public void markRead(Long id, boolean read) {
        Notification n = repo.findById(id).orElseThrow();
        n.setIsRead(read);
        repo.save(n);
    }
}
