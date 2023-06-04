let modalData = {
    ready: false,
    postId: null,
    postJSON: {}
};

let postData = {
    ready: false,
    postId: null,
    postJSON: {}
};

let reblogData = {
    ready: false,
    postId: null,
    page: null,
    JSON: {}
}

let likeData = {
    ready: false,
    postId: null,
    page: null,
    JSON: {}
}

let feed = {
    ready: false,
    pages: 0,
    time: null,
    posts: []
};

initModal();
function initModal() {
    let postModal = document.getElementById("post-view-modal")
    if (!postModal) return;
    let postModalLink = document.getElementById("post-view-modal").getElementsByClassName("link_post")[0];

    let modalObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.attributeName === "href") {
                let postId = mutationRecord.target.href;
                postId = postId.substring(postId.search("/posts/")+7);
                modalData.postId = postId;
                $.getJSON(`https://www.pillowfort.social/posts/${postId}/json`, function(data) {
                    modalData.postJSON = data;
                    modalData.ready = true;
                    console.log("JSON-M: got modal data");
                });
            } else if (mutationRecord.attributeName === "style") {
                if (mutationRecord.target.style.display === "none") {
                    modalData.ready = false;
                }
            }
        });
    });

    modalObserver.observe(postModalLink, {
        attributes: true,
        attributeFilter: ["href"]
    });
    modalObserver.observe(postModal, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

//waitForKeyElements("#post-comments-section", initSinglePost);
initSinglePost();
function initSinglePost() {
    if (document.getElementById("post-view-modal")) return;
    let postId = document.URL.split("/");
    if (postId.length < 5) return;
    postId = postId[4].split("?")[0];
    postData.postId = postId;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/json`, function(data) {
        postData.postJSON = data;
        postData.ready = true;
    });

    let reblogPageButtons = document.getElementsByTagName("dir-pagination-controls")[1];
    reblogPageButtons.addEventListener("click", function () {getReblogData(postId)});
    getReblogData(postId);
}

function getReblogData(postId) {
    reblogData.ready = false;
    reblogData.postId = postId;
    let page = 1;
    let reblogPageButtons = document.getElementsByTagName("dir-pagination-controls")[1];
    if (reblogPageButtons.getElementsByClassName("active").length > 0) page = reblogPageButtons.getElementsByClassName("active")[0].textContent;
    reblogData.page = page;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/reblogs?p=${page}`, function(data) {
        reblogData.JSON = data.reblog_batch;
        reblogData.ready = true;
        console.log(reblogData);
    });
}

initHomeFeed()
function initHomeFeed() {
    const loadingIndicator = document.getElementById("home_loading");
    if (!loadingIndicator) return;

    let homeObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                feed.ready = false;
                let time = "";
                if (feed.time) time = `?last_timestamp=${feed.time}`;
                $.getJSON(`https://www.pillowfort.social/home/json${time}`, function(data) {
                    feed.ready = true;
                    feed.pages++;
                    feed.time = data.posts[data.posts.length-1].created_at;
                    feed.posts.push(...data.posts);
                    console.log(feed);
                });
            }
        });
    });
    homeObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

initFortFeed()
function initFortFeed() {
    const loadingIndicator = document.getElementById("blog_loading");
    if (!loadingIndicator) return;

    let fortObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                feed.ready = false;
                $.getJSON(`https://www.pillowfort.social/
                ${document.URL.split("/")[3]}
                /json?p=
                ${Object.values(
                    document.getElementsByTagName("li")
                ).find(function(item) {
                    return item.classList.contains("active")
                }).textContent}`, function(data) {
                    feed.ready = true;
                    feed.pages = 1;
                    feed.time = data.posts[data.posts.length-1].created_at;
                    feed.posts = data.posts;
                    console.log(feed);
                });
            }
        });
    });
    fortObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
}
