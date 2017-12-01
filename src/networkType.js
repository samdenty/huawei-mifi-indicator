exports.getNetworkType = networkType => {
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