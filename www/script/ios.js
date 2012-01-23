/*
 *
 * Application Layer to simulate iOS
 * Copyright 2011 photoKandy Studios LLC
 * Portions used and modified from other sources where noted.
 * ----------------------------------------------------------
 * This code is hereby released under the Creative Commons Share-and-Share-Alike Attribution License v3.
 * This means you can freely use the code in your commercial and non-commercial applications, but you must
 * provide any changes back to the community, and you must indicate that we are the original creators.
 * -------------------------------------------------------------------------------------------------------
 *
 * The following script, ios.js, simulates some of the more basic elements in iOS for the website. Things
 * such as buttons, navbars, panels, scrolling, text shadows, borders, etc., are provided for. Orientation
 * changes are also detected and handled. Providing a left-hand sidebar for iPads while also supporting
 * iPhones is also provided.
 *
 */

// variables
var sbMenu = 0;
var sbBody = 1;
var sb = Array(); // scrollers for the various areas.
var sbAreas = Array("pnlMainArea","pnlBodyArea");

var returnTo = Array(); // stack for back-button history

var onLongPress = null; // can be used to point to long press handler
// common functions

/*
 * $ ( id )
 * --------
 * Emulate a quick jQuery $ function. Only handles IDs
 ******************************************************/
function $(id)
{
    return document.getElementById(id);
}
function allClasses(selector)
{
    return Array.prototype.slice.call(document.querySelectorAll(selector));
}

function longpress ( event )
{
    if (onLongPress)
    {
        onLongPress ( event );
    }
}

function _resetSB ( o )
{
    var refreshed = false;
    console.log ( 'Really Resetting ' + o  );
    
    if (sb[o])
    {
        try
        {
            sb[o].refresh();
            refreshed = true;
        }
        catch (e)
        {
            refreshed = false;
            sb[o].destroy();
        }
        finally
        {
            if (!refreshed)
            {
                if (sbAreas[o]!="pnlBodyArea") { sb[o] = new iScroll ( sbAreas[o] ); } else
                                               { sb[o] = new iScroll ( sbAreas[o], { longpress: function (e) { longpress(e); } } ); }
            }
        }
    }
    else
    {
                if (sbAreas[o]!="pnlBodyArea") { sb[o] = new iScroll ( sbAreas[o] ); } else
                                               { sb[o] = new iScroll ( sbAreas[o], { longpress: function (e) { longpress(e); } } ); }
    }
}

function resetSB ( o, dly )
{
    console.log ( 'Resetting ' + o + ' in ' + (dly ? dly : 125) );
    setTimeout ( function () { _resetSB (o); }, (dly ? dly : 125) );
}

function destroySB ( o )
{
    try {
        sb[o].destroy();
    }
    catch (e)
    {
        ;
    }
    finally
    {
        sb[o] = null;
    }
}

/*
 * isIPad(), isIPhone
 * ------------------
 * Returns TRUE if running on the device in question.
 *****************************************************/

function isIPad()
{
    return navigator.platform == "iPad" || window.location.href.indexOf("?ipad")>-1;
}

function isIPhone()
{
    return navigator.platform == "iPhone" || window.location.href.indexOf("?iphone")>-1;
}

/*
 * isPortrait(), isLandscape()
 * ---------------------------
 * Returns TRUE if the device is in the orientation in question.
 ***************************************************************/
function isPortrait()
{
    return window.orientation == 0 || window.orientation == 180 || window.location.href.indexOf("&portrait")>-1;
}

function isLandscape()
{
    if (window.location.href.indexOf("&landscape")>-1)
    {
        return true;
    }
    return !isPortrait();
    //return (window.orientation != 0 && window.orientation != 180) || window.location.href.indexOf("&landscape")>-1;
}

/*
 * BlockMove ( event )
 * from http://matt.might.net/articles/how-to-native-iphone-ipad-apps-in-javascript/
 * ----------------------------------------------------------------------------------
 * This ensures that Safari on iDevices will not move the window, giving away that we
 * aren't a native app.
 *************************************************************************************/
 function BlockMove(event) {
  // Tell Safari not to move the window.
/*  var t = event.target;
  for (t=event.target;t.tagName.toLowerCase()!="body";t=t.parentNode)
  {
   // alert (t.id);
    if (t.id == "pnlBodyArea" || t.id == "pnlMainArea" )
    {
        return true;
    }
  }*/
  event.preventDefault() ;
 }

