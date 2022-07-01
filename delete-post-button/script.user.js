// ==UserScript==
// @name        Add delete/restore post button
// @version     1.0
// @author      ShlomoCode
// @match       *://*/*
// @description Add delete/restore post button for own posts (for admin - for all posts) for nodebb forums
// ==/UserScript==
if (typeof $ === 'function') {
    async function main () {
        const [api, translator] = await app.require(['api', 'translator']);
        const translations = {
            delete: await translator.translate('[[topic:delete]]'),
            restore: await translator.translate('[[topic:restore]]')
        };
        const posts = $(app.user.isGlobalMod || app.user.isAdmin ? '[component="post"]' : '.self-post').not('.delete-button-was-added');
        for (const post of posts) {
            const pid = parseInt($(post).attr('data-pid'), 10);
            const pHeader = $(post).find('.post-header');
            const isDeleted = $(post).hasClass('deleted');
            const button = $('<button>')
                .addClass(isDeleted ? 'fas fa-trash-restore-alt' : 'fa fa-fw fa-trash-o')
                .attr('action', isDeleted ? 'restore' : 'delete')
                .css({ background: 'none', border: 'none' })
                .tooltip({
                    title: translations[isDeleted ? 'restore' : 'delete'],
                    placement: 'top',
                    trigger: 'hover'
                })
                .click(async () => {
                    const action = $(button).attr('action');
                    bootbox.confirm(`[[topic:post_${action}_confirm]]`, async (confirm) => {
                        if (!confirm) return;
                        try {
                            await api[action === 'delete' ? 'del' : 'put'](`/api/v3/posts/${pid}/state`);
                            $(button).attr('action', action === 'delete' ? 'restore' : 'delete');
                            $(button).toggleClass('fa fa-fw fa-trash-o fas fa-trash-restore-alt');
                            $(button).attr('data-original-title', translations[action === 'delete' ? 'restore' : 'delete']);
                        } catch (err) {
                            app.alertError(err.message);
                        }
                    });
                });
            pHeader.append(button);
            $(post).addClass('delete-button-was-added');
        }
    }
    $(window).on('action:posts.loaded action:topic.loaded', main);
}
