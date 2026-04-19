// ==UserScript==
// @name         Added Accessibility
// @version      1.2
// @description  Accessibility Tools
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).addedAccessibility || {};
    let editorObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            mutationRecord.addedNodes.forEach(function(node) {
                if (node.tagName === "IMG" && node.id.length === 0) {
                    let id = "tasselAddedAccessiblityImage" + Math.random();
                    let altInput = document.createElement("textarea");
                    altInput.classList.add("tasselAddedAccessiblityEditorInput");
                    altInput.setAttribute("image", id);
                    altInput.placeholder = "Alternative Text";
                    altInput.addEventListener("keyup", function() {
                        document.getElementById(this.getAttribute("image")).alt = this.value;
                    });
                    node.after(altInput);
                    node.id = id;
                } else {
                    let altInputs = Object.values(document.getElementsByClassName("tasselAddedAccessiblityEditorInput"));
                    altInputs.forEach(function(input) {
                        input.value = document.getElementById(input.getAttribute("image")).alt;
                        input.addEventListener("keyup", function() {
                            document.getElementById(this.getAttribute("image")).alt = this.value;
                        });
                    });
                }
            });
        });
    });

    init_pdmmlnvi();
    function init_pdmmlnvi() {
        initEditor_pdmmlnvi();
        initFeeds_pdmmlnvi();
        initFortStyle_pdmmlnvi();
        initTassel_pdmmlnvi();
    }

    /* Add alt-text input in the post editor */
    function initEditor_pdmmlnvi() {
        if (settings.disableAltText) return;
        let editor = document.getElementsByClassName("main","create-post-main");
        if (editor.length > 0) {
            editor = editor[0].getElementsByClassName("fr-element","fr-view");
            if (editor.length > 0) {
                editor = editor[0];
                $.get(document.URL, function(data) {
                    let html = document.createElement("body");
                    html.innerHTML = data.substring(data.search("<body"), data.search("</body>")+7);
                    let content = Object.values(html.children).filter(function(item) {return item.classList.contains("new-post")})[0];
                    content = content.children[0].children[3].children[0];
                    content = content.children[1].value || content.children[2].value;
                    editor.innerHTML = content || "";

                    let imgs = Object.values(editor.getElementsByTagName("img"));
                    imgs.forEach(function(img) {
                        let id = "tasselAddedAccessiblityImage" + Math.random();
                        let altInput = document.createElement("textarea");
                        altInput.classList.add("tasselAddedAccessiblityEditorInput");
                        altInput.setAttribute("image", id);
                        altInput.placeholder = "Alternative Text";
                        altInput.value = img.alt;
                        altInput.addEventListener("keyup", function(event) {
                            if (event.keyCode == 13) {
                                event.preventDefault();
                            }
                            document.getElementById(this.getAttribute("image")).alt = this.value;
                        });
                        img.after(altInput);
                        img.id = id;
                    });
                })
                .fail(function() {
                    console.log("failed");
                });
                editorObserver.observe(editor, {
                    childList: true,
                    subtree: true
                });
            }
        }
    }

    /* Add event listeners to JSON Manager feed handelers */
    function initFeeds_pdmmlnvi() {
        if (settings.disableAltText) return;

        document.getElementById("tasselJsonManagerPostReady").addEventListener("click", function() {
            let post = document.getElementsByClassName("post main");
            if (post.length === 0) return;
            Object.values(post[0].getElementsByTagName("img")).forEach(function(img) {
                addAltText_pdmmlnvi(img);
            });
        });

        document.getElementById("tasselJsonManagerCommentReady").addEventListener("click", function() {
            let comments = document.getElementById("comments");
            if (!comments) return;
            Object.values(comments.getElementsByTagName("img")).forEach(function(img) {
                addAltText_pdmmlnvi(img);
            });
        });

        document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", function() {
            let feed = document.getElementById("homeFeedCtrlId") || document.getElementById("userBlogPosts") || document.getElementById("communityPostsFeed") || document.getElementById("searchFeedCtrl") || document.getElementById("drafts-page") || document.getElementById("queuedPostsCtrlId");
            if (!feed) return;
            Object.values(feed.getElementsByTagName("img")).forEach(function(img) {
                addAltText_pdmmlnvi(img);
            });
        });

        document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
            let modal = document.getElementById("single-post-container") || document.getElementById("reblog-modal");
            if (!modal) return;
            Object.values(modal.getElementsByTagName("img")).forEach(function(img) {
                addAltText_pdmmlnvi(img);
            });
        });
    }

    /* Create alt-text display element */
    function addAltText_pdmmlnvi(img) {
        if (img.alt.length === 0 || img.classList.contains("svg-purple-dark") || img.classList.contains("tasselAddedAccessiblityProcessed")) return;
        img.classList.add("tasselAddedAccessiblityProcessed");
        let altText = document.createElement("p");
        altText.style = "background: var(--tag_bg); padding: 0.5em;";
        altText.innerHTML = "Alt: " + img.alt;
        img.after(altText);
    }

    /* Add button to fort sidebar */
    function initFortStyle_pdmmlnvi() {
        let areas = Object.values(document.getElementsByClassName("util-buttons"));
        for (let area of areas) {
            let button = document.createElement("button");
            button.title = "remove style";
            button.style = "border: none;background: none;width: 22px;height: 22px;margin: 0;padding: 0;";
            button.innerHTML = `<img alt="remove style" style="filter: none !important;background: white;background: radial-gradient(circle,rgb(255, 255, 255) 0%, rgba(0, 0, 0, 0) 50%);border-radius: 100%;" src="/assets/global/watch-8a83b714a3c8fd66d5a9948c2f655ca085ec6dc8f97370ebaf9b0c5b55e3a88b.svg">`;
            button.addEventListener("click", function() {
                if (document.body.classList.contains("tasselAddedAccessibilityUnstyle")) {
                    document.body.classList.remove("tasselAddedAccessibilityUnstyle");
                } else {
                    document.body.classList.add("tasselAddedAccessibilityUnstyle");
                }
            });
            area.appendChild(button);
        }
    }

    /* Add elements to the Tassel menu */
    function initTassel_pdmmlnvi() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarAddedAccessibility";
        button.style.order = "0101";
        button.innerHTML = "Added Accessibility";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarAddedAccessibility").addEventListener("click", displaySettings_pdmmlnvi);
    }

    /* Create Tassel settings menu */
    function displaySettings_pdmmlnvi() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarAddedAccessibility").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //add settings
        content.appendChild(createSwitch_pdmmlnvi("Disable alt-text improvements", settings.disableAltText ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.disableAltText = this.checked;
            saveSettings_pdmmlnvi();
        });
    }

    function saveSettings_pdmmlnvi() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.addedAccessibility = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    function createSwitch_pdmmlnvi(title="", state="") {
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
