var canvasMargin;

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
console.log ('136');

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
console.log ('155');

/**
 *
 * formats a chapter using the page and word objects.
 *
 */
console.log ('162');
    var canvasWidth = 1024;         // width. TODO: change based on orientation
    var canvasHeight = 676;        // height: TODO: change based on orientation

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
        canvasHeight = 366;
    }
    if ( isLandscape() && isIPhone() )
    {
        canvasWidth = 480;
        canvasHeight = 206;
    }
    // TODO: handle iPhone
    $("bibleContent").style.minHeight = canvasHeight + "px";
    $("c").setAttribute ("width", canvasWidth * window.devicePixelRatio);
    $("c").setAttribute ("height", canvasHeight * window.devicePixelRatio);
    
    $("c").style.width = canvasWidth + "px";
    $("c").style.height = canvasHeight + "px";

    var ctx = document.getElementById("c").getContext("2d");
    //ctx.scale ( window.devicePixelRatio, window.devicePixelRatio );

    ctx.font = settingsLayoutTextSize + "px " + settingsLayoutFontFamily;      // font
    ctx.fillStyle = "#000";         // color
   // ctx.strokeStyle = "rgba(0,0,0,0.0)"; // stroke

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
    var columnHeight = (lineHeight * 3.5); // can change if morphology is omitted.
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
       if ( !pages[thisPageNumber] )
        {
            pages[thisPageNumber] = new pageObject( canvasMargin );
        }
        thisPage = pages[thisPageNumber];

        // find the first available position to start drawing on the page
        y = Math.max ( thisPage.columnYEnd [ 1 ], thisPage.columnYEnd [ 2 ], thisPage.columnYEnd[ 4 ] );
        if (!y) { y = canvasMargin; }

        if (y >= (canvasHeight - (canvasMargin*2) - columnHeight))
        {
            // new page!
            thisPageNumber++;
            curP = thisPageNumber;
            if ( !pages[thisPageNumber] )
            {   // allocate if necessary
                pages[thisPageNumber] = new pageObject( canvasMargin );
            }
            thisPage = pages[thisPageNumber];
            
            y = Math.max ( thisPage.columnYEnd [ 1 ], thisPage.columnYEnd [ 2 ], thisPage.columnYEnd[ 4 ] );
            if (!y) { y = canvasMargin; }
            
            thisPage.verseYStart[i] = y;
            thisPage.verseYEnd  [i] = y+columnHeight;
        }
        curY = y;
        
        // create a new word that is the verse #
        thisPage.addWord ( new wordObject ( columnLeft [ 3 ] + ((columnWidth [ 3 ])/2) // center
                         - (ctx.measureText ( i ).width / 2) // center the #
                         , y, ctx.measureText ( i ).width, lineHeight, "#333", i, 99, 0, i, 3 ));

        // start both verses
            y=curY;
            thisPage.verseYStart [ i ] = y;
            thisPage.verseYEnd   [ i ] = y + columnHeight;

        for (var whichSide = 1; whichSide < 3; whichSide++)
        {
            x = columnLeft [ whichSide];
            maxX = x + columnWidth[whichSide];
            thisPageNumber = curP;
            if ( !pages[thisPageNumber] )
            {
                pages[thisPageNumber] = new pageObject( canvasMargin );
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
                            c = "#248";
                            yOffset += lineHeight;
                        }
                        else if (curWord.match ( /VAR[0-9]/g ) )
                        {
                            wt = 5; // Just a variant.
                            curWord = curWord.replace ( /VAR([0-9])/g, "$1"); // simplify it.
                        }
                        else if (curWord.match ( /([A-Z\-]{2,}[A-Z\-0-9]+)/g ) )
                        {
                            c = "#284";
                            wt = 30; // morphology
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
                                thisPage.verseYEnd[i] = Math.max (y, thisPage.verseYEnd[i]);
                                thisPage.columnYEnd[whichSide] = y;
                                
                                // new page!
                                thisPageNumber++;
                                if ( !pages[thisPageNumber] )
                                {   // allocate if necessary
                                    pages[thisPageNumber] = new pageObject( canvasMargin );
                                }
                                thisPage = pages[thisPageNumber];
                                
                                y = canvasMargin;   
                                
                                thisPage.verseYStart[i] = y;
                                thisPage.verseYEnd  [i] = y+columnHeight;
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
                    y = y + (columnHeight);       // increment y
                    if (y >= (canvasHeight - (canvasMargin*2) - columnHeight))
                    {
                        // the verse's height is the maximum height
                        thisPage.verseYEnd[i] = Math.max (y, thisPage.verseYEnd[i]);
                        thisPage.columnYEnd[whichSide] = y;
                        
                        // new page!
                        thisPageNumber++;
                        if ( !pages[thisPageNumber] )
                        {   // allocate if necessary
                            pages[thisPageNumber] = new pageObject( canvasMargin );
                        }
                        thisPage = pages[thisPageNumber];
                        
                        y = canvasMargin;           
                        thisPage.verseYStart[i] = y;
                        thisPage.verseYEnd  [i] = y+columnHeight;
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
            
            // end drawing the verse
            
            
            thisPage.verseYEnd[i] = Math.max ( y + columnHeight, thisPage.verseYEnd[i]);
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
                y = Math.max ( thisPage.columnYEnd [ 1 ], thisPage.columnYEnd [ 2 ], thisPage.columnYEnd[ 4 ] );
                if (!y) { y = canvasMargin; }

                if (y >= (canvasHeight - (canvasMargin*2) - columnHeight))
                {
                    // new page!
                    thisPageNumber++;
                    curP = thisPageNumber;
                    if ( !pages[thisPageNumber] )
                    {   // allocate if necessary
                        pages[thisPageNumber] = new pageObject( canvasMargin );
                    }
                    thisPage = pages[thisPageNumber];
                    
                    y = Math.max ( thisPage.columnYEnd [ 1 ], thisPage.columnYEnd [ 2 ], thisPage.columnYEnd[ 4 ] );
                    if (!y) { y = canvasMargin; }
                    
                    thisPage.verseYStart[i] = y;
                    thisPage.verseYEnd  [i] = y+columnHeight;
                }



                baseText = "Notes for Verse " + i + ": " + baseText + " ";
               // y=y+lineHeight;
                                thisPage.verseYEnd[i] = Math.max (y, thisPage.verseYEnd[i]);
                                thisPage.columnYEnd[whichSide] = y;
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
                                thisPage.verseYEnd[i] = Math.max (y, thisPage.verseYEnd[i]);
                                thisPage.columnYEnd[whichSide] = y;
                                
                                // new page!
                                thisPageNumber++;
                                if ( !pages[thisPageNumber] )
                                {   // allocate if necessary
                                    pages[thisPageNumber] = new pageObject( canvasMargin );
                                }
                                thisPage = pages[thisPageNumber];
                                
                                y = canvasMargin;   
                                
                                thisPage.verseYStart[i] = y;
                                thisPage.verseYEnd  [i] = y+lineHeight;
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
                        thisPage.verseYEnd[i] = Math.max (y, thisPage.verseYEnd[i]);
                        thisPage.columnYEnd[whichSide] = y;
                        
                        // new page!
                        thisPageNumber++;
                        if ( !pages[thisPageNumber] )
                        {   // allocate if necessary
                            pages[thisPageNumber] = new pageObject( canvasMargin );
                        }
                        thisPage = pages[thisPageNumber];
                        
                        y = canvasMargin;           
                        thisPage.verseYStart[i] = y;
                        thisPage.verseYEnd  [i] = y+lineHeight;
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
                thisPage.verseYEnd[i] = Math.max (y, thisPage.verseYEnd[i]);
                thisPage.columnYEnd[whichSide] = y;
            
            }
            // end drawing the notes


        
        curP = thisPageNumber;
    }

    // set up pageReferences
    pageReferences = Array();
    for (var i=0; i<pages.length; i++)
    {
        for (var j=0; j<pages[i].verseYStart.length; j++)
        {
             if ( pages[i].verseYStart[j] )
             {
                if (!pageReferences [j])
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
    // set the page title to the top verse
    setPageTitle ( cvtToProperReference ( passage + "." + pages[pageNumber].verseYStart.indexOf(canvasMargin)) );

    var ctx = document.getElementById("c").getContext("2d");
    ctx.save();
    clearCtx ( ctx );
    ctx.scale ( window.devicePixelRatio, window.devicePixelRatio );

    ctx.font = settingsLayoutTextSize + "px " + settingsLayoutFontFamily;      // font
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000";         // color
    
    // draw any selection (the only thing that will get a full rectangle; all others highlight the text.)

    ctx.fillStyle = "#C0E0FF";
    for (var i=0; i<pages[pageNumber].verseYStart.length; i++)
    {
        if ( selectedVerse[passage + "." + i]=="Y" )
        {
            ctx.fillRect ( 0,           pages[pageNumber].verseYStart[i] - 4, 
                           canvasWidth, (pages[pageNumber].verseYEnd[i] - pages[pageNumber].verseYStart[i]) + 8 );
        }
    }
    
    ctx.fillStyle = "#000";         // color
    // draw the words
    for (var i=0; i<pages[pageNumber].words.length; i++)
    {
        // determine if this word should be highlighted
        var ref = passage + "." + pages[pageNumber].words[i].verse;
        var highlightNum = -1;
        var highlight = "";
        
        if (localStorage.getItem ( "hl_" + ref ))
        {
            highlightNum = localStorage.getItem ( "hl_" + ref );
            highlight = "rgba(";
            highlight = highlight + highlightColors [ highlightNum ];
            highlight = highlight + ")";
        }
        if (highlightText)
        {
            if ( pages[pageNumber].words[i].text.length > 0 )
            {
                if ( pages[pageNumber].words[i].text.toLowerCase() == highlightText.toLowerCase() )
                {
                    // scratch that, highlight the text from a search...
                    highlight = "#FF0";
                }
            }
        }
        if (highlight.length > 0)
        {
            ctx.fillStyle = highlight;
            ctx.fillRect ( pages[pageNumber].words[i].x - 4, 
                           pages[pageNumber].words[i].y,
                           pages[pageNumber].words[i].width + 8,
                           pages[pageNumber].words[i].height); // give a little border
        }
        
        ctx.fillStyle = pages[pageNumber].words[i].color;
        ctx.font = settingsLayoutTextSize + "px " + settingsLayoutFontFamily;      // font
        var theText = pages[pageNumber].words[i].text;
        if (pages[pageNumber].words[i].wordType == 98)
        {
            // we're a note... need to handle a note image here TODO?
            ctx.font = "italic " + settingsLayoutTextSize + "px " + settingsLayoutFontFamily;      // font
        }
        if (pages[pageNumber].words[i].wordType == 99)
        {
            // we're a verse #... handle bookmarks
            if ( localStorage.getItem ( "bm_" + ref ) == "Y" )
            {
                ctx.fillStyle = "#FFF";
                var xx = pages[pageNumber].words[i].x;
                var yy = pages[pageNumber].words[i].y;
                var ww = (isIPad() ? 80 : 60);    // iPhone needs this smaller
                xx = xx + (pages[pageNumber].words[i].width / 2);
                xx = xx - (ww/2); // should now be center of the verse #
                yy = yy - (isIPad() ? 28 : 22);
                ctx.drawImage ( bmImage, xx, yy, ww, ww);
            }
            // check for notes
            if ( localStorage.getItem ( "note_" + ref) )
            {
                theText = theText + "*";
            }
        }
        
        ctx.fillText(theText, 
                     pages[pageNumber].words[i].x, 
                     pages[pageNumber].words[i].y);
    }
    ctx.restore();
    
}
