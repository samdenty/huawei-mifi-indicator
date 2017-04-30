/* Huawei MiFi tray icon indicator for Windows by Samuel Denty */
/* Some functions by Ookami86 - https://github.com/Ookami86/gnome-extension-huawei-status */

var scanInterval = 5000

/* End of configuration*/



const ipc = require('electron').ipcRenderer;
var oldState;
function getSessionID() {
	document.getElementById("monitoringStatus").innerHTML += "<webview src='http://192.168.1.1' id='sessionIdFrame' disablewebsecurity></webview>"
	document.getElementById("sessionIdFrame").addEventListener("did-finish-load", addFrame)
}
function refreshStatus() {
	var webview = document.getElementById('status');
	webview.reload()
	parseStatus()
}

function addFrame() {
	document.getElementById("monitoringStatus").innerHTML = "<webview src='http://192.168.1.1/api/monitoring/status' id='status' disablewebsecurity></webview>"
	parseStatus()
}

function parseStatus() {
	var webview = document.getElementById('status')
	var bound = false
	webview.addEventListener('console-message', (e) => {
		var state = e.message
		if (oldState != state) {
			oldState = state
			var $doc = $.parseXML(e.message);
			var code = $($doc).find("code").text()
			if (code == '125002') {getSessionID()}
			var signal = $($doc).find("signalicon").text()
			var networkType = $($doc).find("networktype").text()
			var roamingStatus = $($doc).find("roamingstatus").text()
			var battery = $($doc).find("batterypercent").text()
			var users = $($doc).find("currentwifiuser").text()
			var connectionStatus = $($doc).find("connectionstatus").text()
			var networkType = $($doc).find("currentnetworktype").text()
			var networkType = getNetworkType(networkType)
			if (roamingStatus == 0) {var iconPreName = 'signal-'} else {var iconPreName = 'roaming-'}
			if (connectionStatus == 50) {var iconPreName = 'disabled-'}
			console.log('Signal:'+iconPreName+signal+';'+'Users:'+users+';'+'Battery:'+battery+';')
			ipc.send('changeIcon', iconPreName + signal, battery, users, networkType)
		}
	})
	webview.addEventListener("dom-ready", function() {
	    webview.executeJavaScript('console.log(document.body.innerHTML)')
	});
}

function getNetworkType(networkType) {
    var NO_SERVICE = '0';
    var GSM = '1';
    var GPRS = '2';
    var EDGE = '3';
    var WCDMA = '4';
    var HSDPA = '5';
    var HSUPA = '6';
    var HSPA = '7';
    var TDSCDMA = '8';
    var HSPA_PLUS = '9';
    var EVDO_REV_0 = '10';
    var EVDO_REV_A = '11';
    var EVDO_REV_B = '12';
    var RTT = '13';
    var UMB = '14';
    var EVDV = '15';
    var RTT = '16';
    var HSPA_PLUS_64QAM = '17';
    var HSPA_PLUS_MIMO = '18';
    var LTE = '19';
 
    switch (networkType){
	case NO_SERVICE:
	    return "No Service";
	case GSM:
	case GPRS:
	case EDGE:
	case RTT:
	case EVDV:
	    return "2G";
	case WCDMA:
	case TDSCDMA:
	case EVDO_REV_0:
	case EVDO_REV_A:
	case EVDO_REV_B:
	case HSDPA:
	case HSUPA:
	case HSPA:
	case HSPA_PLUS:
	case HSPA_PLUS_64QAM:
	case HSPA_PLUS_MIMO:
	    return "3G";
	case LTE:
	    return "4G";
	default:
	    return "??";
   }
}

getSessionID()
window.setInterval(function(){
	refreshStatus()
}, scanInterval);