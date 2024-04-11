let tasselJsonManager = {
    modal: {
        ready: false,
        type: null,
        postId: null,
        json: {}
    },
    post: {
        ready: false,
        postId: null,
        json: {}
    },
    comments: {
        ready: false,
        postId: null,
        page: null,
        maxPage: null,
        comments: []
    },
    reblogs: {
        ready: false,
        postId: null,
        page: null,
        maxPage: null,
        json: {}
    },
    likes: {
        ready: false,
        postId: null,
        page: null,
        maxPage: null,
        json: {}
    },
    feed: {
        ready: false,
        type: 'home',
        pages: 0,
        time: null,
        utc: null,
        posts: []
    },
    followers: {
        ready: false,
        updated: null,
        users: [],
        displayed_count: null,
        real_count: null
    },
    following: {
        ready: false,
        updated: null,
        users: [],
        displayed_count: null,
        real_count: null
    },
    mutuals: {
        ready: false,
        updated: null,
        users: [],
        displayed_count: null,
        real_count: null
    },
    communities: {
        ready: false,
        communities: []
    }
}

let loadingInterval = {
    homeFeed: null,
    commFeed: null,
    fortFeed: null,
    searchFeed: null,
}

initModal_quugasdg();
function initModal_quugasdg() {
    let postModal = document.getElementById("post-view-modal");
    if (postModal) {
        let postModalLink = postModal.getElementsByClassName("link_post")[0];

        let modalObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                if (mutationRecord.attributeName === "href" && document.getElementById("post-view-modal").classList.contains("in")) {
                    let postId = mutationRecord.target.href;
                    postId = postId.substring(postId.search("/posts/")+7);
                    loadCommentModal_quugasdg(postId);
                } else if (mutationRecord.attributeName === "style" && mutationRecord.target.style.display === "none") {
                    tasselJsonManager.modal.ready = false;
                    tasselJsonManager.comments.ready = false;
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

    let reblogModal = document.getElementById("reblog-modal");
    if (reblogModal) {
        let reblogModalLink = reblogModal.getElementsByClassName("link_post")[0];
        let reblogObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                if (mutationRecord.attributeName === "href" && document.getElementById("reblog-modal").classList.contains("in")) {
                    let postId = mutationRecord.target.href;
                    postId = postId.substring(postId.search("/posts/")+7);
                    loadReblogModal_quugasdg(postId);
                } else if (mutationRecord.attributeName === "style" && mutationRecord.target.style.display === "none") {
                    tasselJsonManager.modal.ready = false;
                }
            });
        });
        reblogObserver.observe(reblogModalLink, {
            attributes: true,
            attributeFilter: ["href"]
        });
        reblogObserver.observe(reblogModal, {
            attributes: true,
            attributeFilter: ["style"]
        });
    }
}

function loadCommentModal_quugasdg(postId) {
    tasselJsonManager.modal.postId = postId;
    tasselJsonManager.modal.type = "comments";
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/json`, function(data) {
        tasselJsonManager.modal.json = data;
        assignUsers_quugasdg(tasselJsonManager.modal.json);
        tasselJsonManager.modal.ready = true;
        trigger_quugasdg("tasselJsonManagerModalReady");
    });
    getCommentData_quugasdg(postId);
}

function loadReblogModal_quugasdg(postId) {
    if (tasselJsonManager.post.ready && tasselJsonManager.post.postId == postId) {
        tasselJsonManager.modal = tasselJsonManager.post;
        tasselJsonManager.modal.type = "reblog";
        assignUsers_quugasdg(tasselJsonManager.modal.json);
        trigger_quugasdg("tasselJsonManagerModalReady");
    } else {
        $.getJSON(`https://www.pillowfort.social/posts/${postId}/json`, function(data) {
            tasselJsonManager.modal.json = data;
            tasselJsonManager.modal.type = "reblog";
            assignUsers_quugasdg(tasselJsonManager.modal.json);
            tasselJsonManager.modal.ready = true;
            trigger_quugasdg("tasselJsonManagerModalReady");
        });
    }
}