/*
 * processScriptTags ( id )
 * from http://bytes.com/topic/javascript/answers/513633-innerhtml-script-tag
 * --------------------------------------------------------------------------
 * Given the element id, processes any script tags and adds them to the DOM.
 * This is necessary because just loading a page with script tags in it via
 * AJAX will not execute script. Altered by pK to support script tags with
 * src attributes.
 *****************************************************************************/
function processScriptTags ( id )
{
    var d = $(id).getElementsByTagName("script");
    
    var t = d.length
    for (var x=0;x<t;x++)
    {
        var newScript = document.createElement('script');
        newScript.type = "text/javascript";
        newScript.charset = "utf-8";
        if (d[x].src)
        {
            newScript.src = d[x].src;
        }
        else
        {
            newScript.text = d[x].text;
        }
        $(id).appendChild (newScript);
    }    
}

/*
 * updateOrientation()
 * -------------------
 * This function will check our current orientation and adjust the interface
 * if necessary by adding the device and orientation to the BODY's class.
 ****************************************************************************/
function updateOrientation()
{
    var curDevice;
    var curOrientation;
    
    curDevice = isIPad() ? "ipad" : isIPhone() ? "iphone" : "mobile";
    curOrientation = isPortrait() ? "portrait" : "landscape";
    
    $("pnlBody").setAttribute("class", curDevice + " " + curOrientation );
    
    // if we are an ipad and now in lanscape, make sure the left menu is showing!
    if (isIPad() && isLandscape())
    {
        $("menuPanel").style.display = "block";
    }
    else if (isIPad() && isPortrait()) // we are now in portrait, and the menu should go away.
    {
        $("menuPanel").style.display = "none";
    }

    // and reset our scrollers.
        setTimeout(function () {
            resetSB ( sbMenu );
            resetSB ( sbBody );
        }, 375);
    return true;
}

/* AJAX SUPPORT */
/* MODIFIED FROM http://www.tek-tips.com/viewthread.cfm?qid=1622697&page=13*/

var rootdomain="http://"+window.location.hostname

/*
 * toggleMenu()
 * ------------
 * This is used to show the #menuPanel if it is not visible, and hides it
 * if it is. This is triggered by clicking on "menu" in portrait mode.
 ************************************************************************/
function toggleMenu()
{
    var curState = $("menuPanel").style.display;
    
    if (curState != "block")
    {
        $("hideMenu").style.display = "block";
        $("menuPanel").style.display = "block";
        setTimeout(function () {
            resetSB ( sbMenu );
        }, 375);
    }
    else
    {
        $("hideMenu").style.display = "none";
        $("menuPanel").style.display = "none";
    }
    return true;
}

/*
 * showLoader()
 * ------------
 * This will display the #loader spinner
 ***************************************/
function showLoader()
{
    $("loader").style.display = "block";
    setTimeout ( function() { hideLoader();}, 10000 );
}

/*
 * hideLoader()
 * ------------
 * This will hide the #loader spinner
 ***************************************/
function hideLoader()
{
    $("loader").style.display = "none";
}

function showTabBar()
{
    $("tabBar").style.display = "block";
    $("pnlBodyArea").style.bottom = "43px";
}

function hideTabBar()
{
    $("tabBar").style.display = "none";
    $("pnlBodyArea").style.bottom = "0px";
}

function setTabBar ( s )
{
    $("tabBar").innerHTML = s;
}

