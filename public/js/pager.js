(function () {
    const pager = document.getElementById('pager');
    const state = window.paging || { page: 1, total: 1, limit: 8 };

    const PAGER_SIDE_SPACE = 96; // '<<' & '>>' & side space px
    const PAGER_LINK_ITEM_WIDTH = 48;
    const MIN_PAGER_LINKS = 5; // minimum number of pager links, 5 includes 2x '...' & first/end/current page
    const MAX_PAGER_LINKS = 11; // maximum number of pager links

    function maxLinks() {
        const w = (pager.parentElement.clientWidth || 0) - PAGER_SIDE_SPACE;
        const item = PAGER_LINK_ITEM_WIDTH;
        const n = Math.floor(w / item);
        return Math.max(MIN_PAGER_LINKS, Math.min(n, MAX_PAGER_LINKS)); // 
    }


    function hrefOf(p) {
        const qs = new URLSearchParams(location.search);
        qs.set('page', p);
        qs.set('limit', state.limit);
        return '?' + qs.toString();
    }

    function render() {
        const MAX = maxLinks();
        const { page, total } = state;
        pager.innerHTML = '';

        const add = (label, p, opts = {}) => {
            const li = document.createElement('li');
            li.className = 'page-item' + (opts.disabled ? ' disabled' : '') + (opts.active ? ' active' : '');
            const a = document.createElement('a');
            a.className = 'page-link';
            a.textContent = label;
            a.href = hrefOf(p);
            li.appendChild(a);
            pager.appendChild(li);
        };

        const middle = Math.max(MAX - 2, 0);
        const side = Math.floor((middle - 1) / 2);
        let start = Math.max(2, page - side), end = Math.min(total - 1, page + side);
        /**
         * Fill the middle range to exactly middle items when possible.
         * Handles all edge cases in one generic loop:
         * 1. Near the left edge: start is clamped to 2, so we extend end
         * 2. Near the right edge: end is clamped to total-1, so we extend start
         * 3. Centered case: extend around the current page until we reach middle
         * 4. Not enough total pages: both sides saturate; the range stays shorter
         */
        while (end - start + 1 < middle) {
            if (start > 2)
                start--;
            else if (end < total - 1)
                end++;
            else
                break;
        }

        add('«', Math.max(1, page - 1), { disabled: page <= 1 });
        add('1', 1, { active: page === 1 });

        const leftDots = start > 2, rightDots = end < total - 1;
        const from = start + (leftDots ? 1 : 0), to = end - (rightDots ? 1 : 0);
        
        if (leftDots) {
            pager.insertAdjacentHTML(
                'beforeend', 
                '<li class="page-item disabled"><span class="page-link">…</span></li>'
            );
        }
        for (let p = from; p <= to; p++) {
            add(String(p), p, { active: page === p });
        }
        if (rightDots) {
            pager.insertAdjacentHTML(
                'beforeend', 
                '<li class="page-item disabled"><span class="page-link">…</span></li>'
            );
        }

        if (total > 1) {
            add(String(total), total, { active: page === total });
        }
        add('»', Math.min(total, page + 1), { disabled: page >= total });
    }

    const ro = new ResizeObserver(render);
    ro.observe(pager.parentElement);
    window.addEventListener('orientationchange', render);
    render();
})();