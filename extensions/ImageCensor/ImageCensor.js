// ==UserScript==
// @name         Image Censor
// @version      1.1
// @description  Censor (NSFW) images and icons.
// @author       aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).imageCensor || {blurNSFW: true};
    if (!settings.censorUsers) settings.censorUsers = [];

    /* Initialize */
    initTassel_kyhjxbvr();
    document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
        processPosts_kyhjxbvr([tasselJsonManager.modal.json]);
    });
    document.getElementById("tasselJsonManagerPostReady").addEventListener("click", function() {
        processPosts_kyhjxbvr([tasselJsonManager.post.json]);
    });
    document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", function() {
        processPosts_kyhjxbvr(tasselJsonManager.feed.posts);
    });
    document.getElementById("tasselJsonManagerCommentReady").addEventListener("click", function() {
        censorCommentIcon_kyhjxbvr(tasselJsonManager.comments.comments);
    });

    /* Loop through every post */
    function processPosts_kyhjxbvr(postData) {
        //get HTML elements for posts
        let links = Object.values(document.getElementsByClassName("link_post"));
        links = links.filter(function(item) {
            return !item.classList.contains("tasselPermalinked");
        });

        //loop through data
        postData.forEach(function(post) {
            //match data with an HTML element
            let postElement = links.filter(function(item) {
                if (!item.href) return;
                return item.href.split("/")[4] == (post.original_post_id || post.id);
            });
            if (!links.length) postElement = Object.values(document.getElementsByClassName("post-container"));

            //call changing functions on that element
            postElement.forEach(function(postEl) {
                //get root element
                for (let a = 0; a < 100; a++, postEl = postEl.parentNode) {
                    if (postEl.classList.contains("post-container")) break;
                }
                if (postEl.classList.contains("tasselImageCensorProcessed")) return;
                postEl.classList.add("tasselImageCensorProcessed");

                //blur images
                if (post.nsfw && settings.blurNSFW || settings.blurAny) blurImage_kyhjxbvr(postEl);

                //collapse posts
                if (post.nsfw && settings.collapseNSFW) collapsePost_kyhjxbvr(postEl);

                //censor icons
                let username = post.original_username || post.username;
                if (settings.censorUsers.includes(username)) censorIcon_kyhjxbvr(postEl);

                //pause gifs
                if (settings.pauseGifs) pauseGifs_kyhjxbvr(postEl);
            });
        });
    };

    /* Apply the blur-class to every image in a post */
    function blurImage_kyhjxbvr(postElement) {
        //for photo-posts
        let images = postElement.getElementsByClassName("media")[0];
        if (images) Object.values(images.children).forEach(function(item) {
            item.classList.add("tasselNsfwBlur");
        });

        //for the text-body
        let textBody = postElement.getElementsByClassName("content")[0];
        if (textBody) textBody = textBody.getElementsByTagName("img");
        if (textBody) Object.values(textBody).forEach(function(item) {
            item.classList.add("tasselNsfwBlur");
        });
    }

    /* Collapse posts */
    function collapsePost_kyhjxbvr(postElement) {
        //use this in combination with Advanced Blacklist
        let container = postElement.getElementsByClassName("tasselAdvancedBlacklistBlockedHeader")[0];
        if (container) {
            container.children[1].innerHTML += "<br>This post is marked as NSFW.";
            return;
        }

        //use this without Advanced Blacklist
        container = document.createElement("div");
        container.classList.add("tasselAdvancedBlacklistBlockedHeader");
        container.innerHTML = `
            <button>Show</button>
            <div>This post is marked as NSFW.</div>
        `;
        postElement.getElementsByClassName("header")[0].after(container);
        container.children[0].addEventListener("click", function() {
            let post = this.parentNode.parentNode;
            if (this.innerHTML == "Show") {
                for (let el of post.getElementsByClassName("advancedBlacklistHidden")) el.style.display = "block";
                this.innerHTML = "Hide";
            } else {
                for (let el of post.getElementsByClassName("advancedBlacklistHidden")) el.style.display = "none";
                this.innerHTML = "Show";
            }
        });

        for (let el of postElement.getElementsByClassName("title")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("media")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("content")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("post-nav")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("advancedBlacklistHidden")) el.style.display = "none";
    }

    /* Replace user icon with the default icon */
    function censorIcon_kyhjxbvr(postElement) {
        postElement.getElementsByClassName("avatar")[0].children[0].src = "https://img3.pillowfort.social/pf-default-user.png";
    }

    /* Replace user icon with the default icon */
    function censorCommentIcon_kyhjxbvr(comments) {
        let nameElements = Object.values(document.getElementsByClassName("comment-title"));

        comments.forEach(function(comment) {
            if (!settings.censorUsers.includes(comment.username)) return;

            let elements = nameElements.filter(function(item) {
                return item.innerHTML === comment.username;
            });
            elements.forEach(function(item) {
                for (let a = 0; a < 100; a++, item = item.parentNode) {
                    if (item.classList.contains("header")) break;
                }
                item.getElementsByClassName("avatar")[0].src = "https://img3.pillowfort.social/pf-default-user.png";
            });
        });
    }

    /* Replace GIFs with a static image and toggle */
    function pauseGifs_kyhjxbvr(postElement) {
        //get all gifs in the post
        let images = postElement.getElementsByTagName("img");
        let gifs = Object.values(images).filter(function(image) {
            return image.src.search(".gif") > -1;
        });

        gifs.forEach(function(gif) {
            //the frame holds all the elements and replaces the original GIF
            let frame = document.createElement("div");
            frame.classList = gif.classList;
            frame.classList.remove("pointer-cursor");
            frame.classList.add("tasselPauseGifFrame");
            frame.style.height = gif.height + "px";
            frame.style.width = gif.width + "px";
            frame.appendChild(gif.cloneNode(true));
            frame.children[0].classList.add("hidden");
            frame.children[0].addEventListener("click", function() {
                this.classList.add("hidden");
            });
            gif.parentNode.appendChild(frame);

            let canvas = document.createElement("canvas");
            canvas.setAttribute("width", gif.width);
            canvas.setAttribute("height", gif.height);
            frame.appendChild(canvas);

            let context = canvas.getContext("2d");
            context.drawImage(gif, 0, 0);

            let playButton = document.createElement("div");
            playButton.classList.add("tasselPauseGifPlay");
            playButton.innerHTML = `
                <button style="top:${-gif.height/2-75}px">&#x25BA;</button>
            `;
            let minDimention = Math.min(gif.width, gif.height);//fit button inside image dimentions
            if (minDimention < 200) playButton.children[0].style.scale = 0.5*minDimention + "%";
            playButton.children[0].addEventListener("click", function() {
                this.parentNode.parentNode.children[0].classList.remove("hidden");
            });
            frame.appendChild(playButton);

            gif.remove();
        });
    }

    /* Add elements to the Tassel menu */
    function initTassel_kyhjxbvr() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (!tasselSidebar) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarImageCensor";
        button.innerHTML = "Image Censor";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarImageCensor").addEventListener("click", displaySettings_kyhjxbvr);
    }

    /* Create Tassel settings menu */
    function displaySettings_kyhjxbvr() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarImageCensor").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //add settings
        content.appendChild(createSwitch_kyhjxbvr("Blur NSFW images", settings.blurNSFW ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.blurNSFW = this.checked;
            saveSettings_kyhjxbvr();
        });

        content.appendChild(createSwitch_kyhjxbvr("Collapse NSFW posts", settings.collapseNSFW ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.collapseNSFW = this.checked;
            saveSettings_kyhjxbvr();
        });

        content.appendChild(createSwitch_kyhjxbvr("Blur any images", settings.blurAny ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.blurAny = this.checked;
            saveSettings_kyhjxbvr();
        });

        content.appendChild(createSwitch_kyhjxbvr("Pause GIFs", settings.pauseGifs ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.pauseGifs = this.checked;
            saveSettings_kyhjxbvr();
        });
        content.appendChild(document.createElement("hr"));

        let info4 = document.createElement("label");
        info4.innerHTML = "<p>Enter a list of users whose profile-picture should be censored. One username per line.</p>"
        content.appendChild(info4);
        let userInput = document.createElement("textarea");
        userInput.id = "tasselImageCensorUsers";
        userInput.value = settings.censorUsers.join("\n");
        userInput.style.marginBottom = "10px";
        content.appendChild(userInput);
        let frame4 = document.createElement("div");
        frame4.id = "tasselImageCensorSaveFrame";
        frame4.innerHTML = `
            <div>
                <div></div>
            </div>
        `;
        let button4 = document.createElement("button");
        button4.id = "tasselImageCensorSaveUsers";
        button4.classList.add("btn", "btn-success");
        button4.innerHTML = "Save";
        button4.addEventListener("click", function() {
            settings.censorUsers = document.getElementById("tasselImageCensorUsers").value.split("\n");
            saveSettings_kyhjxbvr();
        });
        frame4.appendChild(button4);
        content.appendChild(frame4);;
    }

    function saveSettings_kyhjxbvr() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.imageCensor = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    function createSwitch_kyhjxbvr(title="", state="") {
        let id = "tasselSwitch" + Math.random();
        let toggle = document.createElement("div");
        toggle.classList.add("tasselToggle");
        toggle.innerHTML = `
          <input id="${id}" type="checkbox" ${state}>
          <label for="${id}">${title}</label>
        `;
        return toggle;
    }
})();
