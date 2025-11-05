package com.example.demo.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("select m from Message m where m.conversation.id = :cid order by m.createdAt asc")
    List<Message> findByConversation(@Param("cid") Long conversationId);

    // Fallbacks for legacy schemas (projection to avoid entity mapping issues)
    @Query(value = "SELECT id as id, conversation_id as conversationId, sender_id as senderId, content as content, created_at as createdAt FROM messages WHERE conversation_id = :cid ORDER BY created_at ASC", nativeQuery = true)
    List<MessageProjection> projByConversationUnderscore(@Param("cid") Long conversationId);

    // Variant: camel case FK but underscore timestamps/flags
    @Query(value = "SELECT id as id, conversationId as conversationId, senderId as senderId, content as content, createdAt as createdAt FROM messages WHERE conversationId = :cid ORDER BY createdAt ASC", nativeQuery = true)
    List<MessageProjection> projByConversationCamelAll(@Param("cid") Long conversationId);

    // Variant: flat FK name
    @Query(value = "SELECT id as id, conversationid as conversationId, senderid as senderId, content as content, createdat as createdAt FROM messages WHERE conversationid = :cid ORDER BY createdat ASC", nativeQuery = true)
    List<MessageProjection> projByConversationFlatAll(@Param("cid") Long conversationId);

    // Variant: fully camel case columns
    // Mixed variant (camel FK + underscore time/flags) — optional
    @Query(value = "SELECT id as id, conversationId as conversationId, sender_id as senderId, content as content, created_at as createdAt FROM messages WHERE conversationId = :cid ORDER BY created_at ASC", nativeQuery = true)
    List<MessageProjection> projByConversationCamelMixed(@Param("cid") Long conversationId);

    @Query("select m from Message m where (:q is null or lower(m.content) like lower(concat('%', :q, '%'))) order by m.createdAt desc")
    List<Message> searchAll(@Param("q") String query);
}
