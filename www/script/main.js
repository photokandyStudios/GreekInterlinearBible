/**
 *
 * Main code used by index.html
 *
 * This code is /NOT/ CC-BY-SA or MIT licensed. It is copyright photoKandy Studios LLC.
 *
 **/

    var cls; // cloud
    var clsLoadedOnce = false;
    var highlightColors = [ "", "255,255,192,1", "255,192,255,1", "192,255,255,1" ];
    //
    // Books of the bible, chapter count, and verse count obtained from http://www.deafmissions.com/tally/bkchptrvrs.html
    //
    var bibleBooks = [ "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
                      "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
                      "Ezra", "Nehemia", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes",
                      "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekial", "Daniel",
                      "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
                      "Zephaniah", "Haggai", "Zechariah", "Malachi",
                      // New Testament
                      "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians",
                      "2 Corinthians", "Galations", "Ephesians", "Philippians", "Colossians",
                      "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus",
                      "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John",
                      "3 John", "Jude", "Revelation" ];
    
    var bibleBooksO3LC = [ "Gen", "Exo", "Lev", "Num", "Deu", "Jos", "Jdg", "Rut",
                          "1Sa", "2Sa", "1Ki", "2Ki", "1Ch", "2Ch",
                          "Ezr", "Neh", "Est", "Job", "Psa", "Pro", "Ecc",
                          "Sos", "Isa", "Jer", "Lam", "Eze", "Dan",
                          "Hos", "Joe", "Amo", "Oba", "Jon", "Mic", "Nah", "Hab",
                          "Zep", "Hag", "Zec", "Mal",
                          // New Testament
                          "Mat", "Mar", "Luk", "Joh", "Act", "Rom", "1Co",
                          "2Co", "Gal", "Eph", "Phi", "Col",
                          "1Th", "2Th", "1Ti", "2Ti", "Tit",
                          "Phl", "Heb", "Jas", "1Pe", "2Pe", "1Jo", "2Jo",
                          "3Jo", "Jud", "Rev" ];

    var bibleBooks3LC = [ "01O", "02O", "03O", "04O", "05O", "06O", "07O", "08O",
                          "09O", "10O", "11O", "12O", "13O", "14O",
                          "15O", "16O", "17O", "18O", "19O", "20O", "21O",
                          "22O", "23O", "24O", "25O", "26O", "27O",
                          "28O", "29O", "30O", "31O", "32O", "33O", "34O", "35O",
                          "36O", "37O", "38O", "39O",
                          // New Testament
                          "40N", "41N", "42N", "43N", "44N", "45N", "46N",
                          "47N", "48N", "49N", "50N", "51N",
                          "52N", "53N", "54N", "55N", "56N",
                          "57N", "58N", "59N", "60N", "61N", "62N", "63N",
                          "64N", "65N", "66N" ];
    
    var bibleBookChapters = [ 50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150,
                              31, 12 ,8 ,66 ,52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4,
                              // New Testament
                              28, 16, 24, 21, 28, 16, 16, 12, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22];

    var transliteration = [ "a", "b", "g", "d", "e", "z", "e", "th", "i", "c", "l", "m",
                            "n", "x", "o", "p", "r", "s", "s", "t", "u", "ph", "ch", "ps", "o"];

    var betaCode = [ "a", "b", "g", "d", "e", "z", "h", "q", "i", "k", "l", "m",
                            "n", "c", "o", "p", "r", "s", "s", "t", "u", "f", "x", "y", "w"];

    var selectedVerse = Array();
    var bookmarkedVerse = Array();
    var notedVerse = Array();
    var highlightedVerse = Array();
    
    var afterBothLoaded;
    
    var bibleLeft;
    var bibleRight;
    var _bl = Array();
    var _br = Array();
    var bibleLeftCode;
    var bibleRightCode;
    var leftLoaded = false;
    var rightLoaded = false;

    function transliterate ( s, a )
    {
        var t;
        var o = "";
        var idx = 0;
        
        if (a)
        {
            t=a;
        }
        else
        {
            t=transliteration;
        }
        
        for (var i=0;i<s.length;i++)
        {
            idx = s.charCodeAt(i);
            if (idx<945)
            {
                o = o + s[i];
            }
            else
            {
                idx = idx - 945;
                if (t[idx])
                {
                    o = o + t[ idx ];
                }
                else
                {
                    o = o + "?";
                }
            }
        }
        
        return o;
    }

    
    var selectedGreekText = localStorage.getItem("TextGreekText");
    if (!selectedGreekText)
    {
        selectedGreekText = "byzp";
    }
    var selectedRightText = localStorage.getItem("TextRightText");
    if (!selectedRightText)
    {
        selectedRightText = "ylt";
    }
    
    // too buggy for now :-(
    //new ScrollFix($("pnlBodyArea"));
    //new ScrollFix($("pnlMainArea"));

    function biblesLoaded()
    {
        //console.log ("in biblesLoaded!");
        if (leftLoaded && rightLoaded)
        {
            //console.log ("both sides ready.");
            hideLoader();
            if (afterBothLoaded)
            {
                //console.log ("calling afterBothLoaded.");
             afterBothLoaded( ); 
            }
            afterBothLoaded = null;

        }
    }

    function bibleRightCallback()
    {
        //console.log ("in bibleRightCallback!");
        rightLoaded = true;
        bibleRight = _br;
        biblesLoaded();
    }

    function bibleLeftCallback()
    {
        //console.log ("in bibleLeftCallback!");
        leftLoaded = true;
        bibleLeft = _bl;
        biblesLoaded();
    }
    
    function loadBible( bc )
    {
        if (bc == "ste") { bc = "byzp"; }
        console.log ("attempted to load " + bc);
        if (bc == "kjv" || bc == "ylt")
        {
            if (bibleRightCode == bc)
            {
                bibleRightCallback();
                return;     // already loaded, no need to do it again.
            }
        }
        else
        {
            if (bibleLeftCode == bc)
            {
                bibleLeftCallback();
                return;     // already loaded, no need to do it again.
            }
        }
        showLoader();
        var newScript = document.createElement('script');
        newScript.type = "application/javascript";
        newScript.charset = "utf-8";
        newScript.src = "./bibles/unbound/" + bc + ".js";
        //console.log (newScript);
        //console.log ("loading: " + newScript.src );
        $("bodyPanel").appendChild (newScript);
        //console.log ("loaded.");
        if (bc == "kjv" || bc == "ylt")
        {
            selectedRightText = bc;
            bibleRightCode = bc;
        }
        else
        {
            selectedGreekText = bc;
            bibleLeftCode = bc;
        }
    }

    function doSearchBible()
    {
        var theWord = $("txtSearch").value;
        $("txtSearch").value = "";  // clear the search after the fact (?)
        var url = "./search.html?ignore";
        showLoader();
        var whichSide = 2;
        for (i=0;i<theWord.length;i++)
        {
            if (theWord.charCodeAt(i) >= 945)
            {
                whichSide = 1;
            }
        }
        if (theWord.toLowerCase().indexOf("greek:")>-1)
        {
            whichSide = 1;
            theWord = theWord.substr( theWord.toLowerCase().indexOf("greek:")+6, theWord.length );
        }
        if (whichSide == 1)
        {
            url = url + "&greek=" + theWord;
        }
        if (whichSide == 2)
        {
            url = url + "&search=" + theWord;
        }
        if (url)
        {
            loadContent(url, updateMainMenuandTabBar,null, currentPageURL );
        }
        
    }

    function getBookName ( passage )
    {
        return bibleBooks[ bibleBooks3LC.indexOf(passage.substr(0,3)) ];
    }
    function getBookIndex ( passage )
    {
        return bibleBooks3LC.indexOf(passage.substr(0,3));
    }
    function getChapterCount ( passage)
    {
        return bibleBookChapters[ bibleBooks3LC.indexOf(passage.substr(0,3)) ];
    }
    function getChapter ( passage)
    {
        if (passage.indexOf(".") != passage.lastIndexOf("."))
        {
            return parseInt(passage.substr(4, passage.lastIndexOf(".")-4));
        }
        else
        {
            return parseInt( passage.substr(4,10) );
        }
    }
    function getVerse ( passage)
    {
        if (passage.indexOf(".") != passage.lastIndexOf("."))
        {
            return parseInt(passage.substr(passage.lastIndexOf(".")+1,10));
        }
        else
        {
            return 0;
        }
    }
    function cvtToProperReference ( passage )
    {
        if (passage.indexOf(".") != passage.lastIndexOf("."))
        {
            // two dots in this passage
            return getBookName (passage) + " " + passage.substr(4, passage.lastIndexOf(".")-4) + ":" + 
                   passage.substr(passage.lastIndexOf(".")+1,10);
        }
        else
        {
            return getBookName (passage) + " " + getChapter (passage);
        }
    }


    function checkCloudSetting ()
    {
        if (!cls)
        {
            // set up our cloud
            cls = new cloudLocalStorage ( "grkinterlinear_ls.dat", "grkinterlinear_ls.q" );
            cls.addMatchKey ( "note\_.*" );
            cls.addMatchKey ( "bm\_.*" );
            cls.addMatchKey ( "hl\_.*" );
        }
        var useCloud =localStorage.getItem ( "settingsUseCloud" );
        if (!useCloud)
        {
            useCloud = "off";
        } 
        
        cls.enabled = (useCloud == "on");    
        
        if (cls.enabled && !clsLoadedOnce)
        {
            cls.loadFrom();
            clsLoadedOnce = true;
        }
        
        setTimeout ( checkCloudSetting, 30000 ); // check for a cloud setting change every 30s
    }
    function loadCloud()
    {
        console.log ("loading cloud...");
        clsLoadedOnce = false;
        checkCloudSetting();
        
        console.log ("starting app...");
        startApp();
    }
    function resume()
    {
        if (cls)
        {
            cls.loadFrom(); // sync from the cloud after a resume
            clsLoadedOnce = true;
        }
    }
    function getGoing()
    {
        console.log ("loading settings...");
        loadCloud();
        /*
        // load app settings and go
        setTimeout (function()
                    { 
                       loadLocalStorageAndSync ( loadCloud ); // start the app after we load the settings!
                    }, 250);
         */
                       
    }
    
            function processGreekVerse( s )
            {
                //console.log ('Processing Greek Verse');
                var settingsGreekLayoutTransliterate = localStorage.getItem("LayoutTransliteration");
                var leftVerse = s;
            
                leftVerse = leftVerse.replace ( /VAR([0-9])/g, "$1");
                leftVerse = leftVerse.replace ( /(G[0-9]+)/g, "<span class='strongs'>$1</span>" );
    //            leftVerse = leftVerse.replace ( /([A-Z\-]{2,}[A-Z\-0-9]+)/g, "<span class='parsed'>$1</span>" );
                leftVerse = leftVerse.replace ( /([A-Z\-]{2,}[A-Z\-0-9]+)/g, "" );

                if (settingsGreekLayoutTransliterate=="on") 
                { 
                  leftVerse = transliterate(leftVerse); 
                }

                //console.log ('Done processing.');
                return leftVerse;
            }
            
    
    
