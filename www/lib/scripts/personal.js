
jQuery.resizeView = function (id) {
    $(function(){
        if(window.parent!=window) {
            //ȡ�����ڵĸ߶�
            var winH = $(window).height();
            //ȡ��ҳ��ĸ߶�
            var bodyH = $(document).height();
            if (bodyH > winH) {
                window.parent.document.getElementById(id).height = bodyH;
            } else {
                window.parent.document.getElementById(id).height = winH;
            }
        }
    });
};

jQuery.readText=function(file,callback,async){
    if(file){
        $(function() {
            $.ajax({
                url: file,
                dataType: 'text',
                async: async?true:false ,
                success: function(data) {
                    callback(data);
                }
            });
        });
    }else{
        console.log("file undefine");
    }
};

var Fun={};
Fun.setArgs = function(key,value){
    var p = [];
    p.push( key + '=' + value);
    return encodeURI('?' + p.join('&'));
};

Fun.getArgs = function(key) {
    var retval;
    var params = location.search;
    if (!params) {
        return;
    }
    var Args   = params.split("?");
    if(Args[0] == params){
        return;
    }
    var str = Args[1];
    var args = str.split("&");
    for(var i = 0; i < args.length; i ++)
    {
        str = args[i];
        var arg = str.split("=");
        if(arg.length <= 1) continue;
        if(arg[0] == key){
            retval = arg[1];
            break;
        }
    }
    return retval;
};

Fun.replaceHtml=function(s){
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/ /g, " &nbsp;");
    s = s.replace(/\"/g, "&quot;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\n/g, "<br/>");
    return s;
}