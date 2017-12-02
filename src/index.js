/////////////////////////////
const config = {
	refreshInterval: 1000
}
/////////////////////////////

const { app, Tray, Menu, shell } = require('electron')

const request			= require('request').defaults({jar: true})
const path				= require('path')
const parseXML			= require('xml2js').parseString
const getNetworkType	= require('./networkType.js').getNetworkType
const pretty			= require('prettysize')
const chalk 			= require('chalk')

let state = {}


process.on('unhandledRejection', (reason, p) => {
	console.log(chalk.redBright("[Promise] ") + ' Unhandled Rejection:', reason)
})

app.on('ready', () => {
	let tray = new Tray(path.join(__dirname, './icons/tray/loading.ico'))
	
	let refreshConfig = () => {
		let cMenu = configMenu()
		tray.setContextMenu(cMenu)
		tray.popUpContextMenu(cMenu, {
			x: tray.getBounds().x,
			y: tray.getBounds().y,
		})
	}
	let increase = () => {
		if (config.refreshInterval < 2000) {
			config.refreshInterval = config.refreshInterval + 100
		} else {
			config.refreshInterval = config.refreshInterval + 1000
		}
		refreshConfig()
	}

	let decrease = () => {
		if (config.refreshInterval == 100) return
		if (config.refreshInterval <= 2000) {
			config.refreshInterval = config.refreshInterval - 100
		} else {
			config.refreshInterval = config.refreshInterval - 1000
		}
		refreshConfig()
	}

	let configMenu = () => {
		let seconds = ' second'
		if (config.refreshInterval !== 1000) seconds += 's'
		return Menu.buildFromTemplate([
			{
				label: 'Refresh interval',
				sublabel: config.refreshInterval / 1000 + seconds,
				enabled: false,
			},
			{
				label: 'Increase',
				icon: path.join(__dirname, './icons/context-menu/up.png'),
				click: () => {
					increase()
				}
			},
			{
				label: 'Decrease',
				icon: path.join(__dirname, './icons/context-menu/down.png'),
				click: () => {
					decrease()
				},
				enabled: config.refreshInterval == 100 ? false : true,
			},
			{
				type: 'separator'
			},
			{
				label: 'Exit',
				click: () => {
					app.quit()
				}
			}
		])
	}
	
	let menu = configMenu()
	tray.setContextMenu(configMenu())

	tray.on('double-click', () => {
		// shell.openExternal("http://192.168.1.1/html/statistic.html")
	})
	
	tray.on('click', () => {
		tray.popUpContextMenu(menu)
	})

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
				if (!status || status.includes("125002")) {setCookie(); return false}
				request('http://192.168.1.1/api/monitoring/traffic-statistics', (error, response, statistics) => {
					if (error) reject(error)
					if (!statistics || statistics.includes("125002")) {setCookie(); return false}

					request('http://192.168.1.1/api/monitoring/check-notifications', (error, response, notifications) => {
						if (error) reject(error)
						if (!notifications || notifications.includes("125002")) {setCookie(); return false}
	
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
			parseXML(xml.status, (err, status) => {
			parseXML(xml.notifications, (err, notifications) => {
			parseXML(xml.statistics, (err, statistics) => {
				statistics = statistics.response
				status = status.response
				notifications = notifications.response

				if (!status || !notifications || !statistics) { handleData(); return }
				console.log('Refreshed')
				if (JSON.stringify(status) !== JSON.stringify(state)) {
					let users = ' user',
						sms = '',
						charging = 'battery'
					if (notifications.UnreadMessage[0] !== '0') {
						let message = 'message'
						if (notifications.UnreadMessage[0] !== '1') message += 's'

						sms = '(' + notifications.UnreadMessage[0] + ' new ' + message + ')\n'
					}
					if (status.CurrentWifiUser[0] !== 1) users += 's'
					if (status.BatteryStatus[0] == 1) charging = ' (charging)'
					tray.setToolTip(
						sms +
						getNetworkType(status.CurrentNetworkType[0]) + " - " + status.SignalIcon[0] + " bars\n" +
						status.CurrentWifiUser[0] + users + ' connected\n' +
						status.BatteryPercent[0] + '% battery' + charging + '\n' + 
						pretty(statistics.CurrentDownload[0]) + ' download / ' + pretty(statistics.CurrentUpload[0]) + ' upload'
					)
					let signalIcon = 'signal-' + status.SignalIcon[0]
					if (status.RoamingStatus[0] !== '0') signalIcon = 'roaming-' + status.SignalIcon[0]
					if (status.ConnectionStatus[0] == '50' || status.ConnectionStatus[0] == '33') signalIcon = 'disabled-' + status.SignalIcon[0]
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
							sublabel: status.BatteryPercent[0] + '%' + charging,
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
				setTimeout(() => {
					handleData()
				}, config.refreshInterval)
			})
			})
			})
		}).catch(() => {
			setTimeout(() => {
				handleData()
			}, config.refreshInterval)
			tray.setImage(
				path.join(__dirname, './icons/tray/loading.ico')
			)
		})
	}

	setCookie().then(() => {
		handleData()
	})
})