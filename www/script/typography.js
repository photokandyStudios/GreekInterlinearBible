/**
 *
 * typography.js
 *
 * Supports bible.html by calculating and rendering the canvas typography.
 *
 * This code is (C) photoKandy Studios LLC. It's so hacky, you wouldn't want it
 * anyway, believe me.
 *
 */
var canvasMargin;

function myMax ( a, b, c )
{
    var _a = a;
    var _b = b;
    var _c = c;
    
    if (!_a) { _a = 0; }
    if (!_b) { _b = 0; }
    if (!_c) { _c = 0; }
    
    return Math.max ( _a, _b, _c );
}

// wordObject will store information about a word
function wordObject ( x, y, w, h, c, text, wordType, yOffset, verse, whichSide )
{
    this.self = this;
    this.x    = x;
    this.y    = y;
    this.color= c;
    this.text = text;
    this.width= w;
    this.height=h;
    this.wordType = wordType;
    this.yOffset = yOffset;
    this.verse = verse;
    this.whichSide = whichSide;
}

// pageObject stores the list of all the words on a page
function pageObject ( canvasMargin )
{
    this.self = this;
    this.words = Array();
    this.verseYStart = Array();
    this.verseYEnd   = Array();
    this.columnYEnd = Array(0, canvasMargin, canvasMargin, canvasMargin, canvasMargin);
    
    this.addWord = function ( wO )
    {
        this.words.push ( wO );
    }
}

// pages stores the list of all the pageObjects in a chapter.
var pages = Array();

// page references stores the verse reference and the page it is on
var pageReferences = Array();

/**
 *
 * formats a chapter using the page and word objects.
 *
 */
    var canvasWidth = 1024;         // width. will change based on orientation
    var canvasHeight = 676;        // height: will change based on orientation

