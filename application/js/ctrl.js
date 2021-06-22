var page_list = 1, page_comments = 1, list_top = 0, ref_page = 'list', last_page = 'list';
var cachepage = 'list';
var isloading = 0;
var info = {
	appname: 'IT之家kaios客户端',
	version: '0.0.0.2',
	summary: '“IT之家”是业内领先的IT资讯和数码产品类网站。IT之家快速精选泛科技新闻，分享即时的IT业界动态和紧跟潮流的数码产品资讯，提供给力的PC和手机技术文章、丰富的系统应用美化资源，以及享不尽的智能阅读。',
	thanks: '感谢为kaios开发付出的每一个人！',
	website: 'www.ithome.com'
};

function setCookie(value, name) {
	if (value === null) {
		value = "";
	}
	localStorage.setItem(name, value);
}

function getCookie(name) {
	return localStorage.getItem(name);
}

var CMD = { //菜单执行的命令
	refersh: 1, //刷新
	about: 2, //关于
	comment: 3, //评论写 
	login: 5, //登录
	checkVersion: 6, //检查新版本
	logout: 7, //注销
	comments: 8 //查看评论
};
var menu_refersh = new MenuItem('刷新', CMD.refersh),
	menu_about = new MenuItem('关于', CMD.about),
	menu_login = new MenuItem('登录', CMD.login),
	menu_logout = new MenuItem('注销', CMD.logout),
	menu_checkVersion = new MenuItem('检查新版本', CMD.checkVersion),
	menu_comments = new MenuItem('查看评论', CMD.comments),
	menu_comment = new MenuItem('写评论', CMD.comment);

var menu = []; // 显示的菜单
var loginedlistmenu = [menu_refersh, menu_logout, menu_about, menu_checkVersion];//登录后的列表菜单
var unloginedlistmenu = [menu_refersh, menu_login, menu_about, menu_checkVersion];//未登录的列表菜单
var loginedarticlemenu = [menu_comment, menu_comments, menu_logout];//登录后的文章菜单
var unloginedarticlemenu = [menu_login, menu_comments];//未登录的文章菜单
var loginedcommentmenu = [menu_comment, menu_logout];//登录后的评论菜单
var unloginedcommentmenu = [menu_login];//未登录的评论菜单

//设置导航栏
function softkey(left, center, right) {
	$('#softkey-left').text(left);
	$('#softkey-center').text(center);
	$('#softkey-right').text(right);
}

function showPage(id) { //显示id和隐藏其它页面
	var pages = [
		'login_form',
		'about',
		'list',
		'article',
		'comments',
		'loading'
	];
	pages.myforEach(function (item) {

		if (id === 'loading') {
			getById(id).style.display = 'block';
			isloading = 1;
			return;
		};

		if (id === item) {
			last_page = id;
			ref_page = cachepage;
			getById(id).style.display = 'block';
			isloading = 0;
			if (id === 'list') {
				setTitle();
				softkey('选项', '查看', '退出');
				if (getCookie('userhash')) {
					menu = loginedlistmenu;
				}
				else {
					menu = unloginedlistmenu;
				}
			} else if (id === 'article') {
				window.scrollTo(0, 0);
				softkey('选项', '', '返回');
				if (getCookie('userhash')) {
					menu = loginedarticlemenu;
				}
				else {
					menu = unloginedarticlemenu;
				}
			} else if (id === 'comments') {
				softkey('选项', '下一页', '返回');
				if (getCookie('userhash')) {
					menu = loginedcommentmenu;
				}
				else {
					menu = unloginedcommentmenu;
				}
			}
		} else {
			getById(item).style.display = 'none';
		}
	});
	if (id != 'loading') {
		cachepage = id;//记录上一个page
	}
	if (id === 'list') {
		try {
			const currentIndex = lastnewsindex;
			const items = document.querySelectorAll('.item');
			const targetElement = items[currentIndex];
			targetElement.blur();
			targetElement.focus();
			targetElement.scrollIntoView(true);
		}
		catch (err) {

		}
	}
}
function setTitle(str) { //设置标题栏
	getById('topic').textContent = str || 'IT之家-新闻资讯';
}

