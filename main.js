// Constants and Initial Setup
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const menuList = document.getElementById("menuList");
const token = localStorage.getItem("authToken");
const mainContent = document.querySelector(".main");
const sidebar = document.querySelector(".sidebar");

menuList.style.display = "none";

// Utility Functions
const showNotification = (message, type = "success", duration = 3000) => {
    const notification = document.getElementById("notification");
    if (!notification) return console.warn("Notification element not found!");

    notification.classList.add(type);
    notification.classList.remove("hidden");
    notification.textContent = message;
    notification.style.cssText = "display: block; opacity: 1;";

    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            notification.style.display = "none";
            notification.classList.remove(type);
        }, 500);
    }, duration);
};

const isMobile = () => window.innerWidth <= 768;

// Security Features
const setupSecurity = () => {
    document.addEventListener("keydown", (e) => {
        if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
            e.preventDefault();
        }
    });

    document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
};

// Authentication Manager
class AuthManager {
    async checkAuthentication() {
        if (!loggedInUser) {
            window.location.href = "index.html";
            return null;
        }

        try {
            const response = await fetch(
                `https://zewk.tocotoco.workers.dev?action=getUser&employeeId=${loggedInUser.loginEmployeeId}&token=${token}`,
                { headers: { "Content-Type": "application/json" } }
            );

            if (!response.ok) throw new Error("Invalid session");

            const user = await response.json();
            document.getElementById("userInfo").textContent = `Chào ${user.fullName} - ${user.employeeId}`;
            this.updateMenuByRole(user.position);
            this.updateSubmenuByRole(user.position); // Kiểm tra submenu
            menuList.style.display = "block";
            return user;
        } catch (error) {
            showNotification("Phiên hết hạn, vui lòng đăng nhập lại", "warning", 3000);
            window.location.href = "index.html";
            return null;
        }
    }

    updateMenuByRole(userRole) {
        document.querySelectorAll("#menuList .menu-item").forEach(item => {
            const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
            item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
        });
    }

    updateSubmenuByRole(userRole) {
        // Kiểm tra submenu cho "Lịch Làm"
        const scheduleItem = document.querySelector("#openSchedule").closest(".menu-item");
        if (scheduleItem) {
            const submenu = scheduleItem.querySelector(".submenu");
            if (submenu) {
                submenu.querySelectorAll(".submenu-item").forEach(item => {
                    const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
                    item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
                });
            }
        }

        // Kiểm tra submenu cho "Xử Lý Yêu Cầu"
        const taskProcessingItem = document.querySelector("#openTaskProcessing").closest(".menu-item");
        if (taskProcessingItem) {
            const submenu = taskProcessingItem.querySelector(".submenu");
            if (submenu) {
                submenu.querySelectorAll(".submenu-item").forEach(item => {
                    const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
                    item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
                });
            }
        }
    }

    setupLogout() {
        document.getElementById("logout").addEventListener("click", () => {
            localStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        });
    }
}

// Personal Info Manager
class PersonalInfoManager {
    constructor(user) {
        this.user = user;
        this.allowedRoles = ["AD", "NV", "QL", "AM"];
    }

    renderPersonalInfo() {
        document.getElementById("openPersonalInformation").addEventListener("click", (e) => {
            e.preventDefault();
            if (!this.allowedRoles.includes(this.user.position)) {
                return showNotification("Bạn không có quyền truy cập", "error", 3000);
            }

            const originalContent = mainContent.innerHTML;
            if (isMobile()) {
                sidebar.classList.add("hidden");
                mainContent.classList.remove("hidden");
            }

            mainContent.innerHTML = `
                ${isMobile() ? '<button id="backButton" class="btn">Quay lại</button>' : ""}
                <h1>Thông Tin Cá Nhân</h1>
                <form id="personalInfoForm">
                    <table class="personal-info-table">
                        <tbody>
                            ${["Mã Nhân Viên:employeeId", "Họ Tên:fullName", "Email:email",
                               "Số Điện Thoại:phone", "Vị Trí:position", "Cửa Hàng:storeName",
                               "Ngày Tham Gia:joinDate"].map(field => {
                                const [label, key] = field.split(":");
                                return `<tr><th>${label}</th><td>${this.user[key] || "N/A"}</td></tr>`;
                            }).join("")}
                        </tbody>
                    </table>
                    <div class="button-container">
                        <button type="button" id="editPass" class="btn">Đổi Mật Khẩu</button>
                    </div>
                </form>
            `;

            this.setupBackButton(originalContent);
            document.getElementById("editPass").addEventListener("click", () =>
                this.renderPasswordForm(originalContent));
        });
    }

