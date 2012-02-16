/**
 * @file        ios.js
 * @author      Kerri Shotts <kerrishotts@gmail.com>
 * @version     2012.01.26.2149
 *
 * @section LICENSE
 * Copyright 2011 photoKandy Studios LLC
 * This code is hereby released under the Creative Commons Share-and-Share-Alike Attribution License v3.
 * This means you can freely use the code in your commercial and non-commercial applications, but you must
 * provide any changes back to the community, and you must indicate that we are the original creators.
 *
 * @section DESCRIPTION
 *
 * Application Layer to simulate iOS
 * Portions used and modified from other sources where noted.
 *
 * The following script, ios.js, simulates some of the more basic elements in iOS for the website. Things
 * such as buttons, navbars, panels, scrolling, text shadows, borders, etc., are provided for. Orientation
 * changes are also detected and handled. Providing a left-hand sidebar for iPads while also supporting
 * iPhones is also provided.
 *
 */


/**
 *
 * Global Variables (consider them internal. Some are useful. Some aren't intended to be used.)
 *
 */

var consoleLogging = true;                                          // PUBLIC
 
var currentPageURL;                                                 // PUBLIC
var currentContainer;
var otherContainer;
var usingTabBar = false;

var menuVisible = false;                                            // PUBLIC: If true, the menu is visible.

// Popovers //
var lastpo;                                                         // PRIVATE: last popover, if any

// Scrolling //
var sbMenu = 0;                                                     // PUBLIC:  # for Menu's Scroller
var sbBody = 1;                                                     // PUBLIC:  # for Body's Scroller
var sb = Array();                                                   // PUBLIC:  scrollers for the various areas.
var sbAreas = Array("pnlMainArea","pnlBodyArea");                   // PUBLIC:  scroller's associated elements
var sbScrolling = Array(false, false);                              // PUBLIC:  indicate if a scroller is scrolling.

// Back-button History//
var returnTo = Array();                                             // PRIVATE: stack for back-button history

// Query-Line Parsing //
var argsParsed = {};                                                // PUBLIC:  arguments passed to any page 

// Event Handlers //
var onLongPress = null;                                             // PUBLIC: can be used to point to long press handler
var onSearch = null;                                                // PUBLIC: called when the search box text changes
var onSwipe = defaultSwipe;                                         // PUBLIC: called when a swipe occurs
var onPageNext = null;                                              // PUBLIC: called when a page swipe occurs
var onPagePrev = null;                                              // PUBLIC: called when a page swipe occurs

/**
 *
 * "Fast Buttons" / Ghost Click Buster.
 * Based on http://code.google.com/intl/en/mobile/articles/fast_buttons.html
 * 
 *
 */
//
// START CLICKBUSTER
//

var clickPointX = Array();                                          // PRIVATE:  last X coordinate of a touch
var clickPointY = Array();                                          // PRIVATE:  last Y coordiante of a touch

/**
 *
 * add a click to the clickPointX/Y array. if nopop is specified, no timeout is set to clear the click.
 *
 * @param x     x-coordinate
 * @param y     y-coordinate
 * @param nopop if not specified, or FALSE, the coordinate is removed from the array after 5s. if TRUE, remains
 *              there forever.
 */ 
function addClick ( x, y, nopop )
{
    clickPointX.push (x);
    clickPointY.push (y);
    if (!nopop)
    {
        setTimeout (popClick, 5000)
    }
}

/**
 *
 * Removes the first item off the clickPointX/Y array.
 *
 */
function popClick ()
{
    clickPointX.splice(0,1);
    clickPointY.splice(0,1);
}

/**
 *
 * Determines if a click is within 15 pixels of a previous click in the clickPointX/Y array.
 * If it is, it is added to via addClick. Returns TRUE if the click SHOULD BE IGNORED;
 * false if it is not to be ignored.
 *
 * @param x     x-coordinate
 * @param y     y-coordinate
 * @param nopop no use here; passed on to addclick
 *
 */
function ignoreClick (x, y, nopop)
{
    for (var i=0;i<clickPointX.length;i++)
    {
        var testX = clickPointX[i];
        var testY = clickPointY[i];
        if ( ( Math.abs(x - testX) < 15 ) && ( Math.abs(y - testY) < 15 ) )
        {
            return true;
        }
    }
    addClick (x, y, nopop);
    return false;
}

/**
 *
 * Attached to the document in order to prevent duplicate clicks from occuring.
 * iOS' webkit has a nasty habit of throwing duplicate onClick events. Not good.
 *
 * Also prevents (or tries to) a click if the scrollers are in movement.
 */
function clickBuster (event)
{
    if (consoleLogging) { console.log ("Clicked " + event.clientX + ", " + event.clientY ); }
    if (ignoreClick(event.clientX, event.clientY) || isScrolling())
    {
        if (consoleLogging) { console.log ("... and ignored it."); }
        setTimeout ( function() { sbScrolling=Array(false, false);  }, 1000 );
        event.stopPropagation();
        event.preventDefault();
    }
}

document.addEventListener ( 'click', clickBuster, true );

//
// END CLICKBUSTER
//


