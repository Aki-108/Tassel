// ==UserScript==
// @name         Keyboard Shortcuts
// @version      0.1
// @description  Navigate Pillowfort with you keyboard.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).keyboardShortcuts || {
        openFeed: "f",
        openNewPost: "n",
        nextPost: "j",
        previousPost: "k",
        openComments: "c",
        openReblog: "r",
        like: "l",
        openPost: "o",
        scrollSmooth: true
    };

    init_ytsuwchs();
    function init_ytsuwchs() {
        addShortcuts_ytsuwchs();
        initTassel_ytsuwchs();
    }

    /* Add key event to document */
    function addShortcuts_ytsuwchs() {
        document.addEventListener("keyup", function(e) {
            //ignore shortcuts when typing text somewhere
            if (document.activeElement.tagName === "INPUT") return;
            if (document.activeElement.getAttribute("spellcheck")) return;

            let top = getPageRect_ytsuwchs().top;
            let posts = Object.values(document.getElementsByClassName("post"));

            switch (convertKey_ytsuwchs(e)) {
                case settings.openFeed:
                    window.open("https://www.pillowfort.social/", "_self");
                    break;
                case settings.openNewPost:
                    if (document.URL !== "https://www.pillowfort.social/posts/new") window.open("https://www.pillowfort.social/posts/new", "_self");
                    break;
                case settings.nextPost:
                    for (let a = 0; a <= posts.length; a++) {
                        let post = posts[a];
                        //scroll normally when no post was found
                        if (!post) {
                            window.scrollByPages(1);
                            break;
                        }
                        //find next post
                        if (getElementRect_ytsuwchs(post).top - 71 > top) {
                            post.getElementsByTagName("a")[0].focus()
                            window.scrollTo({
                                top: getElementRect_ytsuwchs(post).top - 70,
                                behavior: settings.scrollSmooth ? "smooth" : "auto"
                            });
                            break;
                        }
                    }
                    break;
                case settings.previousPost:
                    for (let a = 0; a <= posts.length; a++) {
                        let post = posts[a];
                        //scroll normally when no post was found
                        if (!post) {
                            window.scrollByPages(-1);
                            break;
                        }
                        //find previous post
                        if (getElementRect_ytsuwchs(post).top > top) {
                            posts[Math.max(a-1,0)].getElementsByTagName("a")[0].focus()
                            window.scrollTo({
                                top: getElementRect_ytsuwchs(posts[Math.max(a-1,0)]).top - 70,
                                behavior: settings.scrollSmooth ? "smooth" : "auto"
                            });
                            break;
                        }
                    }
                    break;
                case settings.openComments:
                    for (let a = 0; a < posts.length; a++) {
                        let post = posts[a];
                        if (getElementRect_ytsuwchs(post).top - 70 >= top) {
                            post.getElementsByClassName("nav-tab")[0].click();
                            break;
                        }
                    }
                    break;
                case settings.openReblog:
                    for (let a = 0; a < posts.length; a++) {
                        let post = posts[a];
                        if (getElementRect_ytsuwchs(post).top - 70 >= top) {
                            post.getElementsByClassName("nav-tab")[1].click();
                            break;
                        }
                    }
                    break;
                case settings.like:
                    for (let a = 0; a < posts.length; a++) {
                        let post = posts[a];
                        if (getElementRect_ytsuwchs(post).top - 70 >= top) {
                            post.getElementsByClassName("nav-tab")[2].click();
                            break;
                        }
                    }
                    break;
                case settings.openPost:
                    for (let a = 0; a < posts.length; a++) {
                        let post = posts[a];
                        if (getElementRect_ytsuwchs(post).top - 70 >= top) {
                            window.open(post.getElementsByClassName("link_post")[0].href, "_blank");
                            break;
                        }
                    }
                    break;
            }
        });
    }

    //src: https://stackoverflow.com/a/2159195
    function getPageRect_ytsuwchs() {
        let isquirks = document.compatMode !== 'BackCompat';
        let page = isquirks ? document.documentElement : document.body;
        let x = page.scrollLeft;
        let y = page.scrollTop;
        let w = 'innerWidth' in window ? window.innerWidth : page.clientWidth;
        let h = 'innerHeight' in window ? window.innerHeight : page.clientHeight;
        return {left: x, top: y, right: x+w, bottom: y+h};
    }
    function getElementRect_ytsuwchs(element) {
        let x= 0, y= 0;
        let w= element.offsetWidth, h= element.offsetHeight;
        while (element.offsetParent!==null) {
            x+= element.offsetLeft;
            y+= element.offsetTop;
            element= element.offsetParent;
        }
        return {left: x, top: y, right: x+w, bottom: y+h, width: w, height: h};
    }

    /* Add elements to the Tassel menu */
    function initTassel_ytsuwchs() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarKeyboardShortcuts";
        button.innerHTML = "Keyboard Shortcuts";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarKeyboardShortcuts").addEventListener("click", displaySettings_ytsuwchs);
    }

    /* Create Tassel settings menu */
    function displaySettings_ytsuwchs() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarKeyboardShortcuts").classList.add("active");

        //add settings
        content.appendChild(createSwitch_ytsuwchs("Smooth Scrolling", settings.scrollSmooth ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.scrollSmooth = this.checked;
            saveSettings_ytsuwchs();
        });
        content.appendChild(document.createElement("hr"));

        let title1 = document.createElement("h2");
        title1.innerHTML = "Shortcuts";
        content.appendChild(title1);

        let table1 = document.createElement("div");
        table1.id = "tasselKeyboardShortcutsSettings";
        let cell12 = document.createElement("label");
        cell12.innerHTML = "Go to Feed";
        table1.appendChild(cell12);
        let input12 = document.createElement("input");
        input12.value = settings.openFeed;
        input12.addEventListener("keyup", assignKey_ytsuwchs);
        input12.setAttribute("setting", "openFeed");
        cell12.appendChild(input12);

        let cell1 = document.createElement("label");
        cell1.innerHTML = "Create Post";
        table1.appendChild(cell1);
        let input1 = document.createElement("input");
        input1.value = settings.openNewPost;
        input1.addEventListener("keyup", assignKey_ytsuwchs);
        input1.setAttribute("setting", "openNewPost");
        cell1.appendChild(input1);

        let cell2 = document.createElement("label");
        cell2.innerHTML = "Next Post";
        table1.appendChild(cell2);
        let input2 = document.createElement("input");
        input2.value = settings.nextPost;
        input2.addEventListener("keyup", assignKey_ytsuwchs);
        input2.setAttribute("setting", "nextPost");
        cell2.appendChild(input2);

        let cell3 = document.createElement("label");
        cell3.innerHTML = "Previous Post";
        table1.appendChild(cell3);
        let input3 = document.createElement("input");
        input3.value = settings.previousPost;
        input3.addEventListener("keyup", assignKey_ytsuwchs);
        input3.setAttribute("setting", "previousPost");
        cell3.appendChild(input3);

        let cell4 = document.createElement("label");
        cell4.innerHTML = "Open/Close Comments";
        table1.appendChild(cell4);
        let input4 = document.createElement("input");
        input4.value = settings.openComments;
        input4.addEventListener("keyup", assignKey_ytsuwchs);
        input4.setAttribute("setting", "openComments");
        cell4.appendChild(input4);

        let cell5 = document.createElement("label");
        cell5.innerHTML = "Reblog active Post";
        table1.appendChild(cell5);
        let input5 = document.createElement("input");
        input5.value = settings.openReblog;
        input5.addEventListener("keyup", assignKey_ytsuwchs);
        input5.setAttribute("setting", "openReblog");
        cell5.appendChild(input5);

        let cell6 = document.createElement("label");
        cell6.innerHTML = "Like active Post";
        table1.appendChild(cell6);
        let input6 = document.createElement("input");
        input6.value = settings.like;
        input6.addEventListener("keyup", assignKey_ytsuwchs);
        input6.setAttribute("setting", "like");
        cell6.appendChild(input6);

        let cell7 = document.createElement("label");
        cell7.innerHTML = "Open active Post in a new Tab";
        table1.appendChild(cell7);
        let input7 = document.createElement("input");
        input7.value = settings.openPost;
        input7.addEventListener("keyup", assignKey_ytsuwchs);
        input7.setAttribute("setting", "openPost");
        cell7.appendChild(input7);
        content.appendChild(table1);
    }

    /* Format key input and save in settings */
    function assignKey_ytsuwchs(e) {
        this.value = convertKey_ytsuwchs(e, this.value);
        settings[this.getAttribute("setting")] = this.value;
        saveSettings_ytsuwchs();
    }

    /* Format key input */
    function convertKey_ytsuwchs(e, before) {
        if (e.key === "Shift" || e.key === "Control" || e.key === "Alt") return before;
        let value = "";
        if (e.shiftKey) value += "Shift+";
        if (e.ctrlKey) value += "Ctrl+";
        if (e.altKey) value += "Alt+";
        value += e.key.toLocaleLowerCase();
        return value;
    }

    /* Save settings to local storage */
    function saveSettings_ytsuwchs() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.keyboardShortcuts = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    /* Create an HTML element of a checkbox with lable */
    function createSwitch_ytsuwchs(title="", state="", _class=Math.random()) {
        let id = "tasselSwitch" + Math.random();
        let toggle = document.createElement("div");
        toggle.classList.add("tasselToggle");
        toggle.innerHTML = `
          <input id="${id}" type="checkbox" class="${_class}" ${state}>
          <label for="${id}">${title}</label>
        `;
        return toggle;
    }
})();