function formatChapter ( passage )
{
    var pages = Array();
    var settingsGreekLayoutTransliterate = localStorage.getItem("LayoutTransliteration");
    
    // handle our orientation
    if (isLandscape() && isIPad())
    {
        canvasWidth = 1024;
        canvasHeight = 676;
    }
    if (isPortrait () && isIPad())
    {
        canvasWidth = 768;
        canvasHeight = 932;
    }
    if ( isPortrait() && isIPhone() )
    {
        canvasWidth = 320;
        canvasHeight = 366 - 23;
    }
    if ( isLandscape() && isIPhone() )
    {
        canvasWidth = 480;
        canvasHeight = 206 - 23;
    }

    $("bibleContent").style.minHeight = canvasHeight + "px";
    $("c").setAttribute ("width", canvasWidth * window.devicePixelRatio);
    $("c").setAttribute ("height", canvasHeight * window.devicePixelRatio);
    
    $("c").style.width = canvasWidth + "px";
    $("c").style.height = canvasHeight + "px";

    var ctx = document.getElementById("c").getContext("2d");

    ctx.font = settingsLayoutTextSize + "px " + settingsLayoutFontFamily;      // font
    ctx.fillStyle = "#000";         // color

    canvasMargin = isIPad() ? 30 : 5;

    var columnAvgWidth = (canvasWidth - (canvasMargin * 6))/3;

    var columnLeft = Array();
    var columnWidth = Array();
    
    var column1Multiplier = 1.75;
    var column2Multiplier = 0.0625;
    var column3Multiplier = 1.1875;
    
    if (settingsLayoutColumnWidths == "600930")
    {
        column1Multiplier = 1.75; column2Multiplier = 0.0625; column3Multiplier = 1.1875;
    }
    
    if (settingsLayoutColumnWidths == "300960")
    {
        column1Multiplier = 1.1875; column2Multiplier = 0.0625; column3Multiplier = 1.75;
    }

    if (settingsLayoutColumnWidths == "450945")
    {
        column1Multiplier = 1.46875; column2Multiplier = 0.0625; column3Multiplier = 1.46875;
    }

    columnLeft[1] = canvasMargin;
    columnWidth[1] = columnAvgWidth * column1Multiplier;   // left column
    columnLeft[3] = columnLeft[1] + columnWidth[1] + (canvasMargin * 2);
    columnWidth[3] = columnAvgWidth * column2Multiplier;      // middle column
    columnLeft[2] = columnLeft[3] + columnWidth[3] + (canvasMargin * 2);
    columnWidth[2] = columnAvgWidth * column3Multiplier;      // right column
    columnLeft[4] = canvasWidth / 6;
    columnWidth[4] = canvasWidth / 1.5;
    
    var lineHeight = ctx.measureText("—").width;                        // line height
    lineHeight = lineHeight * ( settingsLayoutLineSpacing / 100 );  // and add our line spacing
    
    var thisPageNumber = 0;
    var y = canvasMargin;       // starting at top of page
    var x = 0;
    var settingsLayoutShowMorphology;
    settingsLayoutShowMorphology = localStorage.getItem ( "LayoutShowMorphology" );
    if (!settingsLayoutShowMorphology)
    {
        settingsLayoutShowMorphology = "on";
    }
    var columnHeight = (lineHeight * ( ( settingsLayoutShowMorphology=="on" ) ? 3.5 : 2.5 )); // can change if morphology is omitted.
    var thisPage;
    
    // if we're non-parsed, columnHeight should be lineHeight...
    if (selectedGreekText.indexOf("p")<0)
    {
        columnHeight = lineHeight;
    }

    for ( var i=1; bibleLeft[passage + "." + i] || bibleRight [passage + "." + i]; i++ )
    {
    ctx.font = settingsLayoutTextSize + "px " + settingsLayoutFontFamily;      // font
        var ref = passage + "." + i;
        var curY = y;
        var curP = thisPageNumber;
        
       thisPageNumber = curP;
       /*if (thisPage)
       {            console.log ("156: " + thisPage.verseYEnd[i]);
            thisPage.verseYEnd[i] = myMax (y, thisPage.verseYEnd[i]);
//            console.log ("158: " + thisPage.verseYEnd[i]);
            thisPage.columnYEnd[whichSide] = y;
        }*/
       if ( !pages[thisPageNumber] )
        {

            pages[thisPageNumber] = new pageObject( canvasMargin );
                pages[thisPageNumber].verseYStart[i] = canvasMargin;
                pages[thisPageNumber].verseYEnd  [i] = canvasMargin;

        }
        thisPage = pages[thisPageNumber];

        // find the first available position to start drawing on the page
        y = myMax ( thisPage.columnYEnd [ 1 ], thisPage.columnYEnd [ 2 ], thisPage.columnYEnd[ 4 ] );
        if (!y) { y = canvasMargin; }

        if (y >= (canvasHeight - (canvasMargin*2) - columnHeight))
        {
                thisPage.verseYEnd[i] = myMax (y, thisPage.verseYEnd[i]);
                thisPage.columnYEnd[whichSide] = y;
//            console.log ("179: " + thisPage.verseYEnd[i]);

            // new page!
            thisPageNumber++;
            curP = thisPageNumber;
            if ( !pages[thisPageNumber] )
            {   // allocate if necessary
                pages[thisPageNumber] = new pageObject( canvasMargin );
                pages[thisPageNumber].verseYStart[i] = canvasMargin;
                pages[thisPageNumber].verseYEnd  [i] = canvasMargin;
            }
            thisPage = pages[thisPageNumber];
            
            y = myMax ( thisPage.columnYEnd [ 1 ], thisPage.columnYEnd [ 2 ], thisPage.columnYEnd[ 4 ] );
            if (!y) { y = canvasMargin; }
            
            thisPage.verseYStart[i] = y;
            thisPage.verseYEnd  [i] = myMax ( y+columnHeight, thisPage.verseYEnd[i]);
//            console.log ("197: " + thisPage.verseYEnd[i]);
        }
        curY = y;
        
        // create a new word that is the verse #
        thisPage.addWord ( new wordObject ( columnLeft [ 3 ] + ((columnWidth [ 3 ])/2) // center
                         - (ctx.measureText ( i ).width / 2) // center the #
                         , y, ctx.measureText ( i ).width, lineHeight, "#806040", i, 99, 0, i, 3 ));

        // start both verses
            y=curY;
            thisPage.verseYStart [ i ] = y;
            thisPage.verseYEnd  [i] = myMax ( y+columnHeight, thisPage.verseYEnd[i]);
//            console.log ("210: " + thisPage.verseYEnd[i]);

        for (var whichSide = 1; whichSide < 3; whichSide++)
        {
            x = columnLeft [ whichSide];
            maxX = x + columnWidth[whichSide];
            thisPageNumber = curP;
            thisPage.verseYEnd[i] = myMax (y, thisPage.verseYEnd[i]);
            thisPage.columnYEnd[whichSide] = y;
//                        console.log ("219: " + thisPage.verseYEnd[i]);
            if ( !pages[thisPageNumber] )
            {
                pages[thisPageNumber] = new pageObject( canvasMargin );
                pages[thisPageNumber].verseYStart[i] = canvasMargin;
                pages[thisPageNumber].verseYEnd  [i] = canvasMargin;
            }
            thisPage = pages[thisPageNumber];

            var curBible = (whichSide==1 ? bibleLeft : bibleRight );
            var baseText = "";

            if (curBible[ref])
            {
                baseText = baseText + curBible[ref] + " ";
            }
            else
            {
                baseText = baseText + "[...]";
            }
            if (whichSide == 1 && settingsGreekLayoutTransliterate == "on")
            {
                baseText = transliterate (baseText);
            }
            
            y=curY;
            
            // start drawing the verse
                var prevWords = Array();
                var wordsSinceRegular = 0;
                var prevwt = 99;
                // now, parse the words
                var dd = 0;
                var maxWidth = 0;
                while ( baseText.length > 0 & dd<1000 )
                {
                    var curWord = "";
                    var w = 0;
                    var h = 0;
                    var yOffset = 0;
                    var curWidth = 0;
                    var c = "#000";
                    var wt = 0; // regular word
                    dd++;
                    // get current word.
                    if (baseText.indexOf (" ") > -1)
                    {
                        curWord = baseText.substr(0, baseText.indexOf (" ") );
                        baseText = baseText.substr( baseText.indexOf (" ")+1, baseText.length );
                    }
                    else
                    {
                        curWord = baseText;
                        baseText = "";
                    }
                    // determine what this word is, but only if we're on the greek side.
                    if (whichSide == 1)
                    {
                        if (curWord.match ( /G[0-9]+/g))
                        {
                            wt = 20; // Strong's
                            c = "#406080";
                            yOffset += (lineHeight*1);
                            // do we have anything in _gl?
                            /*
                            if (_gl[curWord])
                            {
                                baseText = "[[" + _gl[curWord] + "]] " + baseText;
                            }
                            */
                        }
                        else if (curWord.match ( /VAR[0-9]/g ) )
                        {
                            wt = 5; // Just a variant.
                            curWord = curWord.replace ( /VAR([0-9])/g, "$1"); // simplify it.
                            
                        }
                        else if (curWord.match ( /\[\[([A-Za-z0-9\-]*)\]\]/g))
                        {
                            c = "#806040";
                            wt = 30;    // Grenglish
                            yOffset += (lineHeight);
                            curWord = curWord.replace ( /\[\[([A-Za-z0-9\-]*)\]\]/g, "$1"); // simplify it.
                        }
                        else if (curWord.match ( /([A-Z\-]{2,}[A-Z\-0-9]+)/g ) )
                        {
                            c = "#408060";
                            wt = 40; // morphology
                            yOffset += (lineHeight * 2);
                        }
                    }
                    if (wt != 0)
                    {
                        wordsSinceRegular ++;
                    }
                    
                    if ( (whichSide == 2) || ( whichSide == 1 && ( wt <= prevwt ) ))
                    {
                        // move X forward
                        x = x + maxWidth;
                        // advance
                        if (x >= maxX )
                        {
                            x = columnLeft [ whichSide ] ;   // back to beginning of the line
                            y = y + columnHeight;       // increment y
                            if (y >= (canvasHeight - (canvasMargin*2) - columnHeight))
                            {
                                // the verse's height is the maximum height
                                thisPage.verseYEnd[i] = myMax (y, thisPage.verseYEnd[i]);
                                thisPage.columnYEnd[whichSide] = y;
//                                            console.log ("328: " + thisPage.verseYEnd[i]);

                                // new page!
                                thisPageNumber++;
                                if ( !pages[thisPageNumber] )
                                {   // allocate if necessary
                                    pages[thisPageNumber] = new pageObject( canvasMargin );
                                    pages[thisPageNumber].verseYStart[i] = canvasMargin;
                                    pages[thisPageNumber].verseYEnd  [i] = canvasMargin;
                                }
                                thisPage = pages[thisPageNumber];
                                
                                y = canvasMargin;   
                                
                                thisPage.verseYStart[i] = y;
                                thisPage.verseYEnd  [i] = myMax ( y+columnHeight, thisPage.verseYEnd[i]);
//                                            console.log ("344: " + thisPage.verseYEnd[i]);

                            }
                            // now, we have to deal with several previous words now.
                            for (var k=0; k<prevWords.length; k++)
                            {
                                prevWords [ k ].x = x;
                                prevWords [ k ].y = y + prevWords [k].yOffset;
                            }
                            x = x + maxWidth;
                        }
                        for ( var j=0; j<prevWords.length; j++)
                        {
                            if ( ( settingsLayoutShowMorphology=="on" ) ||
                                 ( ( settingsLayoutShowMorphology=="off" ) && prevWords[j].wordType != 40)
                               ) {
                            thisPage.addWord ( prevWords[j] );
                            }
                        }
                        // clear prevWords
                        prevWords = Array();
                        wordsSinceRegular = 0;
                        maxWidth = 0;
                        //wt = 99;
                    }
                    curWidth = ctx.measureText (curWord + " ").width;
                    
                    if (curWidth > maxWidth)
                    {
                        maxWidth = curWidth;
                    }
                    prevWords.push ( new wordObject ( x, y+yOffset, curWidth, lineHeight, c, curWord, wt, yOffset, i, whichSide ) );
                    prevwt = wt;
                }

                // move X forward
                x = x + maxWidth;
                // advance
                if (x >= maxX )
                {
                    x = columnLeft [ whichSide ] ;   // back to beginning of the line
                    y = y + (columnHeight);       // increment y
                    if (y >= (canvasHeight - (canvasMargin*2) - columnHeight))
                    {
                        // the verse's height is the maximum height
                        thisPage.verseYEnd[i] = myMax (y, thisPage.verseYEnd[i]);
                        thisPage.columnYEnd[whichSide] = y;
//                                    console.log ("387: " + thisPage.verseYEnd[i]);

                        // new page!
                        thisPageNumber++;
                        if ( !pages[thisPageNumber] )
                        {   // allocate if necessary
                            pages[thisPageNumber] = new pageObject( canvasMargin );
                            pages[thisPageNumber].verseYStart[i] = canvasMargin;
                            pages[thisPageNumber].verseYEnd  [i] = canvasMargin;
                        }
                        thisPage = pages[thisPageNumber];
                        
                        y = canvasMargin;           
                        thisPage.verseYStart[i] = y;
                        thisPage.verseYEnd  [i] = myMax ( y+columnHeight, thisPage.verseYEnd[i]);
//                                    console.log ("402: " + thisPage.verseYEnd[i]);

                    }
                    // now, we have to deal with several previous words now.
                    for (var k=0; k<prevWords.length; k++)
                    {
                        prevWords [ k ].x = x;
                        prevWords [ k ].y = y + prevWords [k].yOffset;
                    }
                    x = x + maxWidth;
                }
                for ( var j=0; j<prevWords.length; j++)
                {
                    if ( ( settingsLayoutShowMorphology=="on" ) ||
                         ( ( settingsLayoutShowMorphology=="off" ) && prevWords[j].wordType != 40)
                       ) {
                    thisPage.addWord ( prevWords[j] );
                    }
                }
            
            // end drawing the verse
            
            
            thisPage.verseYEnd[i] = myMax ( y + columnHeight, thisPage.verseYEnd[i]);
//                        console.log ("422: " + thisPage.verseYEnd[i]);

            thisPage.columnYEnd[whichSide] = y + columnHeight;
        }
        // end both verses

            // now draw the notes
            
            var baseText = localStorage.getItem("note_" + ref);

            if (settingsInlineNotes=="on" && baseText)
            {
                ctx.font = "italic " + settingsLayoutTextSize + "px " + settingsLayoutFontFamily;      // font
                var whichSide = 4;

                // find the first available position to start drawing on the page
                y = myMax ( thisPage.columnYEnd [ 1 ], thisPage.columnYEnd [ 2 ], thisPage.columnYEnd[ 4 ] );
                if (!y) { y = canvasMargin; }

                if (y >= (canvasHeight - (canvasMargin*2) - columnHeight))
                {
                    // new page!
                    thisPageNumber++;
                    curP = thisPageNumber;
                    thisPage.verseYEnd[i] = myMax (y, thisPage.verseYEnd[i]);
                    thisPage.columnYEnd[whichSide] = y;
//            console.log ("448: " + thisPage.verseYEnd[i]);
                    if ( !pages[thisPageNumber] )
                    {   // allocate if necessary
                        pages[thisPageNumber] = new pageObject( canvasMargin );
                            pages[thisPageNumber].verseYStart[i] = canvasMargin;
                            pages[thisPageNumber].verseYEnd  [i] = canvasMargin;
                    }
                    thisPage = pages[thisPageNumber];
                    
                    y = myMax ( thisPage.columnYEnd [ 1 ], thisPage.columnYEnd [ 2 ], thisPage.columnYEnd[ 4 ] );
                    if (!y) { y = canvasMargin; }
                    
                    thisPage.verseYStart[i] = y;
                    thisPage.verseYEnd  [i] = myMax ( y+lineHeight, thisPage.verseYEnd[i]);
//            console.log ("462: " + thisPage.verseYEnd[i]);
                }



                baseText = "Notes for Verse " + i + ": " + baseText + " ";
                thisPage.verseYEnd[i] = myMax (y, thisPage.verseYEnd[i]);
                thisPage.columnYEnd[whichSide] = y;
//            console.log ("470: " + thisPage.verseYEnd[i]);
                x=columnLeft[whichSide];
                var maxX = x + columnWidth[whichSide];
                var prevWords = Array();
                var wordsSinceRegular = 0;
                var prevwt = 99;
                // now, parse the words
                var dd = 0;
                var maxWidth = 0;
                while ( baseText.length > 0 & dd<1000 )
                {
                    var curWord = "";
                    var w = 0;
                    var h = 0;
                    var yOffset = 0;
                    var curWidth = 0;
                    var c = "#333";
                    var wt = 98; // note word
                    dd++;
                    // get current word.
                    if (baseText.indexOf (" ") > -1)
                    {
                        curWord = baseText.substr(0, baseText.indexOf (" ") );
                        baseText = baseText.substr( baseText.indexOf (" ")+1, baseText.length );
                    }
                    else
                    {
                        curWord = baseText;
                        baseText = "";
                    }
                    // determine what this word is, but only if we're on the greek side.
                    if (curWord.match ( /G[0-9]+/g))
                    {
                        wt = 20; // Strong's
                        c = "#248";
                    }
                    
                    if ( true ) // always advance here
                    {
                        // move X forward
                        x = x + maxWidth;
                        // advance
                        if (x >= maxX )
                        {
                            x = columnLeft [ whichSide ] ;   // back to beginning of the line
                            y = y + lineHeight;       // increment y
                            if (y >= (canvasHeight - (canvasMargin*2) - lineHeight))
                            {
                                // the verse's height is the maximum height
                                thisPage.verseYEnd[i] = myMax (y, thisPage.verseYEnd[i]);
                                thisPage.columnYEnd[whichSide] = y;
//            console.log ("521: " + thisPage.verseYEnd[i]);
                                
                                // new page!
                                thisPageNumber++;
                                if ( !pages[thisPageNumber] )
                                {   // allocate if necessary
                                    pages[thisPageNumber] = new pageObject( canvasMargin );
                                    pages[thisPageNumber].verseYStart[i] = canvasMargin;
                                    pages[thisPageNumber].verseYEnd  [i] = canvasMargin;
                                }
                                thisPage = pages[thisPageNumber];
                                
                                y = canvasMargin;   
                                
                                thisPage.verseYStart[i] = y;
                                thisPage.verseYEnd  [i] = myMax ( y+lineHeight, thisPage.verseYEnd[i]);
//            console.log ("537: " + thisPage.verseYEnd[i]);
                            }
                            // now, we have to deal with several previous words now.
                            for (var k=0; k<prevWords.length; k++)
                            {
                                prevWords [ k ].x = x;
                                prevWords [ k ].y = y + prevWords [k].yOffset;
                            }
                            x = x + maxWidth;
                        }
                        for ( var j=0; j<prevWords.length; j++)
                        {
                            thisPage.addWord ( prevWords[j] );
                        }
                        // clear prevWords
                        prevWords = Array();
                        wordsSinceRegular = 0;
                        maxWidth = 0;
                        //wt = 99;
                    }
                    curWidth = ctx.measureText (curWord + " ").width;
                    
                    if (curWidth > maxWidth)
                    {
                        maxWidth = curWidth;
                    }
                    prevWords.push ( new wordObject ( x, y+yOffset, curWidth, lineHeight, c, curWord, wt, yOffset, i, whichSide ) );
                    prevwt = wt;
                }

                // move X forward
                x = x + maxWidth;
                // advance
                if (x >= maxX )
                {
                    x = columnLeft [ whichSide ] ;   // back to beginning of the line
                    y = y + (lineHeight);       // increment y
                    if (y >= (canvasHeight - (canvasMargin*2) - lineHeight))
                    {
                        // the verse's height is the maximum height
                        thisPage.verseYEnd[i] = myMax (y, thisPage.verseYEnd[i]);
                        thisPage.columnYEnd[whichSide] = y;
//            console.log ("579: " + thisPage.verseYEnd[i]);
                        
                        // new page!
                        thisPageNumber++;
                        if ( !pages[thisPageNumber] )
                        {   // allocate if necessary
                            pages[thisPageNumber] = new pageObject( canvasMargin );
                            pages[thisPageNumber].verseYStart[i] = canvasMargin;
                            pages[thisPageNumber].verseYEnd  [i] = canvasMargin;
                        }
                        thisPage = pages[thisPageNumber];
                        
                        y = canvasMargin;           
                        thisPage.verseYStart[i] = y;
                        thisPage.verseYEnd  [i] = myMax ( y+lineHeight, thisPage.verseYEnd[i]);
//            console.log ("594: " + thisPage.verseYEnd[i]);
                    }
                    // now, we have to deal with several previous words now.
                    for (var k=0; k<prevWords.length; k++)
                    {
                        prevWords [ k ].x = x;
                        prevWords [ k ].y = y + prevWords [k].yOffset;
                    }
                    x = x + maxWidth;
                }
                for ( var j=0; j<prevWords.length; j++)
                {
                    thisPage.addWord ( prevWords[j] );
                }
                y=y+lineHeight*2;
                thisPage.verseYEnd[i] = myMax (y, thisPage.verseYEnd[i]);
                thisPage.columnYEnd[whichSide] = y;
//            console.log ("611: " + thisPage.verseYEnd[i]);
            
            }
            // end drawing the notes


        
        curP = thisPageNumber;
    }

    // set up pageReferences
    pageReferences = Array();
    for (var i=0; i<pages.length; i++)
    {
        for (var j=1; j<pages[i].verseYStart.length; j++)
        {
             if ( pages[i].verseYStart[j] )
             {
                if (pageReferences [j] == undefined)
                {
                 pageReferences[ j ] = i;   // for non-passage references
                 pageReferences[ passage + "." + j] = i;    // for regular references
                }
             }
        }
    }
    
    return pages;
}


