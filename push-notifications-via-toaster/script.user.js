// ==UserScript==
// @name        push notification via toaster
// @version     1.1
// @author      ShlomoCode
// @match       *://*/*
// @description push notification incoming via toaster for nodebb forums
// ==/UserScript==
/* global socket */
(async () => {
    if (typeof $ === 'function' && typeof app === 'object' && app?.user?.uid) {
        const [alerts] = await app.require(['alerts']);
        socket.on('event:new_notification', function (data) {
            function OpenNotfiPath () {
                window.open(data.path, '_blank'); // Replace "_blank" with "_ self" for the alert to open on the same tab.
            }
            alerts.alert({
                title: '[[notifications:new_notification]]',
                message: data.bodyShort,
                clickfn: OpenNotfiPath,
                timeout: 3800,
                type: 'info'
            });
            if (['he', 'ar'].includes(app.user.timeagoCode)) {
                $('.alert-window').css({ right: 'auto', left: '20px' });
            }
        });
    }
})();