lastnewsTime = '';

var tabIndex = 0;
function displayList(hash) { //显示文章列表 
	showPage('loading');//显示加载动画  
	if (hash === 0) {
		tabIndex = 0;
		lastnewsindex = 0;
	}
	ajax_get('http://api.ithome.com/json/listpage/news/' + hash, function (error, data) {
		if (error) {
			alert(error);
		} else {

			var articles = [];
			var currentIndex = document.activeElement.tabIndex - 1;
			if (currentIndex < 0) {
				currentIndex = 0;
			}
			if (data.toplist) {

				data.toplist.myforEach(function (item) {
					articles.push('<li class="item" tabIndex="' + tabIndex + '" data-showitem="' + escape(JSON.stringify(item)) + '"><a>' + '<img  src="' + item.image.replace('https://', 'http://') + '" alt="图片" />' + '<div><h3 style="color:red">[置顶]' + item.title + '</h3><p><span>' + humanedate(item.postdate) + '</span><span>评论(' + item.commentcount + ')</span></p></div></a></li>');
					tabIndex += 1;
				});
			}
			data.newslist.myforEach(function (item) {
				articles.push('<li class="item" tabIndex="' + tabIndex + '" data-showitem="' + escape(JSON.stringify(item)) + '"><a href="javascript:displayArticle(\'' + escape(JSON.stringify(item)) + '\')">' + '<img  src="' + item.image.replace('https://', 'http://') + '" alt="图片" />' + '<div><h3>' + item.title + '</h3><p><span>' + humanedate(item.postdate) + '</span><span>评论(' + item.commentcount + ')</span></p></div></a></li>');
				tabIndex += 1;
				lastnewsTime = item.orderdate;
			});
			if (hash != 0) { //提供了url说明是下一页
				getById('list').innerHTML += articles.join('');
			}
			else {
				getById('list').innerHTML = articles.join('');
			}
			//删掉next按钮
			var next_button = getById('next_button');
			if (next_button) { //原来有next按钮
				next_button.parentNode.removeChild(next_button);
			}
			if (data.newslist.length > 0) {
				getById('list').innerHTML += '<li id="next_button" class="item" tabIndex="' + tabIndex + '" data-showitem2="' + get_next(lastnewsTime) + '"><center><a>加载更多……</a></center></li>';
			}
			else {
				getById('list').innerHTML += '<div id="bottom">我们是有底线的</div>';
			}
			showPage('list');
			if (hash != 0) {
				document.body.scrollTop += 20;
			}
			else {
				if (document.activeElement.tabIndex == -1) {
					nav(1);
				}
				else {
					nav(0);
				}
			}
			if (next_button) { //原来有next按钮 
				const items = document.querySelectorAll('.item');
				var targetElement = items[currentIndex];
				targetElement.focus();
				targetElement.scrollIntoView(true);
			}
		}
	});
}
function displayArticle(item) { //显示文章正文
	showPage('loading');//显示加载动画
	item = JSON.parse(unescape(item))
	url = 'http://api.ithome.com/json/newscontent/' + item.newsid
	list_top = document.body.scrollTop;
	ajax_get(url, function (error, data) {
		if (error) {
			alert(error);
		} else {
			setTitle(item.title);
			getById('dateline').textContent = dateline(item.postdate);
			getById('author').textContent = data.newssource + '(' + data.newsauthor + ')';
			getById('comment_num').innerHTML = '<a href="javascript:displayComments(0)">评论(' + item.commentcount + ')</a>';
			getById('content').innerHTML = UBB(data.detail);
			getById('content').className = item.newsid;
			showPage('article');
		}
	});
}

lastCommentCi = ''

