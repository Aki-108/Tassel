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
            "version": "2.9",
            "created": 1661764440000,
            "updated": 1699180553884,
            "author": "Aki108",
            "description": "Get notified when there are new comments on a post.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@e355457ddf91119f11d4506cbf1ccec172dc3e24/extensions/PostSubscriber/PostSubscriber.js",
            "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@e99697a94751a76a9c7704e41d77edab02413a9c/extensions/PostSubscriber/PostSubscriber.css",
            "post": "https://www.pillowfort.social/posts/2878877",
            "features": ["Subscribe to posts.",
                         "Get notifications for new comments in the sidebar.",
                         "Highlight new comments."
            ]
        },
        {
            "name": "Reblogged to Community",
            "id": 3,
            "version": "2.6",
            "created": 1653984960000,
            "updated": 1699810978512,
            "author": "Aki108",
            "description": "Shows where a post has been liked/reblogged to.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@1221db549dd97864c22357344f18270f526e1bb3/extensions/RebloggedToCommunity/RebloggedToCommunity.js",
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
            "version": "1.6",
            "created": 1674907200000,
            "updated": 1703757216988,
            "author": "Aki108",
            "description": "New and improved blacklist with lots of settings.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@de7120aec7f4ab9e46fd2e8c736a02a1061a1078/extensions/AdvancedBlacklist/AdvancedBlacklist.js",
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
            "version": "1.6",
            "created": 1678386060000,
            "updated": 1703938284270,
            "author": "Aki108",
            "description": "Makes consistent tagging easier.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@2184ab1af9b7e504f6e7653c31c142df0cde81e5/extensions/TaggingTools/TaggingTools.js",
            "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@be9c0472223a193a327ac0e9ad0408e902f36e29/extensions/TaggingTools/TaggingTools.css",
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
            "version": "1.2",
            "created": 1693040438225,
            "updated": 1698421111531,
            "author": "Aki108",
            "description": "Censor (NSFW) images and icons.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@35aa264521a85a9d18b14def9e6b2a2475f69e12/extensions/ImageCensor/ImageCensor.js",
            "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@5381c8033b663799c648d26f1803daf38ab8ddfa/extensions/ImageCensor/ImageCensor.css",
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
            "version": "1.3",
            "created": 1693639280661,
            "updated": 1703925817495,
            "author": "Aki108",
            "description": "Shows statistics of a post.",
            "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@60354f1febf4d269a0ab6ee523bbee03219b2a19/extensions/PostCharts/PostCharts.js",
            "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@f69d5400fe9f1ed953cd1fbdf858b99eec29aa1e/extensions/PostCharts/PostCharts.css",
            "post": "https://www.pillowfort.social/posts/3682233",
            "features": [
                    "Shows a chart of how the notes on a post developed over time.",
                    "Shows a chart of notes on a post grouped by weekday or hour."
            ]
        },
        {
                "name": "Sidebar Counts",
                "id": 10,
                "version": "1.0",
                "created": 1694995080000,
                "updated": 1701106140000,
                "author": "optimists-inbound",
                "description": "Makes the Pillowfort followers/following/mutuals count be accurate",
                "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@ca65e9cddf1016f5c2cc749e38a0426867f56cb4/extensions/SidebarCounts.js",
                "post": "https://www.pillowfort.social/posts/3739972"
        },
        {
                "name": "Read This",
                "id": 11,
                "version": "1.2",
                "created": 1696017952450,
                "updated": 1703533945712,
                "author": "Aki108",
                "description": "Open Read-More's anywhere.",
                "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@c4970c66f3ac9329b818db222823880a0783f528/extensions/ReadThis/ReadThis.js",
                "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@dd5afc9dfe248201b8b23ba0b5a2be72b5fa8c21/extensions/ReadThis/ReadThis.css",
                "post": "https://www.pillowfort.social/posts/3787080",
                "features": [
                        "Opens a Read-More without opening the post.",
                        "Shortens long posts."
                ]
        },
        {
                "name": "Fort Archive",
                "id": 12,
                "version": "0.2",
                "created": 1696333244573,
                "updated": 1703164434481,
                "author": "Aki108",
                "description": "See many posts at once.",
                "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@066fb41a4608a028aba317faa57cb61e853fb017/extensions/FortArchive/FortArchive.js",
                "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@81d7e49e67bd4d391f052728d9f3199a97804a1c/extensions/FortArchive/FortArchive.css",
                "post": "https://www.pillowfort.social/posts/3798470"
        },
        {
                "name": "Hide Numbers",
                "id": 13,
                "version": "1.0",
                "created": 1699174060526,
                "updated": 1699174060526,
                "author": "Aki108",
                "description": "Hide any number.",
                "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@11ffc58430e017d77d327b26c925cd8bd91ca563/extensions/HideNumbers.js"
        },
        {
                "name": "Keyboard Shortcuts",
                "id": 14,
                "version": "0.1",
                "created": 1703241062270,
                "updated": 1703241062270,
                "author": "Aki108",
                "description": "Navigate Pillowfort with you keyboard.",
                "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@774b8c0ee696c73f60581a1f1f70775de1cc367e/extensions/KeyboardShortcuts/KeyboardShortcuts.js",
                "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@f53219db6b18491c39a11fb63561e491474614a4/extensions/KeyboardShortcuts/KeyboardShortcuts.css",
                "post": "https://www.pillowfort.social/posts/4123393"
        },
        {
                "name": "User Muting",
                "id": 15,
                "version": "1.2",
                "created": 1703613662842,
                "updated": 1703854999636,
                "author": "Aki108",
                "description": "Remove people partially.",
                "src": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@c553ba867db4a7acf890cc7498f2f562d87f2a73/extensions/UserMuting/UserMuting.js",
                "css": "https://cdn.jsdelivr.net/gh/Aki-108/Tassel@9efa6891aa45b0eda4fa80a6f7424cb01e0242e2/extensions/UserMuting/UserMuting.css",
                "post": "https://www.pillowfort.social/posts/4139698",
                "features": [
                        "Remove posts/reblogs of someone.",
                        "Remove collapse comments of someone."
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
