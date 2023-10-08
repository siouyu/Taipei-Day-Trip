const payCheckBtn = document.getElementById("pay_check_btn");
const bookingDelete = document.getElementById("booking_delete");
const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactNumber = document.getElementById("contactNumber");
const checkError = document.getElementById("checkError");
let userName;
let isOrder = false;
let booking;

document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/user/auth", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken}`,
            "Content-Type": "application/json"
        }
    })
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Authentication failed");
        }
        return response.json();
    })
    .then(function (data) {
        if (data.id !== null) {
            logOut.style.display = "block";
            logIn.style.display = "none";
            logOut.addEventListener("click", function () {
                localStorage.removeItem("accessToken");
                location.reload();
            });
        } else {
            window.location.href = "/"; 
        }
    })
    .catch(function (error) {
        console.error("Error:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/user/auth", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken}`,
            "Content-Type": "application/json"
        }
    })
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Authentication failed");
        }
        return response.json();
    })
    .then(function (data) {
        console.log(data.name)
        userName = document.getElementById("userName");
        userName.textContent = data.name;
    })
    .catch(function (error) {
        console.error("Error:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/booking", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken}`,
            "Content-Type": "application/json"
        }
    })
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Authentication failed");
        }
        return response.json();
    })
    .then(function (data) {
        console.log(data)
    })
    .catch(function (error) {
        console.error("Error:", error);
    });
});


bookingDelete.addEventListener("click",function(){
    // console.log("DELETE!!!!!!")
    fetch("/api/booking", {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${getToken}`,
            "Content-Type": "application/json"
        },
    })
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Authentication failed");
        }
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        window.location.reload();
    })
    .catch(function (error) {
        console.error("Error:", error);
    });
});

document.addEventListener("DOMContentLoaded", function() {
    fetch("/api/booking", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken}`,
            "Content-Type": "application/json"
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Failed to fetch bookings");
        }
        return response.json();
    })
    .then(function(data) {
        booking = data.data;
        if(booking.length === 0){
            const bookingContent = document.getElementById("bookingEmpty");
            const bookingFooter = document.getElementById("footer")
            bookingContent.innerHTML = "";
            bookingFooter.innerHTML = "";
            const bookingEmptyHTML = `
            <div>目前沒有任何待預定的行程</div>
            <div class="footer_empty">
                <div class="footer_empty_text">COPYRIGHT © 台北一日遊</div>
            </div> `;
            bookingContent.insertAdjacentHTML("beforeend", bookingEmptyHTML);
        }else{
            const bookingInfo = document.getElementById("bookingInfo");
            const bookingHTML = `
                    <img src="${booking.data.attraction.image}" class="booking_img"/>
                    <div>
                        <h4 class="booking_h4">台北一日遊：${booking.data.attraction.name}</h4>
                        <div class="booking_info">日期：${booking.data.date}</div>
                        <div class="booking_info">時間：${booking.data.time}</div>
                        <div class="booking_info">費用：${booking.data.price}</div>
                        <div class="booking_info">地點：${booking.data.attraction.address}</div>
                    </div>
            `;
            bookingInfo.insertAdjacentHTML("beforeend", bookingHTML);
            const bookingPrice = document.getElementById("pay_check_price");
            const priceHTML = `
            <div id="pay_check_price">總價：${booking.data.price}</div>
            `
            bookingPrice.insertAdjacentHTML("beforeend",priceHTML)
        }
    })
    .catch(function(error) {
        console.error("Error:", error);
    });
});


// 檢查 email 格式
document.addEventListener("DOMContentLoaded",function() {
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("emailError");
    emailInput.addEventListener("input", function(event){
        const inputValue = event.target.value;
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailPattern.test(inputValue)){
            emailError.textContent = "Email 格式錯誤";
            emailInput.classList.add("error");
        } else {
            emailError.textContent = "";
            emailInput.classList.remove("error");
        }
    });
});

// 檢查手機號碼格式
document.addEventListener("DOMContentLoaded", function () {
    const phoneNumber = document.getElementById("phoneNumber");
    phoneNumber.addEventListener("input", function (event) {
        const inputValue = event.target.value.replace(/\D/g, "").slice(0, 10);
        if (/[^0-9]/.test(inputValue)) {
            event.preventDefault();
        } else {
            event.target.value = inputValue;
        }
        event.target.value = inputValue;
    });
});

// 檢查信用卡號碼
// document.addEventListener("DOMContentLoaded", function(){
//     const creditNumberInput = document.getElementById("creditNumber");
//     creditNumberInput.addEventListener("input",function(event){
//         const inputValue = event.target.value.replace(/\D/g, "");
//         const formatValue = inputValue.match(/.{1,4}/g);
//         event.target.value = formatValue ? formatValue.join(" "): "";
//     });
// });

