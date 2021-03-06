// ==UserScript==
// @name        Quick Reply for NodeBB
// @match       *://*/*
// @version     1.0
// @author      ShlomoCode
// @description Shortcut to open a topic reply for NodeBB forums - ctrl+i
// ==/UserScript==
if (typeof $ === 'function') {
    $(window).on('action:topic.loaded', (e, data) => {
        $(document).on('keydown', (e) => {
            if (e.ctrlKey && e.keyCode === 73) {
                const { tid, title } = data;
                if (app.currentRoom.split('_')[0] !== 'topic' || app.currentRoom.split('_')[1] !== String(tid)) return;
                $(window).trigger('action:composer.post.new', {
                    tid,
                    topicName: title
                });
            }
        });
    });
}
