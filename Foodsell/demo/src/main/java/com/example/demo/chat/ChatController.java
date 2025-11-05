package com.example.demo.chat;

import com.example.demo.Users.User;
import com.example.demo.config.RoleChecker;
import com.example.demo.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {
    private final ChatService chatService;
    private final RoleChecker roleChecker;

    public ChatController(ChatService chatService, RoleChecker roleChecker) {
        this.chatService = chatService;
        this.roleChecker = roleChecker;
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

    // Admin: monitor chat logs
    @GetMapping("/admin/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Message>>> adminLogs(@RequestParam(value = "q", required = false) String q) {
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