/*
 * loadContent ( url, callback, animate, backTo )
 * ----------------------------------------------
 * Loads url into #pnlBodyArea using AJAX. If the url is loaded successfully,
 * we will call "callback" (usually updateMenu()), passing the url, so that
 * other parts of the interface can be updated.
 *
 * If the web request takes more than 100 milleseconds, a timeout is called
 * so that #loader is displayed. A second timeout is also set of 10 seconds
 * to prevent the #loader from being visible forever. Once the request
 * completes successfully, #loader is hidden.
 *
 * If animate is specified (either slideOut or slideIn), the animation will
 * be kicked off once content has been successfully loaded. The animation is
 * built to take .5s; content is loaded at 250ms just as the other half of
 * the animation is finishing.
 *
 * if backTo is specified, we will push the value onto the returnTo stack
 * so that the user can go back to the previous page by clicking "Back".
 * #btnBack will be automatically displayed. Whenever content is changed
 * in the future, the back button is hidden, and then re-enabled if there
 * are still items in the returnTo stack. The returnTo stack is destroyed
 * if both animate and backTo are empty, indicating the user is going
 * a new direction.
 **************************************************************************/

function loadContent(url, callback, animate, backTo) {
    var page_request = false;
    var returnValue = false;
    
    var tid = setTimeout( function() { showLoader(); }, 100 );
    setTimeout ( function() { hideLoader();}, 10000 );
    
    // Push backTo onto our returnTo stack.
    if (backTo)
    {
        returnTo.push ( backTo );
    }
    
    if (!animate && !backTo)
    {
        returnTo = Array(); // clear our history
    }

    // if we have a back button, hide it.             
    $("btnBack").style.display="none";   
    
    if (window.XMLHttpRequest) // if Mozilla, Safari etc
    {
        page_request = new XMLHttpRequest()
    }
    else if (window.ActiveXObject)
    { // if IE
        try
            {
                page_request = new ActiveXObject("Msxml2.XMLHTTP")
            }
        catch (e)
        {
            try
                {
                    page_request = new ActiveXObject("Microsoft.XMLHTTP")
                }
            catch (e)
                {
                }
        }
    }
    else return false;
    
    // set our return value (this will depend on if things work right or not)
    returnValue = false;

    // we always hide the popup menu if we're an iPad
    if (isIPad() && isPortrait())
    {
        $("menuPanel").style.display = "none";
        $("hideMenu").style.display = "none";
    }
    
    hideTabBar();
    
    // unset longpress, if set.
    onLongPress = null;


    
    page_request.onreadystatechange = function()
    {
        if (page_request.readyState == 4)
        {
        
            // at this point, we have a page; 200 means success. 
            if (window.location.href.indexOf("http")==-1 || page_request.status==200) {

                // check, animate out?
                if (animate)
                {
                    $("pnlBodyArea").style.webkitAnimation = "";
                    setTimeout ( function () { 
                    $("pnlBodyArea").style.webkitAnimation = animate + " 0.5s 1";
                    }, 0);
                }
                if (tid) clearTimeout(tid);
                hideLoader();
        
                // fill content
                setTimeout ( function () {
                    // nuke our scrollbar
                    destroySB ( sbBody );
                    // set the content
                    document.getElementById('pnlBodyArea').innerHTML = page_request.responseText;
                    // process scripts
                    processScriptTags('pnlBodyArea');
                    
                    // if we have items in the returnTo stack, show the back button
                    if (returnTo.length > 0)
                    {
                        $("btnBack").style.display="block";
                    }
                    else
                    {
                        $("btnBack").style.display="none";
                    }
                    
                    resetSB ( sbBody, 375 );                    
                }, 250 );
                returnValue = true;
            }
            
            // if we have a callback, execute it with the url, otherwise return returnValue
            if (callback)
            {
                return callback( url );
            }
            else
            {
                return returnValue;
            }
        }
        return true;
    }
    
    page_request.open('GET', url, true); //get page asynchronously
    page_request.send(null);
    
    return true;
}

/*
 * updateMainMenu ( url, title )
 * -----------------------------
 * The main menu is #grpMainMenu and should be updated to indicate the currently
 * selected page (if possible). This does so by comparing the incoming url with
 * the url in the HREF of each anchor within the group. If it matches, the item
 * is marked as SELected; otherwise the item is unselected.
 *
 * If no url match is found, all anchors will be unselected. This is okay as it
 * simply indicates that there was no main menu item that matched the incoming
 * url.
 *
 * If title is passed, #navBodyTitle will be updated to reflect the title of
 * the page; otherwise the title will be gleaned from the title attribute of
 * the selected menu item.
 *
 * This function is generally called as a callback from loadContent().
 *********************************************************************************/
