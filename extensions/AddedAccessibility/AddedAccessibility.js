// ==UserScript==
// @name         Added Accessibility
// @version      1.3
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
                if (node.tagName === "IMG" && !node.id) {
                    altTextEditor_pdmmlnvi(node);
                    return;
                }
                let altInputs = Object.values(document.getElementsByClassName("tasselAddedAccessiblityEditorInput"));
                altInputs.forEach(function(input) {
                    input.value = document.getElementById(input.getAttribute("image")).alt;
                    altTextEditorEvent_pdmmlnvi(input);
                });
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
        if (editor.length == 0) return;
        editor = editor[0].getElementsByClassName("fr-element","fr-view");
        if (editor.length == 0) return;
        editor = editor[0];
        $.get(document.URL, function(data) {
            let html = document.createElement("body");
            html.innerHTML = data.substring(data.search("<body"), data.search("</body>")+7);
            let content = Object.values(html.children).filter(function(item) {return item.classList.contains("new-post")})[0];
            content = content.children[0].children[3].children[0];
            content = content.children[1].value || content.children[2].value;
            if (content) editor.innerHTML = content;

            let imgs = Object.values(editor.getElementsByTagName("img"));
            imgs.forEach(altTextEditor_pdmmlnvi);
        })
        .fail(function() {
            console.error("Failed to load post data.");
        });
        editorObserver.observe(editor, {
            childList: true,
            subtree: true
        });

        //bug fix for clearing alt text when editing a post
        $(editor).focus();
        let e = $.Event('keypress');
        e.which = 16;
        $(editor).trigger(e);
    }

    /* Add an input box into the post editor */
    function altTextEditor_pdmmlnvi(img) {
        if (img.id) return;
        let id = "tasselAddedAccessiblityImage" + Math.random();
        let altInput = document.createElement("textarea");
        altInput.classList.add("tasselAddedAccessiblityEditorInput");
        altInput.setAttribute("image", id);
        altInput.placeholder = "Alternative Text";
        altInput.value = img.alt;
        altTextEditorEvent_pdmmlnvi(altInput);
        img.after(altInput);
        img.id = id;
    }
    function altTextEditorEvent_pdmmlnvi(el) {
        el.addEventListener("keyup", function(event) {
            if (event.keyCode == 13) {
                event.preventDefault();
            }
            document.getElementById(this.getAttribute("image")).alt = this.value;
        });
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
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.999 511.999" style="enable-background:new 0 0 511.999 511.999;filter: none !important;background: white;background: radial-gradient(circle,rgb(255, 255, 255) 0%, rgba(0, 0, 0, 0) 50%);border-radius: 100%;" alt="remove style">
                    <g>
		                <path d="M508.745,246.041c-4.574-6.257-113.557-153.206-252.748-153.206S7.818,239.784,3.249,246.035
                                 c-4.332,5.936-4.332,13.987,0,19.923c4.569,6.257,113.557,153.206,252.748,153.206s248.174-146.95,252.748-153.201
                                 C513.083,260.028,513.083,251.971,508.745,246.041z M255.997,385.406c-102.529,0-191.33-97.533-217.617-129.418
                                 c26.253-31.913,114.868-129.395,217.617-129.395c102.524,0,191.319,97.516,217.617,129.418
                                 C447.361,287.923,358.746,385.406,255.997,385.406z"/>
	                </g>
	                <g>
		                <path d="M255.997,154.725c-55.842,0-101.275,45.433-101.275,101.275s45.433,101.275,101.275,101.275
                                 s101.275-45.433,101.275-101.275S311.839,154.725,255.997,154.725z M255.997,323.516c-37.23,0-67.516-30.287-67.516-67.516
                                 s30.287-67.516,67.516-67.516s67.516,30.287,67.516,67.516S293.227,323.516,255.997,323.516z"/>
	                </g>
                </svg>`;
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
