// ==UserScript==
// @name         Collapsible Threads
// @version      1.4
// @description  Collapse Comments and Threads
// @author       aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const loadingIndicator = document.getElementById("comments_loading");
    const mutationConfig = {attributes: true, attributeFilter: ["style"]};
    const mutationCallback = (mutationList) => {
        if (loadingIndicator.style.display == "none") {
            init_sicrjulu();
        }
    };
    const mutationObserver = new MutationObserver(mutationCallback);
    if (loadingIndicator != null) mutationObserver.observe(loadingIndicator, mutationConfig);

    function init_sicrjulu() {
        let style = document.createElement("style");
        style.innerHTML += ".tasselCollapsibleThreadsIcons{filter: brightness(0) saturate(100%) invert(36%) sepia(44%) saturate(754%) hue-rotate(149deg) brightness(95%) contrast(89%)}";
        style.innerHTML += "body.dark-theme .tasselCollapsibleThreadsIcons{filter: brightness(0) saturate(100%) invert(36%) sepia(44%) saturate(754%) hue-rotate(149deg) brightness(95%) contrast(89%) brightness(0) saturate(100%) invert(62%) sepia(76%) saturate(192%) hue-rotate(169deg) brightness(85%) contrast(95%)}";
        document.head.appendChild(style);

        let headers = document.getElementsByClassName("header clearfix");
        for (let el of headers) {
            //add button to collapse comment
            let buttonComment = document.createElement("button");
            buttonComment.title = "collapse comment";
            buttonComment.classList.add("collapseButton", "tasselCollapsibleThreadsIcons");
            buttonComment.innerHTML = `
                <svg class="svg-blue-dark" style="transition:.2s transform;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
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
                            item.style.display = "block";
                        }
                    });
                    this.children[0].style.transform = "rotate(0deg)";
                    this.classList.remove("toggled");
                } else {
                    //hide
                    Object.values(comment.children).forEach(function(item){
                        if (!item.classList.contains("header")) {
                            item.style.display = "none";
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
                <svg class="svg-blue-dark" style="transition:.2s transform;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
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
                                item.style.display = "block";
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
                                item.style.display = "none";
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
        }
    }
})();
