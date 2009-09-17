// ==UserScript==
// @name xauto-streetfights-office-bankmission
// @namespace hk.orz
// @description by neo@orz.hk, Moochi, 真正john
// @include        http://apps.new.facebook.com/street-fights/job.php
// @include        http://apps.new.facebook.com/street-fights/bank.php
// @include        http://apps.new.facebook.com/office-wars/job.php
// @include        http://apps.new.facebook.com/office-wars/bank.php
// @include		   http://code.google.com/p/facebook-street-fights-bot/
// Version 2.1
// ==/UserScript==

/*
Requirement:
- Firefox 3.0.1 or better
- Firefox plugin: Greasemonkey
- Facebook w/ the new interface


Download / Update :
- Google code project page, http://code.google.com/p/facebook-street-fights-bot/
- Browse and download source, http://code.google.com/p/facebook-street-fights-bot/source/browse/#svn/trunk
- with SVN client, svn checkout http://facebook-street-fights-bot.googlecode.com/svn/trunk/ facebook-street-fights-bot-read-only

Install instruction:
- Install and load up Firefox
- Goto the plugin page and lookup greasemonkey. Install and restart firefox.
- Click to download the script. Click Install when greasemonkey manager load up.
- Load up 義氣仔女Online or 辦公室Online. If you see rubbish character in a new popup window on the right, your download is corrupted.

Change Job
1) 工具 -> Greasemonkey -> 管理腳本
2) Select "auto-streetfights-office-bankmission" and Click 編輯
2a) The first time you will be asked for an editor. Look up 筆記本 (notepad.exe) or a text editor that support UTF-8, and does not change your text when you are not looking. Microsoft Word is a big NO NO.
2aa) I use notepad++. Editplus is a NO because it does not support UTF-8. Anyway, notepad that come with Windows will do.
3) You should see this page again. Scroll down to the "Things you can change" section and change the IDs and the relative Requirement in those lines starts with "const".
4) If you see rubbish characters on line 4 near the word "john", instead of 2 chinese characters. Well, your script is corrupted during download.
4a) If your script is corrupted, download again using right click -> 另存新檔. Open the script with windows-come-with 筆記本 (notepad.exe) and copy and paste everything to (3) replacing everything.

Function:
義氣仔女Online
- check strength and gold once in a while. if you have the strength to do the default job, auto run it. If you have over $100 cash, auto throw them in the bank
辦公室Online
- check strength and gold every once in a while. if you meet the requirement, auto run the default job. If you have over $100 cash, auto throw them in the bank

Known problem: 
- may stop at "Try again" error message when the game is busy at night
- may stop at "facebook login" when your facebook login expired

What you should know about the game:
- You must meet ALL the requirement for a job to run.
- When you want to get cash from bank, disable greasemoney first, or your money will go back to the bank. There is a 10% cut off in 義氣仔女Online for that.
- In 義氣仔女Online, the hourly pay always take place at 0 minutes every hour. This script takes care of that. However your computer clock must syn with the world clock.
- In 辦公室Online, your pressure raise when you are attacked.
- you generate 5 health, 1 strength, 1 mind and -1 pressure every 5 minutes
- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> if you use this script and got banned, don't blame us <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
*/

// Things you can change
//---------------------------------------------------------------------------------------------
/*
進取工作
true - 5 分鐘 check 一次。一夠能力就做 job。reload 次數比較多，晚間 try again 錯誤機會較高，但萬一 try again 錯誤時損失較少。
false - 等能力升滿先做 job，等級高時 reload 次數少很多。晚間 try again 錯誤較少。而且因為唔做野會當 logout，比人打機會減少好多。但萬一 try again 錯誤時損失較大。
*/
var aggressive = false;
/* 義氣仔女Online  工作代號，由 1 開始順序落。
代客泊車 id:1, req:1
賣翻版DVD id:2, req:3
幫財務公司收數 id:3, req:5
麻將館睇埸 id:4, req:7
走水貨返大陸 id:5, req:10
偷車 id:6, req:15
放貴利 id:7, req:18
打劫銀行 id:8, req:25
連環洗劫金鋪 id:9, req:30
*/
var fightsmissionID = 5;   // 義氣仔女工作。改這個的話，記得改埋 fightsmissionReq.
var fightsmissionReq = 10; // 
/* 辦公室Online 工作代號，由 1 開始順序落。
倒垃圾 id:1, req:1
執拾工作地方 id:2, req:1
買六合彩 id:3, req:1  //減壓力
整理文件 id:4, req:1
請同事食零食 id:5, req:1  //減壓力
睇八卦雜誌 id:6, req:2
記下每個同事的生日 id:7, req:2
比較同事人工 id:8, req:2
睇招聘雜誌搵工 id:9, req:2
同朋友傾電話 id:10, req:2 //減壓力
偷偷地去見工 id:11, req:2
請病假 id:12, req:2  //減壓力
聽音樂 id:13, req:2  //冇壓力
整理Email id:14, req:3
食下午茶 id:15, req:3
做兼職 id:16, req:3
上網玩Facebook id:17, req:3
修改個人履曆 id:18, req:3
做Gym id:19, req:3  //減壓力
開會 id:20, req:4
到外國公幹 id:21, req:4
*/
var officeworkmissionID = 18;   // 辦公室有壓力的工作。改這個的話，記得改埋 officeworkmissionReq.
var officeworkmissionReq = 3; // 
var officerestmissionID = 19;   // 辦公室沒有壓力 / 減壓力的工作。改這個的話，記得改埋 officerestmissionReq.
var officerestmissionReq = 3; // 
var pressurethreshold = 8; // 辦公室壓力上限，壓力大於這個數，就做 officerestmissionID 指定減壓工作，否則做 officeworkmissionID 指定工作。
var bankthreshold = 100; // 現金上限，現金大於這個數，就所有錢存入銀行。
//---------------------------------------------------------------------------------------------


