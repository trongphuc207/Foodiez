import { chatAPI } from '../api/chat';

// Navigate to /chat and optionally preselect conversation via ?cid=
const goToChat = (conversationId) => {
  const url = conversationId ? `/chat?cid=${conversationId}` : '/chat';
  window.location.href = url;
};

export const openChatWithMerchantByShop = async (shopId) => {
  const res = await chatAPI.startWithMerchantByShop(shopId);
  if (res?.success) goToChat(res.data.id); else goToChat();
};

export const openChatWithMerchantByOrder = async (orderId) => {
  const res = await chatAPI.startWithMerchantByOrder(orderId);
  if (res?.success) goToChat(res.data.id); else goToChat();
};

export const openChatWithCustomerByOrder = async (orderId) => {
  const res = await chatAPI.startWithCustomerByOrder(orderId);
  if (res?.success) goToChat(res.data.id); else goToChat();
};

// Removed: openChatWithEmail