function updateMainMenu( url, title )
{
    var mnu = $("grpMainMenu");
    
    // unselect any active items, while selecting the correct item based on url
    for (var o in mnu.childNodes )
    {
        var obj = mnu.childNodes[o];
        if (obj.attributes)
        {
            var objHref = obj.getAttribute("href");
            if (objHref.indexOf ( url ) >= 0)
            {   // selected!
                obj.setAttribute ("class", "navSubItem sel");
                // update the page title, if possible
                $ ("navBodyTitle").innerHTML = title ? title : obj.getAttribute("title");
            }
            else
            {   // not selected!
                obj.setAttribute ("class", "navSubItem");    
            }
            
        }
    }
    return true;
}

/*
 * loadMenu ( url, callback )
 * ----------------------------------------------
 * Loads url into #pnlMainArea using AJAX. If the url is loaded successfully,
 * we will call "callback" (usually updateMenu()), passing the url, so that
 * other parts of the interface can be updated.
 **************************************************************************/

function loadMenu(url, callback) {
    var page_request = false;
    var returnValue = false;
    
    var tid = setTimeout( function() { showLoader(); }, 100 );
    setTimeout ( function() { hideLoader();}, 10000 );    
    
    if (window.XMLHttpRequest) // if Mozilla, Safari etc
    {
        page_request = new XMLHttpRequest()
    }
    else if (window.ActiveXObject)
    { // if IE
        try
            {
                page_request = new ActiveXObject("Msxml2.XMLHTTP")
            }
        catch (e)
        {
            try
                {
                    page_request = new ActiveXObject("Microsoft.XMLHTTP")
                }
            catch (e)
                {
                }
        }
    }
    else return false;
    
    // set our return value (this will depend on if things work right or not)
    returnValue = false;

    
    page_request.onreadystatechange = function()
    {
        if (page_request.readyState == 4)
        {
        
            // at this point, we have a page; 200 means success. 
            if (window.location.href.indexOf("http")==-1 || page_request.status==200) {

                if (tid) clearTimeout(tid);
                hideLoader();
        
                // fill content
                setTimeout ( function () {
                    // nuke our scrollbar
                    destroySB ( sbMenu );
                    // set the content
                    document.getElementById('menuMain').innerHTML = page_request.responseText;
                    // process scripts
                    processScriptTags('menuMain');
                                        
                    resetSB ( sbMenu, 375 );                    
                }, 250 );
                returnValue = true;
            }
            
            // if we have a callback, execute it with the url, otherwise return returnValue
            if (callback)
            {
                return callback( url );
            }
            else
            {
                return returnValue;
            }
        }
        return true;
    }
    
    page_request.open('GET', url, true); //get page asynchronously
    page_request.send(null);
    
    return true;
}


/*
 * setPageTitle ( title )
 * ----------------------
 * Sets the content of #navBodyTitle to the title specified. If no title is passed,
 * sets it to "Home". Assumes the existence of #navBodyTitle.
 **********************************************************************************/
function setPageTitle ( title )
{
    $("navBodyTitle").innerHTML = title ? title : "Home";
}

function setSiteTitle ( title )
{
    $("navSiteTitle").innerHTML = title ? title : "My Site";
}

function setMenuTitle ( title )
{
    $("navMenuTitle").innerHTML = title ? title : "Menu";
}


/*
 * loaded()
 * --------
 * This function is called when the DOM is complete. Various initialization
 * functions will be called, including an update of our orientation.
 ***************************************************************************/
function loaded() {
    //First things first, update our orientation (we can't assume the
    //user is in any particular orientation when loading)
    
    updateOrientation();
    
    // update certain interface settings
    setMenuTitle ( myMenuName );
    setSiteTitle ( mySiteName );
    setPageTitle ( myStartName );
    
    setTimeout ( function () {
    
    // load our menu
    loadMenu ( './menu.html' );
    
    // and load our first page
    loadContent ( myStartPage, updateMainMenu);
     
    // force an update at the end to fix any display kinks.
    $("bodyPanel").style.display="block";

    resetSB ( sbMenu );
    resetSB ( sbBody );
    
    }, 300 );

}

