package com.example.demo.chat;

import com.example.demo.Users.User;
import com.example.demo.config.RoleChecker;
import com.example.demo.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {
    private final ChatService chatService;
    private final RoleChecker roleChecker;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, RoleChecker roleChecker, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.roleChecker = roleChecker;
        this.messagingTemplate = messagingTemplate;
    }

    // Open chat interface: list conversations
    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Conversation>>> myConversations() {
        User me = roleChecker.getCurrentUser();
        var list = chatService.getConversations(me.getId());
        return ResponseEntity.ok(ApiResponse.success(list, "Fetched conversations"));
    }

    // Summaries with title (shop name or partner name)
    @GetMapping("/conversations/summaries")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<com.example.demo.chat.dto.ConversationSummaryDTO>>> myConversationSummaries() {
        User me = roleChecker.getCurrentUser();
        var list = chatService.getConversationSummaries(me.getId());
        return ResponseEntity.ok(ApiResponse.success(list, "Fetched conversation summaries"));
    }

    @GetMapping("/conversations/search-summaries")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<com.example.demo.chat.dto.ConversationSummaryDTO>>> searchSummaries(@RequestParam("q") String q) {
        User me = roleChecker.getCurrentUser();
        var list = chatService.searchConversationSummaries(me.getId(), q);
        return ResponseEntity.ok(ApiResponse.success(list, "Search conversation summaries"));
    }

    // Search conversation by keyword (name/email)
    @GetMapping("/conversations/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Conversation>>> search(@RequestParam("q") String q) {
        User me = roleChecker.getCurrentUser();
        var list = chatService.searchConversations(me.getId(), q);
        return ResponseEntity.ok(ApiResponse.success(list, "Search success"));
    }

    // View chat history
    @GetMapping("/conversations/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<com.example.demo.chat.dto.ChatMessageResponse>>> history(@PathVariable("id") Long conversationId) {
        var list = chatService.getMessagesDTO(conversationId);
        return ResponseEntity.ok(ApiResponse.success(list, "Fetched messages"));
    }

    // Persist a text message (in addition to STOMP)
    @PostMapping(value = "/conversations/{id}/message", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<com.example.demo.chat.dto.ChatMessageResponse>> sendText(
            @PathVariable("id") Long conversationId,
            @RequestBody Map<String, String> body) {
        try {
            String content = body.getOrDefault("content", "").trim();
            if (content.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Empty content"));
            }
            User me = roleChecker.getCurrentUser();
            Message saved = chatService.sendMessage(conversationId, me.getId(), content);
            var dto = new com.example.demo.chat.dto.ChatMessageResponse(saved.getId(), conversationId, me.getId(), saved.getContent(), saved.getImageUrl(), saved.getCreatedAt());
            try { messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, dto); } catch (Exception ignore) {}
            return ResponseEntity.ok(ApiResponse.success(dto, "Sent"));
        } catch (java.util.NoSuchElementException nf) {
            return ResponseEntity.status(404).body(ApiResponse.error("Conversation or user not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Internal server error: " + (e.getMessage()==null? e.getClass().getSimpleName(): e.getMessage())));
        }
    }

    // Create or get conversation with another user
    @PostMapping("/conversations/with/{otherUserId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Conversation>> getOrCreate(@PathVariable Integer otherUserId) {
        User me = roleChecker.getCurrentUser();
        var conv = chatService.getOrCreateConversation(me.getId(), otherUserId);
        return ResponseEntity.ok(ApiResponse.success(conv, "Conversation ready"));
    }

    // Create or get by other user's email
    @PostMapping("/conversations/with-email")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Conversation>> getOrCreateByEmail(@RequestParam("email") String email) {
        User me = roleChecker.getCurrentUser();
        var conv = chatService.getOrCreateConversationByEmail(me.getId(), email);
        return ResponseEntity.ok(ApiResponse.success(conv, "Conversation ready"));
    }

    // Customer -> Merchant from shopId
    @PostMapping("/conversations/with-merchant-by-shop/{shopId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Conversation>> withMerchantByShop(@PathVariable Integer shopId) {
        User me = roleChecker.getCurrentUser();
        var conv = chatService.getOrCreateConversationWithMerchantByShop(me.getId(), shopId);
        return ResponseEntity.ok(ApiResponse.success(conv, "Conversation ready"));
    }

    // Any role -> Merchant from orderId
    @PostMapping("/conversations/with-merchant-by-order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Conversation>> withMerchantByOrder(@PathVariable Integer orderId) {
        User me = roleChecker.getCurrentUser();
        var conv = chatService.getOrCreateConversationWithMerchantByOrder(me.getId(), orderId);
        return ResponseEntity.ok(ApiResponse.success(conv, "Conversation ready"));
    }

    // Merchant/Shipper -> Customer from orderId (or customer self -> merchant already above)
    @PostMapping("/conversations/with-customer-by-order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Conversation>> withCustomerByOrder(@PathVariable Integer orderId) {
        User me = roleChecker.getCurrentUser();
        var conv = chatService.getOrCreateConversationWithCustomerByOrder(me.getId(), orderId);
        return ResponseEntity.ok(ApiResponse.success(conv, "Conversation ready"));
    }

    // Report inappropriate message
    @PostMapping("/messages/{messageId}/report")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<com.example.demo.chat.dto.MessageReportResponse>> report(@PathVariable Long messageId, @RequestBody Map<String, String> body) {
        User me = roleChecker.getCurrentUser();
        String reason = body.getOrDefault("reason", "Inappropriate content");
        var report = chatService.reportMessage(messageId, me.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success(chatService.toReportDTO(report), "Reported"));
    }

    // Mark all messages in a conversation as read for current user
    @PostMapping("/conversations/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Integer>> markConversationRead(@PathVariable("id") Long conversationId) {
        User me = roleChecker.getCurrentUser();
        int affected = chatService.markConversationRead(conversationId, me.getId());
        return ResponseEntity.ok(ApiResponse.success(affected, "Marked read"));
    }

    // Upload image message
    @PostMapping(value = "/conversations/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<com.example.demo.chat.dto.ChatMessageResponse>> uploadImage(
            @PathVariable("id") Long conversationId,
            @RequestParam("file") MultipartFile file) {
        try {
            User me = roleChecker.getCurrentUser();
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("No file"));
            }
            // Validate content type and size (<= 10MB as per properties)
            String ct = file.getContentType();
            if (ct == null || !(ct.startsWith("image/") || ct.equalsIgnoreCase("application/octet-stream"))) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Unsupported file type"));
            }
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.status(413).body(ApiResponse.error("File too large"));
            }
            Path folder = Paths.get("uploads", "chat");
            Files.createDirectories(folder);
            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) ext = original.substring(original.lastIndexOf('.'));
            String name = UUID.randomUUID().toString().replaceAll("-", "") + ext;
            Path savedPath = folder.resolve(name);
            Files.write(savedPath, file.getBytes());
            String url = "/uploads/chat/" + name;

            Message saved = chatService.sendImageMessage(conversationId, me.getId(), url);
            var dto = new com.example.demo.chat.dto.ChatMessageResponse(saved.getId(), conversationId, me.getId(), "", url, saved.getCreatedAt());
            return ResponseEntity.ok(ApiResponse.success(dto, "Uploaded"));
        } catch (org.springframework.web.multipart.MaxUploadSizeExceededException ex) {
            return ResponseEntity.status(413).body(ApiResponse.error("File too large"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    // Admin: monitor chat logs
    @GetMapping("/admin/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<com.example.demo.chat.dto.AdminMessageLogDTO>>> adminLogs(@RequestParam(value = "q", required = false) String q) {
        var list = chatService.adminSearchMessages(q);
        return ResponseEntity.ok(ApiResponse.success(list, "Logs fetched"));
    }

    // Admin: delete conversation
    @DeleteMapping("/admin/conversations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteConversation(@PathVariable Long id) {
        chatService.deleteConversation(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", "Deleted"));
    }
}
