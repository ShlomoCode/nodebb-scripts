// ==UserScript==
// @name        Keyboard shortcut reply for NodeBB
// @match       *://*/*
// @version     1.1.1
// @author      ShlomoCode
// @description Keyboard shortcut for open a topic reply for NodeBB forums - ctrl+i
// ==/UserScript==
if (typeof $ === 'function' && typeof app === 'object' && app?.user?.uid) {
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
