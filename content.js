
// Mouse listener for any move event on the current document.
document.addEventListener('mousemove', function (e) {

      chrome.runtime.connect().postMessage(e);

}, false);