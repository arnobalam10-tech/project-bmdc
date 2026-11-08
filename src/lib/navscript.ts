/**
 * Inline <head> script: starts the top loading bar on the very first tap, before React has hydrated.
 * Sets <html data-navloading>; CSS draws the bar; NavigationProgress removes it when the route changes.
 */
export const navLoadingScript = `(function(){var d=document.documentElement,t;function stop(){delete d.dataset.navloading}
document.addEventListener("click",function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
var a=e.target&&e.target.closest&&e.target.closest("a");if(!a||!a.href||a.target==="_blank"||a.hasAttribute("download"))return;
var u=new URL(a.href,location.href);if(u.origin!==location.origin)return;if(u.pathname===location.pathname&&u.search===location.search)return;
d.dataset.navloading="1";clearTimeout(t);t=setTimeout(stop,15000)},true);
window.addEventListener("bmdc:navstart",function(){d.dataset.navloading="1";clearTimeout(t);t=setTimeout(stop,15000)});
window.addEventListener("pageshow",stop)})();`;
