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
  
```javascript
var wnd = new jsWindow();
	
wnd.title = "my Window"
wnd.container.setPosition(250, 50);
wnd.container.setSize(400, 150);
		
wnd.content = '<label>A dynamically created window.</label>';
		
wnd.show();
```
  
## messagebox
  
![messagebox image](https://github.com/TosiHyper/jsWindow/blob/master/Resources/Messagebox.PNG?raw=true)
  
```javascript
jsMessager.alert("A dynamically created messagebox.", "messagebox");
```
## confirm

![confirm image](https://github.com/TosiHyper/jsWindow/blob/master/Resources/confirm.PNG?raw=true)

```javascript
jsMessager.confirm("A dynamically created confirm. Press {Yes} to execute callback.", "confirm", function() {
	jsMessager.alert("callback executed!", "confirmed");
});
```

## Examples
### Login - window via jsMessager

![login window image](https://github.com/TosiHyper/jsWindow/blob/master/Resources/example_login.PNG?raw=true)

```javascript
var wnd_login = new jsMessager();
			
wnd_login.title = "login";
wnd_login.addButton("login", "login", false);
wnd_login.addButton("cancel", "cancel", true);
wnd_login.textContainer.innerHTML = '<div style="display: block; padding: 10px;"><p style="margin-bottom: 0;">Username</p><input class="form-control" id="inp_user" /><p style="margin-bottom: 0;">Password</p><input class="form-control" type="password" id="inp_password" /></div>'
		
		
wnd_login.addEventListener("js.return", function(ev) {
	var value = ev.parameter;

	if (value === "login") {
		var user = wnd_login.body.container.querySelector("#inp_user").value;
		var password = wnd_login.body.container.querySelector("#inp_password").value;
			
		jsMessager.alert('user: ' + user + " | password: " + password);
			
		if (user === "user1234" && password === "jsWindow") { wnd_login.close(); } else {
			jsMessager.alert("credentials are incorrect!");
		}
	} else { wnd_login.close(); }
});
		
wnd_login.show();
```
