const LOGOUT_TIME = 10 * 60 * 1000; // Thời gian không hoạt động tối đa: 10 phút (ms)

// Lấy thông tin người dùng từ localStorage
const user = JSON.parse(localStorage.getItem("loggedInUser"));
const lastActivity = localStorage.getItem("lastActivity");

// Kiểm tra nếu có thông tin người dùng và hoạt động gần nhất
if (user && lastActivity) {
    const now = new Date().getTime();

    // Nếu chênh lệch thời gian lớn hơn LOGOUT_TIME, xóa thông tin và reload trang
    if (now - lastActivity > LOGOUT_TIME) {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("lastActivity");
        showNotification("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "index.html";
    } else {
        // Nếu chưa hết hạn, cập nhật lại thời gian hoạt động cuối
        localStorage.setItem("lastActivity", now);
        document.getElementById("userInfo").innerText = `Chào ${user.fullName}, mã nhân viên: ${user.employeeId}`;
    }
}

// Cập nhật thời gian hoạt động cuối cùng mỗi khi người dùng thực hiện hành động
const updateLastActivity = () => {
    localStorage.setItem("lastActivity", new Date().getTime());
};

// Lắng nghe sự kiện hoạt động của người dùng (di chuột, nhấn phím, cuộn)
window.addEventListener("mousemove", updateLastActivity);
window.addEventListener("keydown", updateLastActivity);
window.addEventListener("scroll", updateLastActivity);

// Xử lý logout
document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("lastActivity");
    window.location.href = "index.html";
});
// Lắng nghe sự kiện click vào "Đăng ký lịch làm"
// Hàm tạo danh sách giờ
function createHourOptions(start, end) {
    let options = '<option value="">Chọn giờ</option>';
    for (let hour = start; hour <= end; hour++) {
        options += `<option value="${hour}">${hour}:00</option>`;
    }
    return options;
}

// Mở giao diện đăng ký lịch làm
document.getElementById("openScheduleRegistration").addEventListener("click", function (e) {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a>

    // Lấy phần tử main và sidebar
    const mainContent = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");

    // Kiểm tra nếu là thiết bị di động
    const isMobile = window.innerWidth <= 768;

    // Ẩn sidebar và hiển thị main trên thiết bị di động
    if (isMobile) {
        sidebar.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }

    // Cập nhật nội dung của main
    mainContent.innerHTML = `
        ${isMobile ? '<button id="backButton" class="btn">Quay lại</button>' : ''}
        <h1> Đăng ký lịch làm</h1>
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
                                <select name="${day}-start" class="time-select">
                                    ${createHourOptions(8, 19)}
                                </select>
                            </td>
                            <td>
                                <select name="${day}-end" class="time-select">
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

    // Gắn sự kiện click cho nút "Quay lại" nếu có
    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", function () {
            mainContent.classList.add("hidden");
            sidebar.classList.remove("hidden");
        });
    }

    // Gắn sự kiện submit cho form
    document.getElementById("scheduleForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const shifts = [];
        let isValid = true;

        // Duyệt qua tất cả các cặp giờ vào và giờ ra
        document.querySelectorAll("tbody tr").forEach(row => {
            const day = row.cells[0].innerText;
            const start = row.querySelector(`[name="${day}-start"]`).value;
            const end = row.querySelector(`[name="${day}-end"]`).value;

            if (start && end && parseInt(start) >= parseInt(end)) {
                isValid = false;
                showNotification(`Giờ vào phải nhỏ hơn giờ ra cho ${day}!`);
            }

            shifts.push({
                day,
                start: start || "Không chọn",
                end: end || "Không chọn"
            });
        });

        if (isValid) {
            console.log("Lịch làm việc đã chọn:", shifts);
            alert("Lịch làm đã được gửi!");
        }
    });

    // Gắn sự kiện logout
    document.getElementById("logout").addEventListener("click", function () {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("lastActivity");
        window.location.href = "index.html";
    });
});

// Hàm tạo tùy chọn giờ
function createHourOptions(start, end) {
    let options = '<option value="">Chọn giờ</option>';
    for (let i = start; i <= end; i++) {
        options += `<option value="${i}">${i}:00</option>`;
    }
    return options;
}

// Hàm hiển thị thông báo
function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.classList.remove("hidden");
    setTimeout(() => {
        notification.classList.add("hidden");
    }, 3000);
}

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
    const userPosition = "QL" || "EMP"; // Ví dụ: "AD", "QL", hoặc "EMP"

    // Lấy danh sách các mục trong menu
    const menuItems = document.querySelectorAll("#menuList .menu-item");

    // Duyệt qua từng mục và kiểm tra điều kiện hiển thị
    menuItems.forEach(item => {
        const roles = item.getAttribute("data-role").split(","); // Lấy danh sách các role được phép
        if (!roles.includes(userPosition)) {
            item.style.display = "none"; // Ẩn mục nếu vị trí không phù hợp
        }
    });
    // Xử lý khi thay đổi kích thước cửa sổ
    window.addEventListener("resize", handleResize);

    // Gọi kiểm tra kích thước ngay khi tải trang
    handleResize();
});
function showNotification(message, type = "success", duration = 3000) {
  const notification = document.getElementById("notification");

  // Thêm hiệu ứng hiển thị
  notification.className = `notification ${type}`;
  notification.innerText = message;
  notification.style.display = "block";
  notification.style.opacity = "1";

  // Ẩn thông báo sau một thời gian
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      notification.style.display = "none";
    }, 500); // Thời gian animation
  }, duration);
}