function clearCtx ( ctx )
{
    ctx.save();
    ctx.scale ( window.devicePixelRatio, window.devicePixelRatio );
    ctx.clearRect (0, 0, canvasWidth, canvasHeight);
    ctx.restore();
}

function drawPage ( pageNumber )
{
    var yOffset = 0;
    // set the page title to the top verse
    setPageTitle ( cvtToProperReference ( passage + "." + pages[pageNumber].verseYStart.indexOf(canvasMargin)) );
    $("iphoneReference").innerHTML = cvtToProperReference ( passage + "." + pages[pageNumber].verseYStart.indexOf(canvasMargin));

    var ctx = document.getElementById("c").getContext("2d");
    ctx.save();
    clearCtx ( ctx );
    ctx.scale ( window.devicePixelRatio, window.devicePixelRatio );

    ctx.font = settingsLayoutTextSize + "px " + settingsLayoutFontFamily;      // font
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000";         // color
    
    // draw any selection and highlights

    for (var i=1; i<pages[pageNumber].verseYStart.length; i++)
    {   
      if ( pages[pageNumber].verseYStart[i] != undefined )
      {
        var ref = passage + "." + i;
        if (localStorage.getItem ( "hl_" + ref ))
        {   var highlight;
            var highlightNum;
            highlightNum = localStorage.getItem ( "hl_" + ref );
            highlight = "rgba(";
            highlight = highlight + highlightColors [ highlightNum ];
            highlight = highlight + ")";
            ctx.fillStyle = highlight;
            ctx.fillRect ( 0,           pages[pageNumber].verseYStart[i], 
                           canvasWidth, (pages[pageNumber].verseYEnd[i] - pages[pageNumber].verseYStart[i]) );
        }
        if ( selectedVerse[passage + "." + i]=="Y" )
        {
            ctx.fillStyle = "rgba(192,224,255,0.75)"; //#C0E0FF";
            ctx.fillRect ( 0,           pages[pageNumber].verseYStart[i], 
                           canvasWidth, (pages[pageNumber].verseYEnd[i] - pages[pageNumber].verseYStart[i]) );
        }

        // now, try to be fancy?
        /*
        if (pages[pageNumber].verseYStart[i] != canvasMargin )
        {
            var lingrad = ctx.createLinearGradient(0,Math.floor(pages[pageNumber].verseYStart[i]),
                                                   0,Math.floor(pages[pageNumber].verseYStart[i]+50));
            lingrad.addColorStop(0,      'rgba(255,255,255,0.75)');
            lingrad.addColorStop(0.25,  'rgba(255,255,255,0)');
            lingrad.addColorStop(1,      'rgba(255,255,255,0)');
            
            ctx.fillStyle = lingrad;
            ctx.fillRect ( 0,           pages[pageNumber].verseYStart[i], 
                           canvasWidth, 50 );

            ctx.fillStyle = "rgba(255,255,255,0.75)";
            ctx.fillRect ( 0,           Math.floor(pages[pageNumber].verseYStart[i]) , 
                           canvasWidth, 1 );

            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fillRect ( 0,           Math.floor(pages[pageNumber].verseYStart[i])-1, 
                           canvasWidth, 1 );
        }
        */
      }
    }
    
    ctx.fillStyle = "#000";         // color
    // draw the words
    for (var i=0; i<pages[pageNumber].words.length; i++)
    {
        yOffset = 0;
        // determine if this word should be highlighted
        var ref = passage + "." + pages[pageNumber].words[i].verse;
        var highlightNum = -1;
        var highlight = "";
        
        ctx.fillStyle = pages[pageNumber].words[i].color;
        ctx.font = settingsLayoutTextSize + "px " + settingsLayoutFontFamily;      // font
        if (pages[pageNumber].words[i].wordType == 98)
        {
            // we're a note... need to handle a note image here TODO?
            ctx.font = "italic " + settingsLayoutTextSize + "px " + settingsLayoutFontFamily;      // font
        }

        if (highlightText)
        {
            if ( pages[pageNumber].words[i].text.length > 0 )
            {
                if ( pages[pageNumber].words[i].text.toLowerCase() == highlightText.toLowerCase() )
                {
                    // scratch that, highlight the text from a search...
                    highlight = "#F84";
                }
            }
        }
        if (highlight.length > 0)
        {
            ctx.fillStyle = highlight;
            ctx.fillRect ( pages[pageNumber].words[i].x - 4, 
                           pages[pageNumber].words[i].y,
                           pages[pageNumber].words[i].width+4,
                           pages[pageNumber].words[i].height); // give a little border
        }
        ctx.fillStyle = pages[pageNumber].words[i].color;
        
        var theText = pages[pageNumber].words[i].text;
        if (pages[pageNumber].words[i].wordType == 99)
        {
            // we're a verse #... handle bookmarks
            if ( localStorage.getItem ( "bm_" + ref ) == "Y" )
            {
                ctx.fillStyle = "#FFF";
                var xx = pages[pageNumber].words[i].x;
                var yy = pages[pageNumber].words[i].y;
                var ww = (isIPad() ? 80 : 54);    // iPhone needs this smaller
                xx = xx + ( (pages[pageNumber].words[i].width*(isIPad()?1.5:1.25)) / 2);
                xx = xx - (ww/2); // should now be center of the verse #
                yy = yy - (isIPad() ? 24 : 14);
                ctx.drawImage ( bmImage, xx, yy, ww, ww);
            }
            // check for notes
            if ( localStorage.getItem ( "note_" + ref) )
            {
                theText = theText + "*";
            }
            yOffset = 3;
            ctx.font = (settingsLayoutTextSize*(isIPad()?1.5:1.25)) + "px " + settingsLayoutFontFamily;      // font
        }
        
        ctx.fillText(theText, 
                     pages[pageNumber].words[i].x, 
                     pages[pageNumber].words[i].y - yOffset);
    }
    ctx.restore();
    repaint();
}
