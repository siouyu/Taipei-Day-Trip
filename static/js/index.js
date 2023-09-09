let nextPage = 0; // 全域變數
let keyword = null; // 預設頁面一開始都沒有關鍵字
const attractionFrame = document.getElementById("attraction_frame")

function attractionHTML(attractions, attractionFrame){
    for (let i = 0; i < attractions.length; i++) {
        const attraction = attractions[i];
        const imageUrl = attraction.images[0];
        const attractionName = attraction.name;
        const attractionCat = attraction.category;
        const attractionMRT = attraction.mrt;
        const attractionHTML = `
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
        `;
        attractionFrame.insertAdjacentHTML("beforeend", attractionHTML);
    }
}

function loadNextPage(keyword) { 
    let nextPageUrl;
    if (nextPage === null) {
        return;
    }
    if (keyword){
        nextPageUrl = `/api/attractions?page=${nextPage}&keyword=${keyword}` // 如果有給 keyword 先跑這個
    }else{
        nextPageUrl = `/api/attractions?page=${nextPage}`; // 如果沒有 keyword 就跑這個
    }
    fetch(nextPageUrl).then(function (response) {
        return response.json();
    }).then(function (data) {
        const attractions = data.data;
        if (attractions.length > 0) {
            nextPage = data.nextPage;
            attractionHTML(attractions, attractionFrame)
        } else {
            nextPage = null;
        }
    })
    .catch(function (error) {
        console.log("發生錯誤" + error);
    });
}

//捷運站列表
document.addEventListener("DOMContentLoaded", function() {
    fetch(`/api/mrts`).then(function(response){
        return response.json();
    }).then(function(data){
            let mrtList = document.getElementById("mrt_list");
            let mrtNames = data.data.filter(function(mrt) {
                return mrt !== null;
            });
            let mrtListHTML = mrtNames.map(function(mrt, index) {
                return `<div class="mrt_word">${mrt}</div>`;
            }).join("");
            mrtList.insertAdjacentHTML("beforeend", mrtListHTML);

            let mrtStations = document.querySelectorAll(".mrt_word");
            let searchInput = document.getElementById("search_input");
            mrtStations.forEach(function(station) {
                station.addEventListener("click", function() {
                    searchInput.value = station.textContent;
                });
            });
        })
        .catch(function(error){
            console.log("發生錯誤" + error);
        });
    });

// 列表左右按鈕
document.addEventListener("DOMContentLoaded", function() {
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
    let searchInput = document.getElementById("search_input");
    let searchBtn = document.getElementById("search_btn");
    searchBtn.addEventListener("click",function(){
        keyword = searchInput.value.trim(); // 更新關鍵字 → 上面的全域變數被更新
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
                attractionHTML(attractions, attractionFrame);
                nextPage = data.nextPage
            }
        })
        .catch(function(error){
            console.log("發生錯誤" + error);
        });
    });
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