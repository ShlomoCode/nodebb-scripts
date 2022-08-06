// ==UserScript==
// @name        Add edit post button - full
// @version     1.1
// @author      ShlomoCode
// @match       *://*/*
// @description Add edit post button for own posts (for admin - for all posts) for nodebb forums
// ==/UserScript==
if (typeof $ === 'function' && typeof app === 'object' && app?.user?.uid) {
    (() => {
        const icons = [
            {
                text: 'עיפרון',
                value: 'fa fa-fw fa-pencil'
            },
            {
                text: 'עיפרון מעודן',
                value: 'fa fa-solid fa-pen'
            },
            {
                text: 'מברשת',
                value: 'fa pointer fa-paint-brush'
            },
            {
                text: 'עט ציפורן',
                value: 'fa fa-solid fa-pen-fancy'
            },
            {
                text: 'עט רגיל',
                value: 'fas fa-pen-alt'
            },
            {
                text: 'עט + סרגל',
                value: 'fas fa-pencil-ruler'
            },
            {
                text: 'זרחן',
                value: 'fas fa-highlighter'
            }
        ];

        const selectIcon = () =>
            new Promise((resolve, reject) => {
                if (!localStorage.getItem('edit-post-icon')) {
                    bootbox.prompt({
                        title: 'בחר סמל',
                        inputType: 'select',
                        inputOptions: icons,
                        value: icons[0].value,
                        callback: function (result) {
                            if (!result || result === 'null') {
                                localStorage.setItem('edit-post-icon', icons[0].value);
                                app.alertSuccess(`סמל ברירת מחדל - "${icons[0].text}", הוגדר בהצלחה`);
                                resolve(icons[0].value);
                            } else {
                                localStorage.setItem('edit-post-icon', result);
                                app.alertSuccess(`סמל הוגדר בהצלחה - "${icons.find((i) => i.value === result).text}"`);
                                resolve(result);
                            }
                        }
                    });
                } else {
                    resolve(localStorage.getItem('edit-post-icon'));
                }
            });

        async function addEditButtonForPosts (buttonTooltip) {
            const posts = $(app.user.isGlobalMod || app.user.isAdmin ? '[component="post"]' : '.self-post').not('.edit-button-was-added');
            for (const post of posts) {
                const pid = parseInt($(post).attr('data-pid'), 10);
                const pHeader = $(post).find('.post-header');
                const editButton = $('<button>')
                    .addClass(iconClass)
                    .css({ background: 'none', border: 'none' })
                    .tooltip({
                        title: buttonTooltip,
                        placement: 'top',
                        trigger: 'hover',
                        container: 'body'
                    })
                    .click(() => {
                        $(window).trigger('action:composer.post.edit', { pid });
                    });
                pHeader.append(editButton);
                $(post).addClass('edit-button-was-added');
            }
        }

        let iconClass;
        let buttonTooltip;
        (async () => {
            const [translator] = await app.require(['translator']);
            buttonTooltip = await translator.translate('[[topic:edit]]');
            iconClass = await selectIcon();
            addEditButtonForPosts(buttonTooltip);
            $(window).on('action:posts.loaded action:topic.loaded', () => addEditButtonForPosts(buttonTooltip));
        })();

        const resetIconBtn = $('<li><a href="#"><i">שנה סמל</i></a></li>')
            .css({ background: 'none', border: 'none' })
            .tooltip({
                title: 'שנה סמל כפתור עריכת פוסט',
                placement: 'top',
                trigger: 'hover',
                container: 'body'
            })
            .click(async () => {
                localStorage.removeItem('edit-post-icon');
                $('.edit-button-was-added').removeClass('edit-button-was-added');
                iconClass = await selectIcon();
                ajaxify.refresh();
            });
        $('#main-nav').append(resetIconBtn);
    })();
}