function displayComments(Ci) { //显示评论列表TODO 
	showPage('loading');//显示加载动画 
	url = 'http://cmt.ithome.com/api/comment/getnewscomment?sn=' + getCommentSn(getById('content').className);
	if (Ci != 0) {
		url = url + '&cid=' + Ci;
	}
	ajax_get(url, function (error, data) {
		if (error) {
			alert(error);
		} else {
			try {
				var comments = [];
				if (data.content.clist.length == 0) {
					alert("没有下一页了！");
					showPage('comments');
					return;
				}
				data.content.clist.myforEach(function (item) {
					item = item.M;
					comments.push('<li><img src="' + getHeadUrl(item.Ui) + '" alt="头像" onerror=\"onerror=null;src=\'img/avatar_default_rect.png\'\" />  <div><h3>' + item.N + ' (' + item.SF + ')</h3><p><span>' + dateline(item.T) + '</span><span>' + item.Ta + '</span></p><p>' + item.C + '</p></div></li>');
					lastCommentCi = item.Ci;
				});
				if (Ci != 0) { //提供了url说明是下一页
					getById('comments').innerHTML = comments.join('');
				} else {
					getById('comments').innerHTML = comments.join('');
				}
				//删掉next按钮
				var next_button_comments = getById('next_button_comments');
				if (next_button_comments) { //原来有next按钮
					next_button_comments.parentNode.removeChild(next_button_comments);
				}

				if (data.content.clist.length > 0) {
					getById('comments').innerHTML += '<li id="next_button_comments" data-showitem2="' + lastCommentCi + '"><center><a>加载更多……</a></center></li>';
				}
				else {
					getById('comments').innerHTML += '<div class="bottom">我们是有底线的</div>';
				}
				showPage('comments');
				window.scrollTo(0, 0);
				var next_button_comments = getById("next_button_comments");
				if (next_button_comments) {
					next_button_comments.blur();
				}
			}
			catch (err) {
				alert(err + "评论获取失败！");
				showPage('article');
			}
		}
	});
}

function compareVer(oldver, newver) {
	var a = oldver.split('.');
	var b = newver.split('.');

	for (var i = 0; i < a.length; i++) {
		if (parseInt(b[i]) > parseInt(a[i])) {
			return true;
		}
		else if (parseInt(b[i]) === parseInt(a[i])) {
			continue;
		}
		else if (parseInt(b[i]) < parseInt(a[i])) {
			return false;
		}
	}
	return false;
}

function checkUpdate() {
	showPage('loading');
	url = 'http://sss.wmm521.cn/kaios/ithome_ver.json?_=' + (new Date().getTime());

	ajax_get(url, function (error, data) {

		if (error) {
			alert(error);
		} else if (compareVer(info.version, data.version)) {
			alert('有新版本，版本号：' + data.version);
			window.open(data.downloadUrl);
		} else {
			alert('您的版本已经是最新版本。');
		}
		showPage("list");
	});
}
function selectMenu(id) { //选择了菜单项
	if (id === CMD.refersh) { //点击刷新 
		if (last_page === "list") {
			displayList(0);
		}
		else if (last_page === "article") {

		} else if (last_page === "comments") {

		}
	} else if (id === CMD.about) { //点击关于
		showPage('about');
		softkey('隐藏', '', '返回');
		window.scrollTo(0, 0);
	} else if (id === CMD.checkVersion) {
		checkUpdate();
	} else if (id === CMD.comment) { //发布评论
		var content = prompt('评论内容：');
		if (content) {
			showPage('loading');
			ajax_post2('http://cmt.ithome.com/api/comment/submit', getCommentParam(getById('content').className, content), function (error, data) {
				if (error) {
					alert(error);
					showPage(ref_page);
				} else {
					alert(data);
					displayComments('0');
				}
			});
		}
	} else if (id === CMD.login) { //选择登录
		showPage('login_form');
		getByName('login_email')[0].focus();
		softkey('提交', '登录', '返回');

	} else if (id === CMD.logout) {
		setCookie(null, 'userhash');
		setCookie(null, 'email');
		setCookie(null, 'password');
		setCookie(null, 'nickname');
		if (ref_page === "list") {
			menu = unloginedlistmenu;
		}
		else if (ref_page === "article") {
			menu = unloginedarticlemenu;
		} else if (ref_page === "comments") {
			menu = unloginedcommentmenu;
		}
		alert('注销成功！');
	} else if (id === CMD.comments) { //查看评论页面
		displayComments('0');
		window.scrollTo(0, 0);
	}
}

