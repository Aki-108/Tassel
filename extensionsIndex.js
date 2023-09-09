let extensionsIndex = [
        {
            "name": "Lightbox",
            "id": 1,
            "version": "1.5",
            "created": 1660385280000,
            "updated": 1680462960000,
            "author": "Aki108",
            "description": "View images in full screen",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@f5fe346083392cb0469325761d1078f828c940a7/extensions/Lightbox.js",
            "post": "https://www.pillowfort.social/posts/2841345",
            "features": ["View images in full screen.",
                         "Adds a dedicated button for embedded links."
            ]
        },
        {
            "name": "Post Subscriber",
            "id": 2,
            "version": "2.7",
            "created": 1661764440000,
            "updated": 1690032057512,
            "author": "Aki108",
            "description": "Get notified when there are new comments on a post.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@39b3ac70017defb9247c015208b5fde72a5ca5aa/extensions/PostSubscriber/PostSubscriber.js",
            "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@041af2a0fbd5ec2fa8b4c386597e40d4fb11b544/extensions/PostSubscriber/PostSubscriber.css",
            "post": "https://www.pillowfort.social/posts/2878877",
            "features": ["Subscribe to posts.",
                         "Get notifications for new comments in the sidebar.",
                         "Highlight new comments."
            ]
        },
        {
            "name": "Reblogged to Community",
            "id": 3,
            "version": "2.5",
            "created": 1653984960000,
            "updated": 1686421140000,
            "author": "Aki108",
            "description": "Shows where a post has been liked/reblogged to.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@f6d1095bb0264c832ce29101c420b7c61ec2f42b/extensions/RebloggedToCommunity/RebloggedToCommunity.js",
            "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@dd5f2a25bf1998597454ecd652f521927bca05d6/extensions/RebloggedToCommunity/RebloggedToCommunity.css",
            "post": "https://www.pillowfort.social/posts/3057985",
            "features": ["Show where a post has been reblogged to.",
                         "Show where a post has been liked from.",
                         "Makes notes actually dark in dark mode."
            ]
        },
        {
            "name": "Advanced Blacklist",
            "id": 4,
            "version": "1.2",
            "created": 1674907200000,
            "updated": 1693047183221,
            "author": "Aki108",
            "description": "New and improved blacklist with lots of settings.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@7b974afd2d424014a758c137451e6912aa98ecdb/extensions/AdvancedBlacklist/AdvancedBlacklist.js",
            "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@ee662bcafd89de43840272c9f2106380c6fba579/extensions/AdvancedBlacklist/AdvancedBlacklist.css",
            "post": "https://www.pillowfort.social/posts/3273878",
            "features": [
                "Block posts by tag, content, username or community.",
                "Block specific posts and their reblogs.",
                "Show the original tags of a reblog."
            ]
        },
        {
            "name": "Collapsible Threads",
            "id": 5,
            "version": "1.4",
            "created": 1674985800000,
            "updated": 1691331914705,
            "author": "Aki108",
            "description": "Collapse comments and threads.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@de4ae2b1a2f779a8168276c88cd9b9daf5b99e3e/extensions/CollapsibleThreads.js",
            "post": "https://www.pillowfort.social/posts/3161577"
        },
        {
            "name": "Blocklist Annotations",
            "id": 6,
            "version": "1.1",
            "created": 1675279440000,
            "updated": 1675538640000,
            "author": "Aki108",
            "description": "Remember the reason you blocked someone.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@af310a1a71f7e691b507b0019a1877f70fb2007c/extensions/BlocklistAnnotations.js",
            "post": "https://www.pillowfort.social/posts/3167192"
        },
        {
            "name": "Tagging Tools",
            "id": 7,
            "version": "1.3",
            "created": 1678386060000,
            "updated": 1690041155179,
            "author": "Aki108",
            "description": "Makes consistent tagging easier.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@c7236a3ae4b23865fe3b9b07a14b1150c83099dc/extensions/TaggingTools/TaggingTools.js",
            "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@45a52798eab8c5650efd95b0916747f0c07c02b1/extensions/TaggingTools/TaggingTools.css",
            "post": "https://www.pillowfort.social/posts/3228885",
            "features": [
                "Suggests tags based on your previous posts.",
                "Adds a button for copying tags when reblogging.",
                "Set default tags that automatically apply to posts you make/reblog."
            ]
        },
        {
            "name": "Image Censor",
            "id": 8,
            "version": "1.1",
            "created": 1693040438225,
            "updated": 1694245433855,
            "author": "Aki108",
            "description": "Censor (NSFW) images and icons.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@152b208ca2d38e414247660a32050cb36248b2ca/extensions/ImageCensor/ImageCensor.js",
            "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@9c34ab44040bc42fa6bb50363b5f03017de5743f/extensions/ImageCensor/ImageCensor.css",
            "post": "https://www.pillowfort.social/posts/3658180",
            "features": [
                    "Blur NSFW images in posts.",
                    "Collapse NSFW posts.",
                    "Blur any image in posts.",
                    "Pause GIFs",
                    "Replace specific user's icon with the Pillowfort default icon."
            ]
        },
        {
            "name": "Post Charts",
            "id": 9,
            "version": "1.1",
            "created": 1693639280661,
            "updated": 1694188283413,
            "author": "Aki108",
            "description": "Shows statistics of a post.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@b23bedf86f7c2ae1e9edc57063f143ed79402571/extensions/PostCharts/PostCharts.js",
            "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@f69d5400fe9f1ed953cd1fbdf858b99eec29aa1e/extensions/PostCharts/PostCharts.css",
            "post": "https://www.pillowfort.social/posts/3682233",
            "features": [
                    "Shows a chart of how the notes on a post developed over time.",
                    "Shows a chart of notes on a post grouped by weekday or hour."
            ]
          }
    ];

/* Template

  {
    "name": "",
    "id": 0,
    "version": "",
    "created": 0,
    "updated": 0,
    "author": "",
    "icon": "",
    "description": "",
    "src": "",
    "css": "",
    "post": "",
    "features": [
    ]
  }
*/