// Things you may change, but don't if you are not an expert
var ob='http://apps.new.facebook.com/office-wars/bank.php';
var oj='http://apps.new.facebook.com/office-wars/job.php';
var sb='http://apps.new.facebook.com/street-fights/bank.php';
var sj='http://apps.new.facebook.com/street-fights/job.php';
//---------------------------------------------------------------------------------------------


// Things you don't need to change, unless you are a coder. 
// If you made useful changes, please share it.
var last_check = new Date();
var backgroundcolor = '#eeeeff';
var status_tag = null;
var ranjob = false;
var check_interval;



if ( (location.href==sb) || (location.href==sj) ) {
	backgroundcolor = '#eeeeee';
	status_tag = document.getElementById('app17326627347_main');
} else if ( (location.href==ob) || (location.href==oj) ) {
	backgroundcolor = '#ffeeee';
	status_tag = document.getElementById('app21745179649_main');
}

// setup a count down box
var htmlElement = document.createElement('div');
htmlElement.id = 'neotimer';
htmlElement.style.top = '56px';
htmlElement.style.right = '2px';
htmlElement.style.position = 'absolute';
htmlElement.style.width = '160px';
htmlElement.style.height = '300px';
htmlElement.style.background = backgroundcolor;
htmlElement.style.font = '11px arial';
htmlElement.style.color = 'grey';
htmlElement.style.textAlign = 'center';
htmlElement.style.zIndex = 100;
window.parent.document.body.appendChild(htmlElement);


// start up check
function errorreload() {
    if ( (location.href==ob) || (location.href==oj) ) {
		location.href=oj;
	} else if ( (location.href==sb) || (location.href==sj) ) {
		location.href=sj;
	}
}

function checkTime(i) {
  if (i<10) {i="0" + i;}
  return i;
}

function check_money() {
  // check money
  if ( status_tag === null) {return null;}
  var str = new RegExp('現金:[^v]+').exec(status_tag.innerHTML);
  if (str === null) {return null;}
  var money = parseInt(str.toString(10).split('$')[1].split('<')[0].replace(/,/g,""),10);
  return money;	
 }

 function check_mind() {
  // check mind
  if ( status_tag === null) {return null;}
  var str = new RegExp('精神:[^<]+').exec(status_tag.innerHTML);
  if (str === null) {return null;}
  var mind = parseInt(str.toString(10).split(':')[1].split('/')[0],10);
  return mind;
}

 function check_maxmind() {
  // check mind
  if ( status_tag === null) {return null;}
  var str = new RegExp('精神:[^<]+').exec(status_tag.innerHTML);
  if (str === null) {return null;}
  var maxmind = parseInt(str.toString(10).split('/')[1],10);
  return maxmind;
}

function check_strength() {
  // check strength
  if ( status_tag === null) {return null;}
  var str = new RegExp('體力:[^<]+').exec(status_tag.innerHTML);
  if (str === null) {return null;}
  var strength = parseInt(str.toString(10).split(':')[1].split('/')[0],10);
  return strength;
}

function check_maxstrength() {
  // check strength
  if ( status_tag === null) {return null;}
  var str = new RegExp('體力:[^<]+').exec(status_tag.innerHTML);
  if (str === null) {return null;}
  var maxstrength = parseInt(str.toString(10).split('/')[1],10);
  return maxstrength;
}