/**
 *
 * Parses the arguments in url (similar to parsing a query string).
 * One bug: doesn't seem to catch the first parameter after a ?
 * so use something like ?ignore&parms...
 * TODO: Fix that.
 *
 * @source      http://stackoverflow.com/a/7826782
 *
 * @param url   url containing query string.
 *
 */
function parseArgs( url )
{
    var args = url.substring(1).split('&');

    argsParsed = {};

    for (i=0; i < args.length; i++)
    {
        arg = unescape(args[i]);

        if (arg.indexOf('=') == -1)
        {
            argsParsed[arg.trim()] = true;
        }
        else
        {
            kvp = arg.split('=');
            argsParsed[kvp[0].trim()] = kvp[1].trim();
        }
    }
}

/*
 * $ ( id )
 * --------
 * Emulate a quick jQuery $ function. Only handles IDs
 ******************************************************/

/**
 *
 * $ emulates jQuery's $ function, with a caveat: only handles IDs, nothing else.
 *
 * If you are using jQuery, be sure to nuke this particular function.
 *
 * @param id    id of element
 *
 */
function $(id)
{
    return document.getElementById(id);
}

/**
 *
 * allClasses returns an array of elements matching selector. Similar to $$.
 *
 * @param selector      selector to query for
 *
 */
function allClasses(selector)
{
    return Array.prototype.slice.call(document.querySelectorAll(selector));
}

/**
 *
 * Determines if the onLongPress event handler exists, and if so, calls it.
 *
 * @param event     the event triggering the longpress; passed to the event handler.
 *
 */
function longpress ( event )
{
    if (onLongPress)
    {
        onLongPress ( event );
    }
}

/**
 *
 * If there is an onSearch event handler, call it.
 *
 */
function doSearch ()
{
    if (onSearch)
    {
        onSearch();
    }
}

//
// BEGIN SCROLLING STUFF
//
var scrollingTimeout;
function handleScrolling ( me, e, scrolling )
{
    // first, set who is or is not scrolling.
    if (scrolling)
    {
        sbScrolling[me.whichScrollerAmI] = scrolling;
    }
    else
    {
        // reset me in a few ms.
        if (scrollingTimeout)
        {
            clearTimeout (scrollingTimeout);
        }
        scrollingTimeout = setTimeout ( function() { 
            sbScrolling[me.whichScrollerAmI] = false;
        }, 1000 );
    }
    
    try
    {
        if (scrolling)
        {
            //addClick(window.event.touches[0].clientX, window.event.touches[0].clientY);
        }
    }
    catch (except)
    {
        ;
    }
    finally
    {
        ;
    }
    // next, do we have an event? if so, add it as a click
    if (e)
    {
        if (consoleLogging) { console.log ( e ); }
        addClick(e.touches[0].clientX, e.touches[0].clientY);
    }
    
    // furthermore, set up a timer to say we aren't scrolling anymore in 5s.
    //setTimeout ( function() { sbScrolling = Array(false, false); }, 5000);

}

/**
 *
 * _resetSB is intended for internal use only. See resetSB.
 *
 * @param o     an index to sb[] indicating which scroll bar to reset.
 *
 */
function _resetSB ( o )
{
    var refreshed = false;
    
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
                if (sbAreas[o]!="pnlBodyArea") { sb[o] = new iScroll ( sbAreas[o], { hScrollbar: false, vScrollbar: false, 
                                                                                     onScrollMove: function(me) {handleScrolling(this,null, true);},
                                                                                     onScrollEnd:  function(me) {handleScrolling(this,null, false);}, 
                                                                                     zonTouchEnd:  function(me) {handleScrolling(this,null, false);} 
                                                                                    } ); } else
                                               { sb[o] = new iScroll ( sbAreas[o], { hScrollbar: false, vScrollbar: false, 
                                                                                     onScrollMove: function(me) {handleScrolling(this,null, true);},
                                                                                     onScrollEnd:  function(me) {handleScrolling(this,null, false);},
                                                                                     zonTouchEnd:  function(me) {handleScrolling(this,null, false);}, 
                                                                                     longpress: function (e) { longpress(e); } } ); }
            }
        }
    }
    else
    {
                if (sbAreas[o]!="pnlBodyArea") { sb[o] = new iScroll ( sbAreas[o], { hScrollbar: false, vScrollbar: false, 
                                                                                     onScrollMove: function(me) {handleScrolling(this,null, true);},
                                                                                     onScrollEnd:  function(me) {handleScrolling(this,null, false);}, 
                                                                                     zonTouchEnd:  function(me) {handleScrolling(this,null, false);} 
                                                                                    } ); } else
                                               { sb[o] = new iScroll ( sbAreas[o], { hScrollbar: false, vScrollbar: false, 
                                                                                     onScrollMove: function(me, e) {handleScrolling(this,null, true);},
                                                                                     onScrollEnd:  function(me) {handleScrolling(this,null, false);},
                                                                                     zonTouchEnd:  function(me) {handleScrolling(this,null, false);}, 
                                                                                     longpress: function (e) { longpress(e); } } ); }
    }
    sb[o].whichScrollerAmI = o;
}

/**
 *
 * resetSB will reset the desired scrollbar after the given delay. If no delay is supplied,
 * a standard delay of 125ms is used.
 *
 * @param o     An index to sb[] indicating which scrollbar to reset. Typically sbMenu or sbBody.
 *
 */
