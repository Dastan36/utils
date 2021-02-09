layui.define(['form','treetable','jquery','layer'],function(exports){
    var treetable = layui.treetable,
        table = layui.table,
        form = layui.form,
        layer = layui.layer,
        $ = layui.jquery,
        setter = layui.setter,
        view = layui.view;
        
    var tableData = [];
    var treetableAsync = {
        render : function(param){
            var provincesUrl = param.url;
    
            function init(id){
                $.ajax({
                    url: provincesUrl,
                    type:"post",
                    success:function(r){
                        param.data = tableData = r.data;
                        tableInit();
                    }
                });
            }
            init(param.treeSpid);
            
            // 渲染表格
            function tableInit(){
                treetable.render(param);
            }
//            $(".layui-table-body .layui-table tr").bind("click",function(){
//            $('.layui-table-body .layui-table tr').click(function(){
            $("body").on('dblclick','.layui-table-body .layui-table tr',function(e){
            	clearTimeout(treetable.timer);
            	treetable.treetable_load = false;
                var top = $('.layui-table-body').scrollTop();
                var pid = $(this).find('td[data-field="'+param.treeIdName+'"]').text();
                if(pid.indexOf("_")!=-1) pid = pid.substring(pid.indexOf("_")+1); 
                var index = $(this).index();
                layer.load(2);
                $.ajax({
                    url: provincesUrl+"&node="+pid,// + pid,
                    type:"post",
                    success:function(r){
                    	layer.closeAll('loading');
                        var isInit = false;
                        for(var i=0; i<r.data.length; i++){
                            var isPush = true;
                            for(var j=0; j<tableData.length; j++){
                                if(r.data[i][param.treeIdName] == tableData[j][param.treeIdName]){
                                    isPush = false;
                                }
                            }
                            if(isPush){
                                tableData.push(r.data[i]);
                                isInit = true;
                            }
                        }
                        if(isInit){
                            param.data = tableData;
                            treetable.toggleRows($('.layui-table-body .layui-table tr').eq(index).find('.treeTable-icon'));
                            tableInit();
//                            expandSelfAndParent(index);
                            $('.layui-table-body').scrollTop(top);
                        }
                    },
	                error:function(e){
	                	layer.closeAll('loading');
					}
                });
            });
            
            
            function expandSelfAndParent(index){
                treetable.toggleRows($('.layui-table-body .layui-table tr').eq(index).find('.treeTable-icon'));
                var tpid = $('.layui-table-body .layui-table tr').eq(index).find('.treeTable-icon').attr('lay-tpid');
                var trs = $('.layui-table-body .layui-table tr');
                var j = -1;
                for(var i=0; i<trs.length; i++){
                    if($(trs[i]).find('.treeTable-icon').attr('lay-tid') == tpid){
                        treetable.toggleRows($('.layui-table-body .layui-table tr').eq(i).find('.treeTable-icon'));
                        if($(trs[i]).find('.treeTable-icon').attr('lay-tpid') != 0){
                            j=i
                        }
                        break;
                    }
                }
                if(j != -1){
                    init(j)
                }
            }
            
        },
        
        toggleRows:function($dom, linkage){
            treetable.toggleRows($dom, linkage);
        },
        getEmptyNum:function(pid, data){
            treetable.getEmptyNum(pid, data);
        },
        checkParam:function(param){
            treetable.checkParam(param);
        },
        expandAll:function(dom){
            treetable.expandAll(dom);
        },
        foldAll:function(dom){
            treetable.foldAll(dom);
        }
    }
    
    
    exports('treetableAsync', treetableAsync);

})