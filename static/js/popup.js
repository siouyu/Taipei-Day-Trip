const signBtn = document.getElementById("pop_sign_btn");
const registerBtn = document.getElementById("register_btn");
const logIn = document.getElementById("open_popup");
const logOut = document.getElementById("logout");
let getToken = localStorage.getItem("accessToken");

document.addEventListener("DOMContentLoaded",function(){
    if(getToken){
        logOut.style.display = "block";
        logIn.style.display = "none";
    }else{
        logOut.style.display = "none";
        logIn.style.display = "block";
    }
    logOut.addEventListener("click", function(){
        localStorage.removeItem("accessToken");
        location.reload();
    })
});

//跳出彈跳視窗
const popup = document.getElementById("popup");
const openPopupBtn = document.getElementById("open_popup");
const signinClick = document.getElementById("click_word_signin")
const registerClick = document.getElementById("click_word_register")
const signinPopup = document.getElementById("pop_frame_signin")
const registerPopup = document.getElementById("pop_frame_register")

openPopupBtn.addEventListener("click", function() {
    popup.style.display = "flex"; 
    signinPopup.style.display = "block";
});

popup.addEventListener("click", function(event) {
    if (event.target === popup) {
        popup.style.display = "none"; 
        signinPopup.style.display = "none";
        registerPopup.style.display = "none";
    }
});

window.addEventListener("scroll", function() {
    popup.style.display = "none"; 
    signinPopup.style.display = "none";
    registerPopup.style.display = "none";
});

signinClick.addEventListener("click", function(){
    signinPopup.style.display = "block";
    registerPopup.style.display = "none";
})

registerClick.addEventListener("click", function(){
    signinPopup.style.display = "none"; 
    registerPopup.style.display = "block";
})

document.addEventListener("DOMContentLoaded",function(){
        const registerResult = document.getElementById("registerResult");
        const signinHide = document.getElementById("pop_ask_signin");
        registerBtn.addEventListener("click",function(){
            const name = document.querySelector(".pop_content[name='register_name']").value;
            const email = document.querySelector(".pop_content[name='register_email']").value;
            const password = document.querySelector(".pop_content[name='register_password']").value;
            const registerData = {
                name: name,
                email: email,
                password: password
            };
            fetch("/api/user",{
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(registerData)
            })
            .then(function(response){
                if(!response.ok){
                    throw new Error("註冊失敗");
                }
                return response.json();
            })
            .then(function(data){
                signinHide.style.display = "none";
                registerResult.textContent = "註冊成功，請直接登入";
                setTimeout(function () {
                    location.reload();
                }, 500);
            })
            .catch(function(error){
                signinHide.style.display = "none";
                registerResult.textContent= "這個 email 已被註冊";
            });
        });
    })

document.addEventListener("DOMContentLoaded",function(){
    const signInResult = document.getElementById("signInResult");
    const registerHide = document.getElementById("pop_ask_register")
    signBtn.addEventListener("click",function(){
        const email = document.querySelector(".pop_content[name='sign_email']").value;
        const password = document.querySelector(".pop_content[name='sign_password']").value;
        const signInData = {
            email: email,
            password: password
        };
        console.log(JSON.stringify(signInData))
        fetch("/api/user/auth",{
            method: "PUT",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(signInData)
        })
        .then(function(response){
            if(!response.ok){
                throw new Error("登入失敗");
            }
            return response.json();
        })
        .then(function(data){
            registerHide.style.display = "none"; 
            signInResult.textContent = "登入成功！";
            localStorage.setItem("accessToken", data.access_token);
            setTimeout(function () {
                location.reload();
            }, 500);
        })
        .catch(function(error){
            registerHide.style.display = "none"; 
            signInResult.textContent= "帳號或密碼錯誤，請重新輸入";

        });
    });
});

// 檢查 api 的 get
// const urlUser = "/api/user/auth";
// function handleResponse(response) {
//     return response.json();
// }
// function handleData(data) {
//     console.log(data);
// }
// function handleError(error) {
//     console.error("Error:", error);
// }
// fetch(urlUser, {
//     method: "GET",
//     headers: {
//         "Authorization": `Bearer ${getToken}`,
//         "Content-Type": "application/json"
//     }
// })
// .then(handleResponse)
// .then(handleData)
// .catch(handleError);