function resetSB ( o, dly )
{
    setTimeout ( function () { _resetSB (o); }, (dly ? dly : 125) );
}
 

/**
 *
 * destroySB will try to destroy the desired scrollbar. Regardless of the success,
 * the array item (marked by o) is reset to null.
 *
 * @param o     index to sb[]. Typically sbMenu or sbBody.
 *
 */
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

/**
 *
 * resets the content (sbBody) scrollbar.
 *
 */
function resetContentScrollBar (dly)
{
    resetSB ( sbBody,dly );
    return true;
}

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


//
// END SCROLLING STUFF
//

/**
 *
 * isIPad() returns TRUE if the device is an iPad; FALSE if not.
 *
 */
function isIPad()
{
    return navigator.platform == "iPad" || window.location.href.indexOf("?ipad")>-1;
}

/**
 *
 * isIPhone() returns TRUE if the device is an iPhone; FALSE if not.
 *
 */
function isIPhone()
{
    return navigator.platform == "iPhone" || window.location.href.indexOf("?iphone")>-1;
}

/**
 *
 * isPortrait returns TRUE if the device's orientation is PORTRAIT; FALSE if not.
 *
 */
function isPortrait()
{
    return window.orientation == 0 || window.orientation == 180 || window.location.href.indexOf("&portrait")>-1;
}

/**
 *
 * isLandscape returns TRUE if the device's orientation is LANDSCAPE; FALSE if not.
 *
 */
function isLandscape()
{
    if (window.location.href.indexOf("&landscape")>-1)
    {
        return true;
    }
    return !isPortrait();
}

/**
 * BlockMove ( event )
 * @source http://matt.might.net/articles/how-to-native-iphone-ipad-apps-in-javascript/
 *
 * This ensures that Safari on iDevices will not move the window, giving away that we
 * aren't a native app.
 *
 * @event       event to block
 *
 */
 
 function BlockMove(event) {
  // Tell Safari not to move the window.
  event.preventDefault() ;
                                    // this was from a good idea. Might still come in handy down the road.
                                    /*  var t = event.target;
                                      for (t=event.target;t.tagName.toLowerCase()!="body";t=t.parentNode)
                                      {
                                       // alert (t.id);
                                        if (t.id == "pnlBodyArea" || t.id == "pnlMainArea" )
                                        {
                                            return true;
                                        }
                                      }*/
 }

/**
 * processScriptTags ( id )
 * @source http://bytes.com/topic/javascript/answers/513633-innerhtml-script-tag
 * 
 * Given the element id, processes any script tags and adds them to the DOM.
 * This is necessary because just loading a page with script tags in it via
 * AJAX will not execute script. Altered by pK to support script tags with
 * src attributes.
 *
 * @param id        id to attach the script tags to.
 *
 */
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

/**
 * updateOrientation()
 * 
 * This function will check our current orientation and adjust the interface
 * if necessary by adding the device and orientation to the BODY's class.
 *
 */
function updateOrientation()
{
    var curDevice;
    var curOrientation;
    
    curDevice = isIPad() ? "ipad" : isIPhone() ? "iphone" : "mobile";
    curOrientation = isPortrait() ? "portrait" : "landscape";
    
    $("pnlBody").setAttribute("class", curDevice + " " + curOrientation );
    
    /*
    // if we are an ipad and now in lanscape, make sure the left menu is showing!
    if (isIPad() && isLandscape())
    {
        $("menuPanel").style.display = "block";
    }
    else if (isIPad() && isPortrait()) // we are now in portrait, and the menu should go away.
    {
        $("menuPanel").style.display = "none";
    }
    */

    // and reset our scrollers.
        setTimeout(function () {
            resetSB ( sbMenu );
            resetSB ( sbBody );
        }, 375);
    return true;
}

/**
 * toggleMenu()
 * 
 * This is used to show the #menuPanel if it is not visible, and hides it
 * if it is. This is triggered by clicking on "menu" in portrait mode.
 */
function toggleMenu()
{
    menuVisible = !menuVisible;     // invert our menu state.
    if (menuVisible)
    {
        showMenu()
    }
    else
    {
        hideMenu();
    }
    return true;
}

function hideMenu ()
{
    menuVisible = false;
    $("menuPanel").style.left = "-324px";
}

function showMenu ()
{
    menuVisible = true;
    $("menuPanel").style.left = "0px";
    setTimeout(function () {
        resetSB ( sbMenu );
    }, 375);
}

function defaultSwipe ( e )
{
//TODO: handle iPhone here
// if the menu is visible, the swipe should probably /always/ go to the menu
 if (e.x < 360 || menuVisible )
 {
    if (e.direction == "left")
    {
        if (menuVisible)
        {
            hideMenu();
        }
        else
        {
            if (onPageNext) { onPageNext(); }
        }
    }
    if (e.direction == "right")
    {
        if (!menuVisible)
        {
            showMenu();
        }
        else
        {
            if (onPagePrev) { onPagePrev(); }
        }
    }
  }
  else
  {
    if (e.direction == "left")
    {
        if (onPageNext)
        {
            onPageNext();
        }
    }
    else
    {
        if (onPagePrev)
        {
            onPagePrev();
        }
    }
  }
}

