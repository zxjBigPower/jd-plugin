(function () {
    'use strict';
    (function () {
        const XHR = XMLHttpRequest.prototype;

        const origOpen = XHR.open;
        const origSend = XHR.send;

        XHR.open = function (method, url) {
            this._url = url
            return origOpen.apply(this, arguments);
        };

        XHR.send = function (postData) {
            this.addEventListener('load', function () {
                if (this._url.indexOf('wareBusiness') !== -1) {
                    var extraInfo = {};
                    extraInfo.curr_shop_id = window.pageConfig.product.shopId;
                    extraInfo.curr_main_pic = window.pageConfig.product.currentMainImage;
                    extraInfo.curr_colorSize = window.pageConfig.product.colorSize;
                    extraInfo.curr_cat_id = window.pageConfig.product.cat;
                    extraInfo.curr_cat_name = window.pageConfig.product.catName;
                    extraInfo.curr_image_list = window.pageConfig.product.imageList;
                    extraInfo.curr_vender_id = window.pageConfig.product.venderId;

                    window.postMessage({url: this._url, data: this.response, extraInfo: extraInfo}, '*');
                }
            });
            return origSend.apply(this, arguments);
        };
    })(XMLHttpRequest);
})();
