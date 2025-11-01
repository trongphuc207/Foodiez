package com.example.demo.shipper;

import java.util.List;

public interface ShipperService {
    List<ShipperOrderDTO> getShipperOrders(String username, String status);
    ShipperDashboardDTO getShipperDashboard(String username);
    void updateOrderStatus(Integer orderId, String status, String note, String username);
    void acceptOrder(Integer orderId, String username);
    ShipperEarningsDTO getShipperEarnings(String username);
    List<DeliveryHistoryDTO> getDeliveryHistory(String username);
    ShipperProfileDTO getShipperProfile(String username);
}