function check_life() {
  // check strength
  if ( status_tag === null) {return null;}
  var str = new RegExp('生命:[^<]+').exec(status_tag.innerHTML);
  if (str === null) {return null;}
  var life = parseInt(str.toString(10).split(':')[1].split('/')[0],10);
  return life;
}

function check_maxlife() {
  // check strength
  if ( status_tag === null) {return null;}
  var str = new RegExp('生命:[^<]+').exec(status_tag.innerHTML);
  if (str === null) {return null;}
  var maxlife = parseInt(str.toString(10).split('/')[1],10);
  return maxlife;
}

 function check_pressure() {
  // check pressure
  if ( status_tag === null) {return null;}
  var str = new RegExp('壓力:[^<]+').exec(status_tag.innerHTML);
  if (str === null) {return null;}
  var pressure = parseInt(str.toString(10).split(':')[1].split('/')[0],10);
  return pressure;	
 }

 function check_maxpressure() {
  // check pressure
  if ( status_tag === null) {return null;}
  var str = new RegExp('壓力:[^<]+').exec(status_tag.innerHTML);
  if (str === null) {return null;}
  var maxpressure = parseInt(str.toString(10).split('/')[1],10);
  return maxpressure;	
 }

function run_mission() {
  var action;
    if ( location.href==oj ) {
		if (check_pressure(status_tag) > pressurethreshold) {
			if (check_mind(status_tag) < officerestmissionReq) {return '你有壓力我有壓力';}
			action = document.getElementById('app21745179649_mod_action-' + officerestmissionID);
		} else {
			if (check_mind(status_tag) < officeworkmissionReq) {return '冇精神';}
			action = document.getElementById('app21745179649_mod_action-' + officeworkmissionID);
		}
	} else if ( location.href==sj ) {
		if (check_strength(status_tag) < fightsmissionReq) {return '冇體力';}
		action = document.getElementById('app17326627347_mod_action-' + fightsmissionID);
	} else if ( (location.href==sb) || (location.href==ob)) {
		return '存錢';
	} else {
		return '呢度邊道？唔好玩啦哥哥仔。 O.o';
	}
  if (action === null) {return '依？有問題';}
  var action_link = action.getElementsByTagName('a')[0];
  if (action_link === null) {return '下？有問題';}

  // click
  ranjob = true;
  var evt = document.createEvent("MouseEvents");
  evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  action_link.dispatchEvent(evt);
  return '做嘢！';
}


if (aggressive) {
	check_interval = 300; // if aggressive, check every 5 minutes
} else {
    if ( (location.href==ob) || (location.href==oj) ) {
		// if not aggressive, check only when pressure reach 0 or mind reach max
		if ((check_maxmind() - check_mind()) < check_pressure()) {
			check_interval = (check_maxmind() - check_mind()) * 300; 
		} else {
			check_interval = check_pressure() * 300; 
			if (((check_mind() - officeworkmissionReq) < 0) && (check_pressure < (officeworkmissionReq - check_mind()))) {
				check_interval = 300 * (officeworkmissionReq - check_mind());
			}
		}
		if (check_interval < 300) {check_interval = 300;}		
	} else if ( (location.href==sb) || (location.href==sj) ) {
		// if not aggressive, check only when strength reach max
		check_interval = (check_maxstrength() - check_strength()) * 300;
	}
	// if something goes wrong, set reload in 1 hour
	if (check_interval < 300) {check_interval = 3596;}
}

