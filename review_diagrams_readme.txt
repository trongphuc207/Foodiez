' ============================================
' REVIEW SYSTEM - PLANTUML DIAGRAMS
' ============================================
' 
' Hướng dẫn sử dụng các file PlantUML cho Review System
'
' ============================================
' FILE STRUCTURE
' ============================================
'
' 1. review_class_diagram.txt
'    - Class Diagram cho toàn bộ Review System
'    - Bao gồm: Entities, Repositories, Services, Controllers
'    - Mối quan hệ giữa các classes
'
' 2. review_sequence_customer.txt
'    - Sequence Diagrams cho Customer Use Cases
'    - UC46: Write Review
'    - UC48: Edit Review
'    - UC49: Delete Review
'    - Get Customer Reviews
'
' 3. review_sequence_merchant.txt
'    - Sequence Diagrams cho Merchant Use Cases
'    - UC50: View Customer Reviews
'    - UC51: Reply to Review
'    - Get Shop Review Statistics
'
' 4. review_sequence_admin.txt
'    - Sequence Diagrams cho Admin Use Cases
'    - UC52: View All Reviews
'    - UC53: Hide Review
'    - UC54: Resolve Review Complaint
'
' 5. review_sequence_public.txt
'    - Sequence Diagrams cho Public Endpoints
'    - Get Product Reviews
'    - Get Product Review Statistics
'    - Get Shop Reviews
'    - Get Shop Review Statistics
'    - Get Review Replies
'
' ============================================
' CÁCH SỬ DỤNG
' ============================================
'
' 1. Class Diagram:
'    - Copy toàn bộ nội dung file review_class_diagram.txt
'    - Dán vào PlantUML Online Editor hoặc IDE plugin
'    - Xem Class Diagram
'
' 2. Sequence Diagrams:
'    - Mở file tương ứng (customer/merchant/admin/public)
'    - Copy từng diagram (từ @startuml đến @enduml)
'    - Dán vào PlantUML để xem từng diagram
'    - Hoặc copy tất cả để xem nhiều diagrams cùng lúc
'
' 3. PlantUML Online Editor:
'    - URL: http://www.plantuml.com/plantuml/uml/
'    - Dán code vào editor
'    - Click "Submit" để xem diagram
'
' 4. IDE Plugins:
'    - VS Code: PlantUML extension
'    - IntelliJ IDEA: PlantUML integration plugin
'    - Eclipse: PlantUML plugin
'
' ============================================
' USE CASES MAPPING
' ============================================
'
' CUSTOMER USE CASES:
' - UC46: Write Review -> review_sequence_customer.txt
' - UC47: Rate Product -> (integrated in UC46)
' - UC48: Edit Review -> review_sequence_customer.txt
' - UC49: Delete Review -> review_sequence_customer.txt
'
' MERCHANT USE CASES:
' - UC50: View Customer Reviews -> review_sequence_merchant.txt
' - UC51: Reply to Review -> review_sequence_merchant.txt
'
' ADMIN USE CASES:
' - UC52: View All Reviews -> review_sequence_admin.txt
' - UC53: Hide Review -> review_sequence_admin.txt
' - UC54: Resolve Review Complaint -> review_sequence_admin.txt
'
' PUBLIC ENDPOINTS:
' - Get Product Reviews -> review_sequence_public.txt
' - Get Product Statistics -> review_sequence_public.txt
' - Get Shop Reviews -> review_sequence_public.txt
' - Get Shop Statistics -> review_sequence_public.txt
' - Get Review Replies -> review_sequence_public.txt
'
' ============================================
' NOTES
' ============================================
'
' - Tất cả các diagrams đều sử dụng PlantUML syntax
' - Có thể chỉnh sửa màu sắc, style trong từng diagram
' - Các sequence diagrams mô tả chi tiết luồng xử lý
' - Class diagram mô tả cấu trúc và mối quan hệ
'
' ============================================

