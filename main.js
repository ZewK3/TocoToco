const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let user;
const menuList = document.getElementById("menuList");
menuList.style.display = 'none';
const token = localStorage.getItem("authToken");
const mainHtml = document.querySelector(".main");
// Kiểm tra xem người dùng có thông tin đăng nhập không
if (loggedInUser) {
    const employeeId = loggedInUser.loginEmployeeId;
    try {
        // Gửi yêu cầu GET để lấy thông tin người dùng
        const response = await fetch(`https://zewk.tocotoco.workers.dev?action=getUser&employeeId=${employeeId}&token=${token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.ok) {
            user = await response.json();  // Lưu dữ liệu trả về vào biến user
            // Hiển thị thông tin người dùng
            document.getElementById("userInfo").innerText = `Chào ${user.fullName} - ${user.employeeId}`;
            updateMenuByRole(user.position);
            menuList.style.display = 'block';     
        } else {
            showNotification("Phiên hết hạn vui lòng đăng nhập lại", "warning", 3000);
            window.location.href = "index.html";
        }
    } catch (error) {
        showNotification("Lỗi khi gửi yêu cầu", "error", 3000);
    }
} else {
    window.location.href = "index.html";
}

// Xử lý logout
document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});

// mở giao diện thông tin cá nhân
document.getElementById("openPersonalInformation").addEventListener("click", async function (e) {
    e.preventDefault();

    const role = user.position;
    const allowedRoles = ["AD", "NV", "QL", "AM"];
    if (!allowedRoles.includes(role)) {
        showNotification("Bạn Không Có Quyền Truy Cập", "error", 3000);
        return;
    }

    const mainContent = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");
    const isMobile = window.innerWidth <= 768;
    const originalMainContentHTML = mainContent.innerHTML;

    // Ẩn sidebar trên giao diện mobile
    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }

    // Hiển thị thông tin cá nhân
    mainContent.innerHTML = `
        ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
        <h1>Thông Tin Cá Nhân</h1>
        <form id="personalInfoForm">
            <table class="personal-info-table">
                <tbody>
                    <tr>
                        <th>Mã Nhân Viên</th>
                        <td>${user.employeeId || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Họ Tên</th>
                        <td>${user.fullName || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>${user.email || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Số Điện Thoại</th>
                        <td>${user.phone || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Vị Trí</th>
                        <td>${user.position || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Cửa Hàng</th>
                        <td>${user.storeName || "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Ngày Tham Gia</th>
                        <td>${user.joinDate || "N/A"}</td>
                    </tr>
                </tbody>
            </table>
            <div class="button-container">
                <button type="button" id="editPass" class="btn">Đổi Mật Khẩu</button>
            </div>
        </form>
    `;
    
    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", function () {
            if (isMobile) {
                // Nếu là thiết bị di động
                mainContent.classList.add("hidden");
                sidebar.classList.remove("hidden");
            } else {
                // Nếu không phải thiết bị di động
                mainContent.innerHTML = originalMainContentHTML;
            }
        });
    }

    const editPassButton = document.getElementById("editPass");
    if (editPassButton) {
        editPassButton.addEventListener("click", function () {
            // Mở form đổi mật khẩu
            openChangePasswordForm();
        });
    }
});

function openChangePasswordForm() {
    const mainContent = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");
    const isMobile = window.innerWidth <= 768;
    const originalMainContentHTML = mainContent.innerHTML;

    // Ẩn sidebar trên giao diện mobile
    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }
    mainContent.innerHTML = `
        ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
        <h1>Đổi Mật Khẩu</h1>
        <form id="changePasswordForm">
            <div>
                <label for="currentPassword">Mật khẩu hiện tại:</label>
                <input type="password" id="currentPassword" name="currentPassword" required />
            </div>
            <div>
                <label for="newPassword">Mật khẩu mới:</label>
                <input type="password" id="newPassword" name="newPassword" required />
            </div>
            <div>
                <label for="confirmPassword">Xác nhận mật khẩu mới:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required />
            </div>
            <div class="button-container">
                <button type="submit" class="btn">Lưu Mật Khẩu</button>
                <button type="button" id="cancelChangePassword" class="btn">Hủy</button>
            </div>
        </form>
    `;
    const backButton = document.getElementById("backButton");
   if (backButton) {
       backButton.addEventListener("click", function () {
           if (isMobile) {
               // Nếu là thiết bị di động
               mainContent.classList.add("hidden");
               sidebar.classList.remove("hidden");
           } else {
               // Nếu không phải thiết bị di động
               mainContent.innerHTML = originalMainContentHTML;
           }
       });
   }
    // Xử lý sự kiện cho nút Hủy
    const cancelButton = document.getElementById("cancelChangePassword");
    cancelButton.addEventListener("click", function () {
        // Quay lại màn hình trước đó

        mainContent.innerHTML = originalMainContentHTML;
    });

    // Xử lý sự kiện gửi form đổi mật khẩu
    const changePasswordForm = document.getElementById("changePasswordForm");
    changePasswordForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
            showNotification("Mật khẩu xác nhận không trùng khớp", "error", 3000);
            return;
        }

        // Gọi hàm đổi mật khẩu (có thể sử dụng API hoặc logic kiểm tra mật khẩu cũ)
        changePassword(currentPassword, newPassword);
    });
}

function changePassword(currentPassword, newPassword) {
    // Logic để thay đổi mật khẩu, có thể là gọi API hoặc xử lý trực tiếp
    // Ví dụ gọi API để thay đổi mật khẩu
    fetch("/api/change-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification("Đổi mật khẩu thành công", "success", 3000);
        } else {
            showNotification(data.message || "Có lỗi xảy ra", "error", 3000);
        }
    })
    .catch(error => {
        showNotification("Có lỗi xảy ra, vui lòng thử lại", "error", 3000);
    });
}



// Mở giao diện đăng ký lịch làm
document.getElementById("openScheduleRegistration").addEventListener("click", async function (e) {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a>

    // Kiểm tra quyền
    const role = user.position;
    if (!["AD", "NV", "QL"].includes(role)) {
        showNotification("Bạn Không Có Quyền Truy Cập", "error", 3000);
        return;
    }

    const employeeId = user.employeeId; // Lấy employeeId từ thông tin người dùng
    const mainContent = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");
    const isMobile = window.innerWidth <= 768;

    const originalMainContentHTML = mainContent.innerHTML;

    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }

    try {
        // Gửi yêu cầu kiểm tra trạng thái
        const checkResponse = await fetch(`https://zewk.tocotoco.workers.dev?action=checkdk&employeeId=${employeeId}&token=${token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!checkResponse.ok) {
            throw new Error("Lỗi khi gửi yêu cầu kiểm tra trạng thái lịch làm!");
        }

        const checkResult = await checkResponse.json();

        // Nếu nhân viên đã đăng ký lịch làm
        if (checkResponse.status === 200 && checkResult.message === "Nhân viên đã đăng ký lịch làm!") {
            const schedule = checkResult.shifts || [];
            mainContent.innerHTML = `
                ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
                <h1>Bạn đã đăng ký Lịch Làm</h1>
                <form id="scheduleForm">
                    <table class="schedule-table">
                        <thead>
                            <tr>
                               <th>Ngày</th>
                               <th>Giờ vào</th>
                               <th>Giờ ra</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${schedule.map(daySchedule => {
                                const dayName = daySchedule.day === "CN" ? "Chủ Nhật" : `Thứ ${daySchedule.day.slice(1)}`;
                                const [startTime, endTime] = (daySchedule.time || "--:-- - --:--")
                                    .split("-")
                                    .map(t => t.trim() || "--:--");

                                return `
                                    <tr>
                                        <td>${dayName}</td>
                                        <td>
                                            <select name="${daySchedule.day}-start" class="time-select start-select" data-day="${daySchedule.day}">
                                                ${createHourOptions(8, 19, startTime)}
                                            </select>
                                        </td>
                                        <td>
                                            <select name="${daySchedule.day}-end" class="time-select end-select" data-day="${daySchedule.day}">
                                                ${createHourOptions(12, 23, endTime)}
                                            </select>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    <div class="button-container">
                        <button type="submit" class="btn">Gửi Lại</button>
                    </div>
                </form>
            `;
        } 
        // Nếu nhân viên chưa đăng ký lịch làm
        else if (checkResponse.status === 202) {
            mainContent.innerHTML = `
                ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
                <h1>Đăng ký lịch làm</h1>
                <form id="scheduleForm">
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Giờ vào</th>
                                <th>Giờ ra</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(day => `
                                <tr>
                                    <td>${day}</td>
                                    <td>
                                        <select name="${day}-start" class="time-select start-select" data-day="${day}">
                                            ${createHourOptions(8, 19)}
                                        </select>
                                    </td>
                                    <td>
                                        <select name="${day}-end" class="time-select end-select" data-day="${day}">
                                            ${createHourOptions(12, 23)}
                                        </select>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="button-container">
                        <button type="submit" class="btn">Gửi</button>
                    </div>
                </form>
            `;
        }
    } catch (error) {
        console.error("Lỗi kiểm tra trạng thái lịch làm:", error);
        showNotification("Lỗi khi kiểm tra trạng thái lịch làm! Vui lòng thử lại sau.", "error", 3000);
        return;
    }

// Hàm tạo danh sách giờ
function createHourOptions(start, end, selectedValue = "") {
    let options = '<option value="">Chọn giờ</option>';
    for (let hour = start; hour <= end; hour++) {
        const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        const isSelected = formattedHour === selectedValue ? 'selected' : '';
        options += `<option value="${formattedHour}" ${isSelected}>${formattedHour}</option>`;
    }
    return options;
}

    // Cập nhật nội dung của main
const backButton = document.getElementById("backButton");
if (backButton) {
    backButton.addEventListener("click", function () {
        if (isMobile) {
            // Nếu là thiết bị di động
            mainContent.classList.add("hidden");
            sidebar.classList.remove("hidden");
        } else {
            // Nếu không phải thiết bị di động
            mainContent.innerHTML = originalMainContentHTML;
        }
    });
}


    document.querySelectorAll(".start-select").forEach(select => {
        select.addEventListener("change", function () {
            const day = this.getAttribute("data-day");
            const endSelect = document.querySelector(`[name="${day}-end"]`);
            const startValue = parseInt(this.value);

            if (!isNaN(startValue)) {
                const newOptions = createHourOptions(startValue + 4, 23);
                endSelect.innerHTML = newOptions;
            } else {
                endSelect.innerHTML = createHourOptions(12, 23);
            }
        });
    });

    document.getElementById("scheduleForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const shifts = [];
        let isValid = true;

        document.querySelectorAll("tbody tr").forEach(row => {
            const day = row.cells[0].innerText;
            const formattedDay = day === "Chủ Nhật" ? "CN" : day.replace("Thứ ", "T");
            const start = row.querySelector(`[name="${day}-start"]`).value;
            const end = row.querySelector(`[name="${day}-end"]`).value;

            if ((start && !end) || (!start && end)) {
                isValid = false;
                showNotification(`Cần nhập đầy đủ cả giờ vào và giờ ra cho ${day}!`, "warning", 3000);
                return;
            }

            if (start && end && parseInt(start) >= parseInt(end)) {
                isValid = false;
                showNotification(`Giờ vào phải nhỏ hơn giờ ra cho ${day}!`, "warning", 3000);
                return;
            }

            if (start && end) {
                shifts.push({
                    day: formattedDay,
                    start: parseInt(start),
                    end: parseInt(end),
                });
            }
        });
        if (isValid) {
            try {
                const response = await fetch(`https://zewk.tocotoco.workers.dev?action=savedk&token=${token}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ employeeId, shifts }),
                });

                const result = await response.json();
                if (response.ok) {
                    showNotification("Lịch làm việc đã được lưu thành công!", "success", 3000);
                } else {
                    showNotification("Có lỗi xảy ra khi lưu lịch làm việc!", "error", 3000);
                }
            } catch (error) {
                showNotification("Lỗi khi gửi yêu cầu!", "error", 3000);
            }
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const main = document.querySelector(".main");
    const backButton = document.getElementById("backButton");
    const listItems = document.querySelectorAll(".sidebar ul li a");
    // Kiểm tra nếu đang ở chế độ màn hình nhỏ
    const isMobile = () => window.innerWidth <= 768;

    const handleResize = () => {
        if (!isMobile()) {
            // Nếu không phải trên điện thoại, đảm bảo cả sidebar và main luôn hiển thị
            sidebar.classList.remove("hidden");
            main.classList.remove("hidden");
        }
    };
    // Gắn sự kiện click vào các mục trong sidebar
    listItems.forEach(item => {
        item.addEventListener("click", (e) => {
            if (isMobile()) {
                e.preventDefault();
                sidebar.classList.add("hidden"); // Ẩn sidebar
                main.classList.remove("hidden"); // Hiện main
                backButton.classList.remove("hidden"); // Hiện nút quay lại
            }
        });
    });
    // Gắn sự kiện click vào nút quay lại
    backButton.addEventListener("click", () => {
        if (isMobile()) {
            main.classList.add("hidden"); // Ẩn main
            sidebar.classList.remove("hidden"); // Hiện sidebar
        }
    });
    // Xử lý khi thay đổi kích thước cửa sổ
    window.addEventListener("resize", handleResize);
    // Gọi kiểm tra kích thước ngay khi tải trang
    handleResize();   
});


function updateMenuByRole(userRole) {
    const menuItems = document.querySelectorAll("#menuList .menu-item"); // Giả sử các mục menu có class "menu-item"
    menuItems.forEach(item => {
        const allowedRoles = item.getAttribute("data-role")?.split(",") || []; // Lấy danh sách role được phép
        if (!allowedRoles.includes(userRole)) {
            item.style.display = "none"; // Ẩn mục menu nếu vai trò không khớp
        }
    });
}
// Hàm thông báo
function showNotification(message, type = "success", duration = 3000) {
    const notification = document.getElementById("notification");

    if (!notification) {
        console.warn("Không tìm thấy phần tử thông báo!");
        return;
    }

    // Thêm lớp CSS tương ứng với loại thông báo
    notification.classList.add(type);
    notification.classList.remove("hidden");  // Đảm bảo thông báo được hiển thị

    // Cập nhật nội dung thông báo
    notification.innerText = message;

    // Thêm hiệu ứng hiển thị
    notification.style.display = "block";
    notification.style.opacity = "1";

    // Ẩn thông báo sau một thời gian
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            notification.style.display = "none";
            notification.classList.remove(type);  // Xoá lớp kiểu thông báo
        }, 500); // Thời gian animation
    }, duration);
}
const snowflakes = document.querySelectorAll('.snowflake');
// Gán kích thước ngẫu nhiên từ 10px đến 50px
snowflakes.forEach(snowflake => {
  const randomFontSize = Math.floor(Math.random() * (50 - 10 + 1)) + 10; // Random từ 10 đến 50
  snowflake.style.fontSize = `${randomFontSize}px`;
});
function updateSidebarAndMainColor() {
    const currentMonth = new Date().getMonth(); // Lấy tháng hiện tại (0 = tháng 1, 11 = tháng 12)

    // Lấy các phần tử cần thay đổi
    const audioPlayer = document.getElementById('audioPlayer');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main');
    const showUser = document.querySelector('.showUser');
    const snowflakes = document.querySelector('.snowflakes');
    snowflakes?.classList.add('hidden');
    // Xóa tất cả các lớp trước khi thêm mới
    sidebar?.classList.remove('christmas', 'newyear');
    mainContent?.classList.remove('christmas', 'newyear');
    showUser?.classList.remove('christmas', 'newyear');

    // Xử lý các mùa lễ
    if (currentMonth === 11 ) { // Tháng 12 và tháng 1
        sidebar?.classList.add('christmas');
        mainContent?.classList.add('christmas');
        showUser?.classList.add('christmas');
        snowflakes?.classList.remove('hidden');
        
        audioPlayer.querySelector('source').src = 'Music/songmc.mp3'; // Đổi nguồn nhạc
        audioPlayer.load(); // Tải lại nhạc mới
        audioPlayer.play(); // Phát nhạc mới
    } else if (currentMonth >= 0 && currentMonth <= 2) { // Tháng 1 đến tháng 3
        sidebar?.classList.add('newyear');
        mainContent?.classList.add('newyear');
        showUser?.classList.add('newyear');
        audioPlayer.querySelector('source').src = 'Music/songny.mp3'; // Đổi nguồn nhạc
        audioPlayer.load(); // Tải lại nhạc mới
        audioPlayer.play(); // Phát nhạc mới
    } else {
        // Ẩn tuyết nếu không phải mùa lễ
    }
}
// Gọi hàm ngay khi tải trang
updateSidebarAndMainColor();

function getAuthToken() {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        const [key, value] = cookies[i].split('=');
        if (key === 'authToken') {
            return value;
        }
    }
    return null; // Nếu không tìm thấy authToken
}

const timeout = 10 * 60 * 1000;

let hiddenStartTime = null;
let timeoutId = null;

  // Theo dõi sự kiện thay đổi trạng thái hiển thị của trang
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
    // Người dùng rời khỏi trang
    hiddenStartTime = Date.now();
    // Thiết lập bộ đếm để reload sau 10 phút
    timeoutId = setTimeout(() => {
        location.reload();
    }, timeout);
      } else {
    // Người dùng quay lại trang
    if (hiddenStartTime) {
        const elapsed = Date.now() - hiddenStartTime;

        if (elapsed >= timeout) {
      location.reload(); // Reload ngay nếu thời gian rời khỏi đủ lâu
        } else {
      clearTimeout(timeoutId); // Hủy bộ đếm nếu quay lại trước 10 phút
        }
    }
    hiddenStartTime = null; // Reset trạng thái
    }
});


document.addEventListener('keydown', function(e) {
    // Chặn F12 hoặc Ctrl + Shift + I
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
    }
});

// Chặn click chuột phải
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

        const openChatButton = document.getElementById('openChatButton');
        const chatPopup = document.getElementById('chatPopup');
        const messageInput = document.getElementById('messageInput');
        const chatMessages = document.getElementById('chatMessages');
        const sendButton = document.getElementById('sendButton');

        const apiUrl = 'https://zewk.tocotoco.workers.dev/';
        let offset = 0;
        const limit = 50;
        let lastTimestamp = 0; // Lưu timestamp của tin nhắn mới nhất

        // Mở và đóng popup
        openChatButton.addEventListener('click', () => {
            if (chatPopup.style.display === 'none' || chatPopup.style.display === '') {
                chatPopup.style.display = 'flex';
            } else {
                chatPopup.style.display = 'none';
            }
        });

        // Gửi tin nhắn
        const sendMessage = async () => {
            const message = messageInput.value.trim();
            const fullName = user.fullName;
            const position = user.position;
            const employeeId = user.employeeId;
            if (!message) return;

            try {
                const response = await fetch(`${apiUrl}?action=sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ employeeId, fullName, position, message }),
                });

                if (response.ok) {
                    messageInput.value = '';
                } else {
                    console.error('Lỗi gửi tin nhắn:', await response.json());
                }
            } catch (error) {
                console.error('Lỗi gửi tin nhắn:', error);
            }
        };

        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });

        // Hiển thị tin nhắn trong khung chat
const addMessage = (msg, prepend = false) => {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper');
    if (msg.employeeId !== user.employeeId) {
         const senderElement = document.createElement('p');
        senderElement.textContent = `${msg.position}-${msg.fullName}`;
        senderElement.classList.add('message-sender');
        messageWrapper.appendChild(senderElement);
            // Gắn sự kiện click vào senderElement
        senderElement.addEventListener('click', async () => {
            try {
                // Gọi API để lấy thông tin bot
                const response = await fetch(`${apiUrl}?action=getUser&employeeId=${msg.employeeId}&token=${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const botInfo = await response.json();

                    // Tạo hoặc cập nhật div chứa thông tin bot
                    let botInfoDiv = document.getElementById('botInfoDiv');
                    if (!botInfoDiv) {
                        botInfoDiv = document.createElement('div');
                        botInfoDiv.id = 'botInfoDiv';
                        botInfoDiv.classList.add('bot-info-div');
                        document.body.appendChild(botInfoDiv); // Thêm div vào body
                    }

                    botInfoDiv.innerHTML = `
                        <table class="bot-info-table">
                            <tr>
                                <th>Tên</th>
                                <td>${botInfo.fullName}</td>
                            </tr>
                            <tr>
                                <th>ID</th>
                                <td>${botInfo.employeeId}</td>
                            </tr>
                            <tr>
                                <th>Chức vụ</th>
                                <td>${botInfo.position}</td>
                            </tr>
                            <tr>
                                <th>Email</th>
                                <td>${botInfo.email}</td>
                            </tr>
                           <tr>
                                <th>Số điện thoại</th>
                                <td>${botInfo.phone}</td>
                            </tr>
                        </table>
                    `;

                    // Hiển thị botInfoDiv
                    botInfoDiv.style.display = 'block';

                    // Đảm bảo sự kiện ẩn div khi click bên ngoài
                    const handleOutsideClick = (event) => {
                        if (!botInfoDiv.contains(event.target)) {
                            botInfoDiv.style.display = 'none';
                            document.removeEventListener('click', handleOutsideClick); // Hủy sự kiện
                        }
                    };

                    setTimeout(() => {
                        document.addEventListener('click', handleOutsideClick);
                    }, 0); // Thêm trễ để tránh sự kiện click hiện tại bị xử lý
                } else {
                    console.error('Lỗi lấy thông tin bot:', await response.text());
                }
            } catch (error) {
                console.error('Lỗi lấy thông tin bot:', error);
            }
        });

        messageWrapper.appendChild(senderElement);
    }

    // Tạo container chứa nội dung tin nhắn và nút xóa
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    // Phần tử chứa nội dung tin nhắn
    const messageContentElement = document.createElement('p');
    messageContentElement.textContent = msg.message;
    messageContentElement.classList.add(
        msg.employeeId === user.employeeId ? 'user-message' : 'bot-message'
    );
    messageContainer.appendChild(messageContentElement);

    // Nút xóa chỉ hiển thị với tin nhắn của người dùng
    if (msg.employeeId === user.employeeId) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Xóa';
        deleteButton.classList.add('delete-button');
        deleteButton.style.display = 'none';
        messageWrapper.addEventListener('mouseover', () => {
            deleteButton.style.display = 'block';
        });
        messageWrapper.addEventListener('mouseout', () => {
            deleteButton.style.display = 'none';
       });
        // Gắn sự kiện xóa tin nhắn
        deleteButton.addEventListener('click', () => {
            const confirmDelete = confirm('Bạn có chắc chắn muốn xóa tin nhắn này không?');
            if (confirmDelete) {
                // Gửi yêu cầu xóa tin nhắn lên server
                fetch(`${apiUrl}?action=deleteMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ messageId: msg.id }), // Gửi id tin nhắn
                })
                    .then((response) => {
                        if (response.ok) {
                            messageWrapper.remove(); // Xóa tin nhắn khỏi giao diện
                        } else {
                            console.error('Lỗi xóa tin nhắn:', response.statusText);
                        }
                    })
                    .catch((error) => {
                        console.error('Lỗi xóa tin nhắn:', error);
                    });
            }
        });

        messageContainer.appendChild(deleteButton);
    }

    messageWrapper.appendChild(messageContainer);

    // Phần tử chứa thời gian tin nhắn
    const timeElement = document.createElement('p');
    const time = msg.time; // Hiển thị thời gian trực tiếp
    timeElement.textContent = time;
    timeElement.classList.add('message-time');
    messageWrapper.appendChild(timeElement);

    // Thêm tin nhắn vào khung chat
    if (prepend) {
        chatMessages.prepend(messageWrapper); // Thêm tin nhắn lên đầu
    } else {
        chatMessages.appendChild(messageWrapper); // Thêm tin nhắn xuống cuối
        chatMessages.scrollTop = chatMessages.scrollHeight; // Cuộn xuống cuối
    }
};




        // Tải tin nhắn từ máy chủ
        const loadMessages = async () => {
            if (loading) return; // Ngăn việc tải lại khi đang xử lý
            loading = true;

            try {
                const url = new URL(apiUrl);
                url.searchParams.append('action', 'getMessages');
                url.searchParams.append('offset', offset);
                url.searchParams.append('limit', limit);

                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const messages = await response.json();
                    messages.forEach((msg) => addMessage(msg, true)); // Thêm tin nhắn mới lên đầu

                    offset += messages.length; // Cập nhật offset
                } else {
                    console.error('Lỗi tải tin nhắn:', await response.json());
                }
            } catch (error) {
                console.error('Lỗi tải tin nhắn:', error);
            } finally {
                loading = false; // Đặt lại trạng thái tải
            }
        };

        // Tự động tải tin nhắn mới mỗi 5 giây
