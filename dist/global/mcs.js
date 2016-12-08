// 应用程序的启动文件, 整个系统唯一的全局变量, 此文件主要管理命名空间
var mcs = mcs || {};
(function () {
    'use strict';

    mcs.g = mcs.g || {};
    mcs.util = mcs.util || {};
    mcs.date = mcs.date || {};
    mcs.app = mcs.app || { name: "app", version: "1.0" };
    mcs.app.dict = mcs.app.dict || {};
    mcs.app.config = mcs.app.config || {};
    mcs.config = mcs.config || {};

    return mcs;
})();
(function () {
    'use strict';

    var fileTypes = { css: 'css', javascript: 'js' };
    var getFileName = function (fileType, filePath, isLocal) {
        var fileName = !isLocal ? mcs.app.config.mcsComponentBaseUrl.replace('http://', 'http:\\') : '';
        var extension = '';
        switch (fileType) {
            case fileTypes.css:
                extension += '.' + fileTypes.css;
                break;
            case fileTypes.javascript:
                extension += '.' + fileTypes.javascript;
                break;
        }
        if (!extension) return;

        if (filePath.substring(filePath.length - extension.length) != extension) {
            fileName += filePath + extension;
        } else {
            fileName += filePath;
        }
        fileName = fileName.replace(new RegExp('\/\/', 'gm'), '/').replace('http:\\', 'http://');
        return fileName;
    };

    var handleParam = function (fileType, params) {
        if (!params.length) return;

        var assets = { files: [], localFiles: [], container: '' };

        if (params.length == 1) {
            if (params[0] instanceof Object && params[0].constructor == Object) {
                assets = params;
            } else if (params[0] instanceof Array && params[0].constructor == Array) {
                assets.files = params[0];
            } else if (typeof params[0] == 'string') {
                assets.files = [params[0]];
            }
        } else {
            if (params[0] instanceof Array && params[0].constructor == Array) {
                assets.files = params[0];
            } else if (typeof params[0] == 'string') {
                assets.files = [params[0]];
            }
            if (params[1] instanceof Array && params[1].constructor == Array) {
                assets.localFiles = params[1];
            } else if (typeof params[1] == 'string') {
                assets.localFiles = [params[1]];
            }

            assets.container = document.getElementById(arguments[2]) || '';
        }

        if (fileType == fileTypes.css) {
            return assets[0] || {
                cssFiles: assets.files,
                localCssFiles: assets.localFiles,
                container: assets.container
            };
        } else {
            return assets[0] || {
                jsFiles: assets.files,
                localJsFiles: assets.localFiles,
                container: assets.container
            };
        }
    };

    /*
     * 动态加载CSS文件列表，可指定页面上的任意位置
     * cssFiles: 来自远程服务器的CSS文件列表(如：/libs/demo.css,lib/demo,lib/demo.css)
     * localCssFiles: 来自本地服务器的CSS文件列表(如：/local/demo.css, local/demo)
     * container: 可不指定将附加到head中，否则将附加到指定的标签位置
    */
    mcs.g.loadCss = function (/*{cssFiles:[],localCssFiles:[],container:'#containerId'}*/) {
        var assets = handleParam(fileTypes.css, arguments);
        var mergeFiles = [
            { isLocal: false, data: assets.cssFiles || []},
            { isLocal: true, data: assets.localCssFiles || []}
        ];

        for (var i = 0, iLen = mergeFiles.length; i < iLen; i++) {
            var file = mergeFiles[i];
            for (var j = 0, jLen = file.data.length; j < jLen; j++) {
                var cssFile = file.data[j];
                var length = cssFile.length;
                if (!length) continue;
                var fileName = getFileName(fileTypes.css, cssFile, file.isLocal);
                var cssElem = document.createElement('link');
                cssElem.setAttribute('rel', 'stylesheet');
                cssElem.setAttribute('href', fileName);

                var container = assets.container || document.getElementsByTagName("head")[0];
                container.appendChild(cssElem);
            }
        }
    };

    /*
    * 动态加载Js文件列表，可指定页面上的任意位置
    * jsFiles: 来自远程服务器的JS文件列表(如：/libs/demo.js,lib/demo,lib/demo.js)
    * localJsFiles: 来自本地服务器的JS文件列表(如：/local/demo.css, local/demo)
    * container: 可不指定将附加到head中，否则将附加到指定的标签位置
   */
    mcs.g.loadJs = function (/*{jsFiles:[],localJsFiles:[],container:'#containerId'}*/) {
        var assets = handleParam(fileTypes.javascript, arguments);
        var mergeFiles = [
            { isLocal: false, data: assets.jsFiles || []},
            { isLocal: true, data: assets.localJsFiles || []}
        ];

        for (var i = 0, iLen = mergeFiles.length; i < iLen; i++) {
            var file = mergeFiles[i];
            for (var j = 0, jLen = file.data.length; j < jLen; j++) {
                var jsFile = file.data[j];
                var length = jsFile.length;
                if (!length) continue;
                var fileName = getFileName(fileTypes.javascript, jsFile, file.isLocal);
                var jsElem = document.createElement('script');
                jsElem.setAttribute('src', fileName);

                var container = assets.container || document.getElementsByTagName("head")[0];
                container.appendChild(jsElem);
            }
        }
    };

    /*
    * 对requirejs单独做处理
    * requireFile: 来自远程或本地服务器的RequireJS文件地址(如：libs/require)
    * requireConfig: 来自本地服务器的RequireJS配置文件地址(如：./app/config/require.config),
    * isLocal: 是否来自本地服务器(默认为false)
   */
    mcs.g.loadRequireJs = function (requireFile, requireConfig, isLocal) {
        if (!requireFile || !requireConfig) return;
        var fileType = fileTypes.javascript;
        var fileName = getFileName(fileType, requireFile, isLocal);
        var extension = '.' + fileType;
        if (requireConfig.substring(requireConfig.length - extension.length) != extension) {
            requireConfig += extension;
        }
        var jsElem = document.createElement('script');
        jsElem.setAttribute('src', fileName);
        jsElem.setAttribute('data-main', requireConfig);

        document.getElementsByTagName("head")[0].appendChild(jsElem);
    }

    return mcs.g;

})();
(function() {
    'use strict';

    /*
     * 两个对象判等
     */
    mcs.util.isObjectsEqual = function(a, b) {
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        if (aProps.length != bProps.length) {
            return false;
        }
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if (a[propName] !== b[propName]) {
                return false;
            }
        }
        return true;
    };



    mcs.util.postMockForm = function(URL, PARAMS) {
        var temp_form = document.createElement("form");
        temp_form.action = URL;
        temp_form.target = "_blank";
        temp_form.method = "post";
        temp_form.style.display = "none";
        var opt = document.createElement("textarea");
        opt.name = 'form';
        opt.value = JSON.stringify(PARAMS);
        temp_form.appendChild(opt);


        document.body.appendChild(temp_form);
        temp_form.submit();

        document.body.removeChild(temp_form);
    }

    /*
     * 删除数组中指定元素
     */
    mcs.util.removeByValue = function(_array, val) {
        for (var i = 0; i < _array.length; i++) {
            if (this[i] == val) {
                _array.splice(i, 1);
                break;
            }
        }
    };

    /*
     * 删除对象集合中具有指定特征的对象    
     */

    mcs.util.removeByObjectWithKeys = function(_array, obj) {
        var props = Object.getOwnPropertyNames(obj);
        var propsAmount = props.length;

        for (var i = _array.length - 1; i >= 0; i--) {
            var counter = 0;

            for (var j = 0; j < propsAmount; j++) {
                if (_array[i].hasOwnProperty(props[j]) && _array[i][props[j]] == obj[props[j]]) {
                    counter = counter + 1;
                }
            }



            if (counter == propsAmount) {
                _array.splice(i, 1);
            }

        }
    }


    /*
     * 删除对象集合中具有指定特征的对象集
     */
    mcs.util.removeByObjectsWithKeys = function(_array, targetArray) {
        for (var i = targetArray.length - 1; i >= 0; i--) {
            mcs.util.removeByObjectWithKeys(_array, targetArray[i]);
        }
    }


    /**
     * 从对象集合中删除指定对象
     *
     */
    mcs.util.removeByObject = function(_array, obj) {
        for (var i = 0; i < _array.length; i++) {
            if (mcs.util.isObjectsEqual(_array[i], obj)) {
                _array.splice(i, 1);
                break;
            }
        }
    };

    /*
     * JS 产生一个新的GUID随机数
     */
    mcs.util.newGuid = function() {
        var guid = "";
        for (var i = 1; i <= 32; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16);
            guid += n;
            if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
                guid += "-";
        }
        return guid;
    };

    /*
     * 格式化字符串
     */
    mcs.util.format = function(str, args) {
        var result = str;
        if (arguments.length > 0) {
            if (arguments.length == 2 && typeof(args) == "object") {
                for (var key in args) {
                    if (args[key] != undefined) {
                        var reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, args[key]);
                    }
                }
            } else {
                for (var i = 1; i < arguments.length; i++) {
                    if (arguments[i] != undefined) {
                        //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题
                        var reg = new RegExp("({)" + (i - 1) + "(})", "g");
                        result = result.replace(reg, arguments[i]);
                    }
                }
            }
        }
        return result;
    };

    /*
     * 判断是否为字符串
     */
    mcs.util.isString = function(value) {
        return typeof value === 'string';
    };

    /*
     * 判断是否为数组
     */
    mcs.util.isArray = function(value) {
        return value instanceof Array && value.constructor == Array;
    };

    /*
     * 判断是否为对象
     */
    mcs.util.isObject = function(value) {
        return value instanceof Object && value.constructor == Object;
    };

    /*
     * 字典对象合并
     */
    mcs.util.merge = function(dictionary) {
        for (var item in dictionary) {
            var prop = item;
            item = item.toLowerCase().indexOf('c_code_abbr_') == 0 ? item : 'c_codE_ABBR_' + item;
            mcs.app.dict[item] = dictionary[prop];
        }
    };

    /*
     * 对象列表映射成字典
     * data 对象数组, kvp 键值对{key,value},category 所属类别
     */
    mcs.util.mapping = function(data, kvp, category) {
        if (!data || !kvp.key || !kvp.value) return;
        var getItems = function() {
            var items = [];
            for (var i in data) {
                var item = {
                    key: data[i][kvp.key],
                    value: data[i][kvp.value]
                };
                if (kvp.props) {
                    var props = mcs.util.toArray(kvp.props);
                    for (var j in props) {
                        var prop = props[j];
                        item[prop] = data[i][prop];
                    }
                }
                items.push(item);
            }
            return items;
        };
        if (category == undefined) {
            return getItems();
        } else {
            category = category.indexOf('c_codE_ABBR_') == 0 ? category : 'c_codE_ABBR_' + category;
            var result = {};
            result[category] = getItems();
            return result;
        }
    };

    /*
     * 限制文本框只能输入整数
     */
    mcs.util.limit = function(input) {
        if (input instanceof jQuery) {
            input = input[0];
        }
        if (input.value.length == 1) {
            input.value = input.value.replace(/[^1-9]/g, '');
        } else {
            input.value = input.value.replace(/\D/g, '');
        }
    };

    /*
     * 检测只能输入小数
     */
    mcs.util.number = function(input) {
        if (input instanceof jQuery) {
            input = input[0];
        }

        if (input.value != '') {
            input.value = input.value.replace(/[^\d.]/g, ''); //清除“数字”和“.”以外的字符
            input.value = input.value.replace(/^\./g, ''); //验证第一个字符是数字而不是.
            input.value = input.value.replace(/^0{2,}\./g, '0.'); //只保留小数点前第一个0. 清除多余的0
            input.value = input.value.replace(/\.{2,}/g, '.'); //只保留第一个. 清除多余的.
            input.value = input.value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
        }
    };

    /*
     * 从指定的数组集合中找到字符串或数组子集合中是否存在
     */
    mcs.util.contains = function(data, elems, separator) {
        if (!data || !elems) return false;
        var array = mcs.util.toArray(elems, separator);
        for (var i in array) {
            if (jQuery.inArray(array[i], data) > -1) {
                return true;
            }
        }

        return false;
    };

    /*
     * 判断对象数组中是否包含指定属性的对象
     */
    mcs.util.containsObject = function(data, elem, prop) {
        if (!data || !data.length || !elem || !elem[prop]) return false;
        for (var index in data) {
            if (data[index][prop] == elem[prop]) {
                return true;
            }
        }
        return false;
    };

    /*
     * 判断对象数组中是否包含指定属性的对象
     */
    mcs.util.containsElement = function(data, elem) {
        return mcs.util.toArray(data).indexOf(elem) > -1;
    };

    /*
     * 将指定元素转化为数组
     */
    mcs.util.toArray = function(data, separator) {
        var result = [];
        if (typeof data == 'string') {
            separator = separator || ',';
            var array = data.split(separator);
            if (array.length > 1) {
                result = array;
            } else {
                result.push(data);
            }
        }
        if (data instanceof Array) {
            result = data;
        }
        return result;
    };

    /*
     * 判断元素是否存在属性
     */
    mcs.util.hasAttr = function(elem, attrName) {
        return typeof elem.attr(attrName) != 'undefined';
    };

    /*
     * 判断元素是否存在属性
     */
    mcs.util.hasAttrs = function(elem, attrNames) {
        var attrs = mcs.util.toArray(attrNames);
        for (var index in attrs) {
            if (mcs.util.hasAttr(elem, attrs[index])) {
                return true;
            }
        }
        return false;
    };

    /*
     * 将字符串转化为bool类型, isIgnoreZero为解决单选框存在有0的选项
     */
    mcs.util.bool = function(str, isIgnoreZero) {
        isIgnoreZero = isIgnoreZero || false;
        if (typeof str === 'boolean') return str;
        str += '';
        if (isIgnoreZero && str == '0') return true;
        if (!str || !str.length) return false;
        str = str.toLowerCase();
        if (str === 'false' || str === '0' || str === 'undefined' || str === 'null') return false;
        return true;
    };

    /*
     * 对象复制
     */
    mcs.util.clone = function(obj) {
        if (typeof(obj) != 'object') return obj;
        if (obj == null) return obj;
        var newObject = new Object();
        for (var i in obj)
            newObject[i] = mcs.util.clone(obj[i]);
        return newObject;
    };

    /*
     * 从对象数组中查找某属性值对应的索引
     */
    mcs.util.indexOf = function(data, key, value) {
        if (!data || !data.length) return -1;
        for (var index in data) {
            if (!data[index][key]) return -1;
            if (data[index][key] == value) {
                return index;
            }
        }
        return -1;
    };

    /*
     * 从指定的数组集合中找到字符串或数组子集合中是否存在
     */
    mcs.util.contains = function(data, elems, separator) {
        if (!data || !elems) return false;
        var array = mcs.util.toArray(elems, separator);
        for (var j in array) {
            if (jQuery.inArray(array[j], data)) {
                return true;
            }
        }
        return false;
    };

    /*
     * 将指定元素转化为数组
     */
    mcs.util.toArray = function(data, separator) {
        var result = [];
        if (typeof data == 'string') {
            separator = separator || ',';
            var array = data.split(separator);
            if (array.length > 1) {
                result = array;
            } else {
                result.push(data);
            }
        }
        if (data instanceof Array) {
            result = data;
        }
        return result;
    };

    /*
     * 全部选中
     */
    mcs.util.selectAll = function(data) {
        var selectedResult = [];
        angular.forEach(data, function(item) {
            selectedResult.push(item.key);
        });
        return selectedResult;
    };

    /*
     * 全部不选中
     */
    mcs.util.unSelectAll = function() {
        return [];
    };

    /*
     * 反选
     */
    mcs.util.inverseSelect = function(data, selectedResult) {
        var temp = selectedResult;
        selectedResult = [];
        angular.forEach(data, function(item) {
            if (temp.indexOf(item.key) == -1) {
                selectedResult.push(item.key);
            }
        });
        return selectedResult;
    };

    /*
     * 构建级联数据源
     * data 原数据源{key,value,parentkey},
     * result 构建后的新数据源{key:{value,children:[]}}
     */
    mcs.util.buildCascadeDataSource = function(data, result) {
        for (var index in data) {
            var source = data[index];
            if (source.parentKey == 0) {
                var parent = result[source.key];
                if (!parent) {
                    result[source.key] = {
                        value: source.value,
                        children: []
                    };
                } else {
                    parent.value = source.value;
                }
            } else {
                var parent = result[source.parentKey];
                if (!parent) {
                    result[source.parentKey] = {
                        value: '',
                        children: [source]
                    };
                } else {
                    result[source.parentKey].children.push(source);
                }
            }
        }
    };

    /*
     * 设置当前的操作项(checkbox)
     */
    mcs.util.setSelectedItems = function(selected, item, event) {
        var index = selected.indexOf(item.key);
        if (event.target.checked) {
            if (index === -1) {
                selected.push(item.key);
            }
        } else {
            if (index !== -1) {
                selected.splice(index, 1);
            }
        }
    };

    /*
     * 设置默认选中
     */
    mcs.util.setDefaultSelected = function(items, key) {
        if (!items || !items.length) return;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            item.checked = item.key == key;
        }
    };

    /*
     * 获取字典项的值
     */
    mcs.util.getDictionaryItemValue = function(items, key) {
        if (key == undefined) return '';
        if (!items || !items.length) return key;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (item.key == key) {
                return item.value;
            }
        }
        return key;
    };

    mcs.util.loadDependencies = function(dependencies) {
        return {
            resolver: ['$q', '$rootScope', function($q, $rootScope) {
                var defered = $q.defer();

                require(dependencies, function() {
                    $rootScope.$apply(function() {
                        defered.resolve();
                    });
                });

                return defered.promise;
            }]
        };
    };

    /*
     * 配置面包屑
     */
    mcs.util.configBreadcrumb = function($breadcrumbProvider, templateUrl) {
        $breadcrumbProvider.setOptions({
            templateUrl: templateUrl
        });
    };

    /*
     * 获取URL中的Querystring参数
     */
    mcs.util.params = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };

    /*
     * 加载单独路由
     * $stateProvider, 路由提供者服务
     * route, 当前需要加载的路由
     */
    mcs.util.loadRoute = function($stateProvider, route) {
        var parentState = null,
            breadcrumb = route.breadcrumb;
        if (breadcrumb) {
            parentState = breadcrumb;
            if (!route.abstract && !breadcrumb.parent) {
                parentState.parent = function($lastViewScope) {
                    return $lastViewScope.$state.params.prev;
                }
            }
        }

        $stateProvider.state(route.name, {
            url: route.url,
            abstract: route.abstract || false,
            templateUrl: route.templateUrl,
            controller: route.controller,
            controllerAs: route.controllerAs || 'vm',
            ncyBreadcrumb: parentState,
            resolve: mcs.util.loadDependencies(route.dependencies)
        });
        return mcs.util;
    };

    /*
     * 加载默认的路由
     * $stateProvider, 路由提供者服务
     * $urlRouterProvider, URL路由提供者服务
     * defaultRoute, 默认路由(配置首次导航的页面或路由无法找到时进入的页面,包含url,templateUrl,controller,dependencies)
     */
    mcs.util.loadDefaultRoute = function($stateProvider, $urlRouterProvider, defaultRoute) {
        if (!defaultRoute || !defaultRoute.name || !defaultRoute.url || !defaultRoute.templateUrl) {
            console.log('no default route settings or default route has no correct configuration, including name, url and templateUrl.');
            return;
        };
        // 加载默认路由
        var defaultRedirectUrl = !defaultRoute.layout ? defaultRoute.url : defaultRoute.layout.url + defaultRoute.url;
        $urlRouterProvider.otherwise(defaultRedirectUrl);
        // 如果设置布局页则首先加载布局页
        if (defaultRoute.layout) {
            if (!defaultRoute.layout.name || !defaultRoute.layout.url || !defaultRoute.layout.templateUrl) {
                console.log('default route layout has no correct configuration, including name, url and templateUrl.');
                return;
            };
            $stateProvider.state(defaultRoute.layout.name, {
                abstract: true,
                url: defaultRoute.layout.url,
                templateUrl: defaultRoute.layout.templateUrl
            });
        }

        $stateProvider.state(defaultRoute.name, {
            url: defaultRoute.url,
            templateUrl: defaultRoute.templateUrl,
            controller: defaultRoute.controller,
            controllerAs: defaultRoute.controllerAs || 'vm',
            ncyBreadcrumb: defaultRoute.breadcrumb,
            resolve: mcs.util.loadDependencies(defaultRoute.dependencies)
        });
        /*
        var routeConfigPaths = mcs.app.config.routeConfigPaths;
        $.each(routeConfigPaths, function (index) {
            require([routeConfigPaths[index]], function (states) {
                if (states != undefined) {
                    $.each(states, function (route, state) {
                        $stateProvider.state(route, {
                            url: state.url,
                            templateUrl: state.templateUrl,
                            controller: state.controller,
                            controllerAs: 'vm',
                            resolve: mcs.util.loadDependencies(state.dependencies)
                        });
                    });
                }
            });
        });*/
    };

    /**
     * 配置模块的Provider, 可配置全局模块, 也可以单独配置
     */
    mcs.util.configProvider = function(ngModule, $controllerProvider, $compileProvider, $filterProvider, $provide) {
        if (!ngModule || !angular.isDefined(ngModule)) return;

        ngModule.registerController = $controllerProvider.register;
        ngModule.registerDirective = $compileProvider.directive;
        ngModule.registerFilter = $filterProvider.register;
        ngModule.registerFactory = $provide.factory;
        ngModule.registerService = $provide.service;
        ngModule.registerConstant = $provide.constant;
        ngModule.registerValue = $provide.value;
    };

    /**
     * 配置应用的拦截器以及设置白名单
     */
    mcs.util.configInterceptor = function($httpProvider, $sceDelegateProvider, interceptors) {
        $httpProvider.defaults.transformResponse.unshift(function(data, headers) {
            if (mcs.util.isString(data)) {
                var JSON_PROTECTION_PREFIX = /^\)\]\}',?\n/;
                var APPLICATION_JSON = 'application/json';
                var JSON_START = /^\[|^\{(?!\{)/;
                var JSON_ENDS = {
                    '[': /]$/,
                    '{': /}$/
                };
                // Strip json vulnerability protection prefix and trim whitespace
                var tempData = data.replace(JSON_PROTECTION_PREFIX, '').trim();

                if (tempData) {
                    var contentType = headers('Content-Type');
                    var jsonStart = tempData.match(JSON_START);
                    if ((contentType && (contentType.indexOf(APPLICATION_JSON) === 0)) || jsonStart && JSON_ENDS[jsonStart[0]].test(tempData)) {
                        data = (new Function("", "return " + tempData))();
                    }
                }
            }

            return data;
        });

        if (interceptors) {
            for (var interceptor in interceptors) {
                $httpProvider.interceptors.push(interceptors[interceptor]);
            }
        }

        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            //'http://10.1.56.80/mcsweb**'
            mcs.app.config.mcsComponentBaseUrl + '**'
        ]);
    };

    return mcs.util;
})();

