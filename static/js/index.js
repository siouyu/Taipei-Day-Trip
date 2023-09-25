let nextPage = 0; // 全域變數
let keyword = null; // 預設頁面一開始都沒有關鍵字
let isLoading = false; // 一開始沒有在載入頁面
let isSearching = false;
const attractionFrame = document.getElementById("attraction_frame");
const searchInput = document.getElementById("search_input");

// funcion declarations
function attractionHTML(attractions){ // 原本 attractionHTML(attractions, attractionFrame) 裡的 attractionFrame 可以拿掉，因為函示可以從全域變數拿
    for (let i = 0; i < attractions.length; i++) {
        const attraction = attractions[i];
        const imageUrl = attraction.images[0];
        const attractionName = attraction.name;
        const attractionCat = attraction.category;
        const attractionMRT = attraction.mrt;
        const attractionId = attraction.id;
        const attractionLink = "attraction/" + attractionId;
        const attractionHTML = `
        <a href="${attractionLink}">
            <div class="attraction">
            <div class="attraction_img">
                <img src="${imageUrl}" alt="${attractionName}" class="attraction_img_new">
                <div class="attraction_name">${attractionName}</div>
            </div>
            <div class="attraction_word">
                <div class="attraction_word_mrt">${attractionMRT}</div>
                <div class="attraction_word_cat">${attractionCat}</div>
            </div>
            </div>
        </a>
        `;
        attractionFrame.insertAdjacentHTML("beforeend", attractionHTML);
    }
}

function loadNextPage(keyword) { 
    let nextPageUrl;
    if (nextPage === null) {
        return;
    }
    if (isLoading === true) {
        return;
    }
    if (keyword){
        nextPageUrl = `/api/attractions?page=${nextPage}&keyword=${keyword}` // 如果有給 keyword 先跑這個
    }else{
        nextPageUrl = `/api/attractions?page=${nextPage}`; // 如果沒有 keyword 就跑這個
    }
    isLoading = true; // 準備要去 API 取東西
    fetch(nextPageUrl).then(function (response) {
        return response.json();
    }).then(function (data) {
        const attractions = data.data;
        if (attractions.length > 0) {
            nextPage = data.nextPage;
            attractionHTML(attractions)
        } else {
            nextPage = null; // 更新全域變數狀態
        }
        isLoading = false; // 跑完不要繼續載
    })
    .catch(function (error) {
        console.log("發生錯誤" + error);
    });
}


function searchKeyword(){
    keyword = searchInput.value.trim(); // 更新關鍵字 → 上面的全域變數被更新
    if (keyword === ""){
        return;
    }
    if (isSearching === true){
        return;
    }
    isSearching = true;
    fetch(`/api/attractions?keyword=${keyword}`).then(function(response){
        return response.json();
    }).then(function(data){
        const attractions = data.data;
        attractionFrame.innerHTML = "";
        // console.log(data)
        if (attractions.length === 0 ){
            let noResultMessage = document.createElement("div");
            noResultMessage.classList.add("no_result_message");
            noResultMessage.textContent = "沒有符合的景點";
            attractionFrame.appendChild(noResultMessage);
        }else{
            attractionHTML(attractions);
            nextPage = data.nextPage
        }
        isSearching = false;
    })
    .catch(function(error){
        console.log("發生錯誤" + error);
    });
}

//捷運站列表
document.addEventListener("DOMContentLoaded", function(){
    fetch(`/api/mrts`).then(function(response){
        return response.json();
    }).then(function(data){
        let mrtList = document.getElementById("mrt_list");
        let mrtNames = data.data.filter(function(mrt) {  // 從陣列中去掉 null
            return mrt !== null;
        });
        let mrtListHTML = mrtNames.map(function(mrt, index) {
            return `<div class="mrt_word">${mrt}</div>`; 
        }).join("") // join 把陣列中的所有元素連接成一串單一的字符串 → 可以把 .join("'") 拿掉再 console.log 比較差別
        // console.log(mrtListHTML) 
        mrtList.insertAdjacentHTML("beforeend", mrtListHTML);

        let mrtStations = document.querySelectorAll(".mrt_word"); // 捷運站文字跳轉到搜尋框
        let searchInput = document.getElementById("search_input");
        for (let i = 0; i < mrtStations.length; i++){
            mrtStations[i].addEventListener("click", function() {
                searchInput.value = mrtStations[i].textContent; // 只要 div 裡面的文字
                searchKeyword(); // 跳轉後自動搜尋
            });
        }    
    })
    .catch(function(error){
        console.log("發生錯誤" + error);
    });
});

// 列表左右按鈕
document.addEventListener("DOMContentLoaded", function(){
    const leftButton = document.getElementById("list_btn_left");
    const rightButton = document.getElementById("list_btn_right");
    leftButton.onclick = function () {
        document.getElementById("mrt_list").scrollLeft -= 1000;
    };
    rightButton.onclick = function () {
        document.getElementById("mrt_list").scrollLeft += 1000;
    };
});

// 關鍵字搜尋
document.addEventListener("DOMContentLoaded", function(){
    let searchBtn = document.getElementById("search_btn");
    searchBtn.addEventListener("click", searchKeyword); // 這裡不要加括號
    console.log("點擊！")
});

// 載入更多景點
document.addEventListener("DOMContentLoaded", function(){
    const observerContainer = document.getElementById("terget");
    const observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
            if (keyword){
                loadNextPage(keyword); 
            }else{
                loadNextPage(); // 沒有關鍵字的下一頁
            }
        }
    });
    observer.observe(observerContainer);
})
