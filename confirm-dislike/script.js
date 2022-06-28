// ==UserScript==
// @name        Confirm Dislike
// @version     1.0
// @author      ShlomoCode
// @match       *://*
// @description Confirm before disliking a post
// ==/UserScript==
if (typeof $ === 'function') {
    $(window).on('action:post.toggleVote', (e, d) => {
        if (d.delta === -1 && d.unvote === false) {
            if (!confirm('האם אתה בטוח שברצונך לתת דיסלייק? שים לב שהדבר לפי חוקי הפורום!')) {
                $(`[data-pid="${d.pid}"]`).find('[component="post/downvote"]').click();
                app.alert({
                    type: 'warning',
                    title: '!שים לב',
                    message: 'המערכת ניסתה לבטל את הדיסלייק. יש לוודא שהוא באמת בוטל',
                    timeout: 2500
                });
            } else {
                app.alert({
                    type: 'success',
                    title: 'הדיסלייק ניתן בהצלחה',
                    timeout: 2500
                });
            }
        }
    });
}
