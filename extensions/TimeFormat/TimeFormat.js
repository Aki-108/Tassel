// ==UserScript==
// @name         Time Format
// @version      0.1
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
        reblogDate: "RR ago",
        postDate: "",
        editDate: "Last edited RR ago.",
        commentDate: "RR ago",
        reblogNote: "RR ago",
        likeNote: "RR ago"
    };

    init_draxcpxe();
    function init_draxcpxe() {
        initTassel_draxcpxe();
        if (document.getElementById("tasselJsonManagerFeedReady")) document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", loadFeed_draxcpxe);
        if (document.getElementById("tasselJsonManagerPostReady")) document.getElementById("tasselJsonManagerPostReady").addEventListener("click", loadSinglePost_draxcpxe);
        if (document.getElementById("tasselJsonManagerCommentReady")) document.getElementById("tasselJsonManagerCommentReady").addEventListener("click", processComments_draxcpxe);
    }

    /* Get the posts from the feed and hand them to the post processor */
    function loadFeed_draxcpxe() {
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
        permaLinks = document.getElementsByClassName("timestamp2");
        processPosts_draxcpxe([tasselJsonManager.post.json], [{
            id: tasselJsonManager.post.postId*1,
            post: document.getElementsByClassName("post-container")[0]
        }]);
    }

    /* Apply changes to the posts */
    function processPosts_draxcpxe(postData, posts) {
        for (let post of postData) {
            if (!post.original_post) continue;
            let postElement = posts.find(function(item) {
                return (item.id === (post.original_post_id || post.id));
            });
            if (postElement === undefined) continue;
            if (postElement.post.classList.contains("tasselTimeFormatProcessed")) continue;
            postElement.post.classList.add("tasselTimeFormatProcessed");

            //post header
            if (settings.reblogDate.length > 0) postElement.post.getElementsByClassName("timestamp2")[0].innerHTML = formatDate_draxcpxe(new Date(post.publish_at), settings.reblogDate);
            if (settings.reblogDate.length && settings.postDate.length) {
                postElement.post.getElementsByClassName("timestamp2")[0].innerHTML += "<br>";
                postElement.post.getElementsByClassName("timestamp2")[0].style = "line-height: 1.2em;display: inline-block";
            }
            if (settings.postDate.length > 0) postElement.post.getElementsByClassName("timestamp2")[0].innerHTML += formatDate_draxcpxe(new Date(post.original_post.publish_at), settings.postDate);
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

    /* Format date to the desired form */
    function formatDate_draxcpxe(time, format) {
        let output = format;

        let hours = time.getHours();
        output = replaceKey_draxcpxe(output, "HH", (hours < 10 ? "0" : "") + hours);
        output = replaceKey_draxcpxe(output, "H", hours);
        let ap = hours < 12 ? "a.m." : "p.m.";
        hours += hours > 12 ? -12 : 0;
        hours = hours <= 0 ? 12 : hours;
        output = replaceKey_draxcpxe(output, "hh", (hours < 10 ? "0" : "") + hours);
        output = replaceKey_draxcpxe(output, "h", hours);

        let minutes = time.getMinutes();
        output = replaceKey_draxcpxe(output, "mm", (minutes < 10 ? "0" : "") + minutes);
        output = replaceKey_draxcpxe(output, "m", minutes);

        let seconds = time.getSeconds();
        output = replaceKey_draxcpxe(output, "SS", (seconds < 10 ? "0" : "") + seconds);
        output = replaceKey_draxcpxe(output, "S", seconds);

        output = replaceKey_draxcpxe(output, "ap", ap);

        let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        output = replaceKey_draxcpxe(output, "DDDD", weekdays[time.getDay()]);
        output = replaceKey_draxcpxe(output, "DDD", weekdays[time.getDay()].substring(0, 3));
        let day = time.getDate();
        output = replaceKey_draxcpxe(output, "DD", (day < 10 ? "0" : "") + day);
        output = replaceKey_draxcpxe(output, "D", day);

        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        output = replaceKey_draxcpxe(output, "MMMM", months[time.getMonth()]);
        output = replaceKey_draxcpxe(output, "MMM", months[time.getMonth()].substring(0, 3));
        let month = time.getMonth() + 1;
        output = replaceKey_draxcpxe(output, "MM", (month < 10 ? "0" : "") + month);
        output = replaceKey_draxcpxe(output, "M", month);

        let year = time.getFullYear();
        output = replaceKey_draxcpxe(output, "YYYY", year);
        output = replaceKey_draxcpxe(output, "YY", String(year).substring(2));

        output = replaceKey_draxcpxe(output, "RR", getRelativeTime_draxcpxe(time, false));
        output = replaceKey_draxcpxe(output, "R", getRelativeTime_draxcpxe(time, true));

        return output;
    }

    /* Replace sections of text */
    //input: text to be changed
    //key: what to remove from the text
    //value: what to put in the text
    function replaceKey_draxcpxe(input, key, value) {
        while (input.indexOf(key) >= 0) {
            input = input.substring(0, input.indexOf(key)) + value + input.substring(input.indexOf(key) + key.length);
        }
        return input;
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
        let rounded = Math.floor(delta / times[6]); //initialize for "years"
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

        createInput_draxcpxe("Reblog Date", settings.reblogDate, frame1);
        frame1.lastChild.addEventListener("keyup", function() {
            settings.reblogDate = this.value;
            saveSettings_draxcpxe();
        });
        frame1.lastChild.addEventListener("focus", showPreview_draxcpxe);
        frame1.lastChild.addEventListener("blur", hidePreview_draxcpxe);
        createInput_draxcpxe("Post Date", settings.postDate, frame1);
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
        /*createInput_draxcpxe("Reblog Note", settings.reblogNote, frame1);
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
        frame1.lastChild.addEventListener("blur", hidePreview_draxcpxe);*/
        let preview = document.createElement("p");
        preview.id = "tasselTimeFormatPreview";
        content.appendChild(preview);
        //TODO reblog note, like note, inbox, notifications, post subscriber, blocklist
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
            <div>RR</div><div>Relative Time, full</div>
            <div>R</div><div>Relative Time, abbreviated</div>
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
    RR   relative time, word
    R    relative time, unit
    */
})();
