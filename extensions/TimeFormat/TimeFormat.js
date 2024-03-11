// ==UserScript==
// @name         Time Format
// @version      1.4
// @description  Format timestamps any way you want.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let permaLinks; //array of perma-link elements
    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).timeFormat || {
        reblogDate: "RRR ago",
        reblogTooltip: "MMM DD, YYYY @ hh:mm ap",
        postDate: "",
        editDate: "Last edited RRR ago.",
        commentDate: "RRR ago",
        reblogNote: "RRR ago",
        likeNote: "RRR"
    };
    let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    init_draxcpxe();
    function init_draxcpxe() {
        initTassel_draxcpxe();
        if (document.getElementById("tasselJsonManagerFeedReady")) document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", loadFeed_draxcpxe);
        if (document.getElementById("tasselJsonManagerPostReady")) document.getElementById("tasselJsonManagerPostReady").addEventListener("click", loadSinglePost_draxcpxe);
        if (document.getElementById("tasselJsonManagerCommentReady")) document.getElementById("tasselJsonManagerCommentReady").addEventListener("click", processComments_draxcpxe);
        if (document.getElementById("tasselJsonManagerReblogReady")) document.getElementById("tasselJsonManagerReblogReady").addEventListener("click", processReblogs_draxcpxe);
        if (document.getElementById("tasselJsonManagerLikeReady")) document.getElementById("tasselJsonManagerLikeReady").addEventListener("click", processLikes_draxcpxe);
    }

    /* Get the posts from the feed and hand them to the post processor */
    function loadFeed_draxcpxe() {
        if (tasselJsonManager.feed.type === "queue") return;
        if (tasselJsonManager.feed.type === "schedule") return;
        let posts = [];
        permaLinks = document.getElementsByClassName("link_post");
        Object.values(permaLinks).forEach(function(item) {
            if (item.href.split("/")[4] === "") return;
            let id = item.href.split("/")[4]*1;
            for (let a = 0; a < 100 && !item.classList.contains("post-container"); a++) {
                item = item.parentNode;
            }
            posts.push({
                id: id,
                post: item
            });
        });
        processPosts_draxcpxe(tasselJsonManager.feed.posts, posts);
    }

    /* Get post from JSON Manager and process it */
    function loadSinglePost_draxcpxe() {
        processPosts_draxcpxe([tasselJsonManager.post.json], [{
            id: tasselJsonManager.post.json.original_post ? tasselJsonManager.post.json.original_post_id : tasselJsonManager.post.json.id,
            post: document.getElementsByClassName("post-container")[0]
        }]);
    }

    /* Apply changes to the posts */
    function processPosts_draxcpxe(postData, posts) {
        for (let post of postData) {
            let postElement = posts.find(function(item) {
                return (item.id === (post.original_post_id || post.id));
            });
            if (postElement === undefined) continue;
            if (postElement.post.classList.contains("tasselTimeFormatProcessed")) continue;
            postElement.post.classList.add("tasselTimeFormatProcessed");

            //post header
            //get formated reblog date
            let reblogged = formatDate_draxcpxe(new Date(post.publish_at), settings.reblogDate);
            if (settings.reblogDate.length === 0) reblogged = element.innerHTML;
            //get formated publish date
            let posted = "";
            if (post.original_post) posted = formatDate_draxcpxe(new Date(post.original_post.publish_at), settings.postDate);
            //get html element
            let element = postElement.post.getElementsByClassName("timestamp2")[0];
            if (element === undefined) continue;
            //set formated reblog date
            element.innerHTML = reblogged;
            //style for two dates to be displayed
            if (element.innerHTML.length > 0 && posted.length > 0) {
                element.innerHTML += "<br>";
                element.style = "line-height: 1.2em;display: inline-block";
            }
            //set formated publish date
            element.innerHTML += posted;
            //set formated tooltip
            if (settings.reblogTooltip.length > 0) {
                if (post.original_post) element.title = formatDate_draxcpxe(new Date(post.original_post.publish_at), settings.reblogTooltip);
                else element.title = formatDate_draxcpxe(new Date(post.publish_at), settings.reblogTooltip);
            }
        }
    }

    /* Apply changes to the comments */
    function processComments_draxcpxe() {
        if (settings.commentDate.length === 0) return;
        for (let comment of tasselJsonManager.comments.comments) {
            let commentElement = document.getElementById(comment.id);
            if (commentElement === undefined) continue;
            if (commentElement.classList.contains("tasselTimeFormatProcessed")) continue;
            commentElement.classList.add("tasselTimeFormatProcessed");
            let text = commentElement.getElementsByClassName("comment-subheader")[0];
            if (!text) continue;
            text.lastChild.textContent = "";
            text.children[1].innerHTML = formatDate_draxcpxe(new Date(comment.created_at), settings.commentDate);
        }
    }

    /* Apply changes to the reblog list */
    function processReblogs_draxcpxe() {
        if (settings.reblogNote.length === 0) return;
        let links = Object.values(document.getElementsByClassName("reblog-note"));
        for (let reblog of tasselJsonManager.reblogs.json) {
            let element = links.find(function(item) {
                return item.children[1].href === `https://www.pillowfort.social/posts/${reblog.id}`;
            });
            if (element === undefined) continue;
            if (element.classList.contains("tasselTimeFormatProcessed")) continue;
            element.classList.add("tasselTimeFormatProcessed");
            element.children[1].innerHTML = formatDate_draxcpxe(new Date(reblog.publish_at), settings.reblogNote);
        }
    }

    /* Apply changes to the like list */
    function processLikes_draxcpxe() {
        if (settings.likeNote.length === 0) return;
        let links = Object.values(document.getElementById("likes").children);
        for (let index in links) {
            if (links[index].tagName === "DIR-PAGINATION-CONTROLS") return;
            let element = links[index];
            if (element === undefined || element.children.length < 1) continue;
            if (element.classList.contains("tasselTimeFormatProcessed")) continue;
            element.classList.add("tasselTimeFormatProcessed");
            element.children[0].children[1].innerHTML = formatDate_draxcpxe(new Date(tasselJsonManager.likes.json[index - 1].created_at), settings.likeNote);
        }
    }

    /* Format date to the desired form */
    function formatDate_draxcpxe(time, format) {
        let data = {
            mask: format,
            output: format
        }

        let hours = time.getHours();
        if (data.mask.indexOf("HH") >= 0) data = replaceKey_draxcpxe(data, "HH", (hours < 10 ? "0" : "") + hours);
        if (data.mask.indexOf("H") >= 0) data = replaceKey_draxcpxe(data, "H", hours);
        let ap = hours < 12 ? "AM" : "PM";
        hours += hours > 12 ? -12 : 0;
        hours = hours <= 0 ? 12 : hours;
        if (data.mask.indexOf("hh") >= 0) data = replaceKey_draxcpxe(data, "hh", (hours < 10 ? "0" : "") + hours);
        if (data.mask.indexOf("h") >= 0) data = replaceKey_draxcpxe(data, "h", hours);

        let minutes = time.getMinutes();
        if (data.mask.indexOf("mm") >= 0) data = replaceKey_draxcpxe(data, "mm", (minutes < 10 ? "0" : "") + minutes);
        if (data.mask.indexOf("m") >= 0) data = replaceKey_draxcpxe(data, "m", minutes);

        let seconds = time.getSeconds();
        if (data.mask.indexOf("SS") >= 0) data = replaceKey_draxcpxe(data, "SS", (seconds < 10 ? "0" : "") + seconds);
        if (data.mask.indexOf("S") >= 0) data = replaceKey_draxcpxe(data, "S", seconds);

        if (data.mask.indexOf("RRR") >= 0) data = replaceKey_draxcpxe(data, "RRR", getRelativeTime_draxcpxe(time, false));
        if (data.mask.indexOf("RR") >= 0) data = replaceKey_draxcpxe(data, "RR", getRelativeTime_draxcpxe(time, true));

        if (data.mask.indexOf("ap") >= 0) data = replaceKey_draxcpxe(data, "ap", ap);

        if (data.mask.indexOf("DDDD") >= 0) data = replaceKey_draxcpxe(data, "DDDD", weekdays[time.getDay()]);
        if (data.mask.indexOf("DDD") >= 0) data = replaceKey_draxcpxe(data, "DDD", weekdays[time.getDay()].substring(0, 3));
        let day = time.getDate();
        if (data.mask.indexOf("DD") >= 0) data = replaceKey_draxcpxe(data, "DD", (day < 10 ? "0" : "") + day);
        if (data.mask.indexOf("D") >= 0) data = replaceKey_draxcpxe(data, "D", day);

        if (data.mask.indexOf("MMMM") >= 0) data = replaceKey_draxcpxe(data, "MMMM", months[time.getMonth()]);
        if (data.mask.indexOf("MMM") >= 0) data = replaceKey_draxcpxe(data, "MMM", months[time.getMonth()].substring(0, 3));
        let month = time.getMonth() + 1;
        if (data.mask.indexOf("MM") >= 0) data = replaceKey_draxcpxe(data, "MM", (month < 10 ? "0" : "") + month);
        if (data.mask.indexOf("M") >= 0) data = replaceKey_draxcpxe(data, "M", month);

        let year = time.getFullYear();
        if (data.mask.indexOf("YYYY") >= 0) data = replaceKey_draxcpxe(data, "YYYY", year);
        if (data.mask.indexOf("YY") >= 0) data = replaceKey_draxcpxe(data, "YY", String(year).substring(2));

        return data.output;
    }

    /* Replace sections of text */
    //input: object of data mask and data to be changed
    //key: what to remove from the text
    //value: what to put in the text
    function replaceKey_draxcpxe(data, key, value) {
        let valueMask = "_______________________________________".substring(0, String(value).length);
        while (data.mask.indexOf(key) >= 0) {
            data.output = data.output.substring(0, data.mask.indexOf(key)) + value + data.output.substring(data.mask.indexOf(key) + key.length);
            data.mask = data.mask.substring(0, data.mask.indexOf(key)) + valueMask + data.mask.substring(data.mask.indexOf(key) + key.length);
        }
        return data;
    }

    /* Create relative timestamp */
    function getRelativeTime_draxcpxe(date, short) {
        let units = [
            ["s", "second", "seconds"],
            ["min", "minute", "minutes"],
            ["h", "hour", "hours"],
            ["d", "day", "days"],
            ["w", "week", "weeks"],
            ["m", "month", "months"],
            ["y", "year", "years"]
        ];
        let times = [
            1000,//1 second
            60_000,//1 minute
            3_600_000,//1 hour
            86_400_000,//1 day
            1_209_600_000,//14 days - 2 weeks
            2_630_880_000,//30.45 days - 1 month
            63_113_904_000//730.485 days - 2 years
        ];
        let delta = new Date().getTime() - date.getTime();
        let rounded = Math.floor(delta / 31_556_952_000); //initialize for "years"
        for (let i = 0; i <= 6; i++) {
            if (delta < times[i+1]) {
                rounded = Math.floor(delta / times[i]);
                return rounded + " " + units[i][short ? 0 : rounded === 1 ? 1 : 2];
            }
        }
        return rounded + " " + units[6][short ? 0 : rounded === 1 ? 1 : 2]; //use "years" if nothing else fits
    }

    /* Add elements to the Tassel menu */
    function initTassel_draxcpxe() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarTimeFormat";
        button.innerHTML = "Time Format";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarTimeFormat").addEventListener("click", displaySettings_draxcpxe);
    }

    /* Create Tassel settings menu */
    function displaySettings_draxcpxe() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarTimeFormat").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);

        let info1 = document.createElement("p");
        info1.innerHTML = "Write into the input fields how you want the timestamps to be formated. Leave fields empty, if you want to keep the default. Insert only a space, if you want to hide the timestamp.";
        content.appendChild(info1);
        content.appendChild(document.createElement("hr"));

        //add settings
        let title1 = document.createElement("h2");
        title1.innerHTML = "Timestamps";
        content.appendChild(title1);

        let frame1 = document.createElement("div");
        frame1.id = "tasselTimeFormatSettings";
        content.appendChild(frame1);

        createInput_draxcpxe("Reblog Date"+createTooltip_draxcpxe("This is the timestamp that Pillowfort shows in the post header by default.").outerHTML, settings.reblogDate, frame1);
        frame1.lastChild.addEventListener("keyup", function() {
            settings.reblogDate = this.value;
            saveSettings_draxcpxe();
        });
        frame1.lastChild.addEventListener("focus", showPreview_draxcpxe);
        frame1.lastChild.addEventListener("blur", hidePreview_draxcpxe);
        createInput_draxcpxe("Reblog Date Tooltip"+createTooltip_draxcpxe("This is the timestamp that shows up when hovering over the timestamp in the post header.").outerHTML, settings.reblogTooltip, frame1);
        frame1.lastChild.addEventListener("keyup", function() {
            settings.reblogTooltip = this.value;
            saveSettings_draxcpxe();
        });
        frame1.lastChild.addEventListener("focus", showPreview_draxcpxe);
        frame1.lastChild.addEventListener("blur", hidePreview_draxcpxe);
        createInput_draxcpxe("Post Date"+createTooltip_draxcpxe("This is not originally shown. It will also show up in the post header.").outerHTML, settings.postDate, frame1);
        frame1.lastChild.addEventListener("keyup", function() {
            settings.postDate = this.value;
            saveSettings_draxcpxe();
        });
        frame1.lastChild.addEventListener("focus", showPreview_draxcpxe);
        frame1.lastChild.addEventListener("blur", hidePreview_draxcpxe);
        /*createInput("Edit Date", settings.editDate, frame1);
        frame1.lastChild.addEventListener("keyup", function() {
            settings.editDate = this.value;
            saveSettings();
        });
        frame1.lastChild.addEventListener("focus", showPreview);
        frame1.lastChild.addEventListener("blur", hidePreview);*/
        createInput_draxcpxe("Comment Date", settings.commentDate, frame1);
        frame1.lastChild.addEventListener("keyup", function() {
            settings.commentDate = this.value;
            saveSettings_draxcpxe();
        });
        frame1.lastChild.addEventListener("focus", showPreview_draxcpxe);
        frame1.lastChild.addEventListener("blur", hidePreview_draxcpxe);
        createInput_draxcpxe("Reblog Note", settings.reblogNote, frame1);
        frame1.lastChild.addEventListener("keyup", function() {
            settings.reblogNote = this.value;
            saveSettings_draxcpxe();
        });
        frame1.lastChild.addEventListener("focus", showPreview_draxcpxe);
        frame1.lastChild.addEventListener("blur", hidePreview_draxcpxe);
        createInput_draxcpxe("Like Note", settings.likeNote, frame1);
        frame1.lastChild.addEventListener("keyup", function() {
            settings.likeNote = this.value;
            saveSettings_draxcpxe();
        });
        frame1.lastChild.addEventListener("focus", showPreview_draxcpxe);
        frame1.lastChild.addEventListener("blur", hidePreview_draxcpxe);
        let preview = document.createElement("p");
        preview.id = "tasselTimeFormatPreview";
        content.appendChild(preview);
        //TODO inbox, notifications, post subscriber, blocklist
        content.appendChild(document.createElement("hr"));

        let title2 = document.createElement("h2");
        title2.innerHTML = "Keys";
        content.appendChild(title2);

        let table2 = document.createElement("div");
        table2.id = "tasselTimeFormatTable";
        table2.innerHTML = `
            <div><b>Key</b></div><div><b>Meaning</b></div>
            <div>HH</div><div>24 Hours, two digits</div>
            <div>H</div><div>24 Hours, flexible</div>
            <div>hh</div><div>12 Hours, two digits</div>
            <div>h</div><div>12 Hours, flexible</div>
            <div>mm</div><div>Minutes, two digits</div>
            <div>m</div><div>Minutes, flexible</div>
            <div>SS</div><div>Seconds, two digits</div>
            <div>S</div><div>Seconds, flexible</div>
            <div>ap</div><div>a.m. / p.m.</div>
            <div>DDDD</div><div>Weekday, full</div>
            <div>DDD</div><div>Weekday, abbreviated</div>
            <div>DD</div><div>Day, two digits</div>
            <div>D</div><div>Day, flexible</div>
            <div>MMMM</div><div>Month, full</div>
            <div>MMM</div><div>Month, abbreviated</div>
            <div>MM</div><div>Month, two digits</div>
            <div>M</div><div>Month, flexible</div>
            <div>YYYY</div><div>Year, four digits</div>
            <div>YY</div><div>Year, two digits</div>
            <div>RRR</div><div>Relative Time, full</div>
            <div>RR</div><div>Relative Time, abbreviated</div>
        `;
        content.appendChild(table2);
    }

    function showPreview_draxcpxe(e) {
        document.getElementById("tasselTimeFormatPreview").innerHTML = "Preview: " + formatDate_draxcpxe(new Date(), this.value);
    }

    function hidePreview_draxcpxe(e) {
        document.getElementById("tasselTimeFormatPreview").innerHTML = "";
    }

    function saveSettings_draxcpxe() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.timeFormat = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    /* Create an icon with hover popup */
    function createTooltip_draxcpxe(content) {
        let icon = document.createElement("div");
        icon.classList.add("tasselInfo");
        icon.innerHTML = `
            <div class='tasselTooltip'>
                <div class='tasselTooltipBubble'>
                    ${content}
                </div>
            </div>
        `;
        return icon;
    }

    /* Create a label and a text input */
    function createInput_draxcpxe(title="", value="", context) {
        let id = "tasselInput" + Math.random();
        let label = document.createElement("label");
        label.setAttribute("for", id);
        label.innerHTML = title;
        context.appendChild(label);
        let input = document.createElement("input");
        input.id = id;
        input.value = value || "";
        context.appendChild(input);
    }

    /*
    HH H hh h ap mm m ss s DDDD DDD DD D MMMM MMM MM M YYYY YY RR R
    HH   24h leading 0
    H    24h no leading 0
    hh   12h leading 0
    h    12h no leading 0
    mm   minute, 0
    m    minute
    SS   second, 0
    S    second
    ap   am/pm
    DDDD weekday, full
    DDD  weekday, abriviated
    DD   day, 0
    D    day
    MMMM month, full
    MMM  month, abriviated
    MM   month, number, 0
    M    month, number
    YYYY full year
    YY   year
    RRR   relative time, word
    RR    relative time, unit
    */
})();
