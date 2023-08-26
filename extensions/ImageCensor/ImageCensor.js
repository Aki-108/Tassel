// ==UserScript==
// @name         Image Censor
// @version      0.1
// @description  Censor (NSFW) images and icons.
// @author       aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).imageCensor || {};
    if (!settings.censorUsers) settings.censorUsers = [];

    initTassel();
    document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
        processPosts([tasselJsonManager.modal.json]);
    });
    document.getElementById("tasselJsonManagerPostReady").addEventListener("click", function() {
        processPosts([tasselJsonManager.post.json]);
    });
    document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", function() {
        processPosts(tasselJsonManager.feed.posts);
    });

    function processPosts(postData) {
        let links = Object.values(document.getElementsByClassName("link_post"));
        links = links.filter(function(item) {
            return !item.classList.contains("tasselPermalinked");
        });

        postData.forEach(function(post) {
            let postElement = links.filter(function(item) {
                if (!item.href) return;
                return item.href.split("/")[4] == (post.original_post_id || post.id);
            });
            if (!links.length) postElement = Object.values(document.getElementsByClassName("post-container"));
            postElement.forEach(function(postEl) {
                for (let a = 0; a < 100; a++, postEl = postEl.parentNode) {
                    if (postEl.classList.contains("post-container")) break;
                }
                if (postEl.classList.contains("tasselImageCensorProcessed")) return;
                postEl.classList.add("tasselImageCensorProcessed");

                if (post.nsfw && settings.blurNSFW || settings.blurAny) blurImage(postEl);
                if (post.nsfw && settings.collapseNSFW) collapsePost(postEl);

                let username = post.original_username || post.username;
                console.log(username);
                if (settings.censorUsers.includes(username)) censorIcon(postEl);
            });
        });
    };

    function blurImage(postElement) {
        let images = postElement.getElementsByClassName("media")[0];
        if (images) Object.values(images.children).forEach(function(item) {
            item.classList.add("tasselNsfwBlur");
        });
        let textBody = postElement.getElementsByClassName("content")[0];
        if (textBody) textBody = textBody.getElementsByTagName("img");
        if (textBody) Object.values(textBody).forEach(function(item) {
            item.classList.add("tasselNsfwBlur");
        });
    }

    function collapsePost(postElement) {
        let container = postElement.getElementsByClassName("tasselAdvancedBlacklistBlockedHeader")[0];
        if (container) {
            container.children[1].innerHTML += "<br>This post is marked as NSFW.";
            return;
        }

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

    function censorIcon(postElement) {
        postElement.getElementsByClassName("avatar")[0].children[0].src = "https://img3.pillowfort.social/pf-default-user.png";
    }

    /* Add elements to the Tassel menu */
    function initTassel() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (!tasselSidebar) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarImageCensor";
        button.innerHTML = "Image Censor";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarImageCensor").addEventListener("click", displaySettings);
    }

    /* Create Tassel settings menu */
    function displaySettings() {
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
        content.appendChild(createSwitch_dshcgkhy("Blur NSFW images", settings.blurNSFW ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.blurNSFW = this.checked;
            saveSettings();
        });

        content.appendChild(createSwitch_dshcgkhy("Collapse NSFW posts", settings.collapseNSFW ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.collapseNSFW = this.checked;
            saveSettings();
        });

        content.appendChild(createSwitch_dshcgkhy("Blur any images", settings.blurAny ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.blurAny = this.checked;
            saveSettings();
        });
        content.appendChild(document.createElement("hr"));

        let info4 = document.createElement("p");
        info4.innerHTML = "Enter a list of users whose profile-picture should be blurred. One username per line."
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
            saveSettings();
        });
        frame4.appendChild(button4);
        content.appendChild(frame4);;
    }

    function saveSettings() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.imageCensor = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    function createSwitch_dshcgkhy(title="", state="") {
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