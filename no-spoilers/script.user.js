// ==UserScript==
// @name         No Spoilers
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       ShlomoCode
// @match        https://mitmachim.top/*
// @match        https://rechavimzelaze.ovh/*
// @grant        none
// ==/UserScript==

$(window).on('action:posts.edited action:composer.posts.reply action:composer.posts.edit action:topic.loaded action:posts.loaded', function () {
    $(".card.card-body.spoiler").removeClass("card card-body spoiler");
    $(".collapse:not(.show)").css("display", "unset");
    $(".extended-markdown-spoiler").hide();
});