function tick() {

  // display 
  var displaytext;
  displaytext = '<table width="100%" height="100%" style="border:medium double grey;font:11px arial;color:#333366;"><tr><td colspan=4 height=80>' ;
  displaytext += '　自動做嘢存錢機 v2.0<br />　　　　　by neo@orz.hk<br /><br />' ;
  displaytext += '　支援：義氣仔女Online<br />';
  displaytext += '　　　　辦公室Online';
  displaytext += '</td></tr>' ;

  var current = new Date();
  displaytext += '<tr height=50><td colspan=4 style="border:medium dotted grey; text-align:center;">Current Time: ' + current.getHours() + ':' + checkTime(current.getMinutes()) + ':' + checkTime(current.getSeconds()) + '<br />';

  var seconds = (current - last_check) / 1000;
  displaytext += 'Next check: ' + (check_interval - Math.round(seconds)) + ' sec</td></tr>';

  displaytext += '<tr><td colspan=4></td></tr>';

  htmlElement.innerHTML = '<br />Checking life . . .';
  var life = check_life();
  var maxlife = check_maxlife();
  if (life !== null) {displaytext += '<tr height=20><td width="20"></td><td style="border-bottom:thin solid grey;">生命:</td><td style="text-align:right;border-bottom:thin solid grey;">' + life + '/' + maxlife  + '</td><td width="20"></td></tr>';}

  htmlElement.innerHTML = '<br />Checking strength . . .';
  var strength = check_strength();
  var maxstrength = check_maxstrength();
  if (strength !== null) {displaytext += '<tr height=20><td width="20"></td><td style="border-bottom:thin solid grey;">體力:</td><td style="text-align:right;border-bottom:thin solid grey;">' + strength + '/' + maxstrength + '</td><td width="20"></td></tr>';}

  htmlElement.innerHTML = '<br />Checking pressure . . .';
  var pressure = check_pressure();
  var maxpressure = check_maxpressure();
  if (pressure !== null) {displaytext += '<tr height=20><td width="20"></td><td style="border-bottom:thin solid grey;">壓力:</td><td style="text-align:right;border-bottom:thin solid grey;">' + pressure + '/' + maxpressure + '</td><td width="20"></td></tr>';}

  htmlElement.innerHTML = '<br />Checking mind . . .';
  var mind = check_mind();
  var maxmind = check_maxmind();
  if (mind !== null) {displaytext += '<tr height=20><td width="20"></td><td style="border-bottom:thin solid grey;">精神:</td><td style="text-align:right;border-bottom:thin solid grey;">' + mind + '/' + maxmind + '</td><td width="20"></td></tr>';}

  htmlElement.innerHTML = '<br />Checking money . . .';
  var money = check_money();
  if (money !== null) {displaytext += '<tr height=20><td width="20"></td><td style="border-bottom:thin solid grey;">現金:</td><td style="text-align:right;border-bottom:thin solid grey;">$ ' + money + '</td><td width="20"></td></tr>';}

  htmlElement.innerHTML = '<br />Checking action . . .';
  var action = run_mission();
  displaytext += '<tr height=30><td colspan=4 style="text-align:center;">' + action + '</td></tr>';
  displaytext += '<tr><td colspan=4></td></tr>';
  displaytext += '</table>';
  
  htmlElement.innerHTML = displaytext;
  var GMregister = new GM_setValue('neoFacebookWorker', current.getHours() + ':' + checkTime(current.getMinutes()) + ':' + checkTime(current.getSeconds()));

  // reload on error
  if (document.getElementById('error_message') !== null) {
	window.setTimeout(function() { errorreload(); }, 30000);  // 30 seconds no respond, reload
    return;
  }

  // reload if a job ran
  if (ranjob === true) {
    ranjob = false;
	window.setTimeout(function() { errorreload(); }, 30000);  // 30 seconds no response, reload  
    return;
  }  
  
  
    if ( (location.href==oj) || (location.href==sj) ) {

	  // hourly income will save to bank, unless the script is set to non-aggressive and the user has enough time to fade out to background
	  if ((location.href==sj) && (current.getMinutes()===0) && (current.getSeconds()>=21) && (current.getSeconds()<=23) && 
		((aggressive) || (last_check.getMinutes() > 49))) {
		location.href=sb;
		return;
	  }
	  
	  // reload according to the check interval
	  if (seconds > check_interval) {
		if ( location.href==oj ) {
			location.href=ob;
		} else if ( location.href==sj ) {
			location.href=sb;
		}
	    return;
	  }

	  // save money to bank
	  if (money > bankthreshold) {
		if ( location.href==oj ) {
			location.href=ob;
			return;
		} else if ( location.href==sj ) {
			location.href=sb;
			return;
		}
	  }

    }

    // click the deposit button if there is money to save
    if ( (location.href==ob) || (location.href==sb) ) {
	    if (document.getElementsByName("amount").length > 1) {
	      if (parseInt(document.getElementsByName("amount")[1].value,10) > bankthreshold) {
			document.getElementsByName("deposit")[0].click();
			window.setTimeout(function() { errorreload(); }, 30000);  // 30 seconds no response, reload  
			return;
		  } else {
			if ( location.href==ob ) {
				location.href=oj;
			} else if ( location.href==sb ) {
				location.href=sj;
			}
			window.setTimeout(function() { errorreload(); }, 30000);  // 30 seconds no response, reload  
			return;
	      }	
		} else {
			if ( location.href==ob ) {
				location.href=oj;
			} else if ( location.href==sb ) {
				location.href=sj;
			}
			window.setTimeout(function() { errorreload(); }, 30000);  // 30 seconds no response, reload  
			return;
	    }
    }
  
  window.setTimeout(function() { tick(); }, 1049);  
}

// initial run
htmlElement.innerHTML = '<br />Initializing . . .' ;
window.setTimeout(function() { tick(); }, 500);