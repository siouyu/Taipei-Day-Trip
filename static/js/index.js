// fetch("http://3.130.219.42:3000/api/attractions").then(function(response){
//     return response.json();
// }).then(function(data){
//     const imageUrl = data.data[0].images[0];
//     const attractionName = data.data[0].name;
//     const attractionCat = data.cdata[0].ategory;
//     const attractionMRT = data.data[0].mrt;
//     const attrationHTML = `
//         <div class="attraction">
//             <div class="attraction_img">
//                 <img src="${imageUrl}" alt="${attractionName}">
//                 <div class="attraction_name">${attractionName}</div>
//             </div>
//             <div class="attraction_word">
//                 <div class="attraction_word_mrt">${attractionMRT}</div>
//                 <div class="attraction_word_cat">${attractionCat}</div>
//             </div>
//         </div>
//     `;
//     console.log(imageUrl);
//     console.log(attractionName);
//     console.log(attractionCat);
//     console.log(attractionMRT);
//     console.log(attrationHTML);

//     const attractionFrame = document.getElementById("attraction_frame"); 
//     attractionFrame.insertAdjacentHTML("beforeend", attrationHTML); // beforeend 在指定元素的裡頭後面插入新的 HTML
// })
// .catch(function(error){
//     console.log("發生錯誤" + error);
// });



