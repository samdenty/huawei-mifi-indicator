# Huawei MiFi indicator
This project display a signal indicator in the Windows tray area, for Huawei MiFi devices.

![](http://i.imgur.com/30EWe9E.png)


## Getting Started

1. [Download the latest release](https://github.com/samdenty99/huawei-mifi-indicator/raw/master/dist/huawei-mifi-indicator%201.0.0.exe)
2. Press <kbd>WIN+R</kbd> and type in `shell:startup`
3. Copy the EXE to the above folder and launch it

## How does it work

Huawei MiFi devices have an inbuilt API to access the status of the device at `192.168.1.1/api/monitoring/status`. A `sessionID` cookie is required to view this XML page, so a request is made to `192.168.1.1` to get one.

### Confirmed devices

 - Huawei E5577C
 - Huawei E5220

All Huawei MiFi devices should be supported, as the API is included with the Huawei Web OS. 

If you encounter any issues with your specific device, open up an `Issue` and I'll attempt to resolve it
