// ==UserScript==
// @name         Reblogged to Community
// @version      2.2
// @description  Shows where a post has been liked/reblogged to.
// @author       aki108
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
    var reblogPageButtons;
    var likePageButtons;
    var dataJSON;
    var timeouts = [];

    waitForKeyElements("#post-comments-section", addEventListener_tlfevnlu);
    initTassel_tlfevnlu();

    /* Initialize the script by adding event listeners to necessary buttons for user interaction. */
    function addEventListener_tlfevnlu() {
        if (document.URL.search("www.pillowfort.social/posts/") == -1) return;
        //reblogs-tab and reblog-pagination buttons events
        let reblogButton = document.getElementsByClassName("nav-tabs")[0].children[1];
        reblogButton.addEventListener("click", runReblog_tlfevnlu);
        reblogButton.addEventListener("click", fixDarkMode_tlfevnlu);
        reblogPageButtons = document.getElementsByTagName("dir-pagination-controls")[1];
        reblogPageButtons.addEventListener("click", runReblog_tlfevnlu);

        //create toggle to hide reblog data
        if (document.getElementById("tasselModalSidebar") == null) {
            let reblogToggle = document.createElement("div");
            reblogToggle.style = "float:right;margin-top:-38px;background:var(--postHeaderFooter);color:var(--postHeaderFont);border-radius:4px;padding:4px;max-width:calc(50% - 171px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
            reblogToggle.innerHTML = "<input type='checkbox' id='rtcreblogtoggle' style='transform:scale(0.9);margin:0;'/><label for='rtcreblogtoggle' style='margin:0 0 0 3px;font-weight:normal;cursor:pointer;width:max-content;' title='disable extra reblog data'>hide data</label>";
            reblogToggle.firstChild.checked = localStorage.getItem("rtcdisablereblog") == "true";
            reblogToggle.firstChild.addEventListener("change", changeSetting_tlfevnlu);
            reblogToggle.addEventListener("mouseover", function(){document.getElementById("rtcrebloginfo").style.display = "flex";});
            reblogToggle.addEventListener("mouseout", function(){document.getElementById("rtcrebloginfo").style.display = "none";});
            document.getElementById("reblogs").children[0].style.marginTop = 0;
            document.getElementById("reblogs").insertBefore(reblogToggle, document.getElementById("reblogs").firstChild);

            //create hover-info-bubble for reblogs
            let reblogInfo = document.createElement("div");
            reblogInfo.id = "rtcrebloginfo";
            reblogInfo.style = "display:none;justify-content:center;height:0;overflow:visible;";
            reblogInfo.innerHTML = "<div style='background:var(--postHeaderFooter);color:var(--postHeaderFont);width:max-content;max-width:50%;height:max-content;padding:4px;border:1px #2C405A solid;z-index:1;margin-top:-65px;line-height:1em;'>Hiding data will only effect changes from the Reblogged to Community Extension regarding the Reblogs-tab.<br>Hiding data will reduce network activity.</div>";
            document.getElementById("reblogs").insertBefore(reblogInfo, document.getElementById("reblogs").firstChild);
        }

        //likes-tab and like-pagination buttons events
        let likeButton = document.getElementsByClassName("nav-tabs")[0].children[2];
        likeButton.addEventListener("click", runLike_tlfevnlu);
        likeButton.addEventListener("click", fixDarkMode_tlfevnlu);
        likePageButtons = document.getElementsByTagName("dir-pagination-controls")[2];
        likePageButtons.addEventListener("click", runLike_tlfevnlu);

        //create toggle to hide like data
        if (document.getElementById("tasselModalSidebar") == null) {
            let likeToggle = document.createElement("div");
            likeToggle.style = "float:right;margin-top:-38px;background:var(--postHeaderFooter);color:var(--postHeaderFont);border-radius:4px;padding:4px;max-width:calc(50% - 171px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
            likeToggle.innerHTML = "<input type='checkbox' id='rtcliketoggle' style='transform:scale(0.9);margin:0;'/><label for='rtcliketoggle' style='margin:0 0 0 3px;font-weight:normal;cursor:pointer;width:max-content;' title='disable extra like data'>hide data</label>";
            likeToggle.firstChild.checked = localStorage.getItem("rtcdisablelike") == "true";
            likeToggle.firstChild.addEventListener("change", changeSetting_tlfevnlu);
            likeToggle.addEventListener("mouseover", function(){document.getElementById("rtclikeinfo").style.display = "flex";});
            likeToggle.addEventListener("mouseout", function(){document.getElementById("rtclikeinfo").style.display = "none";});
            document.getElementById("likes").children[0].style.marginTop = 0;
            document.getElementById("likes").insertBefore(likeToggle, document.getElementById("likes").firstChild);

            //create hover-info-bubble for likes
            let likeInfo = document.createElement("div");
            likeInfo.id = "rtclikeinfo";
            likeInfo.style = "display:none;justify-content:center;height:0;overflow:visible;";
            likeInfo.innerHTML = "<div style='background:var(--postHeaderFooter);color:var(--postHeaderFont);width:max-content;max-width:50%;height:max-content;padding:4px;border:1px #2C405A solid;z-index:1;margin-top:-65px;line-height:1em;'>Hiding data will only effect changes from the Reblogged to Community Extension regarding the Likes-tab.<br>Hiding data will reduce network activity.</div>";
            document.getElementById("likes").insertBefore(likeInfo, document.getElementById("likes").firstChild);
        }

        //Dark Mode fix for no reblogs and no likes
        Object.values(document.getElementById("reblogs").children).find(function(child) {
            return child.innerText == "There\n    are no reblogs for this post."
        }).style.backgroundColor = "var(--tag_bg)";
        Object.values(document.getElementById("likes").children).find(function(child) {
            return child.innerText == "There are no likes for this post."
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

    /* Load reblog data. */
    function runReblog_tlfevnlu() {
        //stop everything that's already loading
        for (let i = timeouts.length-1; i >= 0; i--) clearTimeout(timeouts.pop());
        if (localStorage.getItem("rtcdisablereblog") == "true") return;
        //if the old entries are still displaying, wait some time and try again
        if (document.getElementsByClassName("rtcsourcedisplayingreblogs").length > 0) {
            timeouts.push(setTimeout(runReblog_tlfevnlu, 200));
            return;
        }
        fixDarkMode_tlfevnlu();

        //fetch new data
        let page = 1;
        if (reblogPageButtons.getElementsByClassName("active").length > 0) page = reblogPageButtons.getElementsByClassName("active")[0].textContent;
        $.getJSON(document.URL.split("?")[0]+'/reblogs?p='+page, function(data) {
            dataJSON = data;
            fillReblogData_tlfevnlu();
        });
    }

    /* After new data is fetched, display it. */
    function fillReblogData_tlfevnlu() {
        let notes = Object.values(document.getElementById("reblogs").getElementsByClassName("reblog-note"));
        for (let index in notes) {
            let note = notes[index];
            note.classList.add("rtcsourcedisplayingreblogs");
            let link = note.getElementsByTagName("a")[1];
            let postId = link.href.substring(link.href.search("/posts/")+7);
            let commId = Object.values(dataJSON)[0][index].community_id;

            //search cache for community
            if (commId == null) {
                link.outerHTML += " to their fort";
                continue;
            }
            let comm = comms.filter(function(value){
                return value[0] == commId;
            });
            if (comm.length > 0) {
                link.outerHTML += " to <a href='https://www.pillowfort.social/community/" + comm[0][1] + "'>" + comm[0][1] + "</a>";
                continue;
            }

            //when the community is not in the cache, add a loading circle
            let dataLoading = document.createElement("a");
            dataLoading.classList.add("reblog"+postId);
            dataLoading.innerHTML = "<i class='fa fa-circle-notch fa-spin fa-3x fa-fw' style='color:var(--linkColor);font-size:15px;'></i>";
            note.appendChild(dataLoading);

            //start fetching community data
            if (document.getElementsByClassName("reblog"+postId).length > 1) continue;
            timeouts.push(setTimeout(function(){findCommunity_tlfevnlu(postId);}, 500*timeouts.length));
        }
    }

    /* Fetch community data. */
    function findCommunity_tlfevnlu(postId) {
        $.getJSON('https://www.pillowfort.social/posts/'+postId+'/json', function(data) {
            //fill data for all entries with the same community
            let notes = Object.values(document.getElementsByClassName("reblog"+postId));
            for (let note of notes) {
                note.classList.remove("reblog"+postId);
                if (data.comm_name == undefined) {
                    note.outerHTML = " to their fort";
                } else {
                    note.outerHTML = " to <a href='https://www.pillowfort.social/community/" + data.comm_name + "'>" + data.comm_name + "</a>";
                }
            }
        }).fail(function(value) {
            //show error message
            let notes = Object.values(document.getElementsByClassName("reblog"+postId));
            for (let note of notes) {
                note.classList.remove("reblog"+postId);
                note.outerHTML = " to <abbr title='" + value.statusText + "'>???</abbr>";
            }
        });
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /* Load like data. */
    function runLike_tlfevnlu() {
        //stop everything that's already loading
        for (let i = timeouts.length-1; i >= 0; i--) clearTimeout(timeouts.pop());
        if (localStorage.getItem("rtcdisablelike") == "true") return;
        //if the old entries are still displaying, wait some time and try again
        if (document.getElementsByClassName("rtcsourcedisplayinglikes").length > 0) {
            timeouts.push(setTimeout(runLike_tlfevnlu, 200));
            return;
        }
        fixDarkMode_tlfevnlu();

        //fetch new data
        let page = 1;
        if (likePageButtons.getElementsByClassName("active").length > 0) page = likePageButtons.getElementsByClassName("active")[0].textContent;
        $.getJSON(document.URL.split("?")[0]+'/likes?p='+page, function(data) {
            dataJSON = data;
            fillLikeData_tlfevnlu();
        });
    }

    /* After new data is fetched, display it. */
    function fillLikeData_tlfevnlu() {
        let notes = Object.values(document.getElementById("likes").getElementsByClassName("like-note"));
        for (let index in notes) {
            let note = notes[index];
            note.classList.add("rtcsourcedisplayinglikes");
            let postId = Object.values(dataJSON)[0][index].liked_via_reblog_id;

            //add a loading circle
            let dataLoading = document.createElement("a");
            dataLoading.classList.add("like"+postId);
            dataLoading.innerHTML = "<i class='fa fa-circle-notch fa-spin fa-3x fa-fw' style='color:var(--linkColor);font-size:15px;'></i>";
            note.appendChild(dataLoading);

            //start fetching post data
            if (document.getElementsByClassName("like"+postId).length > 1) continue;
            timeouts.push(setTimeout(function(){findReblog_tlfevnlu(postId);}, 500*timeouts.length));
        }
    }

    /* Fetch post data. */
    function findReblog_tlfevnlu(postId) {
        $.getJSON('https://www.pillowfort.social/posts/'+postId+'/json', function(data) {
            //fill data for all entries from the same reblog
            let notes = Object.values(document.getElementsByClassName("like"+postId));
            for (let note of notes) {
                note.classList.remove("like"+postId);
                if (data.comm_name == undefined) {
                    note.outerHTML = " in <a href='https://www.pillowfort.social/" + data.username + "'>" + data.username + "</a>'s fort";
                } else {
                    note.outerHTML = " in <a href='https://www.pillowfort.social/community/" + data.comm_name + "'>" + data.comm_name + "</a>";
                }
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

    /* Save settings. */
    function changeSetting_tlfevnlu(el) {
        if (el.srcElement.id == "rtcreblogtoggle") {
            localStorage.setItem("rtcdisablereblog", el.srcElement.checked);
            if (!el.srcElement.checked) runReblog_tlfevnlu();
        } else if (el.srcElement.id == "rtcliketoggle") {
            localStorage.setItem("rtcdisablelike", el.srcElement.checked);
            if (!el.srcElement.checked) runLike_tlfevnlu();
        }
    }

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
        content.appendChild(createSwitch_tlfevnlu("Show where Reblogs went to", localStorage.getItem("rtcdisablereblog") == "true" ? "" : "checked"));
        content.lastChild.children[0].addEventListener("change", function() {
            localStorage.setItem("rtcdisablereblog", !this.checked);
        });
        content.appendChild(createSwitch_tlfevnlu("Show where Likes came from", localStorage.getItem("rtcdisablelike") == "true" ? "" : "checked"));
        content.lastChild.children[0].addEventListener("change", function() {
            localStorage.setItem("rtcdisablelike", !this.checked);
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

    function fixDarkMode_tlfevnlu() {
        let notes = document.querySelectorAll(".reblog-note, .like-note")
        notes.forEach(function(note) {
            note.style.backgroundColor = "var(--tag_bg)";
        });
    }
})();
