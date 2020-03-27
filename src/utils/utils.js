export default {
    /**
         * 截取URL参数
         * @param {string} name 截取的key
         * @param {string} [url] 被截取的url
         * @returns {string} 截取的val
         */
    urlParam: (name, url) => {
        let reg = new RegExp(".*[&?]" + name + "=([^&]*)(&|$)");
        let r;
        if (!url) {
            r = window.location.search.match(reg);
        } else {
            r = url.match(reg);
        }
        if (r) return decodeURIComponent(r[1]);
        return '';
    },
    /**
         * 判断是否是手机号
         * @param {string} val 传进来的字符串
         */
    isMobile: (val) => {
        let reg = /^1[3|4|5|7|8][0-9]\d{8}$/;
        return reg.test(val);
    },

    //获取订单类型
    getOrderType:(orderType)=>{
        // orderType订单类型：1：商城 2：互助 3：问答 4：问诊 5文章 6视频 7直播 8追问 100挂号
        let typeString = '';
        if (orderType === 4) {
            typeString = '图文问诊';
        } else if (orderType === 8) {
            typeString = '问诊追问';
        } else if (orderType === 3) {
            typeString = '语音';
        } else if (orderType === 5) {
            typeString = '图文';
        } else if (orderType === 6) {
            typeString = '视频';
        } else if (orderType === 7) {
            typeString = '直播';
        } else if (orderType === 100) {
            typeString = '门诊挂号'
        }
        return typeString;
    }
}