function dologin() {
	var email = getByName('login_email')[0].value, password = getByName('login_password')[0].value;
	if (!email || !password) {
		alert('请填写用户名和密码。');
		return false;
	}
	var userhash = getUserHash(email, password);
	var url = getUserDataUrl(userhash);
	showPage('loading');
	ajax_get(url, function (error, data) {
		if (error) {
			alert(error);
		} else {
			if (data.ok === 1) {
				alert("登陆成功");
				setCookie(userhash, 'userhash');
				setCookie(data.userinfo.username, 'email');
				setCookie(getMd5(password), 'password');
				setCookie(data.userinfo.nickname, 'nickname');
				if (ref_page === "list") {
					menu = loginedlistmenu;
				}
				else if (ref_page === "article") {
					menu = loginedarticlemenu;
				} else if (ref_page === "comments") {
					menu = loginedcommentmenu;
				}
				showPage(ref_page);
			}
			else {
				alert(data.msg);
				showPage(ref_page);
			}
		}
	});
}

function returnKey() {
	if (last_page === "login_form" || last_page === "about" || last_page === "article") {
		showPage("list");
	}
	else if (last_page === "comments") {
		showPage("article");
	}
}
function SoftRight() {
	if (isloading === 1) {
		isloading = 0; resetLRkey(); showPage(last_page);
	}
	if (isshowmenu === 1) {
		hideMenu();
		return;
	}
	if ($('#softkey-right').text() == "退出") {
		window.close();
	} else { //返回 
		returnKey();
	}
}

function setLastnewsindex() {
	lastnewsindex = document.activeElement.tabIndex;
	if (lastnewsindex < 0) {
		lastnewsindex = 0;
	}
}

function enter() {
	if (last_page === "about") {
		return;
	}
	if (last_page === "login_form") {
		dologin();
		return;
	}
	if (isshowmenu === 1) {
		const currentIndex = document.activeElement.tabIndex;
		const items = document.querySelectorAll('.menuitem');
		const targetElement = items[currentIndex];
		var cmd = parseInt($(targetElement).data("menucmd"));
		hideMenu();
		selectMenuItem(cmd);
		return;
	}
	if (last_page === "list") {
		setLastnewsindex();
		const currentIndex = document.activeElement.tabIndex;
		const items = document.querySelectorAll('.item');
		const targetElement = items[currentIndex];
		if ($(targetElement).data("showitem")) {
			displayArticle($(targetElement).data("showitem"));
		}
		else if ($(targetElement).data("showitem2")) {

			displayList($(targetElement).data("showitem2"));
		}

	}
	else if (last_page === "comments") {
		displayComments($("#next_button_comments").data("showitem2"))
	}
	else {
		return;
	}
}

var isshowmenu = 0;
var lastl = "";
var lastm = "";
var lastr = "";
var lastnewsindex = 0;
function showMenu() {
	isshowmenu = 1;
	setLastnewsindex();
	getById("menu").style.display = "block";
	lastl = $('#softkey-left').text();
	lastm = $('#softkey-center').text();
	lastr = $('#softkey-right').text();

	var str = "";

	for (var i = 0; i < menu.length; i++) {
		str += '<li class="menuitem" tabIndex="' + i + '" data-menucmd="' + menu[i].cmd + '">' + menu[i].name + '</li>';
	}
	getById("menucontainer").innerHTML = str;
	const items = document.querySelectorAll('.menuitem');
	items[0].focus();
	softkey("选择", "确认", "返回");
}
function hideMenu() {
	try {
		isshowmenu = 0;
		getById("menu").style.display = "none";
		softkey(lastl, lastm, lastr);
		const items = document.querySelectorAll('.item');
		items[lastnewsindex].focus();
		items[lastnewsindex].scrollIntoView(true);
	}
	catch (err) {

	}
}
function selectMenuItem(cmd) {
	try {
		isshowmenu = 0;
		selectMenu(cmd);
	}
	catch (err) {
		alert(err);
	}
}

