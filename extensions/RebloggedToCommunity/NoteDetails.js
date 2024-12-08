// ==UserScript==
// @name         Note Details
// @version      2.11
// @description  Shows where a post has been liked/reblogged to.
// @author       Aki108
// @match        http*://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @updateURL    https://raw.githubusercontent.com/Aki-108/Tassel/main/extensions/RebloggedToCommunity.js
// @downloadURL  https://raw.githubusercontent.com/Aki-108/Tassel/main/extensions/RebloggedToCommunity.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /* Wait for the page to load before initializing the script. */
    let reblogTimeouts = [], likeTimeouts = [];
    let settings = (JSON.parse(localStorage.getItem("tasselSettings2")) || {});
    if (settings.rebloggedToCommunity) {
        settings = settings.rebloggedToCommunity;
    } else {
        settings = {
            "showLikes": true,
            "showReblogs": true,
            "showTags": false
        };
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.rebloggedToCommunity = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    highlightNewNotes_tlfevnlu();
    waitForKeyElements("#tasselJsonManagerReblogReady", addEventListener_tlfevnlu);
    initTassel_tlfevnlu();

    /* Initialize the script by adding event listeners to necessary buttons for user interaction. */
    function addEventListener_tlfevnlu() {
        if (document.URL.search("www.pillowfort.social/posts/") === -1) return;
        if (document.URL.search("www.pillowfort.social/posts/new") !== -1) return;

        //JSON Manager events
        document.getElementById("tasselJsonManagerReblogReady").addEventListener("click", fillReblogData_tlfevnlu);
        document.getElementById("tasselJsonManagerLikeReady").addEventListener("click", fillLikeData_tlfevnlu);

        //HTML click events
        let reblogButton = document.getElementsByClassName("nav-tabs")[0].children[1];
        reblogButton.addEventListener("click", function() {
            if (document.getElementsByClassName("rtcsourcedisplayingreblogs").length > 0) return;
            fillReblogData_tlfevnlu();
        });
        let likeButton = document.getElementsByClassName("nav-tabs")[0].children[2];
        likeButton.addEventListener("click", function() {
            if (document.getElementsByClassName("rtcsourcedisplayinglikes").length > 0) return;
            fillLikeData_tlfevnlu();
        });

        //Dark Mode fix for no reblogs and no likes
        Object.values(document.getElementById("reblogs").children).find(function(child) {
            return child.innerText === "There\n    are no reblogs for this post."
        }).style.backgroundColor = "var(--tag_bg)";
        Object.values(document.getElementById("likes").children).find(function(child) {
            return child.innerText === "There are no likes for this post."
        }).style.backgroundColor = "var(--tag_bg)";
    }

    /* Display reblog data. */
    function fillReblogData_tlfevnlu() {
        let notes = Object.values(document.getElementById("reblogs").getElementsByClassName("reblog-note"));
        for (let index in notes) {
            notes[index].classList.add("rtcsourcedisplayingreblogs");
            let link = notes[index].getElementsByTagName("a")[1];
            let postId = link.href.substring(link.href.search("/posts/")+7);
            let comm = tasselJsonManager.reblogs.json[index].community;

            //search cache for community
            if (comm === null) {
                link.outerHTML += " to their fort";
                addTags_tlfevnlu(notes[index], index);
            } else {
                addTags_tlfevnlu(notes[index], index, comm);
            }
        }
    }

    /* Show tags of the reblog */
    function addTags_tlfevnlu(div, index, community) {
        if (!settings.showTags) return;
        let tags = tasselJsonManager.reblogs.json[index].cached_tag_list || "";
        if (tags.length) {
            tags = tags.split(", ");
            let tagFrame = document.createElement("p");
            tagFrame.classList.add("tasselNoteDetailsTags");
            for (let a = 0; a < tags.length; a++) {
                let tagLink = document.createElement("a");
                if (community) tagLink.href = `https://www.pillowfort.social/community/${community}/tagged/${tags[a]}`;
                else tagLink.href = `https://www.pillowfort.social/${tasselJsonManager.reblogs.json[index].username}/tagged/${tags[a]}`;
                tagLink.innerHTML = tags[a];
                tagFrame.appendChild(tagLink);
                if (a < tags.length - 1) {
                    let comma = document.createElement("span");
                    comma.innerHTML = ", ";
                    tagFrame.appendChild(comma);
                }
            }
            div.appendChild(tagFrame);
        }
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /* Display like data. */
    function fillLikeData_tlfevnlu() {
        //stop everything that's already loading
        for (let i = likeTimeouts.length-1; i >= 0; i--) clearTimeout(likeTimeouts.pop());
        if (!settings.showLikes) return;
        //if the old entries are still displaying, wait some time and try again
        if (document.getElementsByClassName("rtcsourcedisplayinglikes").length > 0) {
            likeTimeouts.push(setTimeout(fillLikeData_tlfevnlu, 200));
            return;
        }

        let notes = Object.values(document.getElementById("likes").children);
        for (let index in notes) {
            if (notes[index].tagName === "DIR-PAGINATION-CONTROLS") return;
            if (notes[index] === undefined || notes[index].children.length < 1) continue;
            notes[index].classList.add("rtcsourcedisplayinglikes");
            let postId = tasselJsonManager.likes.json[index - 1].liked_via_reblog_id;

            //add a loading circle
            let dataLoading = document.createElement("a");
            dataLoading.classList.add("like"+postId);
            dataLoading.innerHTML = "<i class='fa fa-circle-notch fa-spin fa-3x fa-fw' style='color:var(--linkColor);font-size:15px;'></i>";
            notes[index].children[0].appendChild(dataLoading);

            //start fetching post data
            if (document.getElementsByClassName("like"+postId).length > 1) continue;
            likeTimeouts.push(setTimeout(function(){findReblog_tlfevnlu(postId);}, 500*likeTimeouts.length));
        }
    }

    /* Fetch post data. */
    function findReblog_tlfevnlu(postId) {
        $.getJSON('https://www.pillowfort.social/posts/'+postId+'/json', function(data) {
            //fill data for all entries from the same reblog
            let notes = Object.values(document.getElementsByClassName("like"+postId));
            for (let note of notes) {
                note.classList.remove("like"+postId);
                if (data.comm_name == undefined) note.outerHTML = " in <a href='https://www.pillowfort.social/" + data.username + "'>" + data.username + "</a>'s fort";
                else note.outerHTML = " in <a href='https://www.pillowfort.social/community/" + data.comm_name + "'>" + data.comm_name + "</a>";
            }
        }).fail(function(value) {
            //show error message
            let notes = Object.values(document.getElementsByClassName("like"+postId));
            for (let note of notes) {
                note.classList.remove("like"+postId);
                note.outerHTML = " in <abbr title='" + value.statusText + "'>???</abbr>";
            }
        });
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function highlightNewNotes_tlfevnlu() {
        if (!settings.newNotes) return;
        if (document.URL !== "https://www.pillowfort.social/notifs_dash") return;
        let lastVisit = JSON.parse(localStorage.getItem("tasselNoteDetails")) || {visited: 0};
        let currentVisit = new Date().getTime();

        let loadingObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                if (mutationRecord.attributeName === "style" && mutationRecord.target.style.display === "none") {
                    let notes = Object.values(document.getElementsByClassName("comment-subheader"));
                    for (let note of notes) {
                        let timestamp = note.textContent.split("\n")[5];
                        if (timestamp.search("at") < 0) timestamp = note.textContent.split("\n")[1];
                        if (timestamp.search("at") < 0) timestamp = note.textContent.split("\n")[2];
                        if (timestamp.search("at") < 0) timestamp = note.textContent.split("\n")[4];
                        let date = new Date(timestamp.slice(timestamp.search(" at ")+4).slice(0,22));
                        if (isNaN(date.getTime())) console.log(timestamp);
                        if (date.getTime() >= lastVisit.visited) note.classList.add("tasselNoteDetailsNew");
                    }
                }
            });
        });
        loadingObserver.observe(document.getElementById("all_loading_spinner"), {
            attributes: true,
            attributeFilter: ["style"]
        });
        loadingObserver.observe(document.getElementById("replies_loading_spinner"), {
            attributes: true,
            attributeFilter: ["style"]
        });
        loadingObserver.observe(document.getElementById("lr_loading_spinner"), {
            attributes: true,
            attributeFilter: ["style"]
        });

        window.addEventListener("beforeunload", function(event) {
            lastVisit.visited = currentVisit;
            localStorage.setItem("tasselNoteDetails", JSON.stringify(lastVisit));
        });
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //add elements to the Tassel menu
    function initTassel_tlfevnlu() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarNoteDetails";
        button.innerHTML = "Note Details";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarNoteDetails").addEventListener("click", tasselDisplaySettings_tlfevnlu);
    }

    //create Tassel settings menu
    function tasselDisplaySettings_tlfevnlu() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarNoteDetails").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //add settings
        content.appendChild(createSwitch_tlfevnlu("Show the tags of a reblog.", settings.showTags ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.showTags = this.checked;
            let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
            file.rebloggedToCommunity = settings;
            localStorage.setItem("tasselSettings2", JSON.stringify(file));
        });
        content.appendChild(createSwitch_tlfevnlu("Show where likes came from.", settings.showLikes ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.showLikes = this.checked;
            let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
            file.rebloggedToCommunity = settings;
            localStorage.setItem("tasselSettings2", JSON.stringify(file));
        });
        content.appendChild(createSwitch_tlfevnlu("Hightlight new notifications.", settings.newNotes ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.newNotes = this.checked;
            let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
            file.rebloggedToCommunity = settings;
            localStorage.setItem("tasselSettings2", JSON.stringify(file));
        });
    }

    function createSwitch_tlfevnlu(title="", state="") {
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