(function () { 
    /** * 获取本周、本季度、本月、上月的开端日期、停止日期 */
    //当前日期 
    var now = new Date();
    //今天本周的第几天 
    var nowDayOfWeek = now.getDay();
    //当前日 
    var nowDay = now.getDate();
    //当前月
    var nowMonth = now.getMonth();
    //当前年
    var nowYear = now.getYear();
    nowYear += (nowYear < 2000) ? 1900 : 0;
    //上月日期
    var lastMonthDate = new Date();
    lastMonthDate.setDate(1);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    //上年
    var lastYear = lastMonthDate.getYear();
    var lastMonth = lastMonthDate.getMonth();
    //格局化日期：yyyy-MM-dd 
    mcs.date.format = function(date) {
        var myyear = date.getFullYear();
        var mymonth = date.getMonth() + 1;
        var myweekday = date.getDate();
        if (mymonth < 10) {
            mymonth = "0" + mymonth;
        } if (myweekday < 10) {
            myweekday = "0" + myweekday;
        }
        return (myyear + "-" + mymonth + "-" + myweekday);
    }
    //比较两个时间的大小
    mcs.date.compare = function (beginTime, endTime) {
        //将字符串转换为日期
        var begin = new Date(beginTime.replace(/-/g, "/"));
        var end = new Date(endTime.replace(/-/g, "/"));
        return begin <= end;
    };
    //获得某月的天数 
    mcs.date.getMonthDays = function(month) {
        var monthStartDate = new Date(nowYear, month, 1);
        var monthEndDate = new Date(nowYear, month + 1, 1);
        var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
        return days;
    }
    //获得本季度的开端月份 
    mcs.date.getQuarterStartMonth = function() {
        var quarterStartMonth = 0;
        if (nowMonth < 3) {
            quarterStartMonth = 0;
        } if (2 < nowMonth && nowMonth < 6) {
            quarterStartMonth = 3;
        } if (5 < nowMonth && nowMonth < 9) {
            quarterStartMonth = 6;
        } if (nowMonth > 8) {
            quarterStartMonth = 9;
        }
        return quarterStartMonth;
    }
    // 获取今天
    mcs.date.today = function () {
        var todayDate = new Date(nowYear, nowMonth, nowDay);
        return todayDate;
    };
    //获得本周的开始日期 
    mcs.date.getWeekStartDate = function() {
        var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
        return mcs.date.format(weekStartDate);
    }
    //获得本周的停止日期 
    mcs.date.getWeekEndDate = function() {
        var weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
        return mcs.date.format(weekEndDate);
    }
    //获得本月的开始日期 
    mcs.date.getMonthStartDate = function() {
        var monthStartDate = new Date(nowYear, nowMonth, 1);
        return mcs.date.format(monthStartDate);
    }
    //获得本月的停止日期 
    mcs.date.getMonthEndDate = function() {
        var monthEndDate = new Date(nowYear, nowMonth, getMonthDays(nowMonth));
        return mcs.date.format(monthEndDate);
    }
    //获得上月开始日期 
    mcs.date.getLastMonthStartDate = function() {
        var lastMonthStartDate = new Date(nowYear, lastMonth, 1);
        return mcs.date.format(lastMonthStartDate);
    }
    //获得上月停止日期 
    mcs.date.getLastMonthEndDate = function() {
        var lastMonthEndDate = new Date(nowYear, lastMonth, getMonthDays(lastMonth));
        return mcs.date.format(lastMonthEndDate);
    }
    //获得本季度的开始日期 
    mcs.date.getQuarterStartDate = function() {
        var quarterStartDate = new Date(nowYear, getQuarterStartMonth(), 1);
        return mcs.date.format(quarterStartDate);
    }
    //获得本季度的停止日期 
    mcs.date.getQuarterEndDate = function() {
        var quarterEndMonth = getQuarterStartMonth() + 2;
        var quarterStartDate = new Date(nowYear, quarterEndMonth, getMonthDays(quarterEndMonth));
        return mcs.date.format(quarterStartDate);
    }

    return mcs.date;
})();
mcs.browser = function () {
    var _browser = {};
    var sUserAgent = navigator.userAgent;
    console.info("useragent: ", sUserAgent);

    var isOpera = sUserAgent.indexOf("Opera") > -1;
    if (isOpera) {
        //首先检测Opera是否进行了伪装
        if (navigator.appName == 'Opera') {
            //如果没有进行伪装，则直接后去版本号
            _browser.version = parseFloat(navigator.appVersion);
        } else {
            var reOperaVersion = new RegExp("Opera (\\d+.\\d+)");
            //使用正则表达式的test方法测试并将版本号保存在RegExp.$1中
            reOperaVersion.test(sUserAgent);
            _browser.version = parseFloat(RegExp['$1']);
        }
        _browser.opera = true;
    }

    var isChrome = sUserAgent.indexOf("Chrome") > -1;
    if (isChrome) {
        if (sUserAgent.indexOf("Edge") > -1) {
            var reEdge = new RegExp("Edge/(\\d+\\.\\d+)");
            reEdge.test(sUserAgent);
            _browser.version = parseFloat(RegExp['$1']);
            _browser.edge = true;
        } else {
            var reChorme = new RegExp("Chrome/(\\d+\\.\\d+(?:\\.\\d+\\.\\d+))?");
            reChorme.test(sUserAgent);
            _browser.version = parseFloat(RegExp['$1']);
            _browser.chrome = true;
        }
    }

    //排除Chrome信息，因为在Chrome的user-agent字符串中会出现Konqueror/Safari的关键字
    var isKHTML = (sUserAgent.indexOf("KHTML") > -1
            || sUserAgent.indexOf("Konqueror") > -1 || sUserAgent
            .indexOf("AppleWebKit") > -1)
            && !isChrome;

    if (isKHTML) {//判断是否基于KHTML，如果时的话在继续判断属于何种KHTML浏览器
        var isSafari = sUserAgent.indexOf("AppleWebKit") > -1;
        var isKonq = sUserAgent.indexOf("Konqueror") > -1;

        if (isSafari) {
            var reAppleWebKit = new RegExp("Version/(\\d+(?:\\.\\d*)?)");
            reAppleWebKit.test(sUserAgent);
            var fAppleWebKitVersion = parseFloat(RegExp["$1"]);
            _browser.version = parseFloat(RegExp['$1']);
            _browser.safari = true;
        } else if (isKonq) {
            var reKong = new RegExp(
                   "Konqueror/(\\d+(?:\\.\\d+(?\\.\\d)?)?)");
            reKong.test(sUserAgent);
            _browser.version = parseFloat(RegExp['$1']);
            _browser.konqueror = true;
        }
    }

    // !isOpera 避免是由Opera伪装成的IE  
    var isIE = sUserAgent.indexOf("compatible") > -1
           && sUserAgent.indexOf("MSIE") > -1 && !isOpera;
    if (isIE || _browser.edge) { //将edge当做ie作为处理，但也可以单独判断为edge
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(sUserAgent);
        _browser.version = parseFloat(RegExp['$1']);
        _browser.msie = true;
    }

    // 排除Chrome 及 Konqueror/Safari 的伪装
    var isMoz = sUserAgent.indexOf("Gecko") > -1 && !isChrome && !isKHTML;
    if (isMoz) {
        var reMoz = new RegExp("rv:(\\d+\\.\\d+(?:\\.\\d+)?)");
        reMoz.test(sUserAgent);
        _browser.version = parseFloat(RegExp['$1']);
        if (_browser.version == 11) {
            _browser.msie = true; //fix the IE11
        }
        _browser.mozilla = true;
    }

    return {
        s: _browser
    };
}();


// 调用
//var browser = mcs.browser.s;
//console.info("broswer.version: ", browser.version);
//console.info("broswer.msie is ", browser.msie);
//console.info("broswer.msie is ", browser.edge);
//console.info("broswer.safari is ", browser.safari);
//console.info("broswer.opera is ", browser.opera);
//console.info("broswer.mozilla is ", browser.mozilla);
//console.info("broswer.chrome is ", browser.chrome);
//console.info("broswer.konqueror is ", browser.konqueror);