const {app, BrowserWindow, Menu, session, Tray} = require("electron");
const rpc = require("discord-rich-presence")("515187842885091343");

let window;
let tray = null;
let force_quit = false;

function createWindow()
{
	window = new BrowserWindow({icon: 'logo.png'});
	let contents = window.webContents;
	window.setMenuBarVisibility(false);
	window.loadURL("https://music.youtube.com");
	
	contents.on('did-finish-load', ()=>
	{
		contents.executeJavaScript("var style = document.createElement('style'); style.textContent = 'html:not([style-scope]):not(.stype-scope){--ytmusic-color-scrubber-bar-1: #9C27B0;--ytmusic-player-bar-height: 6rem;--ytmusic-nav-bar-height: 5rem;}'; document.body.appendChild(style);");
		window.setTitle("YouTube Music Desktop");

		rpc.updatePresence(
		{
			state: "Idle",
			largeImageKey: "logo"
		});
	});

	window.on('page-title-updated', (event, title)=>
	{
		event.preventDefault();
		if (title.lastIndexOf("- Y") != -1)
		{
			song = title.slice(0, title.lastIndexOf("- Y"));
			window.setTitle(song + " - YouTube Music Desktop");
			
			rpc.updatePresence(
			{
				state: song,
				details: "Listening",
				largeImageKey: "logo"
				
			});
		}
	});

	window.on('close', (event)=>
	{
		if(!force_quit)
		{
			event.preventDefault();
			window.hide();
		}
	});
}

function createTray()
{
	tray = new Tray('logo.png');
	
	const contextMenu = Menu.buildFromTemplate([
	{
		label: 'Exit',
		click(menuItem)
		{
			force_quit = true;
			app.quit();
		}
	}]);

	tray.setContextMenu(contextMenu);
	tray.setToolTip("YouTube Music Desktop");
	
	tray.on('right-click', ()=>
	{
		tray.popUpContextMenu(contextMenu);
	});

	tray.on('double-click', ()=>
	{
		window.show();
	});
}

app.on("ready", ()=>
{
	createWindow();
	createTray();

	session.defaultSession.webRequest.onBeforeRequest((details, callback)=>
	{
		//console.log(details.url);
		callback({cancel: false}); // cancel: true
	});

	app.on('before-quit', ()=>
	{
		force_quit = true;
	});
});