initSinglePost_quugasdg();
function initSinglePost_quugasdg() {
    if (document.getElementById("post-view-modal")) return;
    let postId = document.URL.split("/");
    if (postId.length < 5) return;
    postId = postId[4].split("?")[0];
    tasselJsonManager.post.postId = postId;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/json`, function(data) {
        tasselJsonManager.post.json = data;
        assignUsers_quugasdg(tasselJsonManager.post.json);
        tasselJsonManager.post.ready = true;
        trigger_quugasdg("tasselJsonManagerPostReady");

        tasselJsonManager.modal = tasselJsonManager.post;
        tasselJsonManager.modal.type = "reblog";
        assignUsers_quugasdg(tasselJsonManager.modal.json);
        trigger_quugasdg("tasselJsonManagerModalReady");
    });

    if (document.getElementsByTagName("dir-pagination-controls").length < 1) return;

    let commentPageButtons = document.getElementsByTagName("dir-pagination-controls")[0];
    commentPageButtons.addEventListener("click", function () {getCommentData_quugasdg(postId)});
    getCommentData_quugasdg(postId);

    let reblogPageButtons = document.getElementsByTagName("dir-pagination-controls")[1];
    reblogPageButtons.addEventListener("click", function () {getReblogData_quugasdg(postId)});
    getReblogData_quugasdg(postId);

    let likePageButtons = document.getElementsByTagName("dir-pagination-controls")[2];
    likePageButtons.addEventListener("click", function () {getLikeData_quugasdg(postId)});
    getLikeData_quugasdg(postId);
}

function getCommentData_quugasdg(postId) {
    tasselJsonManager.comments.ready = false;
    tasselJsonManager.comments.postId = postId;
    let page = 1;
    let commentPageButtons = document.getElementsByTagName("dir-pagination-controls")[0];
    if (commentPageButtons.getElementsByClassName("active").length > 0) page = commentPageButtons.getElementsByClassName("active")[0].textContent;
    tasselJsonManager.comments.page = page;
    let pages = Object.values(commentPageButtons.getElementsByTagName("li"));
    tasselJsonManager.comments.maxPage = pages.length > 2 ? pages[pages.length-2].textContent : 1;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/comments?pageNum=${page}`, function(data) {
        tasselJsonManager.comments.comments = unpackComments_quugasdg(data.comments);
        tasselJsonManager.comments.comments.forEach(function(comment) {
            assignUsers_quugasdg(comment);
        });
        tasselJsonManager.comments.ready = true;
        trigger_quugasdg("tasselJsonManagerCommentReady");
    });
}

function getReblogData_quugasdg(postId) {
    tasselJsonManager.reblogs.ready = false;
    tasselJsonManager.reblogs.postId = postId;
    let page = 1;
    let reblogPageButtons = document.getElementsByTagName("dir-pagination-controls")[1];
    if (reblogPageButtons.getElementsByClassName("active").length > 0) page = reblogPageButtons.getElementsByClassName("active")[0].textContent;
    tasselJsonManager.reblogs.page = page;
    let pages = Object.values(reblogPageButtons.getElementsByTagName("li"));
    tasselJsonManager.reblogs.maxPage = pages.length > 2 ? pages[pages.length-2].textContent : 1;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/reblogs?p=${page}`, function(data) {
        tasselJsonManager.reblogs.json = data.reblog_batch;
        tasselJsonManager.reblogs.json.forEach(function(reblog) {
            assignUsers_quugasdg(reblog);
        });
        tasselJsonManager.reblogs.ready = true;
        trigger_quugasdg("tasselJsonManagerReblogReady");
    });
}

function getLikeData_quugasdg(postId) {
    tasselJsonManager.likes.ready = false;
    tasselJsonManager.likes.postId = postId;
    let page = 1;
    let likePageButtons = document.getElementsByTagName("dir-pagination-controls")[2];
    if (likePageButtons.getElementsByClassName("active").length > 0) page = likePageButtons.getElementsByClassName("active")[0].textContent;
    tasselJsonManager.likes.page = page;
    let pages = Object.values(likePageButtons.getElementsByTagName("li"));
    tasselJsonManager.likes.maxPage = pages.length > 2 ? pages[pages.length-2].textContent : 1;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/likes?p=${page}`, function(data) {
        tasselJsonManager.likes.json = data.likes_batch;
        tasselJsonManager.likes.json.forEach(function(like) {
            assignUsers_quugasdg(like);
        });
        tasselJsonManager.likes.ready = true;
        trigger_quugasdg("tasselJsonManagerLikeReady");
    });
}

initHomeFeed_quugasdg();
function initHomeFeed_quugasdg() {
    const loadingIndicator = document.getElementById("home_loading");
    if (!loadingIndicator) return;

    let queryString = new URLSearchParams(window.location.search.substring(1));
    for (let pair of queryString.entries()) {
        if (pair[0] === "time") tasselJsonManager.feed.time = pair[1];
    }

    let homeObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                loadHomeFeed_quugasdg();
            }
        });
    });
    homeObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
    loadingInterval.homeFeed = window.setInterval(function() {
        if (loadingIndicator.style.display === "none" && !tasselJsonManager.feed.ready) {
            loadHomeFeed_quugasdg();
        }
    }, 1000);
}

