# Huawei MiFi tray-indicator
This project display a signal indicator in the Windows tray area, for Huawei MiFi devices.

# How does it work

Huawei MiFi devices have an inbuilt API to access the status of the device at `192.168.1.1/api/monitoring/status`. A `sessionID` cookie is required to view this XML page, so a request is made to `192.168.1.1` to get one.

# Confirmed devices

 - Huawei E5577C
 - Huawei E5220

All Huawei MiFi devices should be supported, as the API is included with the Huawei Web OS. 

If you encounter any issues with your specific device, open up an `Issue` and I'll attempt to resolve it
