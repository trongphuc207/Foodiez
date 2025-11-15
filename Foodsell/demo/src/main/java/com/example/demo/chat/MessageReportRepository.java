package com.example.demo.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageReportRepository extends JpaRepository<MessageReport, Long> {

    @Query("select r from MessageReport r where r.message.id in :messageIds order by r.message.id asc, r.createdAt desc")
    List<MessageReport> findLatestByMessageIds(@Param("messageIds") List<Long> messageIds);

    @Modifying
    @Query("delete from MessageReport r where r.message.conversation.id = :conversationId")
    void deleteByConversationId(@Param("conversationId") Long conversationId);
}