    renderPasswordForm(originalContent) {
        if (isMobile()) {
            sidebar.classList.add("hidden");
            mainContent.classList.remove("hidden");
        }

        mainContent.innerHTML = `
            ${isMobile() ? '<button id="backButton" class="btn">Quay lại</button>' : ""}
            <h1>Đổi Mật Khẩu</h1>
            <form id="changePasswordForm">
                <div><label>Mật khẩu hiện tại:</label><input type="password" id="currentPassword" required /></div>
                <div><label>Mật khẩu mới:</label><input type="password" id="newPassword" required /></div>
                <div><label>Xác nhận mật khẩu:</label><input type="password" id="confirmPassword" required /></div>
                <div class="button-container">
                    <button type="submit" class="btn">Lưu</button>
                    <button type="button" id="cancelChangePassword" class="btn">Hủy</button>
                </div>
            </form>
        `;

        this.setupBackButton(originalContent);
        document.getElementById("cancelChangePassword").addEventListener("click", () => {
            mainContent.innerHTML = originalContent;
        });

        document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const [current, newPass, confirm] = ["currentPassword", "newPassword", "confirmPassword"]
                .map(id => document.getElementById(id).value);

            if (newPass !== confirm) {
                return showNotification("Mật khẩu xác nhận không khớp", "error", 3000);
            }

            try {
                const response = await fetch("/api/change-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentPassword: current, newPassword: newPass })
                });
                const data = await response.json();
                showNotification(data.success ? "Đổi mật khẩu thành công" : (data.message || "Có lỗi xảy ra"),
                    data.success ? "success" : "error", 3000);
            } catch (error) {
                showNotification("Có lỗi xảy ra, vui lòng thử lại", "error", 3000);
            }
        });
    }

    setupBackButton(originalContent) {
        const backButton = document.getElementById("backButton");
        if (backButton) {
            backButton.addEventListener("click", () => {
                if (isMobile()) {
                    mainContent.classList.add("hidden");
                    sidebar.classList.remove("hidden");
                } else {
                    mainContent.innerHTML = originalContent;
                }
            });
        }
    }
}

// Schedule Manager
class ScheduleManager {
    constructor(user) {
        this.user = user;
        this.days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
    }

    createHourOptions(start, end, selected = "") {
        return `<option value="">Chọn giờ</option>` +
            Array.from({ length: end - start + 1 }, (_, i) => start + i)
                .map(h => {
                    const time = `${h < 10 ? "0" : ""}${h}:00`;
                    return `<option value="${time}" ${time === selected ? "selected" : ""}>${time}</option>`;
                }).join("");
    }