function loadHomeFeed_quugasdg() {
    clearInterval(loadingInterval.homeFeed);
    tasselJsonManager.feed.ready = false;
    let time = "";
    if (tasselJsonManager.feed.time) time = `?last_timestamp=${tasselJsonManager.feed.time}`;
    $.getJSON(`https://www.pillowfort.social/home/json${time}`, function(data) {
        data.posts.forEach(function(post) {
            assignUsers_quugasdg(post);
        });
        tasselJsonManager.feed.type = 'home';
        tasselJsonManager.feed.pages++;
        tasselJsonManager.feed.time = data.posts[data.posts.length-1].created_at;
        tasselJsonManager.feed.utc = new Date(tasselJsonManager.feed.time).toUTCString();
        tasselJsonManager.feed.posts.push(...data.posts);
        tasselJsonManager.feed.ready = true;
        trigger_quugasdg("tasselJsonManagerFeedReady");
    });
}

initCommFeed_quugasdg();
function initCommFeed_quugasdg() {
    const loadingIndicator = document.getElementById("comm_large_loading");
    if (!loadingIndicator) return;

    let commObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                loadCommFeed_quugasdg();
            }
        });
    });
    commObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
    loadingInterval.commFeed = window.setInterval(function() {
        if (loadingIndicator.style.display === "none" && !tasselJsonManager.feed.ready) {
            loadCommFeed_quugasdg();
        }
    }, 1000);
}

function loadCommFeed_quugasdg() {
    clearInterval(loadingInterval.commFeed);
    tasselJsonManager.feed.ready = false;
    let time = "";
    if (tasselJsonManager.feed.time) time = `?last_timestamp=${tasselJsonManager.feed.time}`;
    let jsonURL = "/posts/json";
    if (document.URL.split("/")[5] === "tagged") jsonURL = `/tagged_json?tag=${document.URL.split("/")[6]}&`;
    $.getJSON(`https://www.pillowfort.social/community/${document.URL.split("/")[4]}${jsonURL}${time}`, function(data) {
        data.forEach(function(post) {
            assignUsers_quugasdg(post);
        });
        tasselJsonManager.feed.type = 'community'
        tasselJsonManager.feed.pages++;
        tasselJsonManager.feed.time = data[data.length-1].created_at;
        tasselJsonManager.feed.utc = new Date(tasselJsonManager.feed.time).toUTCString();
        tasselJsonManager.feed.posts.push(...data);
        tasselJsonManager.feed.ready = true;
        trigger_quugasdg("tasselJsonManagerFeedReady");
    });
}

initFortFeed_quugasdg();
function initFortFeed_quugasdg() {
    const loadingIndicator = document.getElementById("blog_loading");
    if (!loadingIndicator) return;

    let fortObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                loadFortFeed_quugasdg();
            }
        });
    });
    fortObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
    loadingInterval.fortFeed = window.setInterval(function() {
        if (loadingIndicator.style.display === "none" && !tasselJsonManager.feed.ready) {
            loadFortFeed_quugasdg();
        }
    }, 1000);
}

function loadFortFeed_quugasdg() {
    clearInterval(loadingInterval.fortFeed);
    tasselJsonManager.feed.ready = false;
    let page = 1;
    let pageButton = Object.values(
        document.getElementsByTagName("li")
    ).find(function(item) {
        return item.classList.contains("active")
    });
    if (pageButton) page = pageButton.textContent;
    let jsonURL = "/";
    if (document.URL.split("/")[4] === "tagged") jsonURL = `/tagged/${document.URL.split("/")[5]}/`;
    if (document.URL.split("/")[4] === "original") jsonURL = `/original/`;
    if (document.URL.split("/")[4] === "reblogs") jsonURL = `/reblogs/`;
    $.getJSON(`https://www.pillowfort.social/${document.URL.split("/")[3]}${jsonURL}json?p=${page}`, function(data) {
        data.posts.forEach(function(post) {
            assignUsers_quugasdg(post);
        });
        tasselJsonManager.feed.type = 'fort';
        tasselJsonManager.feed.pages = 1;
        tasselJsonManager.feed.time = data.posts[data.posts.length-1].created_at;
        tasselJsonManager.feed.utc = new Date(tasselJsonManager.feed.time).toUTCString();
        tasselJsonManager.feed.posts = data.posts;
        tasselJsonManager.feed.ready = true;
        trigger_quugasdg("tasselJsonManagerFeedReady");
    });
}

