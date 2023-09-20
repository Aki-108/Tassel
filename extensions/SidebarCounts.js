// ==UserScript==
// @name         Sidebar Counts
// @version      0.3
// @description  Make the Pillowfort followers/following/mutuals count be accurate, or else be "???"
// @author       optimists-inbound
// @match        https://www.pillowfort.social/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

async function countUsers_xarxirzq(sidebarLabel = "",jsonPageNumber = 0){
    let newlyCounted=0;
    //check a specific page of the followers/following/mutuals list
    await fetch(`https://www.pillowfort.social/${sidebarLabel}_json?p=${jsonPageNumber}`).then(response => response.text()).then(jsonContents => {
        const displayedValue = document.querySelector(`[href='/${sidebarLabel}'] .sidebar-bottom-num`);
        if(displayedValue !== null){
            let searchIndex = jsonContents.indexOf("{\"username\":");
            if(jsonContents.indexOf(`"${sidebarLabel}":`) !== -1){
                //if there are usernames on this page, please count them
                while(searchIndex !== -1){
                    newlyCounted++;
                    searchIndex=jsonContents.indexOf("{\"username\":",searchIndex + 1);
                }
                //update the counter in the sidebar
                if(jsonPageNumber==1){
                    displayedValue.textContent=`${newlyCounted}`;
                    //save this number to local storage in the browser
                    let storedValues=JSON.parse(localStorage.getItem("tasselSidebarCounts"));
                    if(sidebarLabel=="followers"){storedValues.savedFollowerCount=newlyCounted;}
                    else if(sidebarLabel=="following"){storedValues.savedFollowingCount=newlyCounted;}
                    else if(sidebarLabel=="mutuals"){storedValues.savedMutualCount=newlyCounted;}
                    localStorage.setItem("tasselSidebarCounts",JSON.stringify(storedValues));
                    ///
                }else{
                    let previouslyCounted = parseInt(displayedValue.textContent);
                    displayedValue.textContent=`${previouslyCounted+newlyCounted}`;
                    //save this number to local storage in the browser
                    let storedValues=JSON.parse(localStorage.getItem("tasselSidebarCounts"));
                    if(sidebarLabel=="followers"){storedValues.savedFollowerCount=previouslyCounted+newlyCounted;}
                    else if(sidebarLabel=="following"){storedValues.savedFollowingCount=previouslyCounted+newlyCounted;}
                    else if(sidebarLabel=="mutuals"){storedValues.savedMutualCount=previouslyCounted+newlyCounted;}
                    localStorage.setItem("tasselSidebarCounts",JSON.stringify(storedValues));
                    ///
                }
                //if this page is not empty, then check the next page too.
                //this should accommodate having 19 users per page instead of 20.
                if(newlyCounted !== 0){
                    countUsers_xarxirzq(sidebarLabel,jsonPageNumber+1);
                }
            }
            //below: a line to specifically handle empty(?) mutuals json URLs - they give '500' errors, for some reason.
            else if(jsonContents.indexOf(`<title>(500)</title>`) !== -1){}
            else{displayedValue.textContent=`???`;}//make it obvious if we have some issue calculating the number
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
        if(displayedValue !== null){
            if(savedCounts[i] !== -1){
                displayedValue.textContent=`${savedCounts[i]}`;
            }
            else{
                displayedValue.textContent=`???`;
            }
            countUsers_xarxirzq(sidebarLabels[i],1);
        }else{}
    }
})();