function SoftLeft() {
	if (last_page === "about") {
		showPage("list");
		return;
	}
	if (last_page === "login_form") {
		dologin();
		return;
	}
	if (isshowmenu === 0) {
		showMenu()
	}
	else {
		const currentIndex = document.activeElement.tabIndex;
		const items = document.querySelectorAll('.menuitem');
		const targetElement = items[currentIndex];
		var cmd = parseInt($(targetElement).data("menucmd"));
		hideMenu();
		selectMenuItem(cmd);
	}
}

//设置导航键函数
var tab_location = 1;//设置header位置
function nav(move) {
	if (last_page === "login_form") {
		const activeElement = document.activeElement;
		if (activeElement && activeElement.tabIndex === 1) {
			document.querySelectorAll('#login_email')[0].focus();
		}
		else {
			document.querySelectorAll('#login_password')[0].focus();
		}
		return;
	}
	if (isshowmenu === 1) {
		const currentIndex = document.activeElement.tabIndex;
		var next = currentIndex + move;
		if (next < 0) {
			next = menu.length - 1;
		}
		else if (next >= menu.length) {
			next = 0;
		}
		const items = document.querySelectorAll('.menuitem');
		const targetElement = items[next];
		targetElement.focus();
	}
	else {
		const currentIndex = document.activeElement.tabIndex;
		var next = currentIndex + move;
		const items = document.querySelectorAll('.item');
		const targetElement = items[next];
		targetElement.focus();
		targetElement.scrollIntoView(true);
		if (next == 0) {
			$('.items').scrollTop(0);
		}
	}
}

function tab(move) {
	nav(move);
}

/*  D-Pad  */
//设置按键函数
function handleKeydown(e) {
	if (isloading === 1) {
		if (e.key === 'SoftRight') {
			SoftRight();
		}
		return;
	}
	if (e.key != "EndCall" && isshowmenu) {
		e.preventDefault();//清除默认行为（滚动屏幕等）  
	}
	if (e.key != "EndCall" && last_page == "list") {
		e.preventDefault();//清除默认行为（滚动屏幕等） 
	}
	switch (e.key) {
		case 'ArrowUp':
			nav(-1);
			break;
		case 'ArrowDown':
			nav(1);
			break;
		case 'ArrowRight':
			tab(1);
			break;
		case 'ArrowLeft':
			tab(-1);
			break;
		case 'Enter':
			enter();
			break;
		case 'Backspace':
			SoftRight()
			break;
		case 'Q':
		case 'SoftLeft':
			SoftLeft();
			break;
		case 'E':
		case 'SoftRight':
			SoftRight()
			break;
		case '#':
			alert('By: zixing!');
			break;
	}
}

//设置触发器
document.activeElement.addEventListener('keydown', handleKeydown);
softkey('选项', '查看', '退出');
window.onload = function () { //应用载入之后开始执行。
	getById('about').innerHTML = '<h3>' + info.appname + '</h3><p>版本：' + info.version + '</p><p>简介：' + info.summary + '</p><p>感谢：' + info.thanks + '</p><p>官方网站：' + info.website + '</p><p></p>';
	if (getCookie('userhash')) {
		menu = loginedlistmenu;
	} else {
		menu = unloginedlistmenu;
	}
	var timer = setTimeout(function () {
		document.body.removeChild(getById('welcome')); //关闭欢迎界面
		displayList(0);
		clearTimeout(timer);
	}, 1000);
};