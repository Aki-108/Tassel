// ==UserScript==
// @name         Feed Pagination
// @version      0.1
// @description  No more infinit scroll.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let loadedPages = 0;
    let activePage = 1;
window.setTimeout(function() {
    init_cksprrvl();
    if (document.getElementById("tasselJsonManagerFeedReady")) document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", loadFeed_cksprrvl);
}, 500);

    function init_cksprrvl() {
        if (document.URL !== "https://www.pillowfort.social/") return;
        document.body.style.overflow = "hidden";

        addPagination_cksprrvl();

        let blocker = document.createElement("div");
        blocker.id = "tasselFeedPaginationBlocker";
        document.body.appendChild(blocker);
    }

    function addPagination_cksprrvl() {
        let pagination = document.createElement("div");
        pagination.classList.add("tasselPaginationOuter");
        pagination.innerHTML = `
            <button id="tasselFeedPaginationPrevious">&lsaquo;</button>
            <div id="tasselFeedPaginationPages"></div>
            <button id="tasselFeedPaginationNext">&rsaquo;</button>
        `;
        document.getElementById("homeFeedCtrlId").appendChild(pagination);

        document.getElementById("tasselFeedPaginationPrevious").addEventListener("click", function() {
            simplePageTurn_cksprrvl(-1);
        });

        document.getElementById("tasselFeedPaginationNext").addEventListener("click", function() {
            document.getElementById("tasselFeedPaginationBlocker").style.display = "block";
            if (activePage > loadedPages - 1) {
                activePage++;
                document.getElementById("homeFeedCtrlId").classList.add("pageTurn");
                window.scrollBy(0, window.scrollMaxY);
                getPosts_cksprrvl().forEach(function(item){
                    item.classList.add("hidden");
                });
            } else {
                simplePageTurn_cksprrvl(1);
            }
        });
    }

    function simplePageTurn_cksprrvl(direction) {
        if (direction < 0 && activePage <= 1) return;
        if (direction > 0 && activePage >= loadedPages) return;
        document.getElementById("tasselFeedPaginationBlocker").style.display = "block";
        activePage += direction;
        let posts = Object.values(document.getElementsByClassName("tasselFeedPaginationProcessed"));
        posts.forEach(function(item) {
            if (item.classList.contains(`page${activePage}`)) item.classList.remove("hidden");
            else item.classList.add("hidden");
        });
        let pages = Object.values(document.getElementById("tasselFeedPaginationPages").children);
        pages.forEach(function(page) {
            if (page.textContent == activePage) page.classList.add("active");
            else page.classList.remove("active");
        });
        document.getElementById("homeFeedCtrlId").scrollTo(0, 0);
        document.getElementById("tasselFeedPaginationBlocker").style.display = "none";
    }

    function jumpToPage_cksprrvl(page) {
        console.log("page ", page);
        if (page < 0 || page > loadedPages || page == activePage) return;
        document.getElementById("tasselFeedPaginationBlocker").style.display = "block";
        activePage = page;
        let posts = Object.values(document.getElementsByClassName("tasselFeedPaginationProcessed"));
        posts.forEach(function(item) {
            if (item.classList.contains(`page${activePage}`)) item.classList.remove("hidden");
            else item.classList.add("hidden");
        });
        let pages = Object.values(document.getElementById("tasselFeedPaginationPages").children);
        pages.forEach(function(page) {
            if (page.textContent == activePage) page.classList.add("active");
            else page.classList.remove("active");
        });
        document.getElementById("homeFeedCtrlId").scrollTo(0, 0);
        document.getElementById("tasselFeedPaginationBlocker").style.display = "none";
    }

    function loadFeed_cksprrvl() {
        loadedPages++;
        document.getElementById("homeFeedCtrlId").classList.remove("pageTurn");
        document.getElementById("homeFeedCtrlId").scrollTo(0, 0);
        getPosts_cksprrvl().forEach(function(item) {
            if (item.classList.contains("tasselFeedPaginationProcessed")) return;
            item.classList.add("tasselFeedPaginationProcessed");
            item.classList.add(`page${loadedPages}`);
        });

        let newPage = document.createElement("button");
        newPage.innerHTML = loadedPages;
        newPage.addEventListener("click", function() {
            jumpToPage_cksprrvl(parseInt(this.textContent));
        });
        document.getElementById("tasselFeedPaginationPages").appendChild(newPage);
        let pages = Object.values(document.getElementById("tasselFeedPaginationPages").children);
        pages.forEach(function(page) {
            if (page.textContent == activePage) page.classList.add("active");
            else page.classList.remove("active");
        });

        createNewRedundantDisplay();

        document.getElementById("tasselFeedPaginationBlocker").style.display = "none";
    }

    function getPosts_cksprrvl() {
        let posts = Object.values(document.getElementsByClassName("post-container"));
        posts = posts.map(function(item) {
            return item.parentNode;
        });
        posts = posts.filter(function(item) {
            return !item.parentNode.classList.contains("modal-content");
        });
        return posts;
    }

    function createNewRedundantDisplay() {
        let frames = Object.values(document.getElementsByClassName("reblog-copy-link"));
        frames.forEach(function(item) {
            let newFrame = document.createElement("div");
            newFrame.classList.add("tasselFeedPaginationReblogPopup");
            newFrame.appendChild(item.parentNode.children[1].cloneNode(true));
            item.parentNode.children[1].remove();
            item.parentNode.appendChild(newFrame);
        });
    }
})();
