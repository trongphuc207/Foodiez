package com.example.demo.Shipper;

import java.util.List;

public interface ShipperService {
    List<ShipperOrderDTO> getShipperOrders(String username, String status);
    List<ShipperOrderDTO> getAvailableOrders(String username, String keyword, String area);
    ShipperDashboardDTO getShipperDashboard(String username);
    void updateOrderStatus(Integer orderId, String status, String note, String username);
    void acceptOrder(Integer orderId, String username, String note);
    ShipperEarningsDTO getShipperEarnings(String username);
    List<DeliveryHistoryDTO> getDeliveryHistory(String username);
    ShipperProfileDTO getShipperProfile(String username);
}