// // 檢查信用卡日期
// document.addEventListener("DOMContentLoaded",function(){
//     const creditExpireInput = document.getElementById("creditExpire");
//     const expireError = document.getElementById("expireError");
//     creditExpireInput.addEventListener("input", function(event){
//         const inputValue = event.target.value.replace(/\D/g, "");

//         const month = inputValue.slice(0, 2);
//         const year = inputValue.slice(2, 4);

//         const validMonth = Math.min(Math.max(parseInt(month), 1), 12);

//         const currentDate = new Date();
//         const currentYear = currentDate.getFullYear() % 100;

//         const inputMonth = parseInt(validMonth);
//         const inputYear = parseInt(year);

//         if (inputYear < currentYear || (inputYear === currentYear && inputMonth < (currentDate.getMonth() + 1)))  {
//             expireError.textContent = "請輸入有效的信用卡";
//             creditExpireInput.classList.add("error");
//         } else {
//             expireError.textContent = "";
//             creditExpireInput.classList.remove("error");
//         }
//         event.target.value = `${validMonth.toString().padStart(2, '0')} / ${year}`;
//     });
// });

// // 檢查信用卡驗證碼
// document.addEventListener("DOMContentLoaded", function () {
//     const creditCVVInput = document.getElementById("creditCVV");
//     creditCVVInput.addEventListener("input", function (event) {
//         const inputValue = event.target.value.replace(/\D/g, "").slice(0, 3);
//         event.target.value = inputValue;
//     });
// });

TPDirect.setupSDK(
    137211, 
    'app_f2ROH4WNwiz4F2uW7LpbdEfdwy1dbRnxTZfWGCmBq61HDmMGHgkIP1zzpFtg', 
    'sandbox'
);
TPDirect.card.setup({
    fields: {
        number: {
            element: "#card-number",
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: "#card-expiration-date",
            placeholder: 'MM / YY'
        },
        ccv: {
            element: "#card-ccv",
            placeholder: 'CCV'
        }
    },
    styles: {
        'input': {
            'color': 'gray',
            'font-size': '14px'
        },
        'input.number':{
            'font-size': '14px'
        },
        'input.expirationDate':{
            'font-size': '14px'
        },
        'input.ccv': {
            'font-size': '14px'
        },
        ':focus': {
            'color': 'black'
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6, 
        endIndex: 11
    }
});
payCheckBtn.addEventListener("click", ()=>{
    if(!isOrder){
        isOrder = true;
        TPDirect.card.getPrime(function(result){
            if(!contactName.value || !contactEmail.value || !contactNumber.value){
                checkError.textContent = "請輸入聯絡資訊";
                isOrder = false;
                return false;
            }
            if (result.status !==0){
                console.log(result)
                checkError.textContent = "請確認信用卡資訊";
                isOrder = false;
                return false;
            }
            let primeCode = result.card.prime;
            console.log(primeCode)
            const output = {
                "prime": primeCode,
                "order": {
                    "price": booking.data.price,
                    "trip": booking.data.attraction.name,
                },
                "contact":{
                    "name": contactName.value,
                    "email": contactEmail.value,
                    "phone": contactNumber.value
                }
            };
            postOrder(output);
        });
    }
});
async function postOrder(data){
    try{
        let response = await fetch("/api/orders", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Authorization": `Bearer ${getToken}`,
                "Content-Type": "application/json"
            }
        });
        let result = await response.json();
        console.log("這裡印出結果資料", result.data) 
        if (response.status !== 200 || result.data === undefined){
            checkError.textContent = "交易失敗，請確認信用卡資訊是否有誤";
            isOrder = false;
            return false;
        }else{
            const bookingFinish = document.getElementById("bookingFinish")
            const loginSuccessHtml= `
                <div>
                    <div>訂購完成！稍後將為您跳轉至訂單頁面</div>
                </div>
            `
            bookingFinish.insertAdjacentHTML('beforeend', loginSuccessHtml);
            setTimeout(()=>{
                window.location.href = `/thankyou?number=${result.data.number}`;
                // window.location.href = "/thankyou";
            }, 2000);
        }
    }catch(error){
        console.log({"error":error})
    }
}

function onSubmit(event) {
    event.preventDefault()
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('can not get prime')
        return
    }
    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            alert('get prime error ' + result.msg)
            return
        }
        alert('get prime 成功，prime: ' + result.card.prime)
    })
}