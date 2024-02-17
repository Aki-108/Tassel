// ==UserScript==
// @name         Reblogged to Community
// @version      2.8
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


    /* Cache of communities with most members or active members. */
    let comms = []
    comms.push([509, "Active_Users"]);
    comms.push([177, "AnimalCrossing"]);
    comms.push([211, "Anime"]);
    comms.push([223, "ArtistAlley"]);
    comms.push([632, "BakersBakingStuff"]);
    comms.push([3, "BetaUsers"]);
    comms.push([557, "Bookworms"]);
    comms.push([9293, "cat pics"]);
    comms.push([84, "cats"]);
    comms.push([131, "CriticalRole"]);
    comms.push([11261, "Degoogle"]);
    comms.push([352, "DnD"]);
    comms.push([145, "Dogs"]);
    comms.push([157, "dragon-age"]);
    comms.push([39, "fallout"]);
    comms.push([614, "FandomOlds"]);
    comms.push([135, "Fanfiction"]);
    comms.push([853, "femslash"]);
    comms.push([11, "ffxiv"]);
    comms.push([7578, "FindComments"]);
    comms.push([226, "Food"]);
    comms.push([76, "for folks who like art and OCs with out social media pressures"]);
    comms.push([8846, "Furry Twitter - 18 and over"]);
    comms.push([49, "Gaming"]);
    comms.push([218, "Ghibli"]);
    comms.push([321, "goth"]);
    comms.push([287, "HarryPotterSeries"]);
    comms.push([4693, "Horny Webcomics 🔞"]);
    comms.push([80, "horror"]);
    comms.push([11554, "IntroduceYourself"]);
    comms.push([56, "KingdomHearts"]);
    comms.push([166, "Legend-of-Zelda"]);
    comms.push([132, "LewdDraws"]);
    comms.push([112, "LGBT"]);
    comms.push([136, "Marvel"]);
    comms.push([293, "Memes"]);
    comms.push([86, "Nintendo"]);
    comms.push([113, "NSFW"]);
    comms.push([3244, "NSFW-Furries"]);
    comms.push([304, "OCs"]);
    comms.push([351, "omgcheckplease"]);
    comms.push([1256, "OriginalContent"]);
    comms.push([51, "Overwatch"]);
    comms.push([37, "PillowArtists"]);
    comms.push([15, "Pokemon"]);
    comms.push([455, "Queer"]);
    comms.push([17, "~Queers on TV~"]);
    comms.push([54, "Science"]);
    comms.push([295, "Splatoon"]);
    comms.push([82, "stardew-valley"]);
    comms.push([161, "startrek"]);
    comms.push([153, "StevenUniverse"]);
    comms.push([147, "TAZ"]);
    comms.push([964, "Teratophilia 🔞"]);
    comms.push([4514, "Tumblr NSFW Art, BDSM, Kink and Sex-Work Refugees"]);
    comms.push([202, "Webcomics"]);
    comms.push([11183, "Wholesome Games"]);
    comms.push([107, "Witchcraft"]);
    comms.push([1419, "Writing"]);
    comms.push([1062, "Writing-Prompts"]);
    comms.push([92, "YuriOnIce"]);


    /* Display reblog data. */
    function fillReblogData_tlfevnlu() {
        //stop everything that's already loading
        for (let i = reblogTimeouts.length-1; i >= 0; i--) clearTimeout(reblogTimeouts.pop());
        //if the old entries are still displaying, wait some time and try again
        if (document.getElementsByClassName("rtcsourcedisplayingreblogs").length > 0) {
            reblogTimeouts.push(setTimeout(fillReblogData_tlfevnlu, 200));
            return;
        }

        let notes = Object.values(document.getElementById("reblogs").getElementsByClassName("reblog-note"));
        for (let index in notes) {
            notes[index].classList.add("rtcsourcedisplayingreblogs");
            let link = notes[index].getElementsByTagName("a")[1];
            let postId = link.href.substring(link.href.search("/posts/")+7);
            let commId = tasselJsonManager.reblogs.json[index].community_id;

            //search cache for community
            if (commId === null) {
                if (settings.showReblogs) link.outerHTML += " to their fort";
                addTags_tlfevnlu(notes[index], index);
            }
            let comm = comms.find(function(value) {
                return value[0] === commId;
            });
            if (comm) {
                if (settings.showReblogs) link.outerHTML += " to <a href='https://www.pillowfort.social/community/" + comm[1] + "'>" + comm[1] + "</a>";
                addTags_tlfevnlu(notes[index], index, comm[1]);
            }

            //when the community is not in the cache, add a loading circle
            if (commId !== null && !comm && settings.showReblogs) {
                let dataLoading = document.createElement("a");
                dataLoading.classList.add("reblog"+postId);
                dataLoading.innerHTML = "<i class='fa fa-circle-notch fa-spin fa-3x fa-fw' style='color:var(--linkColor);font-size:15px;'></i>";
                notes[index].appendChild(dataLoading);
            }

            //start fetching community data
            if (commId === null || comm) continue;
            if (document.getElementsByClassName("reblog"+postId).length > 1) continue;
            reblogTimeouts.push(setTimeout(function(){findCommunity_tlfevnlu(postId, index);}, 500*reblogTimeouts.length));
        }
    }

    /* Fetch community data. */
    function findCommunity_tlfevnlu(postId, index) {
        $.getJSON('https://www.pillowfort.social/posts/'+postId+'/json', function(data) {
            //fill data for all entries with the same community
            let notes = Object.values(document.getElementsByClassName("reblog"+postId));
            for (let note of notes) {
                addTags_tlfevnlu(note.parentNode, index, data.comm_name);
                note.classList.remove("reblog"+postId);
                if (data.comm_name === undefined) note.outerHTML = " to their fort";
                else note.outerHTML = " to <a href='https://www.pillowfort.social/community/" + data.comm_name + "'>" + data.comm_name + "</a>";
            }
        }).fail(function(value) {
            //show error message
            let notes = Object.values(document.getElementsByClassName("reblog"+postId));
            for (let note of notes) {
                addTags_tlfevnlu(note.parentNode, index);
                note.classList.remove("reblog"+postId);
                note.outerHTML = " to <abbr title='" + value.statusText + "'>???</abbr>";
            }
        });
    }

    /* Show tags of the reblog */
    function addTags_tlfevnlu(div, index, community) {
        if (!settings.showTags) return;
        let tags = tasselJsonManager.reblogs.json[index].cached_tag_list || "";
        if (tags.length) {
            tags = tags.split(", ");
            let tagFrame = document.createElement("p");
            tagFrame.classList.add("tasselRebloggedToCommunityTags");
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
            notes[index].appendChild(dataLoading);

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

    //add elements to the Tassel menu
    function initTassel_tlfevnlu() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarRebloggedToCommunity";
        button.innerHTML = "Reblogged to Community";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarRebloggedToCommunity").addEventListener("click", tasselDisplaySettings_tlfevnlu);
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
        document.getElementById("tasselModalSidebarRebloggedToCommunity").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //add settings
        content.appendChild(createSwitch_tlfevnlu("Show where reblogs went to.", settings.showReblogs ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.showReblogs = this.checked;
            let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
            file.rebloggedToCommunity = settings;
            localStorage.setItem("tasselSettings2", JSON.stringify(file));
        });
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