let lastId = 0; // Lưu ID của tin nhắn mới nhất

setInterval(async () => {
    try {
        const url = new URL(apiUrl);
        url.searchParams.append('action', 'getMessages');
        url.searchParams.append('lastId', lastId); // Chỉ lấy tin nhắn mới hơn

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const newMessages = await response.json();
            newMessages.forEach((msg) => {
                addMessage(msg);
                lastId = Math.max(lastId, msg.id); // Cập nhật ID mới nhất
            });
        }
    } catch (error) {
        
    }
}, 4000); // 5000ms = 5 giây

document.getElementById("openGrantAccess").addEventListener("click", async function (e) {
    e.preventDefault();

    const role = user.position;
    const allowedRoles = ["AD"]; // Chỉ Admin mới có quyền truy cập
    if (!allowedRoles.includes(role)) {
        showNotification("Bạn Không Có Quyền Truy Cập", "error", 3000);
        return;
    }

    const mainContent = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");
    const isMobile = window.innerWidth <= 768;
    const originalMainContentHTML = mainContent.innerHTML;

    // Ẩn sidebar trên giao diện mobile
    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }

    // Giao diện Phân quyền
    mainContent.innerHTML = `
        ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
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

    // Lấy danh sách người dùng từ server
    try {
        const response = await fetch("/api/users"); // Thay URL bằng endpoint thực tế
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        renderUserList(users); // Hiển thị danh sách người dùng

    } catch (error) {
        console.error("Error fetching users:", error);
        document.getElementById("userList").innerHTML = `
            <tr><td colspan="4">Không thể tải danh sách người dùng. Vui lòng thử lại sau.</td></tr>
        `;
    }

    // Nút quay lại
    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", function () {
            if (isMobile) {
                // Nếu là thiết bị di động
                mainContent.classList.add("hidden");
                sidebar.classList.remove("hidden");
            } else {
                // Nếu không phải thiết bị di động
                mainContent.innerHTML = originalMainContentHTML;
            }
        });
    }

    // Hàm hiển thị danh sách người dùng
    function renderUserList(users) {
        const userList = document.getElementById("userList");
        userList.innerHTML = users.map(user => `
            <tr>
                <td>${user.employeeId}</td>
                <td>${user.fullName}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn" data-id="${user.employeeId}" onclick="changeRole('${user.employeeId}')">
                        Thay Đổi Quyền
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Hàm thay đổi quyền người dùng
    window.changeRole = async function (employeeId) {
        const newRole = prompt("Nhập quyền mới cho nhân viên:");
        if (!newRole) return;

        try {
            const response = await fetch(`/api/users/${employeeId}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            if (!response.ok) throw new Error("Failed to update role");

            showNotification("Cập nhật quyền thành công!", "success", 3000);
            location.reload(); // Tải lại danh sách sau khi cập nhật
        } catch (error) {
            console.error("Error updating role:", error);
            showNotification("Không thể cập nhật quyền. Vui lòng thử lại sau.", "error", 3000);
        }
    };
});
