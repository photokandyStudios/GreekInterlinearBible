// wordObject will store information about a word
function wordObject ( x, y, w, h, c, text, wordType, yOffset )
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
}
console.log ('136');

// pageObject stores the list of all the words on a page
function pageObject ( canvasMargin )
{
    this.self = this;
    this.words = Array();
    this.verseYStart = Array();
    this.verseYEnd   = Array();
    this.columnYEnd = Array(0, canvasMargin, canvasMargin);
    
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
    // TODO: handle iPhone
    $("bibleContent").style.minHeight = canvasHeight + "px";
    $("c").setAttribute ("width", canvasWidth);
    $("c").setAttribute ("height", canvasHeight);

    var ctx = document.getElementById("c").getContext("2d");

    ctx.font = settingsLayoutTextSize + " " + settingsLayoutFontFamily;      // font
    ctx.fillStyle = "#000";         // color
   // ctx.strokeStyle = "rgba(0,0,0,0.0)"; // stroke

    var canvasMargin = 30;

    var columnAvgWidth = (canvasWidth - (canvasMargin * 6))/3;

    var columnLeft = Array();
    var columnWidth = Array();
    
    columnLeft[1] = canvasMargin;
    columnWidth[1] = columnAvgWidth * 1.75;   // left column
    columnLeft[3] = columnLeft[1] + columnWidth[1] + (canvasMargin * 2);
    columnWidth[3] = columnAvgWidth * 0.125;      // middle column
    columnLeft[2] = columnLeft[3] + columnWidth[3] + (canvasMargin * 2);
    columnWidth[2] = columnAvgWidth * 1.125;      // right column
    var lineHeight = ctx.measureText("—").width;                        // line height
    lineHeight = lineHeight * ( settingsLayoutLineSpacing / 100 );  // and add our line spacing
    
    var thisPageNumber = 0;
    var y = canvasMargin;       // starting at top of page
    var x = 0;
    var columnHeight = lineHeight * 4; // can change if morphology is omitted.
    var thisPage;
    
    // if we're non-parsed, columnHeight should be lineHeight...
    if (selectedGreekText.indexOf("p")<0)
    {
        columnHeight = lineHeight;
    }

    for ( var i=1; bibleLeft[passage + "." + i] || bibleRight [passage + "." + i]; i++ )
    {
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
        y = Math.max ( thisPage.columnYEnd [ 1 ], thisPage.columnYEnd [ 2 ] );
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
            
        y = Math.max ( thisPage.columnYEnd [ 1 ], thisPage.columnYEnd [ 2 ] );
        if (!y) { y = canvasMargin; }
            
            thisPage.verseYStart[i] = y;
            thisPage.verseYEnd  [i] = y+columnHeight;
        }
        curY = y;

        // start both verses

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

            baseText = baseText + curBible[ref] + " ";
            if (whichSide == 1 && settingsGreekLayoutTransliterate == "on")
            {
                baseText = transliterate (baseText);
            }
            
            y=curY;
            thisPage.verseYStart [ i ] = y;
            thisPage.verseYEnd   [ i ] = y + columnHeight;
            
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
                    prevWords.push ( new wordObject ( x, y+yOffset, curWidth, lineHeight, c, curWord, wt, yOffset ) );
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
    ctx.clearRect (0, 0, canvasWidth, canvasHeight);
    ctx.restore();
}

function drawPage ( pageNumber )
{
    var ctx = document.getElementById("c").getContext("2d");
    ctx.save();
    clearCtx ( ctx );

    ctx.font = settingsLayoutTextSize + " " + settingsLayoutFontFamily;      // font
    ctx.fillStyle = "#000";         // color
    
    // TODO: draw any selection and highlight colors
    
    // draw the words
    for (i=0; i<pages[pageNumber].words.length; i++)
    {
        ctx.fillStyle = pages[pageNumber].words[i].color;
        ctx.fillText(pages[pageNumber].words[i].text, 
                     pages[pageNumber].words[i].x, 
                     pages[pageNumber].words[i].y);
    }
    ctx.restore();
}
