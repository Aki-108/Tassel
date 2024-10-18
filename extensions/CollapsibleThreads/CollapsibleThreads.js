// ==UserScript==
// @name         Collapsible Threads
// @version      1.6
// @description  Collapse Comments and Threads
// @author       aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).collapsibleThreads || {};

    const loadingIndicator = document.getElementById("comments_loading");
    const mutationConfig = {attributes: true, attributeFilter: ["style"]};
    const mutationCallback = (mutationList) => {
        if (loadingIndicator.style.display == "none") {
            init_sicrjulu();
        }
    };
    const mutationObserver = new MutationObserver(mutationCallback);
    if (loadingIndicator != null) mutationObserver.observe(loadingIndicator, mutationConfig);
    document.getElementById("tasselJsonManagerCommentReady").addEventListener("click", init_sicrjulu);

    function init_sicrjulu() {
        addButtons_sicrjulu();
        removeButtons_sicrjulu();
    }

    function addButtons_sicrjulu() {
        let headers = document.getElementsByClassName("header clearfix");
        for (let el of headers) {
            if (el.classList.contains("tasselCollapsibleThreadsProcessed")) continue;
            else el.classList.add("tasselCollapsibleThreadsProcessed");
            //add button to collapse comment
            let buttonComment = document.createElement("button");
            buttonComment.title = "collapse comment";
            buttonComment.classList.add("collapseButton", "tasselCollapsibleThreadsIcons");
            buttonComment.innerHTML = `
                <svg class="svg-blue-dark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                    <path xmlns="http://www.w3.org/2000/svg" style="fill:none;stroke:#000000;stroke-width:1.2px" d="
                        M 1 14   L 10 5   L 19 14
                    "/>
                </svg>`;
            buttonComment.addEventListener("click", function() {
                let comment = this.parentNode.parentNode.parentNode;
                if (this.classList.contains("toggled")) {
                    //show
                    Object.values(comment.children).forEach(function(item){
                        if (!item.classList.contains("header")) {
                            item.classList.remove("collapsed");
                        }
                    });
                    this.children[0].style.transform = "rotate(0deg)";
                    this.classList.remove("toggled");
                } else {
                    //hide
                    Object.values(comment.children).forEach(function(item){
                        if (!item.classList.contains("header")) {
                            item.classList.add("collapsed");
                        }
                    });
                    this.children[0].style.transform = "rotate(180deg)";
                    this.classList.add("toggled");
                }
            });
            el.getElementsByClassName("comment-buttons")[0].appendChild(buttonComment);

            //add button to collapse the whole thread
            let buttonThread = document.createElement("button");
            buttonThread.title = "collapse thread";
            buttonThread.classList.add("collapseButton", "tasselCollapsibleThreadsIcons");
            buttonThread.innerHTML = `
                <svg class="svg-blue-dark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                    <path xmlns="http://www.w3.org/2000/svg" style="fill:none;stroke:#000000;stroke-width:1.2px" d="
                        M 1 12   L 10 3   L 19 12
                        M 1 20   L 10 11   L 19 20
                    "/>
                </svg>`;
            buttonThread.addEventListener("click", function() {
                let comments = this.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("comment");
                if (this.classList.contains("toggled")) {
                    //show
                    for (let comment of comments) {
                        Object.values(comment.children).forEach(function(item){
                            if (!item.classList.contains("header")) {
                                item.classList.remove("collapsed");
                            }
                        });
                        Object.values(comment.getElementsByClassName("collapseButton")).forEach(function(item) {
                            item.classList.remove("toggled");
                            item.children[0].style.transform = "rotate(0deg)";
                        });
                    }
                } else {
                    //hide
                    for (let comment of comments) {
                        Object.values(comment.children).forEach(function(item){
                            if (!item.classList.contains("header")) {
                                item.classList.add("collapsed");
                            }
                        });
                        Object.values(comment.getElementsByClassName("collapseButton")).forEach(function(item) {
                            item.classList.add("toggled");
                            item.children[0].style.transform = "rotate(180deg)";
                        });
                    }
                }
            });
            el.getElementsByClassName("comment-buttons")[0].appendChild(buttonThread);

            //add button to expand to full width
            let buttonWidth = document.createElement("button");
            buttonWidth.title = "widen comment";
            buttonWidth.classList.add("widenButton", "tasselCollapsibleThreadsIcons");
            buttonWidth.innerHTML = `
                <svg class="svg-blue-dark" xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 10 20">
                    <path xmlns="http://www.w3.org/2000/svg" style="fill:none;stroke:#000000;stroke-width:1.2px" d="
                        M 9 1   L 1 10   L 9 19
                    "/>
                </svg>`;
            buttonWidth.addEventListener("click", function() {
                //find position in thread
                let level = 0;
                let el = this;
                let comment;
                for (let a = 0; a < 200; a++) {
                    if (el.classList.contains("thread")) break;
                    else if (el.classList.contains("child-comment")) {
                        level++;
                        if (comment === undefined) comment = el;
                    }
                    el = el.parentNode;
                }

                //add styling for level of indentation
                if (!document.getElementById(`widened${level}`)) {
                    let style = document.createElement("style");
                    style.id = `widened${level}`;
                    style.innerHTML += `
                    .child-comment.widened.widened${level} {
                        margin-left: ${(level - 1) * -19}px;
                    }`;
                    document.head.appendChild(style);
                }

                //reset and assign classes
                let undo = comment.classList.contains("widened");
                let widened = document.getElementsByClassName("widened");
                for (let child of widened) child.classList.remove("widened");
                if (!undo) comment.classList.add("widened", `widened${level}`);
            });
            //add button to every child comment
            if (el.parentNode.parentNode.classList.contains("child-comment")) {
                let commentBody = el.parentNode.getElementsByClassName("body")[0];
                commentBody.classList.add("tasselCollapsibleThreadsChild");
                commentBody.appendChild(buttonWidth);
            }
        }
    }

    function removeButtons_sicrjulu() {
        let css = "";
        if (settings.hideNativeCollapse || settings.hideScrollRoot) {
            css += `
              div:has(>.toggle-comments),
              div:has(>.pointer-cursor[title="Scroll to root comment"]) {
                float: unset !important;
              }
              div:has(>div>.toggle-comments),
              div:has(>div>.pointer-cursor[title="Scroll to root comment"]){
                min-height: max-content !important;
              }`;
        } else return;

        if (settings.hideNativeCollapse) css += ".toggle-comments {display: none;}";
        if (settings.hideScrollRoot) css += `.pointer-cursor[title="Scroll to root comment"] {display: none;}`;

        //Apply new styling to page
        //src: https://stackoverflow.com/q/3922139
        let style = document.createElement("style");
        style.setAttribute('type', 'text/css');
        if (style.styleSheet) {//IE
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.head.appendChild(style);
    }

    //add elements to the Tassel menu
    window.setTimeout(initTassel_sicrjulu, 1000);
    function initTassel_sicrjulu() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar === null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarCollapsibleThreads";
        button.innerHTML = "Collapsible Threads";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarCollapsibleThreads").addEventListener("click", tasselDisplaySettings_sicrjulu);
    }

    //create Tassel settings menu
    function tasselDisplaySettings_sicrjulu() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarCollapsibleThreads").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //add settings
        content.appendChild(createSwitch_sicrjulu("Hide the native collapse button", settings.hideNativeCollapse ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.hideNativeCollapse = this.checked;
            saveSettings_sicrjulu();
        });
        content.appendChild(createSwitch_sicrjulu("Hide the scroll-to-root button", settings.hideScrollRoot ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.hideScrollRoot = this.checked;
            saveSettings_sicrjulu();
        });
    }

    function saveSettings_sicrjulu() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.collapsibleThreads = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    function createSwitch_sicrjulu(title="", state="") {
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