    renderScheduleRegistration() {
        document.getElementById("openScheduleRegistration").addEventListener("click", async (e) => {
            e.preventDefault();
            if (!["AD", "NV", "QL"].includes(this.user.position)) {
                return showNotification("Bạn không có quyền truy cập", "error", 3000);
            }

            const originalContent = mainContent.innerHTML;
            if (isMobile()) {
                sidebar.classList.add("hidden");
                mainContent.classList.remove("hidden");
            }

            try {
                const response = await fetch(
                    `https://zewk.tocotoco.workers.dev?action=checkdk&employeeId=${this.user.employeeId}&token=${token}`,
                    { headers: { "Content-Type": "application/json" } }
                );

                if (!response.ok) throw new Error("Failed to check schedule");

                const result = await response.json();
                let scheduleHtml;

                if (response.status === 200 && result.message === "Nhân viên đã đăng ký lịch làm!") {
                    scheduleHtml = result.shifts.map(day => {
                        const [start, end] = (day.time || "--:-- - --:--").split("-").map(t => t.trim());
                        return `
                            <tr>
                                <td>${day.day === "CN" ? "Chủ Nhật" : `Thứ ${day.day.slice(1)}`}</td>
                                <td><select name="${day.day}-start" class="time-select start-select" data-day="${day.day}">
                                    ${this.createHourOptions(8, 19, start)}
                                </select></td>
                                <td><select name="${day.day}-end" class="time-select end-select" data-day="${day.day}">
                                    ${this.createHourOptions(12, 23, end)}
                                </select></td>
                            </tr>
                        `;
                    }).join("");
                } else {
                    scheduleHtml = this.days.map(day => `
                        <tr>
                            <td>${day}</td>
                            <td><select name="${day}-start" class="time-select start-select" data-day="${day}">
                                ${this.createHourOptions(8, 19)}
                            </select></td>
                            <td><select name="${day}-end" class="time-select end-select" data-day="${day}">
                                ${this.createHourOptions(12, 23)}
                            </select></td>
                        </tr>
                    `).join("");
                }

                mainContent.innerHTML = `
                    ${isMobile() ? '<button id="backButton" class="btn">Quay lại</button>' : ""}
                    <h1>${response.status === 200 ? "Bạn đã đăng ký Lịch Làm" : "Đăng ký lịch làm"}</h1>
                    <form id="scheduleForm">
                        <table class="schedule-table">
                            <thead><tr><th>Ngày</th><th>Giờ vào</th><th>Giờ ra</th></tr></thead>
                            <tbody>${scheduleHtml}</tbody>
                        </table>
                        <div class="button-container">
                            <button type="submit" class="btn">${response.status === 200 ? "Gửi Lại" : "Gửi"}</button>
                        </div>
                    </form>
                `;

                this.setupBackButton(originalContent);
                this.setupScheduleForm();
            } catch (error) {
                showNotification("Lỗi khi kiểm tra trạng thái lịch làm!", "error", 3000);
            }
        });
    }

    setupBackButton(originalContent) {
        const backButton = document.getElementById("backButton");
        if (backButton) {
            backButton.addEventListener("click", () => {
                if (isMobile()) {
                    mainContent.classList.add("hidden");
                    sidebar.classList.remove("hidden");
                } else {
                    mainContent.innerHTML = originalContent;
                }
            });
        }
    }

