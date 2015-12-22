jQuery.resizeView = function (id) {
    if (id)
        $(function () {
            if (window.parent != window) {
                var winH = $(window).height();
                var bodyH = $(document).height();
                if (bodyH > winH) {
                    window.parent.document.getElementById(id).height = bodyH;
                } else {
                    window.parent.document.getElementById(id).height = winH;
                }
            }
        });
};

jQuery.imgLoaded = function (callback) {
    var imgs = document.getElementsByTagName("img");
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].addEventListener("load", callback);
    }
}
jQuery.readText = function (file, callback, async) {
    if (file) {
        //Fun.debug("load file:"+file);
        $(function () {
            $.ajax({
                url: file,
                dataType: 'text',
                async: async ? true : false,
                success: function (data, textStatus) {
                    //    Fun.debug("load file done:"+file);
                    callback(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    Fun.debug("load file error:" + errorThrown);
                }
            });
        });
    } else {
        //Fun.debug("file undefine");
    }
};

jQuery.loadMD = function (fromFile, toElementID, iframe) {
    jQuery.readText(fromFile, function (data) {
        var content = document.getElementById(toElementID);
        var html = markdown.toHTML(data);
        content.innerHTML = html;
        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
        $('p code').each(function (i, block) {
            hljs.highlightBlock(block);
        });

        jQuery.imgLoaded(function () {
            jQuery.resizeView(iframe)
        });

        jQuery.resizeView(iframe);
    }, false);
};


var Fun = {};
Fun.debug = function (log) {
    // return;
    console.log(log);
};

Fun.setArgs = function (key, value) {
    var p = [];
    p.push(key + '=' + value);
    return encodeURI('?' + p.join('&'));
};

Fun.getArgs = function (key) {
    var retval;
    var params = location.search;
    if (!params) {
        return;
    }
    var Args = params.split("?");
    if (Args[0] == params) {
        return;
    }
    var str = Args[1];
    var args = str.split("&");
    for (var i = 0; i < args.length; i++) {
        str = args[i];
        var arg = str.split("=");
        if (arg.length <= 1) continue;
        if (arg[0] == key) {
            retval = arg[1];
            break;
        }
    }
    return retval;
};

Fun.replaceHtml = function (s) {
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/ /g, " &nbsp;");
    s = s.replace(/\"/g, "&quot;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\n/g, "<br/>");
    return s;
};


Fun.Markdown2HtmlByGithub = function (params, callback) {
    var path = '/markdown' + params.raw ? "/raw" : '';
    if (params.text) {
        convert(params.text);
    } else if (params.file) {
        jQuery.readText(fromFile, function (data) {
            convert(params.data);
        }, true);
    }
    var convert = function (txt) {
        $.ajax({
            type: 'POST',
            url: path,
            dataType: 'text',
            async: params.async ? params.async : true,
            success: function (data, textStatus) {
                //    Fun.debug("load file done:"+file);
                callback(data);
            },
        });
    }
}
