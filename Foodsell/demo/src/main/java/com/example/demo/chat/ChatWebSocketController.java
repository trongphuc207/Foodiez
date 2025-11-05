package com.example.demo.chat;

import com.example.demo.chat.dto.ChatMessageDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.HashMap;
import java.util.Map;

@Controller
public class ChatWebSocketController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage")
    public void handleSendMessage(@Payload ChatMessageDTO dto) {
        if (dto == null || dto.getConversationId() == null || dto.getSenderId() == null) return;
        var saved = chatService.sendMessage(dto.getConversationId(), dto.getSenderId(), dto.getContent());
        // Broadcast lightweight payload to avoid lazy serialization issues
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", saved.getId());
        payload.put("conversationId", dto.getConversationId());
        payload.put("senderId", dto.getSenderId());
        payload.put("content", saved.getContent());
        payload.put("createdAt", saved.getCreatedAt());
        messagingTemplate.convertAndSend("/topic/conversations/" + dto.getConversationId(), payload);
    }
}
