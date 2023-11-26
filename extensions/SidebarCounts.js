// ==UserScript==
// @name         Sidebar Counts
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Make the Pillowfort followers/following/mutuals count be accurate, or else be "???"
// @author       optimists-inbound
// @match        https://www.pillowfort.social/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

async function countUsers_xarxirzq(sidebarLabel = "",jsonPageNumber = 1,previouslyCounted = 0,attemptNumber=1){
    let newlyCounted=0;
    //check a specific json page of the followers/following/mutuals list
    await fetch(`https://www.pillowfort.social/${sidebarLabel}_json?p=${jsonPageNumber}`)
        .then(response => response.text())
        .then(jsonContents => {
        if(jsonContents.indexOf(`<title>(500)</title>`) !== -1){
            //we're seeing a '500' error. maybe try loading this json page again?
            if(attemptNumber<3){///i'm using 3 attempts here, but maybe this number could be a user-configured setting.
                setTimeout(() => {
                    countUsers_xarxirzq(sidebarLabel,jsonPageNumber,previouslyCounted,attemptNumber+1);
                },150);///'every 150 milliseconds' seems like a good retry rate for me, but maybe this could be a user-configured setting too.
            }
            else if(sidebarLabel=="mutuals" && jsonPageNumber>1){
                //i'm guessing that a '500' error is fine if it's for mutuals, and if it's beyond page 1.
                //the mutuals json gives a Pillowfort-style '500' error page when it has no users listed.
                //if we're done counting, then we can display the counted value.
                const displayedValue = document.querySelector(`[href='/${sidebarLabel}'] .sidebar-bottom-num`);
                if(displayedValue !== null){displayedValue.textContent=`${previouslyCounted+newlyCounted}`;}
                //save this displayed number to local storage in the browser
                let storedValues=JSON.parse(localStorage.getItem("tasselSidebarCounts"));
                if(sidebarLabel=="followers"){storedValues.savedFollowerCount=previouslyCounted+newlyCounted;}
                else if(sidebarLabel=="following"){storedValues.savedFollowingCount=previouslyCounted+newlyCounted;}
                else if(sidebarLabel=="mutuals"){storedValues.savedMutualCount=previouslyCounted+newlyCounted;}
                localStorage.setItem("tasselSidebarCounts",JSON.stringify(storedValues));
            }
        }
        else{
            const displayedValue = document.querySelector(`[href='/${sidebarLabel}'] .sidebar-bottom-num`);
            if(displayedValue == null){return;}

            //this revised code for counting usernames, for version 0.5, should exclude deleted users too.
            newlyCounted=jsonContents.split(`{"username":"`).length-1;
            newlyCounted-=jsonContents.split(`_deleted","avatar_url":"http`).length-1;

            if(newlyCounted !== 0){//if this page is not empty, then check the next page too.
                countUsers_xarxirzq(sidebarLabel,jsonPageNumber+1,previouslyCounted+newlyCounted);
            }
            //if this page is empty, then we're done counting now. let's display what we've counted.
            //the displayed value should change from ??? to the correct number, and never display any incorrect numbers in between.
            else{
                displayedValue.textContent=`${previouslyCounted+newlyCounted}`;
                //save this displayed number to local storage in the browser
                let storedValues=JSON.parse(localStorage.getItem("tasselSidebarCounts"));
                if(sidebarLabel=="followers"){storedValues.savedFollowerCount=previouslyCounted+newlyCounted;}
                else if(sidebarLabel=="following"){storedValues.savedFollowingCount=previouslyCounted+newlyCounted;}
                else if(sidebarLabel=="mutuals"){storedValues.savedMutualCount=previouslyCounted+newlyCounted;}
                localStorage.setItem("tasselSidebarCounts",JSON.stringify(storedValues));
            }
        }
    });
}

(function() {
    'use strict';
    let savedCounts=[-1,-1,-1];
    if(localStorage.getItem("tasselSidebarCounts")==null){
        localStorage.setItem("tasselSidebarCounts",`{"savedFollowerCount":-1,"savedFollowingCount":-1,"savedMutualCount":-1}`);
    }
    else{
        let storedValues=JSON.parse(localStorage.getItem("tasselSidebarCounts"));
        savedCounts=[parseInt(storedValues.savedFollowerCount),parseInt(storedValues.savedFollowingCount),parseInt(storedValues.savedMutualCount)];
    }
    const sidebarLabels=["followers","following","mutuals"];
    for(let i=0;i<3;i++){
        //initially display previously-saved values, or display "???" if no values are saved
        let displayedValue=document.querySelector(`[href='/${sidebarLabels[i]}'] .sidebar-bottom-num`);
        if(displayedValue == null){return;}
        if(savedCounts[i] !== -1){
            displayedValue.textContent=`${savedCounts[i]}`;
        }
        else{
            displayedValue.textContent=`???`;
        }
        countUsers_xarxirzq(sidebarLabels[i]);
    }
})();
