// ==UserScript==
// @name         Fort Archive
// @version      0.5
// @description  View lots of posts at once.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let user = document.getElementsByClassName("username-data");
    if (!user.length) return;
    user = user[0].id;
    let pageTime = [];
    let pageJson = [];
    let lastPage = 1;
    let mainFrame;
    let navigation;
    let pagesDisplayed = [];
    let maxSearchDepth = 1;
    let searchedCount = 0;

    let icon = document.createElement("div");
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="tasselFortArchive user-buttons svg-purple" width="20" height="20" viewBox="0 0 20 20">
        <title>Archive</title>
        <path xmlns="http://www.w3.org/2000/svg" style="fill:none;stroke:#000000;stroke-width:1.4px" d="
          M 16.5 6.5   L 10.5 0.5   L 3.5 0.5   L 3.5 19.5   L 16.5 19.5   L 16.5 6.5   L 10.5 6.5   L 10.5 0.5
        "/>
      </svg>`;

    init_avytegoo();
    function init_avytegoo() {
        let sidebar = document.getElementsByClassName("util-buttons sidebar-expanded")[0];
        let button = document.createElement("button");
        button.innerHTML = icon.innerHTML;
        button.addEventListener("click", function() {
            if (mainFrame) {
                mainFrame.remove();
                mainFrame = null;
                navigation.remove();
                navigation = null;
                document.getElementById("userBlogPosts").style.display = "block";
            } else initArchive_avytegoo();
        });
        sidebar.appendChild(button);
    }

    function initArchive_avytegoo() {
        document.getElementById("user-sidebar-navbutton").click();
        Object.values(document.getElementsByClassName("sidebar")).forEach(function(item) {item.style.zIndex = 99999;item.style.top = "54px"});

        mainFrame = document.createElement("main");
        mainFrame.id = "tasselFortArchive";
        document.getElementById("userBlogPosts").after(mainFrame);

        navigation = document.createElement("nav");
        navigation.id = "tasselFortArchiveNavigation";
        document.getElementById("userBlogPosts").after(navigation);

        document.getElementById("userBlogPosts").style.display = "none";
        loadPage_avytegoo(1);

        let pagination = document.getElementsByClassName("pagination")[0];
        lastPage = pagination.children[pagination.children.length-2].textContent*1;
        maxSearchDepth = Math.ceil(Math.log2(lastPage + 1));

        navigation.innerHTML = `
            <label for="tasselFortArchiveJumpLoading">Preloading fort:</label>
            <progress id="tasselFortArchiveJumpLoading" value="0" max="${maxSearchDepth}"></progress>
        `;

        findLastPage_avytegoo(1, lastPage);
    }

    function initNav_avytegoo() {
        window.setTimeout(function() {
            if (pageTime.length >= 2) loadNavigation_avytegoo();
            else initNav_avytegoo();
        }, 500);
    }
    function loadNavigation_avytegoo() {
        navigation.innerHTML = `
            Jump to:
            <select id="tasselFortArchiveNavigationMonth">
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
            </select>
            <select id="tasselFortArchiveNavigationYear">
            </select>
            <button id="tasselFortArchiveNavigationSearch" class="tasselButton">Go</button>
            <button id="tasselFortArchiveNavigationReverse" class="tasselButton">Reverse</button>
        `;
        let years = document.getElementById("tasselFortArchiveNavigationYear");
        let start = pageTime[1][1].getFullYear();
        let end = pageTime[pageTime.length-1][0].getFullYear();
        for (let year = start; year >= end; year--) {
            years.innerHTML += `<option>${year}</option>`;
        }
        document.getElementById("tasselFortArchiveNavigationSearch").addEventListener("click", function() {
            findDate_avytegoo(1, lastPage);
        });
        document.getElementById("tasselFortArchiveNavigationReverse").addEventListener("click", function() {
            if (mainFrame.classList.contains("reverse")) mainFrame.classList.remove("reverse");
            else mainFrame.classList.add("reverse");
            Object.values(document.getElementsByClassName("tasselFortArchivePost")).forEach(function(post) {
                post.style.order *= -1;
            });
        });
    }

    function findLastPage_avytegoo(minPage, maxPage, lastSuccessful, lastUnsuccessful) {
        let pivot = Math.ceil((minPage+maxPage)/2);
        if (lastSuccessful === lastUnsuccessful-1 || lastSuccessful === lastPage) {
            lastPage = lastSuccessful;
            initNav_avytegoo();
            return;
        }
        $.getJSON(`${document.URL}/json/?p=${pivot}`, function(data) {
            searchedCount++;
            let loading = document.getElementById("tasselFortArchiveJumpLoading");
            if (loading) loading.value = searchedCount;
            if (data.posts.length) {
                lastSuccessful = lastSuccessful < pivot || lastSuccessful === undefined ? pivot : lastSuccessful;
                findLastPage_avytegoo(pivot+1, maxPage, lastSuccessful, lastUnsuccessful);
                pageTime[pivot] = [
                    new Date(data.posts[data.posts.length-1].timestamp.replace("@", ""))
                    ,
                    new Date(data.posts[0].timestamp.replace("@", ""))
                ];
                pageJson[pivot] = data;
            } else {
                lastUnsuccessful = lastUnsuccessful > pivot || lastUnsuccessful === undefined ? pivot : lastUnsuccessful;
                findLastPage_avytegoo(minPage, pivot-1, lastSuccessful, lastUnsuccessful);
            }
        });
    }

    function findDate_avytegoo(minPage, maxPage) {
        let pivot = Math.ceil((minPage+maxPage)/2);
        if (pageTime[pivot]) evaluateDate_avytegoo(minPage, pivot, maxPage);
        else {
            $.getJSON(`${document.URL}/json/?p=${pivot}`, function(data) {
                pageTime[pivot] = [
                    new Date(data.posts[data.posts.length-1].timestamp.replace("@", ""))
                    ,
                    new Date(data.posts[0].timestamp.replace("@", ""))
                ];
                pageJson[pivot] = data;
                evaluateDate_avytegoo(minPage, pivot, maxPage);
            });
        }
    }

    function evaluateDate_avytegoo(minPage, pivot, maxPage) {
        let month = document.getElementById("tasselFortArchiveNavigationMonth").value;
        let year = document.getElementById("tasselFortArchiveNavigationYear").value;
        let date = new Date(`01 ${month} ${year}`).getTime();
        //escape endless loop
        if (maxPage === pivot) {
            clearPage_avytegoo();
            loadPage_avytegoo(minPage);
            return;
        }
        if (date <= pageTime[minPage][1].getTime() && date >= pageTime[pivot][0].getTime()) {
            if (date >= pageTime[minPage][0].getTime()) {
                clearPage_avytegoo();
                loadPage_avytegoo(minPage);
                //if (minPage > 1) addLoadPage(minPage-1, true);
                return;
            } else if (date <= pageTime[pivot][1].getTime()) {
                clearPage_avytegoo();
                loadPage_avytegoo(pivot);
                //if (pivot > 1) addLoadPage(pivot-1, true);
                return;
            } else {
                findDate_avytegoo(minPage, pivot);
                return;
            }
        }
        if (date <= pageTime[pivot][1].getTime() && date >= pageTime[maxPage][0].getTime()) {
            if (date >= pageTime[pivot][0].getTime()) {
                clearPage_avytegoo();
                loadPage_avytegoo(pivot);
                // if (pivot > 1) addLoadPage(pivot-1, true);
                return;
            } else if (date <= pageTime[maxPage][1].getTime()) {
                clearPage_avytegoo();
                loadPage_avytegoo(maxPage);
                //if (maxPage > 1) addLoadPage(maxPage-1, true);
                return;
            } else {
                findDate_avytegoo(pivot, maxPage);
                return;
            }
        }
        //selected date is older than oldest post
        if (date < pageTime[maxPage][0].getTime()) {
            clearPage_avytegoo();
            loadPage_avytegoo(maxPage);
            return;
        }
    }

    function clearPage_avytegoo() {
        mainFrame.innerHTML = "";
        pagesDisplayed = [];
    }

    function loadPage_avytegoo(page, hidden) {
        if (!hidden && pagesDisplayed.includes(page)) return;
        if (pageJson[page]) {
            if (hidden) return;
            pagesDisplayed.push(page);
            pageJson[page].posts.forEach(function(post) {
                addPost_avytegoo(post);
            });
            if (page < lastPage) addLoadPage_avytegoo(page+1);
            if (page > 1) addLoadPage_avytegoo(page-1, true);
            if (document.getElementById("tasselFortArchiveLoadingIndicator")) document.getElementById("tasselFortArchiveLoadingIndicator").remove();
        } else {
            $.getJSON(`${document.URL}/json/?p=${page}`, function(data) {
                pageTime[page] = [
                    new Date(data.posts[data.posts.length-1].timestamp.replace("@", ""))
                    ,
                    new Date(data.posts[0].timestamp.replace("@", ""))
                ];
                pageJson[page] = data;
                if (hidden) return;
                pagesDisplayed.push(page);
                data.posts.forEach(function(post) {
                    addPost_avytegoo(post);
                });
                if (page < lastPage) addLoadPage_avytegoo(page+1);
                if (page > 1) addLoadPage_avytegoo(page-1, true);
                if (document.getElementById("tasselFortArchiveLoadingIndicator")) document.getElementById("tasselFortArchiveLoadingIndicator").remove();
            });
        }
    }

    function addLoadPage_avytegoo(page, top) {
        if (pagesDisplayed.includes(page)) return;
        let eventArea = document.createElement("div");
        if (top) {
            if (document.getElementById("tasselFortArchiveScrollDetectorTop")) return;
            eventArea.style.order = "-99999998";
            eventArea.id = "tasselFortArchiveScrollDetectorTop";
        } else {
            if (document.getElementById("tasselFortArchiveScrollDetectorBottom")) return;
            eventArea.style.order = "99999998";
            eventArea.id = "tasselFortArchiveScrollDetectorBottom";
        }
        eventArea.style.height = "70px";
        mainFrame.appendChild(eventArea);
        VisibilityMonitor_avytegoo(eventArea, function() {
            eventArea.remove();
            let dir = 1;
            if (top != mainFrame.classList.contains("reverse")) dir = -1;
            window.scrollBy({top: 71*dir, left: 0, behavior : "auto"});
            loadPage_avytegoo(page);
            if (pageJson[page]) return;
            let loadingIndicator = document.createElement("div");
            loadingIndicator.id = "tasselFortArchiveLoadingIndicator";
            loadingIndicator.innerHTML = `<div style="text-align: center;"><i class="fa fa-circle-notch fa-spin fa-3x fa-fw" style="color:white; margin-top: 10px;"></i></div>`;
            if (top) loadingIndicator.style.order = "-99999999";
            else loadingIndicator.style.order = "99999999";
            loadingIndicator.style.height = "70px";
            loadingIndicator.style.backgroundColor = "#2C405A";
            mainFrame.appendChild(loadingIndicator);
        }, function(){});
    }

    function addPost_avytegoo(post) {
        let frame = document.createElement("div");
        frame.classList.add("tasselFortArchivePost");
        frame.style.order = -post.id;

        if (post.original_post) {
            post.title = post.original_post.title;
            post.comments_count = post.original_post.comments_count;
            post.reblogs_count = post.original_post.reblogs_count;
            post.likes_count = post.original_post.likes_count;
        }

        let info = document.createElement("div");
        info.classList.add("tasselFortArchivePostInfo");
        let time = document.createElement("a");
        time.innerHTML = post.timestamp.replace(" @ ", "<br>");
        time.setAttribute("href", `https://www.pillowfort.social/posts/${post.id}`);
        info.appendChild(time);
        info.appendChild(document.createElement("hr"));
        let notes = document.createElement("div");
        notes.classList.add("tasselFortArchivePostInfoNotes");
        notes.innerHTML = `
            <span>
                <img src="/assets/global/ic_comments-971400e1d5e879ea6d55b07efceaeab51933a87f0efeda913ee55a363a5a5628.svg">
                <span>${post.comments_count}</span>
            </span>
            <span>
                <img src="/assets/global/ic_repost-05181363d91d42e9926ec9a2f623b8367228dc7588b573d8c2be4365eb76d477.svg">
                <span>${post.reblogs_count}</span>
            </span>
            <span>
                <img class="${post.liked ? "svg-pink-light" : "svg-blue"}" src="${post.liked ? "/assets/global/heart-filled-21763dc1590d5cd3b2f7fbdd6f55c4f32638eb3b9447f1f9c2189d96d8cf1693.svg" : "/assets/global/heart-empty-0df522a263aebc4b7469d31bac635776ea3794c9fc2bac01986d4917f1faa857.svg"}">
                <span>${post.likes_count}</span>
            </span>
        `;
        info.appendChild(notes);
        info.appendChild(document.createElement("hr"));
        let tags = document.createElement("div");
        tags.classList.add("tasselFortArchivePostInfoTags");
        post.tags.forEach(function(tag) {
            if (tags.children.length) tags.lastChild.innerHTML += ",";
            tags.innerHTML += `<span><a href="https://www.pillowfort.social/${user}/tagged/${tag}">${tag}</a></span>`;
        });
        info.appendChild(tags);
        frame.appendChild(info);

        let display = document.createElement("div");
        display.classList.add("tasselFortArchivePostDisplay");
        if (post.title.length) {
            let head = document.createElement("header");
            head.innerHTML = `
                <h3>${post.title}</h3>
            `;
            display.appendChild(head);
        }
        if (post.media.length) {
            if (post.media[0].media_type === "picture") {
                let pictures = document.createElement("div");
                pictures.classList.add("tasselFortArchivePostImage");
                pictures.innerHTML = `
                <img src="${post.media[0].small_image_url || post.media[0].b2_sm_url || post.media[0].url}">
            `;
                if (post.media.length >= 2) {
                    pictures.innerHTML += `
                    <img src="${post.media[1].small_image_url || post.media[1].b2_sm_url || post.media[1].url}">
                `;
                    pictures.classList.add("half");
                }
                display.appendChild(pictures);
            } else if (post.media[0].media_type === "youtube") {
                let video = document.createElement("iframe");
                video.classList.add("youtubeembed");
                video.setAttribute("frameborder", "0");
                video.src = `https://www.youtube.com/embed/${post.media[0].url}`;
                display.appendChild(video);
            } else if (post.post_type === "embed") {
                let embed = document.createElement("div");
                embed.classList.add("embed");
                embed.innerHTML = post.media[0].embed_code;
                display.appendChild(embed);
            }
        }
        let content = document.createElement("div");
        content.classList.add("tasselFortArchivePostContent");
        content.innerHTML = post.content.replaceAll("[READ-MORE]", "").replaceAll("[/READ-MORE]", "");
        display.appendChild(content);
        frame.appendChild(display);

        let postDate = new Date(post.timestamp.replace("@", ""));
        let yearFrame = document.getElementById("tasselFortArchiveYear"+postDate.getFullYear());
        if (!yearFrame) {
            yearFrame = document.createElement("div");
            yearFrame.style.order = -postDate.getFullYear();
            yearFrame.id = "tasselFortArchiveYear"+postDate.getFullYear();
            yearFrame.innerHTML = `
                <h1>${postDate.getFullYear()}</h1>
                <div class="content"></div>
            `;
            mainFrame.appendChild(yearFrame);
        }
        let monthFrame = yearFrame.getElementsByClassName("content")[0].getElementsByClassName("tasselFortArchiveMonth"+postDate.getMonth());
        if (!monthFrame.length) {
            monthFrame = document.createElement("div");
            monthFrame.order = -postDate.getMonth();
            monthFrame.classList.add("tasselFortArchiveMonth"+postDate.getMonth());
            let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            monthFrame.innerHTML = `
                <h2>${monthNames[postDate.getMonth()]}</h2>
                <div class="content"></div>
            `;
            yearFrame.getElementsByClassName("content")[0].appendChild(monthFrame);
        } else monthFrame = monthFrame[0];
        monthFrame.getElementsByClassName("content")[0].appendChild(frame);
    }

    //src: https://stackoverflow.com/a/2159195
    function VisibilityMonitor_avytegoo(element, showfn, hidefn) {
        let isshown= false;
        function check() {
            if (rectsIntersect_avytegoo(getPageRect_avytegoo(), getElementRect_avytegoo(element)) !== isshown) {
                isshown= !isshown;
                isshown? showfn() : hidefn();
            }
        };
        window.onscroll=window.onresize= check;
        check();
    }
    function getPageRect_avytegoo() {
        let isquirks= document.compatMode!=='BackCompat';
        let page= isquirks? document.documentElement : document.body;
        let x= page.scrollLeft;
        let y= page.scrollTop;
        let w= 'innerWidth' in window? window.innerWidth : page.clientWidth;
        let h= 'innerHeight' in window? window.innerHeight : page.clientHeight;
        return [x, y, x+w, y+h];
    }
    function getElementRect_avytegoo(element) {
        let x= 0, y= 0;
        let w= element.offsetWidth, h= element.offsetHeight;
        while (element.offsetParent!==null) {
            x+= element.offsetLeft;
            y+= element.offsetTop;
            element= element.offsetParent;
        }
        return [x, y, x+w, y+h];
    }
    function rectsIntersect_avytegoo(a, b) {
        return a[0]<b[2] && a[2]>b[0] && a[1]<b[3] && a[3]>b[1];
    }
})();
