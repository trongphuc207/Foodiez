package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;
import com.example.demo.Users.User;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "address_name")
    private String addressName;

    @Column(name = "full_address", columnDefinition = "TEXT")
    private String fullAddress;

    private String phone;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
