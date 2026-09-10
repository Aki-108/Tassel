// ==UserScript==
// @name         Fort Archive
// @version      1.1
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
    let downloadQueue = [];
    let downloadsDone = {total: 0, posts: 0, images: 0, comments: 0};
    let downloadFails = [];

    let scriptURL = "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@0bc67fec09546f614d9314e642b3b487f3d6d538/extensions/FortArchive/Archive.js";
    let styleURL = "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@0bc67fec09546f614d9314e642b3b487f3d6d538/extensions/FortArchive/Archive.css";

    let icon = document.createElement("div");
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="tasselFortArchive user-buttons svg-blue" width="20" height="20" viewBox="0 0 20 20">
        <title>Archive</title>
        <path xmlns="http://www.w3.org/2000/svg" style="fill:none;stroke:#000000;stroke-width:1.4px" d="
          M 16.5 6.5   L 10.5 0.5   L 3.5 0.5   L 3.5 19.5   L 16.5 19.5   L 16.5 6.5   L 10.5 6.5   L 10.5 0.5
        "/>
      </svg>`;

    const loadScript_avytegoo = src => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.onload = resolve
            script.onerror = reject
            script.src = src
            document.head.append(script)
        })
    }

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
                document.getElementById("user-sidebar-wrap").classList.remove("hidden");
            } else initArchive_avytegoo();
        });
        sidebar.appendChild(button);
    }

    function initArchive_avytegoo() {
        document.getElementById("user-sidebar-navbutton").addEventListener("click", function() {
            document.getElementById("user-sidebar-wrap").classList.remove("hidden");
        });
        document.getElementById("user-sidebar-wrap").classList.add("hidden");
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
        lastPage = pagination ? pagination.children[pagination.children.length-2].textContent*1 : 1;
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
            <span class="vr"></span>
        `;//TODO vr
        if (true || user.toUpperCase() == document.getElementsByClassName("navbar-right")[0].getElementsByTagName("a")[0].innerHTML.toUpperCase()) navigation.innerHTML += `<button id="tasselFortArchiveNavigationDownload" class="tasselButton">Download Fort</button>`;
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
        if (document.getElementById("tasselFortArchiveNavigationDownload")) document.getElementById("tasselFortArchiveNavigationDownload").addEventListener("click", initDownloader_avytegoo);
        loadScript_avytegoo("https://cdn.jsdelivr.net/gh/Stuk/jszip@cae55105f5e8bd37c270cdb76eab2cf40388dfd9/dist/jszip.min.js");
        loadScript_avytegoo("https://cdn.jsdelivr.net/gh/Stuk/jszip@cae55105f5e8bd37c270cdb76eab2cf40388dfd9/vendor/FileSaver.js");
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
            eventArea.style.order = "-999999999999999999999998";
            eventArea.id = "tasselFortArchiveScrollDetectorTop";
        } else {
            if (document.getElementById("tasselFortArchiveScrollDetectorBottom")) return;
            eventArea.style.order = "999999999999999999999998";
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
            if (top) loadingIndicator.style.order = "-999999999999999999999999";
            else loadingIndicator.style.order = "999999999999999999999999";
            loadingIndicator.style.height = "70px";
            loadingIndicator.style.backgroundColor = "#2C405A";
            mainFrame.appendChild(loadingIndicator);
        }, function(){});
    }

    function addPost_avytegoo(post) {
        let frame = document.createElement("div");
        frame.classList.add("tasselFortArchivePost");
        frame.style.order = -new Date(post.publish_at).getTime();

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
                <img src="https://cdn.jsdelivr.net/gh/Aki-108/Tassel@50f03c59507325d27ccf9adb1a6fa46cdb6c5604/icons/comment.svg">
                <span>${post.comments_count}</span>
            </span>
            <span>
                <img src="https://cdn.jsdelivr.net/gh/Aki-108/Tassel@50f03c59507325d27ccf9adb1a6fa46cdb6c5604/icons/reblog.svg">
                <span>${post.reblogs_count}</span>
            </span>
            <span>
                <img class="${post.liked ? "svg-pink-light" : "svg-blue"}" src="${post.liked ? "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@a1b0fd5791107e84f128115ebab358d9f3bf0ab4/icons/liked.svg" : "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@50f03c59507325d27ccf9adb1a6fa46cdb6c5604/icons/like.svg"}">
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

    function initDownloader_avytegoo() {
        downloadsDone = {total: 0, posts: 0, images: 0, comments: 0};

        let window = document.createElement("div");
        window.id = "tasselFortArchiveDownloader";
        window.classList.add("beforeStart");
        document.getElementById("tasselFortArchive").innerHTML = "";
        document.getElementById("tasselFortArchive").appendChild(window);
        let exit = document.createElement("button");
        exit.classList.add("tasselButton");
        exit.innerHTML = "return";
        exit.addEventListener("click", function() {
            downloadQueue = [];
            if (mainFrame) {
                mainFrame.remove();
                mainFrame = null;
                navigation.remove();
                navigation = null;
                document.getElementById("userBlogPosts").style.display = "block";
            } else initArchive_avytegoo();
        });
        document.getElementById("tasselFortArchiveNavigation").innerHTML = "";
        document.getElementById("tasselFortArchiveNavigation").appendChild(exit);

        let intro = document.createElement("section");
        window.appendChild(intro);
        intro.innerHTML = `
            <div id="tasselFortArchiveBeforeStart">
                <h1>Settings</h1>
                <label class="tasselLabel">from page
                    <input id="tasselFortArchiveStartPage" value="1" type="number" min="1" max="${lastPage}">
                </label>
                <label class="tasselLabel">to page
                    <input id="tasselFortArchiveEndPage" value="${lastPage}" type="number" min="1" max="${lastPage}">
                </label>
                <label class="tasselCheckbox">
                    <input id="tasselFortArchiveIncludeComments" type="checkbox" checked="">
                    include comments
                </label>
                <button id="tasselFortArchiveStart" class="tasselButton">Start Download</button>
            </div>
            <div id="tasselFortArchiveAfterStart">
                <h1>Preparing your Archive...</h1>
                <div id="tasselFortArchiveProgress">
                    <div id="tasselFortArchiveProgressBar">0%</div>
                </div>
                <div id="tasselFortArchiveStats">
                    <p>files remaining: 0</p>
                    <p>posts: 0</p>
                    <p>images: 0</p>
                    <p>comments: 0</p>
                    <p>failed files: 0</p>
                </div>
            </div>
            <hr>
        `;
        document.getElementById("tasselFortArchiveStart").addEventListener("click", function() {
            let start = document.getElementById("tasselFortArchiveStartPage").value;
            let end = document.getElementById("tasselFortArchiveEndPage").value;
            if (start < 1 || end > lastPage || start > end) {
                alert("Invalid input for start and end pages.");
                return;
            }
            downloadQueue = [];
            for (let i = start; i <= end; i++) {
                downloadQueue.push(["page", i]);
            }
            downloadIcons_avytegoo();
            document.getElementById("tasselFortArchiveDownloader").classList.remove("beforeStart");
            let redirect = document.createElement("script");
            redirect.innerHTML = `if (document.URL.search("file:///") === 0) window.location.href = document.URL.substring(0, document.URL.search("\\\.")) + "_files/saved_resource.html";`;
            document.head.appendChild(redirect);
            nextDownload_avytegoo();
        });

        let instructions = document.createElement("section");
        instructions.id = "tasselFortArchiveInstruction";
        window.appendChild(instructions);
        instructions.innerHTML = `
            <h1>Download Instructions</h1>
            <p>Your download is ready when the progress bar says "done". Follow the appropriate instructions below.
            <h2>Firefox</h2>
            <details>
                <summary>
                    More...
                </summary>
                <ul>
                    <li>Right-click the fort preview below.</li>
                    <li>Select "This Frame" \> "Save Frame As...".</li>
                    <li>Save the file as a "Website, complete".</li>
                    <li>A file and a folder of the same name apear in your selected location. They have to stay together, even when you move the file.</li>
                    <li>Open the downloaded file to view your archive.</li>
                </ul>
                <img src="https://cdn.jsdelivr.net/gh/Aki-108/Tassel@0d00efdc4de9466a70f3fdd5de12d53fcbf4d5dc/documents/images/ArchiveDownloaderFirefox1.png">
            </details>
            <br>
            <h2>Chromium/Other</h2>
            <details>
                <summary>
                    More...
                </summary>
                <ul>
                    <li>Right-click this site.</li>
                    <li>Select "Save As".</li>
                    <li>Save the file as a "Webpage, complete".</li>
                    <li>A file and a folder of the same name apear in your selected location. Open the folder.</li>
                    <li>Open the file "saved_resource" to view your archive.</li>
                </ul>
            </details>
            <hr>
        `;

        let frame = document.createElement("iframe");
        frame.id = "tasselFortArchiveFrame";
        window.appendChild(frame);
        let now = new Date();
        frame.title = `Pillofort Archive ${now.getFullYear()}${now.getMonth() + 1 < 10 ? "0" : ""}${now.getMonth() + 1}${now.getDate() < 10 ? "0" : ""}${now.getDate()}`
        let html = `
            <head>
                <title>${frame.title}</title>
                <link rel="stylesheet" href="${styleURL}"></style>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nunito:400,400i,700,700i">
                <script>var username = "${user}";</script>
            </head>
            <body style="${document.body.getAttribute("style")}">
                <nav>
                    <div class="sidebar-user">${user}</div>
                    ${(document.getElementById("sidebar-user-content").innerHTML)}
                    <div class="sidebar-footer"><a href="?">Posts<span>0</span></a></div>
                </nav>
                <main>
                    <div class="post main" style="width: 300px;margin-left:290px">
                        <div class="header"></div>
                        <div class="post-content">
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                        </div>
                        <div class="post-nav"></div>
                    </div>
                    <div class="post main" style="width: 300px;margin-left:290px">
                        <div class="header"></div>
                        <div class="post-content">
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                            <div style="width: ${Math.random()*8+8}em;height: 1em;margin: 10px 20px 1em 20px;background: var(--postFontColor);opacity: 0.6;"></div>
                        </div>
                        <div class="post-nav"></div>
                    </div>
                </main>
                <footer>
                    <dir-pagination-controls>
                        <ul class="pagination">
                            <li class="disabled">
                                <a href="?p=1">‹</a>
                            </li>
                            <li class="active">
                                <a href="?p=1">1</a>
                            </li>
                            <li>
                                <a href="?p=1">›</a>
                            </li>
                        </ul>
                    </dir-pagination-controls>
                </footer>
            </body>`;
        frame.contentWindow.document.open();
        frame.contentWindow.document.write(html);
        frame.contentWindow.document.close();
    }

    function nextDownload_avytegoo() {
        let total = downloadQueue.length+downloadsDone.total;
        let percent = Math.min(Math.round(downloadsDone.total/total*100), 100);
        document.getElementById("tasselFortArchiveProgressBar").style.width = percent + "%";
        document.getElementById("tasselFortArchiveProgressBar").innerHTML = percent + "%";

        document.getElementById("tasselFortArchiveStats").innerHTML = `
            <p>files remaining: ${downloadQueue.length}</p>
            <p>posts: ${downloadsDone.posts}</p>
            <p>images: ${downloadsDone.images}</p>
            <p>comments: ${downloadsDone.comments}</p>
            <p>failed files: ${downloadFails.length}</p>
        `;

        if (downloadQueue.length > 0) {
            if (downloadQueue[0][0] == "page") downloadPage_avytegoo(downloadQueue[0][1]);
            else if (downloadQueue[0][0] == "image") downloadImage_avytegoo(downloadQueue[0][1]);
            else if (downloadQueue[0][0] == "comments") downloadComments_avytegoo(downloadQueue[0][1]);
        } else {
            if (downloadFails.length > 0) {
                document.getElementById("tasselFortArchiveStats").innerHTML = `
                    <p>files remaining: ${downloadQueue.length}</p>
                    <p>posts: ${downloadsDone.posts}</p>
                    <p>images: ${downloadsDone.images}</p>
                    <p>comments: ${downloadsDone.comments}</p>
                    <p>failed files: ${downloadFails.length} <button id="tasselFortArchiveRetryFails" class="tasselButton small">retry</button></p>
                `;
                document.getElementById("tasselFortArchiveRetryFails").addEventListener("click", function() {
                    downloadQueue.push(...downloadFails);
                    downloadFails = [];
                    nextDownload_avytegoo();
                });
            }
            let script = document.createElement("script");
            script.src = scriptURL;
            script.type = 'text/javascript';
            let frame = document.getElementById("tasselFortArchiveFrame");
            frame.contentWindow.document.body.appendChild(script);

            document.getElementById("tasselFortArchiveProgressBar").innerHTML = "done";
            document.getElementById("tasselFortArchiveDownloader").classList.add("afterFinished");
        }
    }

    function downloadPage_avytegoo(page) {
        $.getJSON(`https://www.pillowfort.social/${user}/json/?p=${page}`, function(data) {
            data.posts.forEach(function(post) {
                if (post.original_username && post.original_username != user) {
                    delete post.title;
                    delete post.content;
                    delete post.comments_count;
                    delete post.likes_count;
                    delete post.reblogs_count;
                    delete post.media;
                    delete post.original_post;
                    return;
                } else {
                    downloadQueue.push(["image", post.avatar_url]);
                }
                post.avatar_url = reformatImageURLs_avytegoo(post.avatar_url);
                if (post.media && post.media.length > 0) {
                    post.media.forEach(function(media) {
                        if (media.media_type == "picture") {
                            downloadQueue.push(["image", media.url]);
                            media.url = reformatImageURLs_avytegoo(media.url);
                            media.small_image_url = media.url;
                        } else if (media.embed_code) {
                            media.embed_code = encodeURI(media.embed_code);
                        }
                    });
                }
                post.content = downloadFormatTextbody_avytegoo(post.content);
                if (document.getElementById("tasselFortArchiveIncludeComments").checked && post.comments_count > 0) {
                    downloadQueue.push(["comments", `${post.id},${1}`]);
                }
            });
            let fileLink = document.createElement("script");
            fileLink.type = "text/javascript";
            fileLink.innerHTML = `
                if (pages == undefined) var pages = [];
                pages[${page}] = ${JSON.stringify(data)}
            `;
            let frame = document.getElementById("tasselFortArchiveFrame");
            frame.contentWindow.document.head.appendChild(fileLink);
            downloadsDone.total++;
            downloadsDone.posts += data.posts.length;
            downloadQueue.shift();
            window.setTimeout(nextDownload_avytegoo, 1000);
        }).fail(function() {
            downloadFails.push(downloadQueue[0]);
            downloadQueue.shift();
            window.setTimeout(nextDownload_avytegoo, 1000);
        });
    }

    function downloadImage_avytegoo(url) {
        let id = reformatImageURLs_avytegoo(url);
        if (!document.getElementById(id)) {
            let fileLink = document.createElement("img");
            fileLink.src = url;
            fileLink.id = id;
            fileLink.style.display = "none";
            let frame = document.getElementById("tasselFortArchiveFrame");
            frame.contentWindow.document.head.appendChild(fileLink);

            downloadsDone.total++;
            downloadsDone.images++;
            downloadQueue.shift();
            window.setTimeout(nextDownload_avytegoo, 500);
        } else {
            downloadQueue.shift();
            nextDownload_avytegoo();
        }
    }

    function downloadComments_avytegoo(url) {
        let post = url.split(",")[0]*1;
        let page = url.split(",")[1]*1;
        $.getJSON(`https://www.pillowfort.social/posts/${post}/comments?pageNum=${page}`, function(data) {
            if (data.comments.length > 0) {
                data.comments.forEach(function(comment) {
                    comment.body = downloadFormatTextbody_avytegoo(comment.body);
                });
                let fileLink = document.createElement("script");
                fileLink.type = "text/javascript";
                fileLink.innerHTML = `
                    if (comments == undefined) var comments = [];
                    if (comments[${post}] == undefined) comments[${post}] = [];
                    comments[${post}][${page}] = ${JSON.stringify(data)}
                `;
                let frame = document.getElementById("tasselFortArchiveFrame");
                frame.contentWindow.document.head.appendChild(fileLink);
                downloadQueue.push(["comments", `${post},${page+1}`]);
            }

            downloadsDone.total++;
            downloadsDone.comments += data.comments.length;
            downloadQueue.shift();
            window.setTimeout(nextDownload_avytegoo, 1000);
        }).fail(function() {
            downloadFails.push(downloadQueue[0]);
            downloadQueue.shift();
            window.setTimeout(nextDownload_avytegoo, 1000);
        });
    }

    function downloadIcons_avytegoo() {
        downloadQueue.push(["image", "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@8f35964f5cdb5721282723b2afd158deb1748e55/icons/user-badge.svg"]);
        downloadQueue.push(["image", "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@8f35964f5cdb5721282723b2afd158deb1748e55/icons/lock.svg"]);
        downloadQueue.push(["image", "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@8f35964f5cdb5721282723b2afd158deb1748e55/icons/nsfw.svg"]);
        downloadQueue.push(["image", "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@50f03c59507325d27ccf9adb1a6fa46cdb6c5604/icons/link.svg"]);
        downloadQueue.push(["image", "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@50f03c59507325d27ccf9adb1a6fa46cdb6c5604/icons/comment.svg"]);
        downloadQueue.push(["image", "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@50f03c59507325d27ccf9adb1a6fa46cdb6c5604/icons/reblog.svg"]);
        downloadQueue.push(["image", "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@50f03c59507325d27ccf9adb1a6fa46cdb6c5604/icons/like.svg"]);
        downloadQueue.push(["image", "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@a1b0fd5791107e84f128115ebab358d9f3bf0ab4/icons/liked.svg"]);
    }

    function downloadFormatTextbody_avytegoo(textBodyIn) {
        let textBodyOut = "";
        while (textBodyIn.search(`<img`) >= 0) {
            textBodyOut += textBodyIn.substring(0, textBodyIn.search(`<img`)+4);
            textBodyIn = textBodyIn.substring(textBodyIn.search(`<img`)+4);

            textBodyOut += textBodyIn.substring(0, textBodyIn.search(`src="`)+5);
            textBodyIn = textBodyIn.substring(textBodyIn.search(`src="`)+5);

            let url = textBodyIn.substring(0, textBodyIn.search(`"`));
            downloadQueue.push(["image", url]);
            textBodyOut += reformatImageURLs_avytegoo(url);
            textBodyIn = textBodyIn.substring(url.length);
        }
        textBodyOut += textBodyIn;
        return textBodyOut;
    }

    function reformatImageURLs_avytegoo(url) {
        if (!url) return url;
        url = url.split("/");
        return url[url.length - 1];
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
