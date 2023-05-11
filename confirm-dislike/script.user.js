// ==UserScript==
// @name        Confirm Dislike
// @version     1.1
// @author      ShlomoCode
// @match       *://*/*
// @description Confirm before disliking a post
// ==/UserScript==
(async () => {
    if (typeof $ === 'function' && typeof app === 'object' && app?.user?.uid) {
        const [alerts] = await app.require(['alerts']);
        $(window).on('action:post.toggleVote', (e, d) => {
            if (d.delta === -1 && d.unvote === false) {
                if (!confirm('האם אתה בטוח שברצונך לתת דיסלייק? שים לב שהדבר לפי חוקי הפורום!')) {
                    $(`[data-pid="${d.pid}"]`).find('[component="post/downvote"]').click();
                    alerts.alert({
                        type: 'warning',
                        title: 'שים לב!',
                        message: 'המערכת ניסתה לבטל את הדיסלייק. יש לוודא שהוא באמת בוטל',
                        timeout: 2500
                    });
                } else {
                    alerts.alert({
                        type: 'success',
                        title: 'הדיסלייק ניתן בהצלחה',
                        timeout: 2500
                    });
                }
            }
        });
    }
})();