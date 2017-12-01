const {app, Tray, Menu, shell} = require('electron')

const request				= require('request').defaults({jar: true})
const path					= require('path')
const parseXML				= require('xml2js').parseString
const getNetworkType		= require('./networkType.js').getNetworkType
const pretty				= require('prettysize')
const chalk 				= require('chalk')

let state = {}


process.on('unhandledRejection', (reason, p) => {
	console.log(chalk.redBright("[Promise] ") + ' Unhandled Rejection:', reason)
})

app.on('ready', () => {
	let appIcon = new Tray(path.join(__dirname, './icons/loading.ico'))

	let setCookie = () => {
		return new Promise((resolve, reject) => {
			request('http://192.168.1.1', (error, response, body) => {
				if (error) reject(error)
				resolve()
			})
		})
	}
	
	let getData = () => {
		return new Promise((resolve, reject) => {
			request('http://192.168.1.1/api/monitoring/status', (error, response, status) => {
				if (error) reject(error)
				if (status.includes("125002")) {setCookie();return}
				request('http://192.168.1.1/api/monitoring/traffic-statistics', (error, response, statistics) => {
					if (error) reject(error)
					if (statistics.includes("125002")) {setCookie();return}

					request('http://192.168.1.1/api/monitoring/check-notifications', (error, response, notifications) => {
						if (error) reject(error)
						if (notifications.includes("125002")) {setCookie();return}
	
						resolve({
							status: status,
							statistics: statistics,
							notifications: notifications
						})
					})
				})
			})
		})
	}
	
	let handleData = () => {
		getData().then(xml => {
			parseXML(xml.status, function (err, status) {
			parseXML(xml.notifications, function (err, notifications) {
			parseXML(xml.statistics, function (err, statistics) {
				statistics = statistics.response
				status = status.response
				notifications = notifications.response

				if (!status || !notifications || !statistics) return
				if (JSON.stringify(status) !== JSON.stringify(state)) {
					let users = ' user',
						sms = ''
					if (notifications.UnreadMessage[0] !== '0') {
						sms = '(' + notifications.UnreadMessage[0] + ' new messages) '
						if (notifications.UnreadMessage[0] == '1') sms = '(' + notifications.UnreadMessage[0] + ' new message) '
					}
					if (status.CurrentWifiUser[0] !== 1) users += 's'
					appIcon.setToolTip(
						sms +
						getNetworkType(status.CurrentNetworkType[0]) +
						' - ' +
						status.CurrentWifiUser[0] +
						users +
						' connected (' +
						status.BatteryPercent[0] +
						'%)'
					)
					let signalIcon = 'signal-' + status.SignalIcon[0] + '.ico'
					if (status.RoamingStatus[0] !== '0') signalIcon = 'roaming-' + status.SignalIcon[0] + '.ico'
					if (status.ConnectionStatus[0] == '50' || status.ConnectionStatus[0] == '33') signalIcon = 'disabled-' + data.SignalIcon[0] + '.ico'
					if (status.ConnectionStatus[0] == '900') signalIcon = 'loading.ico'
					if (notifications.UnreadMessage[0] !== '0') signalIcon = 'sms.ico'
					appIcon.setImage(
						path.join(__dirname, './icons/' + signalIcon)
					)
					appIcon.setContextMenu(
						Menu.buildFromTemplate([
							{
								label: 'Connected to ' + getNetworkType(status.CurrentNetworkType[0]) + ' network',
								click: () => {
									shell.openExternal("http://192.168.1.1/html/mobilenetworksettings.html")
								}
							},
							{
								label: status.CurrentWifiUser[0] + users + ' connected',
								click: () => {
									shell.openExternal("http://192.168.1.1/html/statistic.html")
								}
							},
							{
								label: pretty(statistics.CurrentDownload[0]) + ' download / ' + pretty(statistics.CurrentUpload[0]) + ' upload',
								click: () => {
									shell.openExternal("http://192.168.1.1/html/statistic.html")
								}
							},
							{
								label: status.BatteryPercent[0] + '% battery remaining',
								click: () => {
									shell.openExternal("http://192.168.1.1/")
								}
							},
							{
								label: 'Exit',
								click: () => {
									app.quit()
								}
							}
						])
					)
					
				}
				if (state.status && state.notifications && state.statistics) {
					if (notifications.UnreadMessage[0] > state.notifications.UnreadMessage[0]) {
						// New SMS
					}
				}
				state = {
					status: status,
					notifications: notifications,
					statistics: statistics,
				}
			})
			})
			})
		})
	}

	setCookie()
	handleData()
	
	setInterval(() => {
		handleData()
	}, 15000)
})