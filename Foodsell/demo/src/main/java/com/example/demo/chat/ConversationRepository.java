package com.example.demo.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("select c from Conversation c where (c.user1.id = :u1 and c.user2.id = :u2) or (c.user1.id = :u2 and c.user2.id = :u1)")
    Optional<Conversation> findByUserPair(@Param("u1") Integer user1Id, @Param("u2") Integer user2Id);

    @Query("select c from Conversation c where c.user1.id = :uid or c.user2.id = :uid order by c.updatedAt desc")
    List<Conversation> findAllByUser(@Param("uid") Integer userId);

    // Eagerly fetch participants to avoid LazyInitializationException when mapping titles
    @Query("select c from Conversation c left join fetch c.user1 left join fetch c.user2 where c.user1.id = :uid or c.user2.id = :uid order by c.updatedAt desc")
    List<Conversation> findAllByUserWithUsers(@Param("uid") Integer userId);

    @Query("select c from Conversation c left join fetch c.user1 left join fetch c.user2 where (c.user1.id = :uid or c.user2.id = :uid) and (lower(c.user1.fullName) like lower(concat('%', :q, '%')) or lower(c.user2.fullName) like lower(concat('%', :q, '%'))) order by c.updatedAt desc")
    List<Conversation> searchByUserAndName(@Param("uid") Integer userId, @Param("q") String query);
}