/**
 * showLoader()
 *
 * This will display the #loader spinner
 */
function showLoader()
{
    $("loader").style.display = "block";
    setTimeout ( function() { hideLoader();}, 10000 );
}

/**
 * hideLoader()
 *
 * This will hide the #loader spinner
 */
function hideLoader()
{
    $("loader").style.display = "none";
}

/**
 *
 * showTabBar() will display the tab bar for the content area.
 *
 */
function showTabBar()
{
    $("tabBar").style.display = "block";
    $("pnlBodyArea").style.bottom = "51px";
}

/**
 *
 * hideTabBar() will hide the tab bar for the content area.
 *
 */
function hideTabBar()
{
    $("tabBar").style.display = "none";
    $("pnlBodyArea").style.bottom = "0px";
}

/**
 *
 * setTabBar will set the Tab Bar's HTML code to the supplied string.
 *
 * @param s     html code that should be inside the tab bar
 *
 */
function setTabBar ( s )
{
    $("tabBar").innerHTML = s;
}

/**
 * showPopover displays the popover named e at coordinates x,y. If
 * the popover would go offscreen, the coordinates are adjusted.
 *
 * @param e     popover element
 * @param x     x-coordinate
 * @param y     y-coordinate
 *
 */
function showPopOver ( e, x, y )
{
    // if we have a previous popover, hide it.
    if (lastpo)
    {
        $(lastpo).style.display = "hidden";
    }
    
    addClick (x, y); // to prevent spurious hiding of this popover.
    // set lastpo to this one
    lastpo = e;
    
    // get the popover and coords
    var po = $(e);
    po.style.display = "block";

    var newY = y-28;
    var newX = (x - 48 - (isLandscape() ? 321 : 0));
    var newH = 0 + po.offsetHeight; //alert (newH);
    var newW = 236; // currently popovers are 236w
    // now try prevent the popover from going out-of-bounds
    if ( isLandscape() && isIPad() )
    {
        if (newX + newW > 703) { newX = 703-newW; }
        if (newY + newH > 670) { newY = 670-newH; }
    }
    // TODO: isPortrait & isiPad.
    
    // set position and display
    po.style.top = newY + "px";
    po.style.left =  newX + "px";
    
    // and show the transparent div that will kill the popover if clicks occur elsewhere.
    $("hidePopOver").style.display = "block";
}

/**
 * hidePopover hides the last displayed popover (via lastpo).
 *
 */
function hidePopOver ()
{
                    // this code was used before clickbuster. Might still make a comeback.
/*    if ( window.event.clientX && ignoreClick ( window.event.clientX, window.event.clientY ) )
    {
        return false; // we're too close to a click; ignore this request.
    }
 */
    if (lastpo)
    {
        $(lastpo).style.display = "none";
        lastpo=null;
    }
    if ($("hidePopOver"))
    {
        $("hidePopOver").style.display = "none";
    }
}

function showSearch(callback)
{
    if (callback)
    {
        onSearch = callback;
    }
    $("theSearch").style.display = "block";
}

function hideSearch()
{
    onSearch = null;
    $("theSearch").style.display = "none";
}

//
// AJAX SUPPORT
// MODIFIED FROM http://www.tek-tips.com/viewthread.cfm?qid=1622697&page=13*/
//

var rootdomain="http://"+window.location.hostname

/**
 * loadContent ( url, callback, animate, backTo )
 * 
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
 *
 * @param url           the address to load
 * @param callback      the function to call when loading is complete
 * @param animate       the animation (if desired)
 * @param backTo        the address to return back to when BACK is pressed.
 *
 */