initSearch_quugasdg();
function initSearch_quugasdg() {
    const loadingIndicator = document.getElementById("search_loading");
    if (!loadingIndicator) return;

    let searchObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                loadSearch_quugasdg();
            }
        });
    });
    searchObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
    loadingInterval.searchFeed = window.setInterval(function() {
        if (loadingIndicator.style.display === "none" && !tasselJsonManager.feed.ready) {
            loadSearch_quugasdg();
        }
    }, 1000);
}

function loadSearch_quugasdg() {
    clearInterval(loadingInterval.searchFeed);
    tasselJsonManager.feed.ready = false;
    let time = "";
    if (tasselJsonManager.feed.time) time = `?last_timestamp=${tasselJsonManager.feed.time}`;
    $.getJSON(`https://www.pillowfort.social/search/posts/${document.URL.split("/")[4]}/json${time}`, function(data) {
        data.posts_by_tag.posts_by_tag.forEach(function(post) {
            assignUsers_quugasdg(post);
        });
        tasselJsonManager.feed.type = 'search';
        tasselJsonManager.feed.pages++;
        tasselJsonManager.feed.time = data.posts_by_tag.posts_by_tag[data.posts_by_tag.posts_by_tag.length-1].created_at;
        tasselJsonManager.feed.utc = new Date(tasselJsonManager.feed.time).toUTCString();
        tasselJsonManager.feed.posts.push(...data.posts_by_tag.posts_by_tag);
        tasselJsonManager.feed.ready = true;
        trigger_quugasdg("tasselJsonManagerFeedReady");
    });
}

initDraftFeed_quugasdg();
function initDraftFeed_quugasdg() {
    const loadingIndicator = document.getElementById("drafts_loading");
    if (!loadingIndicator) return;

    let draftObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                loadDraftFeed_quugasdg()
            }
        });
    });
    draftObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

function loadDraftFeed_quugasdg() {
    tasselJsonManager.feed.ready = false;
    let page = 1;
    let pageButton = Object.values(
        document.getElementsByTagName("li")
    ).find(function(item) {
        return item.classList.contains("active")
    });
    if (pageButton) page = pageButton.textContent;
    $.getJSON(`https://www.pillowfort.social/drafts/json?p=${page}`, function(data) {
        tasselJsonManager.feed.ready = true;
        tasselJsonManager.feed.type = 'drafts';
        tasselJsonManager.feed.pages = 1;
        tasselJsonManager.feed.time = data.posts[data.posts.length-1].created_at;
        tasselJsonManager.feed.utc = new Date(tasselJsonManager.feed.time).toUTCString();
        tasselJsonManager.feed.posts = data.posts;
        trigger_quugasdg("tasselJsonManagerFeedReady");
    });
}

initQueueFeed_quugasdg();
function initQueueFeed_quugasdg() {
    const loadingIndicator = document.getElementById("q_loading");
    if (!loadingIndicator) return;

    let queueObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                loadQueueFeed_quugasdg();
            }
        });
    });
    queueObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

function loadQueueFeed_quugasdg() {
    tasselJsonManager.feed.ready = false;
    let page = 1;
    /*let pageButton = Object.values(
                    document.getElementsByTagName("li")
                ).find(function(item) {
                    return item.classList.contains("active")
                });
                if (pageButton) page = pageButton.textContent;*/
    $.getJSON(`https://www.pillowfort.social/queued_posts/json?p=${page}`, function(data) {
        tasselJsonManager.feed.ready = true;
        tasselJsonManager.feed.type = 'queue';
        tasselJsonManager.feed.pages = 1;
        tasselJsonManager.feed.time = data.posts[data.posts.length-1].created_at;
        tasselJsonManager.feed.utc = new Date(tasselJsonManager.feed.time).toUTCString();
        tasselJsonManager.feed.posts = data.posts;
        trigger_quugasdg("tasselJsonManagerFeedReady");
    });
}

initScheduleFeed_quugasdg();
function initScheduleFeed_quugasdg() {
    const loadingIndicator = document.getElementById("s_loading");
    if (!loadingIndicator) return;

    let scheduleObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                loadScheduleFeed_quugasdg();
            }
        });
    });
    scheduleObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

