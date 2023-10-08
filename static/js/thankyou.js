const urlParams = new URLSearchParams(window.location.search);
const orderNumber = urlParams.get("number");

const orderNumberElement = document.querySelector(".booking_h3_top div");
if (orderNumber) {
    orderNumberElement.textContent = `訂單編號：${orderNumber}`;
} else {
    orderNumberElement.textContent = "未找到訂單編號";
}
