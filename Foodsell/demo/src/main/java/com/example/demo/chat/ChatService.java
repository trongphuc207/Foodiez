package com.example.demo.chat;

import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import com.example.demo.Orders.OrderRepository;
import com.example.demo.Orders.Order;
import com.example.demo.shops.ShopRepository;
import com.example.demo.shops.Shop;
import com.example.demo.chat.dto.ChatMessageResponse;
import com.example.demo.chat.dto.ConversationSummaryDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final MessageReportRepository reportRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ShopRepository shopRepository;

    public ChatService(ConversationRepository conversationRepository,
                       MessageRepository messageRepository,
                       MessageReportRepository reportRepository,
                       UserRepository userRepository,
                       OrderRepository orderRepository,
                       ShopRepository shopRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.shopRepository = shopRepository;
    }

    @Transactional
    public Conversation getOrCreateConversation(Integer userAId, Integer userBId) {
        return conversationRepository.findByUserPair(userAId, userBId)
                .orElseGet(() -> {
                    User a = userRepository.findById(userAId).orElseThrow();
                    User b = userRepository.findById(userBId).orElseThrow();
                    return conversationRepository.save(new Conversation(a, b));
                });
    }

    public List<Conversation> getConversations(Integer userId) {
        return conversationRepository.findAllByUser(userId);
    }

    public List<Conversation> searchConversations(Integer userId, String q) {
        return conversationRepository.searchByUserAndName(userId, q == null ? "" : q);
    }

    @Transactional
    public Message sendMessage(Long conversationId, Integer senderId, String content) {
        Conversation c = conversationRepository.findById(conversationId).orElseThrow();
        User sender = userRepository.findById(senderId).orElseThrow();
        Message m = new Message();
        m.setConversation(c);
        m.setSender(sender);
        m.setContent(content);
        Message saved = messageRepository.save(m);
        c.setUpdatedAt(saved.getCreatedAt());
        conversationRepository.save(c);
        return saved;
    }

    public List<ChatMessageResponse> getMessagesDTO(Long conversationId) {
        try {
            var list = messageRepository.projByConversationUnderscore(conversationId);
            if (list != null && !list.isEmpty()) return mapProj(list);
        } catch (Exception ignore) {}
        try {
            var list = messageRepository.projByConversationCamelAll(conversationId);
            if (list != null && !list.isEmpty()) return mapProj(list);
        } catch (Exception ignore) {}
        try {
            var list = messageRepository.projByConversationCamelMixed(conversationId);
            if (list != null && !list.isEmpty()) return mapProj(list);
        } catch (Exception ignore) {}
        try {
            var list = messageRepository.projByConversationFlatAll(conversationId);
            if (list != null && !list.isEmpty()) return mapProj(list);
        } catch (Exception ignore) {}
        // Fallback: use JPA mapping (works if schema matches default)
        var entities = messageRepository.findByConversation(conversationId);
        return entities.stream()
                .map(m -> new ChatMessageResponse(
                        m.getId(),
                        conversationId,
                        m.getSender() != null ? m.getSender().getId() : null,
                        m.getContent(),
                        m.getCreatedAt()
                ))
                .toList();
    }

    private List<ChatMessageResponse> mapProj(List<MessageProjection> list) {
        return list.stream()
                .map(p -> new ChatMessageResponse(p.getId(), p.getConversationId(), p.getSenderId(), p.getContent(), p.getCreatedAt()))
                .toList();
    }

    public List<ConversationSummaryDTO> getConversationSummaries(Integer userId) {
        var conversations = conversationRepository.findAllByUserWithUsers(userId);
        return conversations.stream().map(c -> {
            var u1 = c.getUser1();
            var u2 = c.getUser2();
            var partner = (u1 != null && u1.getId().equals(userId)) ? u2 : u1;
            String title = "Cuộc trò chuyện";
            if (partner != null) {
                // Try shop name by sellerId
                try {
                    var shopOpt = shopRepository.findBySellerId(partner.getId());
                    if (shopOpt.isPresent()) {
                        title = shopOpt.get().getName();
                    } else if (partner.getFullName() != null) {
                        title = partner.getFullName();
                    } else if (partner.getEmail() != null) {
                        title = partner.getEmail();
                    }
                } catch (Exception ignored) {}
            }
            return new ConversationSummaryDTO(c.getId(), title, c.getUpdatedAt());
        }).toList();
    }

    public List<ConversationSummaryDTO> searchConversationSummaries(Integer userId, String q) {
        var conversations = conversationRepository.searchByUserAndName(userId, q == null ? "" : q);
        return conversations.stream().map(c -> {
            var u1 = c.getUser1();
            var u2 = c.getUser2();
            var partner = (u1 != null && u1.getId().equals(userId)) ? u2 : u1;
            String title = "Cuộc trò chuyện";
            if (partner != null) {
                try {
                    var shopOpt = shopRepository.findBySellerId(partner.getId());
                    if (shopOpt.isPresent()) {
                        title = shopOpt.get().getName();
                    } else if (partner.getFullName() != null) {
                        title = partner.getFullName();
                    } else if (partner.getEmail() != null) {
                        title = partner.getEmail();
                    }
                } catch (Exception ignored) {}
            }
            return new ConversationSummaryDTO(c.getId(), title, c.getUpdatedAt());
        }).toList();
    }

    @Transactional
    public MessageReport reportMessage(Long messageId, Integer reporterId, String reason) {
        Message msg = messageRepository.findById(messageId).orElseThrow();
        User reporter = userRepository.findById(reporterId).orElseThrow();
        msg.setReported(true);
        messageRepository.save(msg);
        MessageReport r = new MessageReport();
        r.setMessage(msg);
        r.setReporter(reporter);
        r.setReason(reason);
        return reportRepository.save(r);
    }

    public com.example.demo.chat.dto.MessageReportResponse toReportDTO(MessageReport r) {
        return new com.example.demo.chat.dto.MessageReportResponse(
                r.getId(),
                r.getMessage() != null ? r.getMessage().getId() : null,
                r.getReporter() != null ? r.getReporter().getId() : null,
                r.getReason(),
                r.getCreatedAt()
        );
    }

    public List<Message> adminSearchMessages(String q) { return messageRepository.searchAll(q); }

    @Transactional
    public void deleteConversation(Long conversationId) { conversationRepository.deleteById(conversationId); }

    // Convenience: create conversation by other user's email
    @Transactional
    public Conversation getOrCreateConversationByEmail(Integer currentUserId, String otherEmail) {
      User other = userRepository.findByEmail(otherEmail).orElseThrow();
      return getOrCreateConversation(currentUserId, other.getId());
    }

    // Customer -> Merchant by shopId
    @Transactional
    public Conversation getOrCreateConversationWithMerchantByShop(Integer currentUserId, Integer shopId) {
        Shop shop = shopRepository.findById(shopId).orElseThrow();
        return getOrCreateConversation(currentUserId, shop.getSellerId());
    }

    // By orderId -> merchant
    @Transactional
    public Conversation getOrCreateConversationWithMerchantByOrder(Integer currentUserId, Integer orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        Shop shop = shopRepository.findById(order.getShopId()).orElseThrow();
        return getOrCreateConversation(currentUserId, shop.getSellerId());
    }

    // By orderId -> customer
    @Transactional
    public Conversation getOrCreateConversationWithCustomerByOrder(Integer currentUserId, Integer orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        return getOrCreateConversation(currentUserId, order.getBuyerId());
    }
}
