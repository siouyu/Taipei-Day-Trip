let id = window.location.href.split("/").slice(-1)[0];
let index = 0;
let imageCount;
let indicators;
const bottom = document.querySelector(".carousel .bottom");
const url = "/api/attraction/" + id;
const attractionImg = document.getElementById("container");
const attractionTitle = document.getElementById("introduction_title_frame");
const attractionContent = document.getElementById("content_frame");

fetch(url).then(function(response){
    return response.json();
}).then(function(data){
    const attractions = data.data;
    const image = attractions.images;
    const imageUrls = image.map(function(image){
        const imageUrl = image.replace(/['",]/g,"");
        console.log(imageUrl)
        const imagesHTML =`
        <div class="main">
            <img src="${imageUrl}"/>
        </div>
        `;
        attractionImg.insertAdjacentHTML("beforeend", imagesHTML);
        return imageUrl;
    });
    imageCount = document.querySelectorAll(".carousel .container img").length;
    for (let i = 0; i < imageCount; i++) {
        const indicator = document.createElement("div");
        indicator.classList.add("indicator");
        indicator.onclick = () => setIndex(i);
        bottom.append(indicator);
    }
    indicators = document.querySelectorAll(".carousel .bottom .indicator");
    indicators.forEach((indicator, i) => {
        indicator.addEventListener("click", () => {
            setIndex(i);
            refresh(); // 更新圖片
            updateIndicators(); // 更新點點樣式
        });
    });
    updateIndicators();
    refresh();
    const attractionName = attractions.name;
    const attractionCat = attractions.category;
    const attractionMRT = attractions.mrt;
    const nameHTML = `
        <div class="introduction_title_frame" id="introduction_title_frame">
            <h2>${attractionName}</h2>
            <div style="margin-bottom: 10px;">${attractionCat} at ${attractionMRT}</div>
        <div class="tour_frame">
                <h4 class="h4">訂購導覽行程</h4>
            <div class="tour_word">
                <div>以此景點為中心的一日行程，帶您探索城市角落故事</div>
            </div>
            <div class="tour_word">
                <h4 class="h4">選擇日期：</h4>
                <input type="date" value="yyyy-MM-dd" class="tour_date"/>
            </div>
            <div class="tour_word">
                <h4 class="h4">選擇時間：</h4>                       
                <div class="radio">
                    <input id="radio-1" name="radio" type="radio" checked>
                    <label for="radio-1" class="radio_label">上半天</label>
                </div>
                <div class="radio">
                    <input id="radio-2" name="radio" type="radio">
                    <label for="radio-2" class="radio_label">下半天</label>
                </div>
            </div>
            <div class="tour_word">
                <h4 class="h4">導覽費用：</h4>
                <div class="fee" id="fee-1">新台幣 2000 元</div>
                <div class="fee" id="fee-2">新台幣 2500 元</div>
            </div>
                <button class="btn_reserve">開始預約行程</button>
        </div>
    `
    attractionTitle.insertAdjacentHTML("beforeend", nameHTML);
    const attractionDes = attractions.description;
    const attractionAddress = attractions.address;
    const attractionTrans = attractions.transport;
    const descriptionHTML =`
        <p>${attractionDes}</p>
        <div class="content">
            <h4>景點地址：</h4>
            <div>${attractionAddress}</div>
        </div>
        <div class="content">
            <h4>交通方式：</h4>
            <div>${attractionTrans}</div>
        </div>
    `
    attractionContent.insertAdjacentHTML("beforeend", descriptionHTML);
    const radio1 = document.getElementById("radio-1");
    const radio2 = document.getElementById("radio-2");
    const fee1 = document.getElementById("fee-1");
    const fee2 = document.getElementById("fee-2");
    radio1.addEventListener("click", function() {
        fee1.style.display = "block";
        fee2.style.display = "none";
    });
    radio2.addEventListener("click", function() {
        fee1.style.display = "none";
        fee2.style.display = "block";
    });
    fee1.style.display = "block";
    fee2.style.display = "none";
})
.catch(function(error) {
console.log("發生錯誤" + error);
});


let refreshWrapper = (func) => {
    return function (...args) {
        let result = func(...args);
        refresh();
        updateIndicators();
        return result;
    };
};
let leftShift = refreshWrapper(() => {
    index--;
});
let rightShift = refreshWrapper(() => {
    index++;
});
let setIndex = refreshWrapper((idx) => {
    index = idx;
});

function updateIndicators() {
    indicators.forEach((indicator, i) => {
        if (i === index) {
        indicator.classList.add("full"); // 顯示當前圖片
        } else {
        indicator.classList.remove("full"); // 移除 full
        }
    });
}

// 圖片輪轉
function refresh() {
    if (index < 0) {
        index = imageCount - 1; // 最右邊圖片
    } else if (index >= imageCount) {
        index = 0; // 最左邊圖片
    }
    let carousel = document.querySelector(".carousel")
    let width = getComputedStyle(carousel).width // 輪播框寬寬度
    width = Number(width.slice(0, -2))
    carousel.querySelector(".container").style.left = index * width * -1 + "px";
}