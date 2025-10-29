package com.example.demo.admin;

public class AdminUserDTO {
    private int id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String role;
    private boolean banned;

    public AdminUserDTO() {}

    public AdminUserDTO(int id, String name, String email, String role, boolean banned, String phone, String address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.banned = banned;
        this.phone = phone;
        this.address = address;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isBanned() { return banned; }
    public void setBanned(boolean banned) { this.banned = banned; }
}
