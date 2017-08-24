# Huawei MiFi tray-indicator
This project display a signal indicator in the Windows tray area, for Huawei MiFi devices.

<<<<<<< HEAD
![](http://i.imgur.com/30EWe9E.png)

#How does it work
=======
### How does it work
>>>>>>> cfffc8f3a0367bb92107354c5ed9d85a3dc79a0d

Huawei MiFi devices have an inbuilt API to access the status of the device at `192.168.1.1/api/monitoring/status`. A `sessionID` cookie is required to view this XML page, so a request is made to `192.168.1.1` to get one.

### Confirmed devices

 - Huawei E5577C
 - Huawei E5220

All Huawei MiFi devices should be supported, as the API is included with the Huawei Web OS. 

If you encounter any issues with your specific device, open up an `Issue` and I'll attempt to resolve it