function resetContentScrollBar ()
{
    resetSB ( sbBody );
    return true;
}
/*
 * startApp()
 * ----------
 * This function is called from the bottom of the index page in order to kick off
 * the rest of our app.
 *********************************************************************************/
function startApp ()
{
    // add a listener call "loaded" when the DOM is ready.
    window.addEventListener('load', loaded, false);
    
    // add an orientation handler so that when the user
    // rotates their device, we'll rotate with them.
    window.onorientationchange = function(){
        updateOrientation();
    };
}

/*
 *
 * processCheckBoxes()
 * -------------------
 * this function uses the iOS switches as seen on http://vxjs.org/switch.html and
 * handles their values and appearance appropriately. It must be called on all
 * pages that have checkboxes.
 *********************************************************************************/
var processCheckBoxes = function() 
{
    var checkbox;
    var objs = allClasses(".switch");
    var switchControl;
    
    for (var i=0; i<objs.length; i++)
    {
        switchControl = objs[i];                            //alert (switchControl);
        checkbox = switchControl.lastElementChild;
        var lS = checkbox.getAttribute("localStorage");
        var def= checkbox.getAttribute("default");
        if (lS)                                             //alert ("Taking stored value.");
        {
            if (!localStorage.getItem(lS))
            {                                                   //alert ("Taking default...");
                if (def) 
                {
                    localStorage.setItem(lS,def);                                   //alert ("Took Default");
                }
                else
                {
                    localStorage.setItem(lS,"off");                                 //alert ("No default. Set off.");
                }
            }
            if (localStorage.getItem(lS)=="on")  
            {
               switchControl.classList.toggle("on");        //alert ("Setting On.");
               checkbox.checked = !checkbox.checked;
            }
        }
        switchControl.addEventListener("click", function toggleSwitch() 
        {
            var checkbox = this.lastElementChild;  //alert (checkbox);
            this.classList.toggle("on");           //alert (switchControl);
            checkbox.checked = !checkbox.checked;           //alert (checkbox.checked);
            if (checkbox.getAttribute("localStorage"))
            {
                 localStorage.setItem(checkbox.getAttribute("localStorage"), checkbox.checked ? "on" : "off" );
            }
        }, false);
    }
};

var processDropDowns = function() 
{
    var objs = allClasses(".dropdown");                     //alert (objs.length);
    var ddControl;
    for (var i=0; i<objs.length; i++)
    {                                                       //alert (i);
        ddControl = objs[i];                                //alert (ddControl);
        var lS = ddControl.getAttribute("localStorage");    //alert (lS);
        var def= ddControl.getAttribute("default");         //alert (def);
        if (lS)
        {                                                   //alert ("Taking stored value");
            if (!localStorage.getItem(lS))
            {
                localStorage.setItem(lS,def);               //                        alert ("lS = def");
            }


            for (var j=0; j<ddControl.length; j++)
            {                                               //alert (i);
                if ( ddControl[j].value == localStorage.getItem(lS) )
                {                                           //alert (ddControl[i].value);
                    ddControl.selectedIndex = j;            //alert ("Set index.");
                }
            }
        }
        //alert (i);
        ddControl.addEventListener("change", function changeSelection() 
        {
            if (this.getAttribute("localStorage"))
            {   
                localStorage.setItem(this.getAttribute("localStorage"), this.value );
            }
        }, false);
        //alert (i);
    }
};

/**
 * ScrollFix v0.1
 * http://www.joelambert.co.uk
 *
 * Copyright 2011, Joe Lambert.
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var ScrollFix = function(elem) {
	// Variables to track inputs
	var startY, startTopScroll;

	elem = elem || document.querySelector(elem);

	// If there is no element, then do nothing	
	if(!elem)
		return;

	// Handle the start of interactions
	elem.addEventListener('touchstart', function(event){
		startY = event.touches[0].pageY;
		startTopScroll = elem.scrollTop;

		if(startTopScroll <= 0)
			elem.scrollTop = 1;

		if(startTopScroll + elem.offsetHeight >= elem.scrollHeight)
			elem.scrollTop = elem.scrollHeight - elem.offsetHeight - 1;
	}, false);
   
};
