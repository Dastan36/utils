layui.define(["layer", "jquery"], function (exports) {
	var $ = layui.$,
		layer = layui.layer;

	var wbUtil = {
		base_server: '',
		tableName: 'wb',  // 存储表名
		clientId: 'webApp',	// 应用id
		clientSecret: 'webApp',// 应用秘钥
		scope: 'app',		  // 范围
		loadingDate: {},

		/**
		 * 空函数
		 */
		emptyFunction: function (){},

		/**
		 * 获取缓存的token
		 * @returns {any}
		 */
		getToken: function () {
			var t = layui.data(this.tableName).token;
			if (t) {
				return JSON.parse(t);
			}
		},

		/**
		 * 清除user
		 */
		removeToken: function () {
			layui.data(this.tableName, {
				key: 'token',
				remove: true
			});
		},

		/**
		 * 缓存token
		 * @param token
		 */
		saveToken: function (token) {
			layui.data(this.tableName, {
				key: 'token',
				value: JSON.stringify(token)
			});
		},

		/**
		 * 当前登录的用户
		 * @returns {any}
		 */
		getUser: function () {
			var u = layui.data(this.tableName).login_user;
			if (u) {
				return JSON.parse(u);
			}
		},

		/**
		 * 缓存user
		 * @param user
		 */
		saveUser: function (user) {
			layui.data(this.tableName, {
				key: 'login_user',
				value: JSON.stringify(user)
			});
		},

		/**
		 * 获取数据
		 * @param key
		 */
		getData: function (key) {
			var v = layui.data(this.tableName)[key];
			if (v) {
				return JSON.parse(v);
			}
		},

		/**
		 * 保存数据
		 * @param key
		 * @param value
		 */
		saveData: function (key, value) {
			layui.data(this.tableName, {
				key: key,
				value: JSON.stringify(value)
			});
		},

		/**
		 * 跳转页面
		 * @param url
		 */
		jumpPage: function(url) {
			if (null == this.getToken()) {
				this.error('权限不足');
				return
			}
			window.location.href = url;
		},

		/**
		 * 跳回到登录页面
		 */
		jumpToLogin: function () {
			function getTop(window) {
				if (window == window.parent) {
					return window;
				} else {
					return getTop(window.parent)
				}
			}
			setTimeout(getTop(window).location.replace(P_ENTRANCE));
		},

		/**
		 * 是否显示loading
		 * 最短显示时间 300ms
		 * @param flag 1:显示 0：不显示
		 * @param index 需要关闭的窗口的index
		 * @param dom 需要在哪个div上显示loading效果，不传默认遮罩整个页面
		 */
		loading: function(flag, index, dom) {
			var minDalay = 300; // 最短显示时间
			if (flag === 1) {
				var contentOffset = null;
				if (dom) {
					if (typeof dom == 'string') {
						dom = $(dom);
					}
					
					// 隐藏时候无需显示
					if (dom.is(':hidden')) {
						return;
					}
					
					contentOffset = dom.offset();
					contentOffset.width = dom.width();
					contentOffset.height = dom.height();
				}
				
				var index = layer.load(2, {
					shade: [0.1,'#fff'], //0.1透明度的白色背景
					success: function(layero, index) {
						if (contentOffset != null) {
							$('#layui-layer-shade'+index).css({
								position: 'absolute',
								top: contentOffset.top,
								left: contentOffset.left,
								width: contentOffset.width,
								height: contentOffset.height
							});
							layero.css({
								position: 'absolute',
								top: (contentOffset.top + contentOffset.height / 2 - 16) + 'px',
								left: (contentOffset.left + contentOffset.width / 2 - 16) + 'px',
								width: '32px',
								height: '32px'
							})
						}
					}
				});
				this.loadingDate[index] = new Date().getTime();
				return index
			} else {
				if (index == undefined) return;
				
				var now = new Date().getTime();
				var start = this.loadingDate[index];

				var delay = (start + minDalay) - now;
				if (delay < 0) delay = 0;
				setTimeout(function () {
					layer.close(index);
				}, delay)

				delete this.loadingDate[index];
			}
		},

		/**
		 * 显示Loading
		 * @returns {undefined}
		 */
		showLoading: function (dom) {
			return this.loading(1, null, dom);
		},

		/**
		 * 隐藏loading
		 * @param index
		 */
		hideLoading: function (index) {
			if (index == undefined) {
				layer.closeAll('loading');
			} else {
				this.loading(0, index);
			}
		},

		/**
		 * 警告
		 * @param msg
		 * @param callback
		 */
		alert: function(msg, callback) {
			layer.alert(msg, callback)
		},

		/**
		 * 询问框
		 * @param msg
		 * @param callback
		 */
		confirm: function(msg, yes, cancel) {
			layer.confirm(msg, yes, cancel);
		},

		/**
		 * 提示（普通）
		 * @param msg 提示信息
		 * @param callback 回调
		 * @returns {*}
		 */
		toast: function(msg, callback) {
			return layer.msg(msg, function () {
				if (typeof callback == "function") callback();
			});
		},

		/**
		 * 提示（成功）
		 * @param title 提示信息
		 * @param callback 回调
		 * @returns {*}
		 */
		success: function (msg, callback) {
			return layer.msg(msg, {icon: 1, shade: this.shade, scrollbar: false, time: 2000, shadeClose: true}, function () {
				if (typeof callback == "function") callback();
			});
		},

		/**
		 * 提示（错误）
		 * @param msg 提示信息
		 * @param callback 回调
		 * @returns {*}
		 */
		error: function(msg, callback) {
			return layer.msg(msg, {icon: 2, shade: this.shade, scrollbar: false, time: 3000, shadeClose: true}, function () {
				if (typeof callback == "function") callback();
			});
		},
		
		/**
		 * 请求
		 * @param param.url url
		 * @param param.data 参数
		 * @param param.type 请求类型，默认： post
		 * @param param.dataType 请求数据类型，默认： json
		 * @param param.success 回掉，请求成功后的回调该方法
		 * @param param.error 回掉，请求失败后的回调该方法
		 * @param param.loading 是否需要loading效果 默认true 需要
		 * @param param.loadingDom 是否需要loading效果的元素，不设置默认为遮罩全部
		 */
		ajax: function(param) {
			var url = param.url || '',
				data = param.data || {},
				type = param.type || 'post',
				dataType = param.dataType || 'json',
				success = param.success || this.emptyFunction,
				error = param.error || this.emptyFunction,
				loading = param.loading === false ? false : true;
				loadingDom = param.loadingDom || null;


			if (loading === undefined) loading = true;
			var loadingIndex = null;
			if (loading) loadingIndex = wbUtil.showLoading(loadingDom);

			return $.ajax({
				url: wbUtil.base_server + url,
				data: data,
				dataType: dataType,
				type: type,
				success: function (response) {
					if (loading) wbUtil.hideLoading(loadingIndex);

					success(response);
				},
				error: function (xhr) {
					if (loading) wbUtil.hideLoading(loadingIndex);

					if (xhr.status === 200) {
						// 200 说明后台没问题，这里是 因为系统中有很多不是正规的json格式的返回值，不能被JSON.parse解析，就会报错，这里用 eval 重新解析下
						var result = {
							success: false,
							msg: '未知错误'
						}
						if (xhr.responseText.indexOf('session timeout') > -1) {
							wbUtil.confirm('session 超时，是否重新登录？', function() {
								wbUtil.jumpToLogin();
							});
							return;
						} else {
							try {
								result = eval("(" + xhr.responseText + ')');
							} catch(e) {
								// 解析不出来
								result.msg == xhr.responseText;
							}
						}
						success(result);
					} else if (xhr.status === 400) {
						var responseText = JSON.parse(xhr.responseText) ;
						var error_msg = responseText.error_description || responseText.msg ;
						wbUtil.error(error_msg);

					} else if( xhr.status === 401) {
						var responseText = JSON.parse(xhr.responseText) ;
						var error_msg = responseText.error_description || responseText.msg ;
						wbUtil.error(error_msg);

					} else if( xhr.status === 500){
						wbUtil.error('服务器异常,请联系管理员');
					} else if( xhr.status === 0){
						wbUtil.error('网关异常,请联系管理员');
					}
					error(xhr);
				}
			})
		},

		/**
		 * post 请求
		 * @param url
		 * @param data
		 * @param success
		 */
		post: function (url, data, success) {
			this.ajax({
				url: url,
				data: data,
				type: 'post',
				success: success
			})
		},

		/**
		 * get 请求
		 * @param url
		 * @param data
		 * @param success
		 */
		get: function (url, data, success) {
			this.ajax({
				url: url,
				data: data,
				type: 'get',
				success: success
			})
		},
		
		/**
		 * 从url获取指定参数的值
		 * @param url
		 * @param key 参数名称
		 */
		getParamFromUrl: function(url, key) {
			if (url.indexOf('?') > -1) {
				var param = {};
				url.substring(url.indexOf('?')+1).split('&').forEach(function(item, index) {
					param[item.split('=')[0]] = item.split('=')[1];
				});
				return param[key] || '';
			} else {
				return '';
			}
		},
		
		/**
		 * 获取 LayoutMainMenuWindow
		 */
		getLayoutMainMenuWindow: function(_window) {
			if (_window == undefined) _window = window;
			if (_window.PAGE_INDEX == 'LAYOUT_MAIN_MENU') {
				return _window;
			} else if (_window.parent == _window) {
				return null;
			} else {
				return this.getLayoutMainMenuWindow(_window.parent);
			}
		},
		
		/**
		 * 初始化标题
		 */
		initTitle: function() {
			var layoutMainMenuWindow = this.getLayoutMainMenuWindow();
			if (layoutMainMenuWindow == null) return;
			
			function getMenu(data, _id) {
				var menu = null;
				$.each(data, function(index, item) {
					if (item.f_id == _id) {
						menu = item;
						return false;
					}
					if (item.f_children && item.f_children.length > 0) {
						menu = getMenu(item.f_children, _id);
						if (menu != null) return false;
					}
				});
				return menu;
			}
			
			function getId() {
				var id = '';
				var a = parent.document.getElementsByTagName("IFRAME");
				for(var i=0; i<a.length; i++) {
					if(a[i].contentWindow==window) {
						id = $(a[i]).attr('id');
					}
				} 
				return id;
			}
			
			var menu = getMenu(layoutMainMenuWindow.sideData, getId());
			
			if (menu) {
				$('.layui-content-header-title').show().html('<i class="' + menu.f_icon + '"></i>' + menu.f_title);
			} else {
				$('.layui-content-header-title').hide();
			}
		},
		
		/**
		 * 打开一个tab标签
		 */
		openTab: function(id, url, title) {
			var layoutMainMenuWindow = this.getLayoutMainMenuWindow();
			
			layoutMainMenuWindow.loadView(id, url, title);
		}
	};
	exports('wbUtil', wbUtil);
});
