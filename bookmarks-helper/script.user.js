// ==UserScript==
// @name        favorites helper
// @version     1.1
// @author      ShlomoCode
// @match       *://*/*
// @description helper for the Favourites of nodebb sites
// ==/UserScript==
if (typeof $ === 'function') {
    let bookmarksList;
    async function getBookmarksIds() {
        if (localStorage.getItem('bookmarksIds')) {
            return JSON.parse(localStorage.getItem('bookmarksIds'));
        } else {
            const postIds = [];
            let pageIndex = 1;
            let isNext = true;
            do {
                const data = await (await fetch(`${location.origin}/api/user/${app.user.userslug}/bookmarks?page=${pageIndex}`)).json();
                const { posts } = data;
                postIds.push(...[...posts].map((post) => post.pid));
                pageIndex++;
                isNext = !!posts.length;
            } while (isNext);
            localStorage.setItem('bookmarksIds', JSON.stringify(postIds));
            return postIds;
        }
    }

    function initPage() {
        const posts = $('[component="post"]').not('.deleted');
        for (const post of posts) {
            const pHeader = $(post).find('.post-header');
            const button = $('<i style="margin-right: 5px;" class="fa fa-spinner fa-pulse please-await-to-bookmarks-list"></i>').tooltip({
                title: 'טוען נתוני מועדפים, אנא המתן...',
                placement: 'top',
                trigger: 'hover',
            });
            pHeader.append(button);
        }
    }

    async function main() {
        const api = await app.require('api');
        const messages = {
            'add-bookmark': 'הוסף למועדפים',
            'remove-bookmark': 'הסר מהמועדפים',
            bookmarks: 'מועדפים',
        };
        const posts = $('[component="post"]').not('.deleted').not('.bookmark-button-was-added');
        if (!bookmarksList) {
            initPage();
            try {
                bookmarksList = await getBookmarksIds();
            } catch (err) {
                return app.alertError(err.message);
            } finally {
                $('.please-await-to-bookmarks-list').remove();
            }
        }
        for (const post of posts) {
            const pid = parseInt($(post).attr('data-pid'), 10);
            const pHeader = $(post).find('.post-header');
            const isBookmarked = bookmarksList.includes(pid);
            const button = $('<button>')
                .addClass(isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark')
                .attr('action', isBookmarked ? 'remove-bookmark' : 'add-bookmark')
                .css({ background: 'none', border: 'none' })
                .tooltip({
                    title: messages[isBookmarked ? 'remove-bookmark' : 'add-bookmark'],
                    placement: 'top',
                    trigger: 'hover',
                })
                .click(async () => {
                    const action = $(button).attr('action');
                    try {
                        await api[action === 'add-bookmark' ? 'put' : 'del'](`/api/v3/posts/${pid}/bookmark`);
                        $(button).attr('action', action === 'add-bookmark' ? 'remove-bookmark' : 'add-bookmark');
                        $(button).toggleClass('far fa-bookmark fas fa-bookmark');
                        $(button).attr('data-original-title', messages[action === 'add-bookmark' ? 'remove-bookmark' : 'add-bookmark']);
                        const bookmarksSaved = JSON.parse(localStorage.getItem('bookmarksIds'))
                        const pIndexSaved = bookmarksSaved.findIndex(item => item === parseInt(pid));
                        if (pIndexSaved !== -1) {
                            bookmarksSaved[pIndexSaved] = undefined;
                            localStorage.setItem('bookmarksIds', JSON.stringify(bookmarksSaved));
                        } else {
                            localStorage.setItem('bookmarksIds', JSON.stringify([...bookmarksSaved, pid]));
                        }
                    } catch (err) {
                        app.alertError(err.message);
                    }
                });
            pHeader.append(button);
            $(post).addClass('bookmark-button-was-added');
        }
    }

    async function addLinkToNavigation() {
        if (!$('#bookmarks-link-navigation').length) {
            const bookmarksBtn = $('<li><a class="navigation-link" title="מועדפים" id="bookmarks-link-navigation" data-original-title="מועדפים" href="/uid/' + app.user.uid + '/bookmarks"><i class="fas fa-bookmark"></i><span class="visible-xs-inline">מועדפים</span></a></li>')
                .css({ background: 'none', border: 'none' })
                .tooltip({
                    title: 'מועדפים',
                    placement: 'bottom',
                    trigger: 'hover',
                });
            $('#main-nav').append(bookmarksBtn);
        }
    }
    async function manageBookmarks() {
        const api = await app.require('api');
        const posts = $('.posts-list').find('[component="post"]').not('.reject-bookmark-button-was-added');
        for (const post of posts) {
            const pid = parseInt($(post).attr('data-pid'), 10);
            const pHeader = $(post).find('.topic-title');
            const pText = $(post).find('.topic-title').text();
            const button = $('<button>')
                .addClass('fas fa-trash-alt')
                .css({ background: 'none', border: 'none' })
                .tooltip({
                    title: 'הסר מהמועדפים',
                    placement: 'top',
                    trigger: 'hover',
                })
                .click(async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    bootbox.confirm(`<style>[class="bootbox-close-button close"] { padding: 1px !important; }</style>האם אתה בטוח שברצונך להסיר מהמועדפים את הפוסט "<a href="/post/${pid}" target="_blank" style="color: gray;">${pText}</a>"?`, async (confirm) => {
                        if (!confirm) return;
                        try {
                            await new Promise((resolve, reject) => {
                                const alertId = utils.generateUUID();
                                app.alert({
                                    timeout: 2500,
                                    type: 'warning',
                                    alert_id: alertId,
                                    type: 'success',
                                    title: 'הפוסט יוסר מהמועדפים, לחץ כאן כדי לבטל',
                                    clickfn: () => reject('channeled'),
                                });
                                setTimeout(() => {
                                    app.removeAlert(alertId);
                                    resolve();
                                }, 2500);
                            });
                            await api.del(`/api/v3/posts/${pid}/bookmark`);
                            $(post).remove();
                            const bookmarksSaved = JSON.parse(localStorage.getItem('bookmarksIds'))
                            const pIndexSaved = bookmarksSaved.findIndex(item => item === parseInt(pid));
                            if (pIndexSaved !== -1) {
                                bookmarksSaved[pIndexSaved] = undefined;
                                localStorage.setItem('bookmarksIds', JSON.stringify(bookmarksSaved));
                            }
                        } catch (err) {
                            if (err !== 'channeled') {
                                app.alertError(err.message);
                            }
                        }
                    });
                });
            pHeader.append(button);
            $(post).addClass('reject-bookmark-button-was-added');
        }
    }

    $(window).on('action:posts.loaded action:topic.loaded', main);
    $(window).on('action:ajaxify.end', () => {
        if (/^user\/.+\/bookmarks$/.test(ajaxify.currentPage) && ajaxify.data.uid === app.user.uid) manageBookmarks();
    });
    $(window).on('action:ajaxify.end', addLinkToNavigation);
}