function loadScheduleFeed_quugasdg() {
    tasselJsonManager.feed.ready = false;
    let page = 1;
    /*let pageButton = Object.values(
                    document.getElementsByTagName("li")
                ).find(function(item) {
                    return item.classList.contains("active")
                });
                if (pageButton) page = pageButton.textContent;*/
    $.getJSON(`https://www.pillowfort.social/scheduled_posts/json?p=${page}`, function(data) {
        tasselJsonManager.feed.ready = true;
        tasselJsonManager.feed.type = 'schedule';
        tasselJsonManager.feed.pages = 1;
        tasselJsonManager.feed.time = data.posts[data.posts.length-1].created_at;
        tasselJsonManager.feed.utc = new Date(tasselJsonManager.feed.time).toUTCString();
        tasselJsonManager.feed.posts = data.posts;
        trigger_quugasdg("tasselJsonManagerFeedReady");
    });
}

loadUsers_quugasdg("followers", 0);
loadUsers_quugasdg("following", 0);
loadUsers_quugasdg("mutuals", 0);
function loadUsers_quugasdg(type, tries) {
    tasselJsonManager[type].ready = false;
    let file = JSON.parse(localStorage.getItem("tasselJsonManager"));
    if (file && file[type]) tasselJsonManager[type] = file[type];

    let sidebar = document.getElementById("expanded-bar-container");
    let links = Object.values(sidebar.getElementsByTagName("a"));
    links = links.filter(function(item) {
        return item.getAttribute("href") === `/${type}`;
    });
    if (!links.length) return;
    let count = parseInt(links[0].getElementsByClassName("sidebar-bottom-num")[0].textContent);

    if (count == tasselJsonManager[type].displayed_count && (new Date().getTime() - tasselJsonManager[type].updated < 86_400_000)) {
        tasselJsonManager[type].ready = true;
        trigger_quugasdg(`tasselJsonManager${type.charAt(0).toUpperCase()+type.slice(1)}Ready`);
        return;
    }

    tasselJsonManager[type].users = [];
    tasselJsonManager[type].displayed_count = count;
    loadUserPages_quugasdg(type, 1, tries);
}

function loadUserPages_quugasdg(type, page, tries) {
    $.getJSON(`https://www.pillowfort.social/${type}_json?p=${page}`, function(data) {
        let users = data[type].map(function(item) {
            return item.username
        });
        if (users.length) {
            tasselJsonManager[type].users.push(...users);
            loadUserPages_quugasdg(type, page+1);
        } else {
            tasselJsonManager[type].users = tasselJsonManager[type].users.filter(function(item) {
                return !item.includes("_deleted");
            });
            tasselJsonManager[type].real_count = tasselJsonManager[type].users.length;
            tasselJsonManager[type].updated = new Date().getTime();
            tasselJsonManager[type].ready = true;
            trigger_quugasdg(`tasselJsonManager${type.charAt(0).toUpperCase()+type.slice(1)}Ready`);
            let file = JSON.parse(localStorage.getItem("tasselJsonManager") || "{}");
            file[type] = tasselJsonManager[type];
            localStorage.setItem("tasselJsonManager", JSON.stringify(file));
        }
    })
    .fail(function() {
        if (tries < 10) {
            window.setTimeout(loadUsers_quugasdg(type, tries + 1), 300_000);
        }
    });
}

function assignUsers_quugasdg(json) {
    json.follower = tasselJsonManager.followers.users.includes(json.username);
    json.following = tasselJsonManager.following.users.includes(json.username);
    json.mutual = tasselJsonManager.mutuals.users.includes(json.username);
    if (json.original_username) {
        json.original_follower = tasselJsonManager.followers.users.includes(json.original_username);
        json.original_following = tasselJsonManager.following.users.includes(json.original_username);
        json.original_mutual = tasselJsonManager.mutuals.users.includes(json.original_username);
    } else {
        json.original_follower = null;
        json.original_following = null;
        json.original_mutual = null;
    }
}

initCommunities_quugasdg();
function initCommunities_quugasdg() {
    $.getJSON(`https://www.pillowfort.social/communitylist/json`, function(data) {
        tasselJsonManager.communities.communities = data;
        tasselJsonManager.communities.ready = true;
        trigger_quugasdg("tasselJsonManagerCommunitiesReady");
    });
}

function trigger_quugasdg(name) {
    let trigger = document.getElementById(name);
    if (trigger) trigger.click();
}

function unpackComments_quugasdg(comment) {
    if (comment.length === 0) return [];
    let list = [...comment];
    comment.forEach(function(item) {
        list.push(...unpackComments_quugasdg(item.children))
    });
    return list;
}
