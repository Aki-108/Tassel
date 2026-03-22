// ==UserScript==
// @name         Sidebar Counts
// @version      2.0
// @description  Make the Pillowfort followers/following/mutuals count be accurate
// @author       Aki108; optimists-inbound
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    init_xarxirzq();
    function init_xarxirzq() {
        if (document.getElementById("tasselJsonManagerFollowersReady")) document.getElementById("tasselJsonManagerFollowersReady").addEventListener("click", function() {
            display_xarxirzq("followers");
        });
        if (document.getElementById("tasselJsonManagerFollowingReady")) document.getElementById("tasselJsonManagerFollowingReady").addEventListener("click", function() {
            display_xarxirzq("following");
        });
        if (document.getElementById("tasselJsonManagerMutualsReady")) document.getElementById("tasselJsonManagerMutualsReady").addEventListener("click", function() {
            display_xarxirzq("mutuals");
        });
        display_xarxirzq("followers");
        display_xarxirzq("following");
        display_xarxirzq("mutuals");
    }

    function display_xarxirzq(type) {
        Object.values(document.getElementsByClassName("sidebar-bottom")[0].children).find(function(element) {
            return element.href=`/${type}`;
        }).getElementsByClassName("sidebar-bottom-num")[0].innerHTML = tasselJsonManager[type].real_count;
    }
    
})();
