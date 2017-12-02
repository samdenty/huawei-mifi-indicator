/////////////////////////////
const config = {
	refreshInterval: 15000
}
/////////////////////////////

const { app, Tray, Menu, shell }	= require('electron')
const request						= require('request').defaults({jar: true})
const path							= require('path')
const parseXML						= require('xml2js').parseString
const getNetworkType				= require('./networkType.js').getNetworkType
const pretty						= require('prettysize')
const chalk 						= require('chalk')

let state = {}
let defaultMenu = Menu.buildFromTemplate([
	{
		label: 'Exit',
		click: () => {
			app.quit()
		}
	}
])
let menu = defaultMenu


process.on('unhandledRejection', (reason, p) => {
	console.log(chalk.redBright("[Promise] ") + ' Unhandled Rejection:', reason)
})

app.on('ready', () => {
	let tray = new Tray(path.join(__dirname, './icons/tray/loading.ico'))
	tray.on('double-click', () => {
		shell.openExternal("http://192.168.1.1/html/statistic.html")
	})
	tray.on('click', () => {
		tray.popUpContextMenu(menu)
	})
	tray.setContextMenu(defaultMenu)

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
				if (status.includes("125002")) {setCookie(); return false}
				request('http://192.168.1.1/api/monitoring/traffic-statistics', (error, response, statistics) => {
					if (error) reject(error)
					if (statistics.includes("125002")) {setCookie(); return false}

					request('http://192.168.1.1/api/monitoring/check-notifications', (error, response, notifications) => {
						if (error) reject(error)
						if (notifications.includes("125002")) {setCookie(); return false}
	
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
						let message = 'message'
						if (notifications.UnreadMessage[0] !== '1') message += 's'

						sms = '(' + notifications.UnreadMessage[0] + ' new ' + message + ')\n'
					}
					if (status.CurrentWifiUser[0] !== 1) users += 's'
					tray.setToolTip(
						sms +
						getNetworkType(status.CurrentNetworkType[0]) + " - " + status.SignalIcon[0] + " bars\n" +
						status.CurrentWifiUser[0] + users + ' connected\n' +
						status.BatteryPercent[0] + '% battery\n' + 
						pretty(statistics.CurrentDownload[0]) + ' download / ' + pretty(statistics.CurrentUpload[0]) + ' upload'
					)
					let signalIcon = 'signal-' + status.SignalIcon[0]
					if (status.RoamingStatus[0] !== '0') signalIcon = 'roaming-' + status.SignalIcon[0]
					if (status.ConnectionStatus[0] == '50' || status.ConnectionStatus[0] == '33') signalIcon = 'disabled-' + data.SignalIcon[0]
					if (status.ConnectionStatus[0] == '900') signalIcon = 'loading'
					if (notifications.UnreadMessage[0] !== '0') signalIcon = 'sms'
					tray.setImage(
						path.join(__dirname, './icons/tray/' + signalIcon + '.ico')
					)
					menu = Menu.buildFromTemplate([
						{
							label: 'Network Type',
							sublabel: getNetworkType(status.CurrentNetworkType[0]),
							icon: path.join(__dirname, './icons/context-menu/' + signalIcon + '.png'),
							click: () => {
								shell.openExternal("http://192.168.1.1/html/mobilenetworksettings.html")
							}
						},
						{
							label: 'Connected devices',
							sublabel: status.CurrentWifiUser[0],
							icon: path.join(__dirname, './icons/context-menu/devices.png'),
							click: () => {
								shell.openExternal("http://192.168.1.1/html/statistic.html")
							}
						},
						{
							label: 'Battery percentage',
							sublabel: status.BatteryPercent[0] + '%',
							click: () => {
								shell.openExternal("http://192.168.1.1/")
							}
						},
						{
							type: 'separator'
						},
						{
							label: 'Current download / speed',
							sublabel: pretty(statistics.CurrentDownload[0]) + ' / ' + pretty(statistics.CurrentDownloadRate[0]) + '/s',
							icon: path.join(__dirname, './icons/context-menu/download.png'),
							click: () => {
								shell.openExternal("http://192.168.1.1/html/statistic.html")
							}
						},
						{
							label: 'Current upload / speed',
							sublabel: pretty(statistics.CurrentUpload[0]) + ' / ' + pretty(statistics.CurrentUploadRate[0]) + '/s',
							icon: path.join(__dirname, './icons/context-menu/upload.png'),
							click: () => {
								shell.openExternal("http://192.168.1.1/html/statistic.html")
							}
						}
					])
					
				}
				if (state.status && state.notifications && state.statistics) {
					if (notifications.UnreadMessage[0] > state.notifications.UnreadMessage[0]) {
						let message = "message"
						if (notifications.UnreadMessage[0] == "1") message += "s"
						tray.displayBalloon({
							title: "New SMS received",
							content: "You have " + notifications.UnreadMessage[0] + " unread " + message
						})
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

	setCookie().then(() => {
		handleData()
	})
	
	setInterval(() => {
		handleData()
	}, config.refreshInterval)
})