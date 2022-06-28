// ==UserScript==
// @name        Add edit post button - basic
// @version     1.0
// @author      ShlomoCode
// @match       *://*/*
// @description Add edit post button for own posts (for admin - for all posts) for nodebb forums
// ==/UserScript==
if (typeof $ === 'function') {
    async function addEditButtonForPosts () {
        const [translator] = await app.require(['translator']);
        const editButtonTitle = await translator.translate('[[topic:edit]]');
        const posts = $(app.user.isGlobalMod || app.user.isAdmin ? '[component="post"]' : '.self-post').not('.edit-button-was-added');
        for (const post of posts) {
            const pid = parseInt($(post).attr('data-pid'), 10);
            const pHeader = $(post).find('.post-header');
            const editButton = $('<button>')
                .addClass('fa fa-fw fa-pencil')
                .css({ background: 'none', border: 'none' })
                .tooltip({
                    title: editButtonTitle,
                    placement: 'top',
                    trigger: 'hover'
                })
                .click(() => {
                    $(window).trigger('action:composer.post.edit', { pid });
                });
            pHeader.append(editButton);
            $(post).addClass('edit-button-was-added');
        }
    }

    $(window).on('action:posts.loaded action:topic.loaded', addEditButtonForPosts);
}
