let tasselJsonManager = {
    modal: {
        ready: false,
        postId: null,
        JSON: {}
    },
    post: {
        ready: false,
        postId: null,
        JSON: {}
    },
    reblogs: {
        ready: false,
        postId: null,
        page: null,
        JSON: {}
    },
    likes: {
        ready: false,
        postId: null,
        page: null,
        JSON: {}
    },
    feed: {
        ready: false,
        pages: 0,
        time: null,
        posts: []
    }
}

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
                tasselJsonManager.modal.postId = postId;
                $.getJSON(`https://www.pillowfort.social/posts/${postId}/json`, function(data) {
                    tasselJsonManager.modal.postJSON = data;
                    tasselJsonManager.modal.ready = true;
                    trigger("tasselJsonManagerModalReady");
                });
            } else if (mutationRecord.attributeName === "style") {
                if (mutationRecord.target.style.display === "none") {
                    tasselJsonManager.modal.ready = false;
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
    tasselJsonManager.post.postId = postId;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/json`, function(data) {
        tasselJsonManager.post.postJSON = data;
        tasselJsonManager.post.ready = true;
        trigger("tasselJsonManagerPostReady");
    });

    let reblogPageButtons = document.getElementsByTagName("dir-pagination-controls")[1];
    reblogPageButtons.addEventListener("click", function () {getReblogData(postId)});
    getReblogData(postId);

    let likePageButtons = document.getElementsByTagName("dir-pagination-controls")[2];
    likePageButtons.addEventListener("click", function () {getLikeData(postId)});
    getLikeData(postId);
}

function getReblogData(postId) {
    tasselJsonManager.reblogs.ready = false;
    tasselJsonManager.reblogs.postId = postId;
    let page = 1;
    let reblogPageButtons = document.getElementsByTagName("dir-pagination-controls")[1];
    if (reblogPageButtons.getElementsByClassName("active").length > 0) page = reblogPageButtons.getElementsByClassName("active")[0].textContent;
    tasselJsonManager.reblogs.page = page;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/reblogs?p=${page}`, function(data) {
        tasselJsonManager.reblogs.JSON = data.reblog_batch;
        tasselJsonManager.reblogs.ready = true;
        trigger("tasselJsonManagerReblogReady");
    });
}

function getLikeData(postId) {
    tasselJsonManager.likes.ready = false;
    tasselJsonManager.likes.postId = postId;
    let page = 1;
    let likePageButtons = document.getElementsByTagName("dir-pagination-controls")[2];
    if (likePageButtons.getElementsByClassName("active").length > 0) page = likePageButtons.getElementsByClassName("active")[0].textContent;
    tasselJsonManager.likes.page = page;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/likes?p=${page}`, function(data) {
        tasselJsonManager.likes.JSON = data.likes_batch;
        tasselJsonManager.likes.ready = true;
        trigger("tasselJsonManagerLikeReady");
    });
}

initHomeFeed()
function initHomeFeed() {
    const loadingIndicator = document.getElementById("home_loading");
    if (!loadingIndicator) return;

    let homeObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                tasselJsonManager.feed.ready = false;
                let time = "";
                if (tasselJsonManager.feed.time) time = `?last_timestamp=${tasselJsonManager.feed.time}`;
                $.getJSON(`https://www.pillowfort.social/home/json${time}`, function(data) {
                    tasselJsonManager.feed.ready = true;
                    tasselJsonManager.feed.pages++;
                    tasselJsonManager.feed.time = data.posts[data.posts.length-1].created_at;
                    tasselJsonManager.feed.posts.push(...data.posts);
                    trigger("tasselJsonManagerFeedReady");
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
                 tasselJsonManager.feed.ready = false;
                let page = 1;
                let pageButton = Object.values(
                    document.getElementsByTagName("li")
                ).find(function(item) {
                    return item.classList.contains("active")
                });
                if (pageButton) page = pageButton.textContent;
                $.getJSON(`https://www.pillowfort.social/${document.URL.split("/")[3]}/json?p=${page}`, function(data) {
                    tasselJsonManager.feed.ready = true;
                    tasselJsonManager.feed.pages = 1;
                    tasselJsonManager.feed.time = data.posts[data.posts.length-1].created_at;
                    tasselJsonManager.feed.posts = data.posts;
                    trigger("tasselJsonManagerFeedReady");
                });
            }
        });
    });
    fortObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

function trigger(name) {
    let trigger = document.getElementById(name);
    if (trigger) trigger.click();
}
