import {createHashRouter} from 'react-router-dom';
import {appRoutes} from './routes';
export const router=createHashRouter(appRoutes);

// Keep command-driven navigation and redirects inside their current window.
const openPage = window.desktop?.openPage;
if (openPage) {
    document.addEventListener("click", event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest<HTMLAnchorElement>("a[href]");
        if (!link || link.target || link.hasAttribute("download")) return;
        const url = new URL(link.href);
        if (url.protocol !== location.protocol || url.host !== location.host || url.pathname !== location.pathname || url.search !== location.search || !url.hash.startsWith("#/")) return;

        event.preventDefault();
        event.stopPropagation();
        void openPage(url.hash.slice(1)).catch(() => {
            console.warn("Unable to open desktop page.");
        });
    }, true);
}
