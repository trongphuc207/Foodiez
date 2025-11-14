package com.example.demo.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("select m from Message m where m.conversation.id = :cid order by m.createdAt asc")
    List<Message> findByConversation(@Param("cid") Long conversationId);

    // Fallbacks for legacy schemas (projection to avoid entity mapping issues)
    @Query(value = "SELECT id as id, conversation_id as conversationId, sender_id as senderId, content as content, image_url as imageUrl, created_at as createdAt FROM messages WHERE conversation_id = :cid ORDER BY created_at ASC", nativeQuery = true)
    List<MessageProjection> projByConversationUnderscore(@Param("cid") Long conversationId);

    // Variant: camel case FK but underscore timestamps/flags
    @Query(value = "SELECT id as id, conversationId as conversationId, senderId as senderId, content as content, imageUrl as imageUrl, createdAt as createdAt FROM messages WHERE conversationId = :cid ORDER BY createdAt ASC", nativeQuery = true)
    List<MessageProjection> projByConversationCamelAll(@Param("cid") Long conversationId);

    // Variant: flat FK name
    @Query(value = "SELECT id as id, conversationid as conversationId, senderid as senderId, content as content, imageurl as imageUrl, createdat as createdAt FROM messages WHERE conversationid = :cid ORDER BY createdat ASC", nativeQuery = true)
    List<MessageProjection> projByConversationFlatAll(@Param("cid") Long conversationId);

    // Variant: fully camel case columns
    // Mixed variant (camel FK + underscore time/flags) — optional
    @Query(value = "SELECT id as id, conversationId as conversationId, sender_id as senderId, content as content, image_url as imageUrl, created_at as createdAt FROM messages WHERE conversationId = :cid ORDER BY created_at ASC", nativeQuery = true)
    List<MessageProjection> projByConversationCamelMixed(@Param("cid") Long conversationId);

    @Query("select m from Message m left join fetch m.conversation left join fetch m.sender where (:q is null or lower(m.content) like lower(concat('%', :q, '%'))) order by m.createdAt desc")
    List<Message> searchAll(@Param("q") String query);

    // Count unread messages in a conversation for a specific user (not sent by that user)
    @Query("select count(m) from Message m where m.conversation.id = :cid and m.sender.id <> :uid and m.read = false")
    long countUnreadInConversation(@Param("cid") Long conversationId, @Param("uid") Integer userId);

    // Mark unread as read in a conversation for a specific user
    @Modifying
    @Query("update Message m set m.read = true where m.conversation.id = :cid and m.sender.id <> :uid and m.read = false")
    int markAsReadInConversation(@Param("cid") Long conversationId, @Param("uid") Integer userId);

    // Delete all messages in a conversation
    @Modifying
    @Query("delete from Message m where m.conversation.id = :cid")
    void deleteByConversationId(@Param("cid") Long conversationId);
}
