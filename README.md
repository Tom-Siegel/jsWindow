# jsWindow
Draggable and sizeable window javascript library and css

This library contributes dynamic creation of fully customizeable and event based windows. 

  - no predefined HTML needed
  - custom themes for windows
  - custom settings for windows
  - free draggable and resizeable (can be disabled)
  - window/task bar integrated
  - tooltips integrated
  - minimize, maximize and close windows (reuseable)
  - event based
  - class based
  - typed properties
  
## window
  
![window image](https://github.com/TosiHyper/jsWindow/blob/master/Resources/window.PNG?raw=true)
  
'''javascript
var wnd = new jsWindow(); counter++;
		
    wnd.title = "my Window"
		wnd.container.setPosition(250, 50);
		wnd.container.setSize(400, 150);
		
		wnd.content = '<label>A dynamically created window.</label>';
		
		wnd.show();
'''
  
## messagebox
  
![messagebox image](https://github.com/TosiHyper/jsWindow/blob/master/Resources/Messagebox.PNG?raw=true)
  
## confirm

![confirm image](https://github.com/TosiHyper/jsWindow/blob/master/Resources/confirm.PNG?raw=true)