function loadContent(url, callback, animate, backTo) {
    var page_request = false;
    var returnValue = false;
    var y = 0;
    
    // set up a timeout to show our loader if no content received in 100ms
    var tid = setTimeout( function() { showLoader(); }, 100 );                      //console.log ("784");
    
    // also set up a timeout to hide the loader in 10s no matter what happens
    setTimeout ( function() { hideLoader();}, 10000 );                              //console.log ("788");
    
    // Push backTo onto our returnTo stack.
    if (backTo)
    {
        returnTo.push ( backTo );
    }                                                                               
                                                                                    //console.log ("795");
    if (!animate && !backTo)
    {
        returnTo = Array(); // clear our history
    }                                       
                                                                                    //console.log ("800");
    // if we have a back button, hide it.             
    $("btnBack").style.display="none";   
                                                                                    //console.log ("803");
    if (window.XMLHttpRequest) // if Mozilla, Safari etc
    {
        page_request = new XMLHttpRequest();
    }
    else return false;  
                                                                                    //console.log ("809");
    // set our return value (this will depend on if things work right or not)
    returnValue = false;
                                                                                    //console.log ("812");
/*
    // we always hide the popup menu if we're an iPad
    if (isIPad() && isPortrait())
    {
        $("menuPanel").style.display = "none";
        $("hideMenu").style.display = "none";
    }
 */
    hideMenu();
                                                                                    //console.log ("819");
    if (!usingTabBar) {  hideTabBar(); }
                                                                                    //console.log ("821");
    // unset longpress, if set.
    onLongPress = null;
    onSwipe = defaultSwipe;
    onPageNext = null;
    onPagePrev = null;
                                                                                    //console.log ("824");
    // no more popover, either:
    lastpo = null;
                                                                                    //console.log ("827");
    // position otherContent in the appropriate place
    otherContainer.style.left = "0";
    if (animate)
    {
        otherContainer.style.position = "absolute";
        y = (sb[sbBody].y);
        otherContainer.style.top = "" + (-y) + "px";   // so we can scroll horizontally first
        $("outerContainer").style.webkitTransition = "left,-webkit-transform 0.5s ease-in-out";

        if (animate == "slideBack") { otherContainer.style.left = "-100%"; }
        if (animate == "slideOut")  { otherContainer.style.left = "100%"; }
    }
    else
    {
        currentContainer.innerHTML = "";    // can't have overlaying content, can we.
    }
                                                                                    //console.log ("839");
    page_request.onreadystatechange = function()
    {
        if (page_request.readyState == 4)
        {
        
            // at this point, we have a page; 200 means success. 
            if (window.location.href.indexOf("http")==-1 || page_request.status==200) {

                
                // clear our showloader timer
                if (tid) clearTimeout(tid);
                
                    if (consoleLogging) { console.log ('Loaded Content:' + url); }
                currentPageURL = url;
                parseArgs(url);
        
                // fill content
//                setTimeout ( function () {
                    // nuke our scrollbar
                    destroySB ( sbBody );

                    // nuke the search handler
                    onSearch = null;
                    hideSearch();                    

                    // set the content
                    otherContainer.innerHTML = page_request.responseText;
                    // process scripts
                    processScriptTags(otherContainer.getAttribute("id"));
                    hideLoader();
                    
                    var tempContainer;
                    tempContainer = otherContainer;
                    otherContainer = currentContainer;
                    currentContainer = tempContainer;
                    
                    // check, animate out?
                    if (animate)
                    {
                        $("outerContainer").style.webkitTransform = "translate3d(" + ( 100 * ( (animate=="slideOut" ? -1 : 1) )) + "%,"+ y + "px,0)";
                        setTimeout ( function() 
                                     {
                                          $("outerContainer").style.webkitTransition = "";
                                          currentContainer.style.left = "0";
                                          currentContainer.style.top = "0";
                                          $("outerContainer").style.webkitTransform = "translate3d(0,0,0)";
                                          currentContainer.style.position = "relative";
                                          otherContainer.style.left = "100%";
                                          otherContainer.innerHTML = "";

                                     }, 625 );
                        resetSB ( sbBody, 750 );
                    }

                    // if we have items in the returnTo stack, show the back button
                    if (returnTo.length > 0)
                    {
                        $("btnBack").style.display="block";
                    }
                    else
                    {
                        $("btnBack").style.display="none";
                    }
                    
                    if (!animate) { resetSB ( sbBody, 250 );                    }
//                }, (animate) ? 325 : 250 );
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

/**
 * updateMainMenu ( url, title )
 * 
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
 *
 * @param url   the incoming url
 * @param title the title of the body area.
 *
 */
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
    
    //if (usingTabBar)
    //{
    //    updateTabBar ( url, title );
    //}
    return true;
}

function updateMainMenuandTabBar ( url, title)
{
    try
    {
        updateMainMenu ( url, title );
    }
    catch (e)
    {
        ;
    }
    finally
    {
        ;
    }
    
    try
    {
        updateTabBar ( url, title );
    }
    catch (e)
    {
        ;
    }
    finally
    {
        ;
    }
}

/**
 * loadMenu ( url, callback )
 * 
 * Loads url into #pnlMainArea using AJAX. If the url is loaded successfully,
 * we will call "callback" (usually updateMenu()), passing the url, so that
 * other parts of the interface can be updated.
 *
 * @param url       the address of the menu
 * @param callback  the callback function, if desired.
 */

function loadMenu(url, callback) {
    var page_request = false;
    var returnValue = false;
    
    var tid = setTimeout( function() { showLoader(); }, 100 );
    setTimeout ( function() { hideLoader();}, 10000 );    
    
    page_request = new XMLHttpRequest()
    
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

/**
 * updateTabBar ( url, title )
 * 
 * The main menu is #grpTabBar and should be updated to indicate the currently
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
 *
 * @param url   the incoming url
 * @param title the title of the body area.
 *
 */
function updateTabBar( url, title )
{
    var mnu = $("grpTabBar");
    
    // unselect any active items, while selecting the correct item based on url
    for (var o in mnu.childNodes )
    {
        var obj = mnu.childNodes[o];
        if (obj.attributes)
        {
            var objHref = obj.getAttribute("href");
            if (objHref.indexOf ( url ) >= 0)
            {   // selected!
                obj.setAttribute ("class", "barItem sel");
                // update the page title, if possible
                $ ("navBodyTitle").innerHTML = title ? title : obj.getAttribute("title");
            }
            else
            {   // not selected!
                obj.setAttribute ("class", "barItem");    
            }
            
        }
    }
    //if (usingTabBar)
    //{
    //    updateMainMenu ( url, title );
    //}
    return true;
}



/**
 * loadTabBar ( url, callback )
 * 
 * Loads url into #tabBar using AJAX. If the url is loaded successfully,
 * we will call "callback" (usually updateTabs()), passing the url, so that
 * other parts of the interface can be updated.
 *
 * @param url       the address of the tabbar
 * @param callback  the callback function, if desired.
 */

function loadTabBar(url, callback) {
    var page_request = false;
    var returnValue = false;
    
    page_request = new XMLHttpRequest()
    
    // set our return value (this will depend on if things work right or not)
    returnValue = false;
    
    page_request.onreadystatechange = function()
    {
        if (page_request.readyState == 4)
        {
        
            // at this point, we have a page; 200 means success. 
            if (window.location.href.indexOf("http")==-1 || page_request.status==200) {

                // fill content
                setTimeout ( function () {
                    // nuke our scrollbar
                    destroySB ( sbMenu );
                    // set the content
                    document.getElementById('tabBar').innerHTML = page_request.responseText;
                    // process scripts
                    processScriptTags('tabBar');
                    if (usingTabBar)
                    {
                        showTabBar();
                    }
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


/**
 * setPageTitle ( title )
 *
 * Sets the content of #navBodyTitle to the title specified. If no title is passed,
 * sets it to "Home". Assumes the existence of #navBodyTitle.
 *
 * @param title     Page Title
 */
function setPageTitle ( title )
{
    $("navBodyTitle").innerHTML = title ? title : "Home";
}

/**
 * setSiteTitle sets the #navSiteTitle to the title specified. If no title is passed,
 * the default is "My Site".
 *
 * @param title     Site Title
 */
function setSiteTitle ( title )
{
    $("navSiteTitle").innerHTML = title ? title : "My Site";
}

/**
 * setMenuTitle sets the #navMenuTitle to the title specified. If no title is passed,
 * the default is "Menu"
 *
 * @param title     Menu Title
 */
function setMenuTitle ( title )
{
    $("navMenuTitle").innerHTML = title ? title : "Menu";
}


/**
 * loaded()
 * 
 * This function is called when the DOM is complete. Various initialization
 * functions will be called, including an update of our orientation.
 */
 
function loaded() {
    //First things first, update our orientation (we can't assume the
    //user is in any particular orientation when loading)
    
    updateOrientation();
    
    // update certain interface settings
    setMenuTitle ( myMenuName );
    setSiteTitle ( mySiteName );
    setPageTitle ( myStartName );
    
    currentContainer = $("container1");
    otherContainer   = $("container2");
    
    setTimeout ( function () {
    
    // load our menu
    loadMenu ( './menu.html' );
    
    // if we have a tab bar defined, load it too.
    if (myTabBar)
    {
        loadTabBar ( myTabBar );
        usingTabBar = true;
    }
    
    // and load our first page
    loadContent ( myStartPage, updateMainMenu);
     
    // force an update at the end to fix any display kinks.
    $("bodyPanel").style.display="block";

    resetSB ( sbMenu );
    resetSB ( sbBody );
    
    }, 300 );
    


}


/**
 * startApp()
 * 
 * This function is called from the bottom of the index page in order to kick off
 * the rest of our app.
 */
function startApp ()
{
    // add a listener call "loaded" when the DOM is ready.
    //window.addEventListener('load', loaded, false);
    loaded();
    
    addSwipeListener(document.body, function(e) { 
                                                  if (onSwipe) 
                                                  { 
                                                    onSwipe(e); 
                                                  }
                                                } );
    
    // add an orientation handler so that when the user
    // rotates their device, we'll rotate with them.
    window.onorientationchange = function(){
        updateOrientation();
    };
}

/**
 *
 * processCheckBoxes()
 * 
 * @source http://vxjs.org/switch.html
 *
 * this function uses the iOS switches as seen on http://vxjs.org/switch.html and
 * handles their values and appearance appropriately. It must be called on all
 * pages that have checkboxes.
 */
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

/**
 *
 * processDropDowns()
 * 
 * @inspiration http://vxjs.org/switch.html
 *
 * this function adds code to all dropdowns on the page to handle storing their values
 * to localStorage ( and retrieving them for display ).
 *
 */

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
 * getWordFromPoint returns the word under the given x,y coords.
 * @source http://stackoverflow.com/questions/3855322/how-to-get-word-under-cursor
 */
function getHitWord(hit_elem,x,y,dothework) {
var hit_word = '';
var dtw = false;
if (dothework)
{
    dtw = true;
}
//                                                        console.log ('862');
//text contents of hit element
var text_nodes = hit_elem.childNodes;
//                                                        console.log ('867');
//bunch of text under cursor? break it into words
if (text_nodes.length > 0) {
  var original_content = hit_elem.innerHTML;
//                                                        console.log ('871');
  //wrap every word in every node in a dom element
   //                                                     console.log ( dtw );
if (dtw==true) 
{  
  hit_elem.innerHTML = hit_elem.textContent.replace(/([^\s\.\,\?\!\-\:\;\(\)\`]*)/g, "<word>$1</word>"); 
}
 //                                                       console.log ( hit_elem.innerHTML );
  //get the exact word under cursor
  var hit_word_elem = document.elementFromPoint(x, y);
//                                                        console.log ('879');
  if (hit_word_elem.nodeName != 'WORD' && hit_word_elem.parentNode.nodeName != 'WORD') {
        if (consoleLogging) { console.log("missed!");}
  }
  else  {
    hit_word = hit_word_elem.textContent;
        if (consoleLogging) { console.log("got it: "+hit_word); }
  }
//                                                        console.log ('887');
if (dtw==true) {  hit_elem.innerHTML = original_content;}
}
//                                                        console.log ('890');
return hit_word;
}

/*
 * getWordFromPoint will attempt to return the word underneth the given x,y coords.
 *
 * @param x     x-coordinate
 * @param y     y-coordinate
 */
function getWordFromPoint (x, y, dothework)
{
        if (consoleLogging) { console.log ("Trying to get word at " + x + ", " + y); }
      return getHitWord(document.elementFromPoint(x, y),x,y,dothework);
}

//
// phoneGap stuff
//

/**
 * openWebPage opens a childbrowser with the specified url.
 *
 * @param url   web address
 */
function openWebPage ( url )
{
    PhoneGap.exec ("ChildBrowserCommand.showWebPage", url );
    return false;
}

//
// localStorage loading & saving
//
// Turns out that under iOS 5.1 (b3), the localStorage is stored in a vulnerable location.
// So, we need to ensure that the settings are consistently loaded at app startup and saved
// again at periodic times. The main app will continue to use localStorage as if nothing
// is wrong, but these functions will load and save the data to persistent storage.
//
// Author: Kerri Shotts, photoKandy Studios LLC. License: MIT.
//
// v2
//
// Added: documentation and functions to deal with non-periodic sync

/**************************************************************************
 *
 * persistent storage for localStorage (phonegap / iOS)
 *
 * These functions simply copy the data in localStorage to a persistent
 * location in the documents folder named localStorage.dat. The format is
 * pretty simple: each item is separated by [EOK], whilst the key/value is
 * separated by [EQ]. Therefore, this is easy to break (have a key/value
 * with one of these values...), but it works for my present needs.
 *
 * The persistentStorage object stores the read/write functions and can be
 * used by calling the saveLocalStorage and loadLocalStorage functions.
 *
 * By default, the routine saves data to localStorage.dat at the rate of
 * 30 seconds. If this is not desired, syncLocalStorageInterval should be
 * reset to 0 prior to the next call to saveLocalStorage(), at which point
 * the continuous saving will be stopped. At that point, it is up to you
 * to call saveLocalStorage() manually.
 *
 */
 
/**
 *
 * syncLocalStorageInterval defines the length of time before another
 * save operation can be started. 30000 = 30s. 
 * If you wish to disable the periodic save, set this to 0.
 *
 */
var syncLocalStorageInterval = 30000;

/**
 *
 * The persistentStorage function contains the functions necessary
 * to read from and save to the localStorage.dat file in the documents
 * directory.
 *
 */
var persistentStorage = function()
{
    // Get self so we don't have to be funny when a timeout calls us...
    var self = this;
    
    /**
     * Called when the filesystem is successfully returned. Will attempt to get "localStorage.dat"
     * access (and create it if necesssary).
     */
    self.gotFStoWrite = function (fileSystem)
    {
        fileSystem.root.getFile("localStorage.dat", {create: true, exclusive: false}, self.gotFileEntrytoWrite, self.fail);
    }
    
    /**
     *
     * Called when the filesystem is successfully returned. It will attempt to open "localStorage.dat" for
     * read-only access.
     */
    self.gotFStoRead = function (fileSystem)
    {
        fileSystem.root.getFile("localStorage.dat", null, self.gotFileEntrytoRead, self.fail);
    }
    
    /**
     *
     * Called when localStorage.dat is obtained for writing. It will create a fileWriter
     * which will actually write the contents of localStorage.
     */
    self.gotFileEntrytoWrite = function (fileEntry)
    {
        fileEntry.createWriter (self.gotFileWriter, self.fail);
    }

    /**
     *
     * Called when localStorage.dat is obtained for reading. It will create a fileReader
     * which will read the contents of the file into localStorage.
     */
    self.gotFileEntrytoRead = function (fileEntry)
    {
        fileEntry.file (self.gotFileReader, self.fail);
    }
    
    /**
     *
     * Called when the file localStorage.dat is successfully opened for reading.
     * Parses the file by splitting it into key/value pairs, and then splitting
     * those pairs into the key and the value. It then saves them to localStorage
     * using localStorage.setItem(). 
     *
     * NOTE: localStorage is /not/ cleared when this file is loaded.
     */
    self.gotFileReader = function (file)
    {
        var reader = new FileReader();
        reader.onloadend = function (evt) { 
            if (consoleLogging) { console.log ("Syncing localStorage from persistent store."); }
            var ls = evt.target.result.split("[EOK]");
            for (var i=0;i<ls.length;i++)
            {
                var kv = ls[i].split("[EQ]");
                localStorage.setItem ( kv[0], kv[1] );
            }
            if (consoleLogging) { console.log ("Sync complete."); }
            if (self.readCallback)
            {
                self.readCallback();
            }
        };
        reader.readAsText (file);
    }

    /**
     *
     * Called when localStorage.dat is open for writing and created if necessary.
     * Writes out each value in localStorage as a key/value pair.
     */
    self.gotFileWriter = function (writer)
    {
        if (consoleLogging) { console.log ("Syncing localStorage to persistent store."); }
        
        var s = "";
        
        for (var i=0; i<localStorage.length; i++)
        {
            var key = localStorage.key(i);
            var value = localStorage[key];
            s = s + key + "[EQ]" + value + "[EOK]";
        }
        writer.write ( s );
        
        if (consoleLogging) { console.log ("Sync Complete."); }
        
        if (self.writeCallback)
        {
            self.writeCallback();
        }
    }

    /**
     *
     * If an error should occur during a read or write operation,
     * we will display the error. If a readCallback() is defined,
     * call it.
     */
    self.fail = function (error)
    {
        console.log ("Error: " + error.code);
            if (self.readCallback)
            {
                self.readCallback();
            }
    }

    /**
     *
     * Kicks off a save operation. If callback is specified,
     * it is called when the save operation is complete.
     */
    self.write = function ( callback )
    {
        if (callback)
        {
            self.writeCallback = callback;
        }
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, self.gotFStoWrite, self.fail);
    }
    
    /**
     *
     * Kicks off a read operation. if callback is defined,
     * it is called when the operation is complete OR a read error
     * occurs.
     */
    self.read = function( callback )
    {
        if (callback)
        {
            self.readCallback = callback;
        }
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, self.gotFStoRead, self.fail);
    }
}

/**
 *
 * Saves localStorage to the persistent store in localStorage.dat in the documents folder.
 *
 * If callback is defined, it is executed when the save operation is complete. If 
 * syncLocalStorageInterval is greater than zero, a timeout is created in order to
 * call saveLocalStorage again, essentially creating a repeating save.
 */
function saveLocalStorage( callback )
{
    var self = this;
    var o = new persistentStorage();
    self.callback = callback;
    o.write(function() 
            {
                if (syncLocalStorageInterval>0)
                {
                    setTimeout (saveLocalStorage, syncLocalStorageInterval);     
                }
                if (self.callback) { self.callback(); self.callback = null; }
            });
    
}

/**
 *
 * Loads the localStorage data from the Documents/localStorage.dat file. 
 *
 * If callback is defined, it is called after the load is complete or an
 * error occurs.
 */
function loadLocalStorage( callback )
{
    var o = new persistentStorage();
    o.read( callback );
}

/**
 *
 * This one kicks everything off. It calls loadLocalStorage to load the
 * localStorage data from the persistent store, and then, if syncLocalStorageInterval
 * is greater than zero, sets up the next save operation.
 *
 * If callback is defined, it is called after the read is complete or an
 * error occurs. Useful for defining when the application should start (as it should
 * load the store completely before beginning.)
 */
function loadLocalStorageAndSync( callback )
{
    var self = this;
    self.callback = callback;

    loadLocalStorage(function() 
                     {  
                        if (syncLocalStorageInterval>0)
                        {
                            setTimeout (saveLocalStorage, syncLocalStorageInterval);
                        }
                        if (self.callback) { self.callback(); self.callback = null; }
                     });
}

//
/**
 * based on: http://rabblerule.blogspot.com/2009/08/detecting-swipe-in-webkit.html
 * You can identify a swipe gesture as follows:
 * 1. Begin gesture if you receive a touchstart event containing one target touch.
 * 2. Abort gesture if, at any time, you receive an event with >1 touches.
 * 3. Continue gesture if you receive a touchmove event mostly in the x-direction.
 * 4. Abort gesture if you receive a touchmove event mostly the y-direction.
 * 5. End gesture if you receive a touchend event.
 * 
 * @author Dave Dunkin
 * @copyright public domain
 */
function addSwipeListener(el, listener)
{
 var startX;
 var dx;
 var direction;
 
 function cancelTouch()
 {
  el.removeEventListener('touchmove', onTouchMove);
  el.removeEventListener('touchend', onTouchEnd);
  startX = null;
  startY = null;
  direction = null;
 }
 
 function onTouchMove(e)
 {
  if (e.touches.length > 1)
  {
   cancelTouch();
  }
  else
  {
   dx = e.touches[0].pageX - startX;
   var dy = e.touches[0].pageY - startY;
   if (direction == null)
   {
    direction = dx;
    e.preventDefault();
   }
   else if ((direction < 0 && dx > 0) || (direction > 0 && dx < 0) || Math.abs(dy) > 50) //25
   {
    cancelTouch();
   }
  }
 }

 function onTouchEnd(e)
 {
  var sX = startX;
  var sY = startY;
  cancelTouch();
  if (Math.abs(dx) > 35) //50
  {
   listener({ target: el, direction: dx > 0 ? 'right' : 'left', x:sX, y:sY });
  }
  dx = null;
 }
 
 function onTouchStart(e)
 {
  if (e.touches.length == 1)
  {
   startX = e.touches[0].pageX;
   startY = e.touches[0].pageY;
   el.addEventListener('touchmove', onTouchMove, false);
   el.addEventListener('touchend', onTouchEnd, false);
  }
 }
 
 el.addEventListener('touchstart', onTouchStart, false);
}


//
// end ios.js
//