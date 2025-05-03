// ==UserScript==
// @name         Moderation Aid
// @version      0.1
// @description  Keep up with flags and pending posts.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settings = JSON.parse(localStorage.getItem("tasselModerationAid")) || {};
    let now = new Date().getTime();

    init_ncxtjacn();
    function init_ncxtjacn() {
        setSidebarFlags_ncxtjacn();
        setSidebarPending_ncxtjacn();
        openFlags_ncxtjacn();
        openPending_ncxtjacn();

        if (now - settings.lastCheck < 3600000 /*1 h*/) return;
        settings.lastCheck = now;
        localStorage.setItem("tasselModerationAid", JSON.stringify(settings));

        $.getJSON(`https://www.pillowfort.social/community_flags/0/json?resolved=false&p=1`, function(data) {
            settings.flags = data.total_items || 0;
            localStorage.setItem("tasselModerationAid", JSON.stringify(settings));
            setSidebarFlags_ncxtjacn();
        });

        if (document.getElementById("tasselJsonManagerCommunitiesReady")) document.getElementById("tasselJsonManagerCommunitiesReady").addEventListener("click", function() {
            let moderating = tasselJsonManager.communities.communities.filter(function(item) {return item.membership_type === "moderator"});
            let screenPosts = moderating.filter(function(item) {return item.screen_posts});
            console.log(screenPosts);
            settings.pending = 0;
            for (let community of screenPosts) {
                $.getJSON(`https://www.pillowfort.social/community/${community.id}/pending_posts?p=1`, function(data) {
                    if (data.total_items > 0) settings.pendingLink = `https://www.pillowfort.social/community_flags/${community.id}/`;

                    settings.pending = (settings.pending || 0) + data.total_items;
                    localStorage.setItem("tasselModerationAid", JSON.stringify(settings));
                    setSidebarPending_ncxtjacn();
                });
            }
        });
    }

    function setSidebarFlags_ncxtjacn() {
        let sidebarItem = document.getElementById("tasselModerationAidFlags");
        if (settings.flags <= 0 || settings.flags === undefined) {
            if (sidebarItem) sidebarItem.remove();
            return;
        }

        if (!sidebarItem) {
            sidebarItem = document.createElement("a");
            sidebarItem.id = "tasselModerationAidFlags";
            sidebarItem.href = "/communities?tab=flags";
            sidebarItem.classList.add("sidebar-indent-a");

            let sidebarCommunities = Object.values(document.getElementsByClassName("sidebar-rows sidebar-expanded")[0].children).find(function(item) {
                return item.href === "https://www.pillowfort.social/communities";
            });
            sidebarCommunities.after(sidebarItem);
        }

        sidebarItem.innerHTML = `<div class="sidebar-topic sidebar-indent" style=""><span>Flags</span><div class="sidebar-num" style="padding-top: 4px">${settings.flags}</div></div>`;
    }

    function setSidebarPending_ncxtjacn() {
        let sidebarItem = document.getElementById("tasselModerationAidPending");
        if (settings.pending <= 0 || settings.pending === undefined) {
            if (sidebarItem) sidebarItem.remove();
            return;
        }

        if (!sidebarItem) {
            sidebarItem = document.createElement("a");
            sidebarItem.id = "tasselModerationAidPending";
            sidebarItem.classList.add("sidebar-indent-a");

            let sidebarCommunities = Object.values(document.getElementsByClassName("sidebar-rows sidebar-expanded")[0].children).find(function(item) {
                return item.href === "https://www.pillowfort.social/communities";
            });
            sidebarCommunities.after(sidebarItem);
        }

        sidebarItem.innerHTML = `<div class="sidebar-topic sidebar-indent" style=""><span>Pending</span><div class="sidebar-num" style="padding-top: 4px">${settings.pending}</div></div>`;
        sidebarItem.href = settings.pendingLink + "?tab=pending";
    }

    function openFlags_ncxtjacn() {
        if (document.URL.search("https://www.pillowfort.social/communities") !== 0) return;

        settings.lastCheck = 0;
        window.addEventListener("beforeunload", function() {
            settings.lastCheck = 0;
            localStorage.setItem("tasselModerationAid", JSON.stringify(settings));
        });

        let queryString = new URLSearchParams(window.location.search.substring(1));
        for (let pair of queryString.entries()) {
            if (pair[0] === "tab" && pair[1] === "flags") {
                waitForKeyElements("#comm-index-nav-tabs", function() {
                    document.getElementById("comm-index-nav-tabs").getElementsByTagName("li")[3].firstChild.click();
                });
            }
        }
    }

    function openPending_ncxtjacn() {
        if (document.URL.search("https://www.pillowfort.social/community_flags") !== 0) return;

        settings.lastCheck = 0;
        window.addEventListener("beforeunload", function() {
            settings.lastCheck = 0;
            localStorage.setItem("tasselModerationAid", JSON.stringify(settings));
        });

        let queryString = new URLSearchParams(window.location.search.substring(1));
        for (let pair of queryString.entries()) {
            if (pair[0] === "tab" && pair[1] === "pending") {
                waitForKeyElements("#flags-tabs", function() {
                    document.getElementById("flags-tabs").getElementsByTagName("li")[1].firstChild.click();
                });
            }
        }
    }
})();