    setupScheduleForm() {
        document.querySelectorAll(".start-select").forEach(select => {
            select.addEventListener("change", function () {
                const day = this.getAttribute("data-day");
                const endSelect = document.querySelector(`[name="${day}-end"]`);
                const startValue = parseInt(this.value);
                endSelect.innerHTML = this.createHourOptions(
                    isNaN(startValue) ? 12 : Math.max(startValue + 4, 12),
                    23
                );
            }.bind(this));
        });

        document.getElementById("scheduleForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const shifts = [];
            let isValid = true;

            document.querySelectorAll("tbody tr").forEach(row => {
                const day = row.cells[0].textContent;
                const formattedDay = day === "Chủ Nhật" ? "CN" : `T${this.days.indexOf(day) + 2}`;
                const start = row.querySelector(`[name="${day}-start"]`).value;
                const end = row.querySelector(`[name="${day}-end"]`).value;

                if ((start && !end) || (!start && end)) {
                    isValid = false;
                    showNotification(`Cần nhập đầy đủ giờ cho ${day}!`, "warning", 3000);
                    return;
                }

                if (start && end && parseInt(start) >= parseInt(end)) {
                    isValid = false;
                    showNotification(`Giờ vào phải nhỏ hơn giờ ra cho ${day}!`, "warning", 3000);
                    return;
                }

                if (start && end) {
                    shifts.push({ day: formattedDay, start: parseInt(start), end: parseInt(end) });
                }
            });

            if (isValid) {
                try {
                    const response = await fetch(
                        `https://zewk.tocotoco.workers.dev?action=savedk&token=${token}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ employeeId: this.user.employeeId, shifts })
                        }
                    );
                    showNotification(
                        response.ok ? "Lịch làm việc đã được lưu thành công!" : "Có lỗi khi lưu lịch!",
                        response.ok ? "success" : "error",
                        3000
                    );
                } catch (error) {
                    showNotification("Lỗi khi gửi yêu cầu!", "error", 3000);
                }
            }
        });
    }
}

// Chat Manager
// ... (giữ nguyên các phần khác của mã)

class ChatManager {
    constructor(user) {
        this.user = user;
        this.apiUrl = "https://zewk.tocotoco.workers.dev/";
        this.offset = 0;
        this.limit = 50;
        this.lastId = 0;
        this.loading = false;

        this.openChatButton = document.getElementById("openChatButton");
        this.chatPopup = document.getElementById("chatPopup");
        this.messageInput = document.getElementById("messageInput");
        this.chatMessages = document.getElementById("chatMessages");
        this.sendButton = document.getElementById("sendButton");

        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.startMessagePolling();
    }

    setupEventListeners() {
        this.openChatButton.addEventListener("click", () => this.toggleChatPopup());
        this.sendButton.addEventListener("click", () => this.sendMessage());
        this.messageInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.sendMessage();
        });
    }

    toggleChatPopup() {
        const isHidden = this.chatPopup.style.display === "none" || this.chatPopup.style.display === "";
        this.chatPopup.style.display = isHidden ? "flex" : "none";
        if (isHidden) this.loadInitialMessages();
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        const payload = {
            employeeId: this.user.employeeId,
            fullName: this.user.fullName,
            position: this.user.position,
            message
        };

        try {
            const response = await fetch(`${this.apiUrl}?action=sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                this.messageInput.value = "";
            } else {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error("Send message error:", error);
            showNotification("Không thể gửi tin nhắn", "error", 3000);
        }
    }

    createMessageElement(msg, prepend = false) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("message-wrapper");

        if (msg.employeeId !== this.user.employeeId) {
            const sender = document.createElement("p");
            sender.textContent = `${msg.position}-${msg.fullName}`;
            sender.classList.add("message-sender");
            this.addSenderClickHandler(sender, msg.employeeId);
            wrapper.appendChild(sender);
        }

        const container = document.createElement("div");
        container.classList.add("message-container");

        const content = document.createElement("p");
        content.textContent = msg.message;
        content.classList.add(msg.employeeId === this.user.employeeId ? "user-message" : "bot-message");
        container.appendChild(content);

        if (msg.employeeId === this.user.employeeId) {
            const deleteBtn = this.createDeleteButton(msg.id, wrapper, msg.time);
            container.appendChild(deleteBtn);
            this.addHoverEffects(wrapper, deleteBtn, msg.time);
        }

        wrapper.appendChild(container);

        const time = document.createElement("p");
        time.textContent = msg.time;
        time.classList.add("message-time");
        wrapper.appendChild(time);

        this.chatMessages[prepend ? "prepend" : "appendChild"](wrapper);
        if (!prepend) this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    createDeleteButton(messageId, wrapper, messageTime) {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Xóa";
        deleteBtn.classList.add("delete-button");
        deleteBtn.style.display = "none";

        deleteBtn.addEventListener("click", async () => {
            if (!confirm("Bạn có chắc chắn muốn xóa tin nhắn này không?")) return;

            try {
                const response = await fetch(`${this.apiUrl}?action=deleteMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messageId })
                });

                if (response.ok) {
                    wrapper.remove();
                } else {
                    throw new Error("Delete failed");
                }
            } catch (error) {
                console.error("Delete message error:", error);
                showNotification("Không thể xóa tin nhắn", "error", 3000);
            }
        });

        return deleteBtn;
    }

addHoverEffects(wrapper, deleteBtn, messageTime) {
    wrapper.addEventListener("mouseover", () => {
        // Lấy thời gian hiện tại dưới dạng đối tượng Date
        const currentTime = new Date();
        
        // Định dạng currentTime thành "dd-mm-yyyy hh:mm" nếu cần hiển thị
        const formattedCurrentTime = `${String(currentTime.getDate()).padStart(2, '0')}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${currentTime.getFullYear()} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
        
        // Parse messageTime từ định dạng "dd-mm-yyyy hh:mm"
        const [datePart, timePart] = messageTime.split(' ');
        const [day, month, year] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        const messageDate = new Date(year, month - 1, day, hours, minutes); // month - 1 vì getMonth() đếm từ 0
        
        const timeDiff = (currentTime - messageDate) / 1000; // Chuyển sang giây

        if (timeDiff <= 600) { // 10 phút = 600 giây
            deleteBtn.style.display = "block";
        } else {
            deleteBtn.style.display = "none";
        }
    });

    wrapper.addEventListener("mouseout", () => {
        deleteBtn.style.display = "none";
    });
}

    async addSenderClickHandler(sender, employeeId) {
        sender.addEventListener("click", async () => {
            try {
                const response = await fetch(
                    `${this.apiUrl}?action=getUser&employeeId=${employeeId}&token=${token}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                    }
                );

                if (!response.ok) throw new Error("Failed to fetch user info");
                const userInfo = await response.json();
                this.showUserInfoPopup(userInfo);
            } catch (error) {
                console.error("Fetch user info error:", error);
                showNotification("Không thể tải thông tin người dùng", "error", 3000);
            }
        });
    }

    showUserInfoPopup(userInfo) {
        let infoDiv = document.getElementById("botInfoDiv");
        if (!infoDiv) {
            infoDiv = document.createElement("div");
            infoDiv.id = "botInfoDiv";
            infoDiv.classList.add("bot-info-div");
            document.body.appendChild(infoDiv);
        }

        infoDiv.innerHTML = `
            <table class="bot-info-table">
                ${["Tên:fullName", "ID:employeeId", "Chức vụ:position", "Email:email", "Số điện thoại:phone"]
                    .map(field => {
                        const [label, key] = field.split(":");
                        return `<tr><th>${label}</th><td>${userInfo[key] || "N/A"}</td></tr>`;
                    }).join("")}
            </table>
        `;

        infoDiv.style.display = "block";

        const hidePopup = (e) => {
            if (!infoDiv.contains(e.target)) {
                infoDiv.style.display = "none";
                document.removeEventListener("click", hidePopup);
            }
        };

        setTimeout(() => document.addEventListener("click", hidePopup), 0);
    }

    // async loadInitialMessages() {
    //     if (this.loading) return;
    //     this.loading = true;

    //     try {
    //         const url = new URL(this.apiUrl);
    //         url.searchParams.append("action", "getMessages");
    //         url.searchParams.append("offset", this.offset);
    //         url.searchParams.append("limit", this.limit);

    //         const response = await fetch(url, {
    //             method: "GET",
    //             headers: { "Content-Type": "application/json" }
    //         });

    //         if (response.ok) {
    //             const messages = await response.json();
    //             messages.forEach(msg => this.createMessageElement(msg, true));
    //             this.offset += messages.length;
    //         }
    //     } catch (error) {
    //         console.error("Load messages error:", error);
    //         showNotification("Không thể tải tin nhắn", "error", 3000);
    //     } finally {
    //         this.loading = false;
    //     }
    // }

    startMessagePolling() {
        setInterval(async () => {
            try {
                const url = new URL(this.apiUrl);
                url.searchParams.append("action", "getMessages");
                url.searchParams.append("lastId", this.lastId);

                const response = await fetch(url, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                if (response.ok) {
                    const newMessages = await response.json();
                    newMessages.forEach(msg => {
                        this.createMessageElement(msg);
                        this.lastId = Math.max(this.lastId, msg.id);
                    });
                }
            } catch (error) {
                
            }
        }, 3000);
    }
}

// ... (giữ nguyên các class khác: GrantAccessManager, TaskProcessingManager, v.v.)

// Grant Access Manager
class GrantAccessManager {
    constructor(user) {
        this.user = user;
    }

    setupEventListener() {
        document.getElementById("openGrantAccess").addEventListener("click", (e) => {
            e.preventDefault();
            this.renderGrantAccess();
        });
    }

    async renderGrantAccess() {
        if (!["AD"].includes(this.user.position)) {
            showNotification("Bạn không có quyền truy cập", "error", 3000);
            return;
        }

        const originalContent = mainContent.innerHTML;
        if (isMobile()) {
            sidebar.classList.add("hidden");
            mainContent.classList.remove("hidden");
        }

        mainContent.innerHTML = `
            ${isMobile() ? '<button id="backButton" class="btn">Quay lại</button>' : ""}
            <h1>Phân Quyền Người Dùng</h1>
            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="Tìm kiếm theo tên hoặc mã nhân viên..." />
            </div>
            <table class="user-table">
                <thead>
                    <tr>
                        <th>Mã Nhân Viên</th>
                        <th>Họ Tên</th>
                        <th>Quyền Hiện Tại</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody id="userList">
                    <tr><td colspan="4">Đang tải danh sách người dùng...</td></tr>
                </tbody>
            </table>
        `;

        this.setupBackButton(originalContent);
        await this.loadUsers();
    }

    setupBackButton(originalContent) {
        const backButton = document.getElementById("backButton");
        if (backButton) {
            backButton.addEventListener("click", () => {
                if (isMobile()) {
                    mainContent.classList.add("hidden");
                    sidebar.classList.remove("hidden");
                } else {
                    mainContent.innerHTML = originalContent;
                }
            });
        }
    }

    async loadUsers() {
        try {
            const response = await fetch(`https://zewk.tocotoco.workers.dev?action=getUsers&token=${token}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const contentType = response.headers.get("Content-Type");
            if (!contentType?.includes("application/json")) {
                const text = await response.text();
                throw new Error(`Expected JSON, got ${contentType}: ${text.slice(0, 100)}...`);
            }

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            const users = await response.json();
            this.renderUserList(users);
        } catch (error) {
            console.error("Fetch users error:", error);
            document.getElementById("userList").innerHTML = `<tr><td colspan="4">Lỗi: ${error.message}</td></tr>`;
            showNotification(`Lỗi tải danh sách người dùng: ${error.message}`, "error", 3000);
        }
    }

    renderUserList(users) {
        const userList = document.getElementById("userList");
        userList.innerHTML = users.map(user => `
            <tr>
                <td>${user.employeeId}</td>
                <td>${user.fullName}</td>
                <td>${user.position}</td>
                <td>
                    <button class="btn" data-id="${user.employeeId}" onclick="grantAccessManager.changeRole('${user.employeeId}')">
                        Thay Đổi Quyền
                    </button>
                </td>
            </tr>
        `).join("");
    }

    async changeRole(employeeId) {
        const newRole = prompt("Nhập quyền mới cho nhân viên:");
        if (!newRole) return;

        try {
            const response = await fetch(`/api/users/${employeeId}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                showNotification("Cập nhật quyền thành công!", "success", 3000);
                location.reload();
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("Update role error:", error);
            showNotification("Không thể cập nhật quyền", "error", 3000);
        }
    }
}

// Task Processing Manager
class TaskProcessingManager {
    constructor(user) {
        this.user = user;
        this.allowedRoles = ["AD"];
    }

    renderTaskProcessing() {
        document.getElementById("openTaskProcessing").addEventListener("click", (e) => {
            e.preventDefault();
            if (!this.allowedRoles.includes(this.user.position)) {
                return showNotification("Bạn không có quyền truy cập", "error", 3000);
            }

            const originalContent = mainContent.innerHTML;
            if (isMobile()) {
                sidebar.classList.add("hidden");
                mainContent.classList.remove("hidden");
            }

            mainContent.innerHTML = `
                ${isMobile() ? '<button id="backButton" class="btn">Quay lại</button>' : ""}
                <h1>Xử Lý Công Việc</h1>
                <div class="task-tabs">
                    <button class="task-tab active" data-tab="nhan-su">Nhân Sự</button>
                    <button class="task-tab" data-tab="cua-hang">Cửa Hàng</button>
                    <button class="task-tab" data-tab="tai-chinh">Tài Chính</button>
                    <button class="task-tab" data-tab="xet-duyet">Xét Duyệt</button>
                </div>
                <div class="task-content">
                    <div class="tab-panel active" id="nhan-su-panel">
                        <h2>Quản lý Nhân Sự</h2>
                        <p>Chức năng quản lý thông tin nhân viên, phân quyền, và lịch làm việc.</p>
                    </div>
                    <div class="tab-panel" id="cua-hang-panel">
                        <h2>Quản lý Cửa Hàng</h2>
                        <p>Chức năng quản lý thông tin cửa hàng, doanh thu, và tồn kho.</p>
                    </div>
                    <div class="tab-panel" id="tai-chinh-panel">
                        <h2>Quản lý Tài Chính</h2>
                        <p>Chức năng theo dõi giao dịch, báo cáo tài chính, và chi phí.</p>
                    </div>
                    <div class="tab-panel" id="xet-duyet-panel">
                        <h2>Xét Duyệt</h2>
                        <p>Chức năng phê duyệt lịch làm việc, yêu cầu tài chính, và báo cáo.</p>
                    </div>
                </div>
            `;

            this.setupBackButton(originalContent);
            this.setupTabNavigation();
        });
    }

    setupBackButton(originalContent) {
        const backButton = document.getElementById("backButton");
        if (backButton) {
            backButton.addEventListener("click", () => {
                if (isMobile()) {
                    mainContent.classList.add("hidden");
                    sidebar.classList.remove("hidden");
                } else {
                    mainContent.innerHTML = originalContent;
                }
            });
        }
    }

    setupTabNavigation() {
        document.querySelectorAll(".task-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                document.querySelectorAll(".task-tab").forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
                tab.classList.add("active");
                document.getElementById(`${tab.getAttribute("data-tab")}-panel`).classList.add("active");
            });
        });
    }
}

// Menu Manager
const updateMenuByRole = (userRole) => {
    document.querySelectorAll("#menuList .menu-item").forEach(item => {
        const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
        item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
    });
};

// Initialization
(async () => {
    setupSecurity();

    const authManager = new AuthManager();
    const user = await authManager.checkAuthentication();

    if (user) {
        authManager.setupLogout();

        const personalInfoManager = new PersonalInfoManager(user);
        personalInfoManager.renderPersonalInfo();

        const scheduleManager = new ScheduleManager(user);
        scheduleManager.renderScheduleRegistration();

        const chatManager = new ChatManager(user);

        const grantAccessManager = new GrantAccessManager(user);
        grantAccessManager.setupEventListener();

        const taskProcessingManager = new TaskProcessingManager(user);
        taskProcessingManager.renderTaskProcessing();

        window.grantAccessManager = grantAccessManager;
    }
})();

function updateSidebarAndMainColor() {
    const currentMonth = new Date().getMonth(); // Lấy tháng hiện tại (0 = tháng 1, 11 = tháng 12)

    // Lấy các phần tử cần thay đổi
    const audioPlayer = document.getElementById("audioPlayer");
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main");
    const showUser = document.querySelector(".showUser");
    const snowflakes = document.querySelector(".snowflakes");
    snowflakes?.classList.add("hidden");
    // Xóa tất cả các lớp trước khi thêm mới
    sidebar?.classList.remove("christmas", "newyear");
    mainContent?.classList.remove("christmas", "newyear");
    showUser?.classList.remove("christmas", "newyear");

    // Xử lý các mùa lễ
    if (currentMonth === 11) { // Tháng 12
        sidebar?.classList.add("christmas");
        mainContent?.classList.add("christmas");
        showUser?.classList.add("christmas");
        snowflakes?.classList.remove("hidden");

        audioPlayer.querySelector("source").src = "Music/songmc.mp3"; // Đổi nguồn nhạc
        audioPlayer.load(); // Tải lại nhạc mới
        audioPlayer.play(); // Phát nhạc mới
    } else if (currentMonth >= 0 && currentMonth <= 2) { // Tháng 1 đến tháng 3
        sidebar?.classList.add("newyear");
        mainContent?.classList.add("newyear");
        showUser?.classList.add("newyear");
        audioPlayer.querySelector("source").src = "Music/songny.mp3"; // Đổi nguồn nhạc
        audioPlayer.load(); // Tải lại nhạc mới
        audioPlayer.play(); // Phát nhạc mới
    } else {
        // Ẩn tuyết nếu không phải mùa lễ
    }
}
// Gọi hàm ngay khi tải trang
updateSidebarAndMainColor();