function updateControlBar( url )
{
    var mnu = $("mnuControlBar");
    
    // unselect any active items, while selecting the correct item based on url
    for (var o in mnu.childNodes )
    {
        var obj = mnu.childNodes[o];
        if (obj.attributes)
        {
            var objHref = obj.getAttribute("href");
            if (objHref.indexOf ( url ) >= 0)
            {   // selected!
                obj.setAttribute ("class", " sel");
            }
            else
            {   // not selected!
                obj.setAttribute ("class", "");    
            }
            
        }
    }
    return true;
}
        
            // startup variables
            var mySiteName = "Greek Interlinear";
            var myMenuName = "<div id='mnuControlBar' class='segmentedControlBar'>" + 
                             "<a class='sel' style='width:46px' href='javascript:loadMenu(\"./menu.html\", updateControlBar);'>Goto</a>" + 
                             "<a style='width:88px' href='javascript:loadMenu(\"./bookmarks.html\", updateControlBar);'>Bookmarks</a>" + 
                             "<a style='width:79px' href='javascript:loadMenu(\"./highlights.html\", updateControlBar);'>Highlights</a>" + 
                             "<a style='width:50px' href='javascript:loadMenu(\"./notes.html\", updateControlBar);'>Notes</a>" + 
                             "</div>";
            var myStartPage = "./bible.html";
            var myStartName = "Interlinear";
            var myTabBar = "./tabs.html";
            
            visualTheme = "blueTheme";
            
            // load our first bibles
            onDeviceReady = function () { 
                console.log ("Device is ready.");
                setTimeout ( function() {
                                            if (navigator)
                                            {
                                                if (navigator.splashscreen)
                                                {
                                                    navigator.splashscreen.hide();
                                                }
                                            }
                                        }, 10000 ); // in 10s, we kill the splash. NO MATTER WHAT
                
                afterBothLoaded = getGoing; // starter
                leftLoaded = false; rightLoaded = false;
                loadBible ( selectedGreekText );
                loadBible ( selectedRightText );
            }
            document.addEventListener ( "deviceready", onDeviceReady, false);
            document.addEventListener ( "resume", resume, false );
